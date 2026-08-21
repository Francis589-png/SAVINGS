'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ROOM_LENGTH = 220;
const TRACK_WIDTH = 18;

export default function JusuRushPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState('Create a room or join a race');
  const [score, setScore] = useState(0);
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState<1 | 2>(1);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 500);
    camera.position.set(0, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbfe7ff, 0x101827, 2));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(10, 25, 10);
    sun.castShadow = true;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_WIDTH, ROOM_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x162235, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -ROOM_LENGTH / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH, 0.08, ROOM_LENGTH),
      new THREE.MeshStandardMaterial({ color: 0x253754 })
    );
    lane.position.set(0, 0.05, -ROOM_LENGTH / 2);
    scene.add(lane);

    const balls = [
      new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.2, roughness: 0.25 })),
      new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 24), new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.2, roughness: 0.25 }))
    ];
    balls[0].position.set(-4, 1.15, 0);
    balls[1].position.set(4, 1.15, 0);
    balls.forEach((ball) => { ball.castShadow = true; scene.add(ball); });

    const coins: THREE.Mesh[] = [];
    for (let i = 0; i < 32; i += 1) {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.18, 20),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2, emissive: 0x5b4300 })
      );
      coin.rotation.x = Math.PI / 2;
      coin.position.set((i % 2 === 0 ? -1 : 1) * (2 + (i % 4)), 0.75, -10 - i * 6);
      coin.userData.value = i % 5 === 0 ? 100 : 25;
      coin.castShadow = true;
      scene.add(coin);
      coins.push(coin);
    }

    const finish = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH, 0.25, 2),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x064e3b })
    );
    finish.position.set(0, 0.2, -ROOM_LENGTH + 4);
    scene.add(finish);

    const keys = new Set<string>();
    let localX = -4;
    let localZ = 0;
    let targetX = localX;
    let speed = 0.18;
    let raf = 0;

    const onKeyDown = (event: KeyboardEvent) => keys.add(event.key.toLowerCase());
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const animate = () => {
      if (keys.has('arrowleft') || keys.has('a')) targetX -= 0.12;
      if (keys.has('arrowright') || keys.has('d')) targetX += 0.12;
      targetX = THREE.MathUtils.clamp(targetX, -TRACK_WIDTH / 2 + 1.5, TRACK_WIDTH / 2 - 1.5);
      localX = THREE.MathUtils.lerp(localX, targetX, 0.18);
      if (keys.has('shift')) speed = Math.min(0.32, speed + 0.002);
      else speed = THREE.MathUtils.lerp(speed, 0.18, 0.02);
      localZ -= speed;

      const ball = balls[player - 1];
      ball.position.x = localX;
      ball.position.z = localZ;
      ball.rotation.x -= speed * 0.8;

      coins.forEach((coin) => {
        coin.rotation.z += 0.04;
        if (!coin.visible) return;
        if (Math.abs(coin.position.z - localZ) < 1.7 && Math.abs(coin.position.x - localX) < 1.7) {
          coin.visible = false;
          setScore((value) => value + Number(coin.userData.value));
        }
      });

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, localX * 0.35, 0.08);
      camera.position.z = localZ + 20;
      camera.lookAt(localX, 0, localZ - 12);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [player]);

  const connect = (code: string, selectedPlayer: 1 | 2) => {
    setRoomCode(code.toUpperCase());
    setPlayer(selectedPlayer);
    setStatus('Connecting…');
    const endpoint = process.env.NEXT_PUBLIC_JUSU_RUSH_WS_URL;
    if (!endpoint) {
      setStatus('3D practice mode ready — multiplayer server not configured yet');
      return;
    }
    const ws = new WebSocket(endpoint);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setStatus(`Room ${code.toUpperCase()} connected`);
      ws.send(JSON.stringify({ type: 'join', room: code.toUpperCase(), player: selectedPlayer }));
    };
    ws.onclose = () => { setConnected(false); setStatus('Disconnected'); };
    ws.onerror = () => setStatus('Unable to connect to the race server');
  };

  const createRoom = () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    connect(code, 1);
  };

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">JUSU</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">RUSH</h1>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right backdrop-blur">
            <p className="text-xs text-slate-400">Collected</p>
            <p className="text-xl font-black text-yellow-300">{score.toLocaleString()} SP</p>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:order-1">
            <p className="mb-2 text-sm font-semibold text-slate-300">2-PLAYER COIN RUSH</p>
            <p className="mb-5 text-sm leading-6 text-slate-400">Roll your ball, collect virtual value and beat your opponent to the finish.</p>
            <div className="space-y-3">
              <button onClick={createRoom} className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950 active:scale-[.98]">CREATE RACE</button>
              <input aria-label="Room code" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ROOM CODE" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center font-bold tracking-[0.25em] outline-none focus:border-cyan-400" />
              <button disabled={roomCode.length < 4} onClick={() => connect(roomCode, 2)} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40">JOIN RACE</button>
            </div>
            <div className="mt-6 rounded-2xl bg-black/20 p-4 text-sm">
              <p className="font-bold">{status}</p>
              <p className="mt-2 text-slate-500">{connected ? '● Live connection' : '● Local 3D mode'}</p>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">Controls: A/D or ←/→ to steer. Hold Shift for a boost. Mobile touch controls are next in the race build.</p>
          </aside>

          <div className="order-1 min-h-[62vh] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl lg:order-2">
            <div ref={mountRef} className="h-full min-h-[62vh] w-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
