import { WebSocketServer } from 'ws';
import { randomBytes } from 'node:crypto';

const port = Number(process.env.PORT || 8080);
const rooms = new Map();
const wss = new WebSocketServer({ port });

const send = (ws, message) => ws.readyState === 1 && ws.send(JSON.stringify(message));
const roomState = (room) => ({ type: 'state', players: [...room.players.values()].map(p => ({ player: p.player, x: p.x, z: p.z, score: p.score, finished: p.finished })) });

wss.on('connection', (ws) => {
  let currentRoom = null;
  let playerId = null;

  ws.on('message', raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return send(ws, { type: 'error', message: 'Invalid message' }); }
    if (message.type === 'create') {
      const code = randomBytes(3).toString('hex').toUpperCase();
      rooms.set(code, { players: new Map(), createdAt: Date.now() });
      send(ws, { type: 'room_created', room: code });
      return;
    }
    if (message.type === 'join') {
      const code = String(message.room || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return send(ws, { type: 'error', message: 'Room not found' });
      if (room.players.size >= 2) return send(ws, { type: 'error', message: 'Room is full' });
      const requested = Number(message.player) === 2 ? 2 : 1;
      const player = room.players.has(requested) ? (requested === 1 ? 2 : 1) : requested;
      currentRoom = code; playerId = player;
      room.players.set(player, { ws, player, x: 0, z: 0, score: 0, finished: false });
      send(ws, { type: 'joined', room: code, player });
      for (const p of room.players.values()) send(p.ws, roomState(room));
      return;
    }
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    const me = room.players.get(playerId);
    if (!me) return;
    if (message.type === 'state') {
      me.x = Number(message.x) || 0;
      me.z = Number(message.z) || 0;
      me.score = Number(message.score) || 0;
      me.finished = Boolean(message.finished);
      for (const p of room.players.values()) if (p.ws !== ws) send(p.ws, roomState(room));
    }
  });

  ws.on('close', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    room.players.delete(playerId);
    for (const p of room.players.values()) send(p.ws, { type: 'player_left', player: playerId });
    if (room.players.size === 0) rooms.delete(currentRoom);
  });
});

setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [code, room] of rooms) if (room.createdAt < cutoff) rooms.delete(code);
}, 10 * 60 * 1000);

console.log(`JUSU RUSH server listening on :${port}`);
