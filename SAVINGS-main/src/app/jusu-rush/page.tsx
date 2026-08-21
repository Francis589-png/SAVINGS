'use client';

import { useEffect, useRef, useState } from 'react';

const TRACK_LENGTH = 2400;
const LANES = [-0.32, 0.32];
type Pickup = { x: number; z: number; value: number; collected: boolean };

export default function JusuRushPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState('Create a room or join a race');
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState<1 | 2>(1);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, raf = 0, distance = 0;
    let lateral = LANES[player - 1], targetLateral = lateral, boost = 0;
    const keys = new Set<string>();
    const pickups: Pickup[] = Array.from({ length: 80 }, (_, i) => ({ x: ((i * 37) % 100) / 100 * 1.55 - 0.775, z: 120 + i * 28, value: i % 9 === 0 ? 100 : 25, collected: false }));
    const resize = () => { const r = canvas.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); width = r.width; height = r.height; canvas.width = width * d; canvas.height = height * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const down = (e: KeyboardEvent) => keys.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const touch = (e: TouchEvent) => { const t = e.touches[0]; if (!t) return; targetLateral = Math.max(-.78, Math.min(.78, (t.clientX / width - .5) * 1.8)); e.preventDefault(); };
    resize(); window.addEventListener('resize', resize); window.addEventListener('keydown', down); window.addEventListener('keyup', up); canvas.addEventListener('touchmove', touch, { passive: false }); canvas.addEventListener('touchstart', touch, { passive: false });

    const ball = (x: number, y: number, r: number, color: string) => { const g = ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r); g.addColorStop(0,'#fff'); g.addColorStop(.2,color); g.addColorStop(1,'#07111f'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.stroke(); };
    const loop = () => {
      const steer = (keys.has('arrowleft') || keys.has('a') ? -1 : 0) + (keys.has('arrowright') || keys.has('d') ? 1 : 0);
      targetLateral = Math.max(-.78, Math.min(.78, targetLateral + steer*.018));
      boost = keys.has('shift') || keys.has(' ') ? Math.min(1, boost+.035) : Math.max(0, boost-.02);
      distance = Math.min(TRACK_LENGTH, distance + 7 + boost*7); lateral += (targetLateral-lateral)*.16;
      ctx.clearRect(0,0,width,height);
      const sky=ctx.createLinearGradient(0,0,0,height); sky.addColorStop(0,'#071a30'); sky.addColorStop(.55,'#10233b'); sky.addColorStop(1,'#03070d'); ctx.fillStyle=sky; ctx.fillRect(0,0,width,height);
      const horizon=height*.34, top=width*.18, bottom=width*.98; ctx.fillStyle='#1d2938'; ctx.beginPath(); ctx.moveTo(width/2-top/2,horizon); ctx.lineTo(width/2+top/2,horizon); ctx.lineTo(width/2+bottom/2,height); ctx.lineTo(width/2-bottom/2,height); ctx.closePath(); ctx.fill();
      for(let i=0;i<18;i++){const z=((i*140-distance)%1600+1600)%1600,p=1-z/1600;if(p<=0)continue;const y=horizon+p*p*(height-horizon),rw=top+p*(bottom-top);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(width/2-rw/2,y);ctx.lineTo(width/2+rw/2,y);ctx.stroke();}
      pickups.forEach(q=>{if(q.collected)return;const rel=q.z-distance;if(rel<4||rel>1000)return;const p=1-rel/1000,y=horizon+p*p*(height-horizon),rw=top+p*(bottom-top),x=width/2+q.x*rw/2,r=4+p*18;ctx.fillStyle=q.value===100?'#f97316':'#facc15';ctx.shadowBlur=16;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(rel<34&&Math.abs(q.x-lateral)<.12){q.collected=true;setScore(v=>v+q.value);}});
      const bx=width/2+lateral*bottom*.46, by=height*.78; ball(bx,by,Math.max(22,width*.045),player===1?'#38bdf8':'#f43f5e'); ball(width/2+(player===1?.32:-.32)*bottom*.46,by+24,Math.max(15,width*.03),player===1?'#f43f5e':'#38bdf8');
      if(distance>=TRACK_LENGTH){ctx.fillStyle='rgba(2,6,23,.82)';ctx.fillRect(0,0,width,height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 42px system-ui';ctx.fillText('FINISH!',width/2,height/2-20);ctx.font='700 20px system-ui';ctx.fillStyle='#facc15';ctx.fillText(`${score.toLocaleString()} SP COLLECTED`,width/2,height/2+25);}
      raf=requestAnimationFrame(loop);
    };
    loop();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);canvas.removeEventListener('touchmove',touch);canvas.removeEventListener('touchstart',touch);};
  }, [player, score]);

  const connect = (code: string, selectedPlayer: 1 | 2) => { setRoomCode(code.toUpperCase()); setPlayer(selectedPlayer); setStatus('Connecting…'); const endpoint=process.env.NEXT_PUBLIC_JUSU_RUSH_WS_URL; if(!endpoint){setStatus('3D race ready — multiplayer server will connect when configured');return;} const ws=new WebSocket(endpoint); wsRef.current=ws; ws.onopen=()=>{setStatus(`Room ${code.toUpperCase()} connected`);ws.send(JSON.stringify({type:'join',room:code.toUpperCase(),player:selectedPlayer}));}; ws.onclose=()=>setStatus('Disconnected'); ws.onerror=()=>setStatus('Unable to connect to race server'); };
  const createRoom=()=>connect(Math.random().toString(36).slice(2,8).toUpperCase(),1);

  return <main className="min-h-screen bg-[#050b14] text-white"><section className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6"><header className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.35em] text-cyan-400">JUSU</p><h1 className="text-4xl font-black">RUSH</h1></div><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right"><p className="text-xs text-slate-400">RACE VALUE</p><p className="text-xl font-black text-yellow-300">{score.toLocaleString()} SP</p></div></header><div className="grid flex-1 gap-4 lg:grid-cols-[270px_1fr]"><aside className="order-2 rounded-3xl border border-white/10 bg-white/[.04] p-5 lg:order-1"><p className="font-bold text-slate-300">2-PLAYER COIN RUSH</p><p className="mt-2 text-sm leading-6 text-slate-400">Race a second player, collect virtual value and reach the finish.</p><div className="mt-5 space-y-3"><button onClick={createRoom} className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950">CREATE RACE</button><input aria-label="Room code" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase().slice(0,6))} placeholder="ROOM CODE" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center font-bold tracking-[.25em] outline-none"/><button disabled={roomCode.length<4} onClick={()=>connect(roomCode,2)} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-bold disabled:opacity-40">JOIN RACE</button></div><div className="mt-5 rounded-2xl bg-black/20 p-4 text-sm"><p className="font-bold">{status}</p><p className="mt-2 text-xs text-slate-500">Player {player} • No Firebase required for the race engine</p></div><p className="mt-5 text-xs leading-5 text-slate-500">Touch and drag to steer. Desktop: A/D or ←/→. Hold Shift or Space for boost.</p></aside><div className="order-1 min-h-[70vh] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl lg:order-2"><canvas ref={canvasRef} className="h-full min-h-[70vh] w-full touch-none"/></div></div></section></main>;
}
