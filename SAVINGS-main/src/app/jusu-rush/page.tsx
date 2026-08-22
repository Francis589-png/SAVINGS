'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Kind = 'coin' | 'boost' | 'spring' | 'slow' | 'kill';
type Obstacle = { z: number; lane: -1 | 0 | 1; kind: Kind; hit: boolean };

const LENGTH = 5000;
const LANES = [-1, 0, 1] as const;

function makeTrack(): Obstacle[] {
  const items: Obstacle[] = [];
  // Deliberately sparse: one gameplay object roughly every 180–300m.
  const pattern: Kind[] = ['coin', 'boost', 'slow', 'coin', 'spring', 'kill', 'coin', 'boost', 'coin', 'slow', 'coin', 'spring', 'kill', 'coin', 'boost', 'coin'];
  for (let i = 0; i < 16; i++) {
    const kind = pattern[i];
    items.push({ z: 420 + i * 285 + (i % 3) * 45, lane: LANES[(i * 2 + 1) % 3], kind, hit: false });
  }
  return items;
}

export default function JusuRushPage() {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ z: 0, lane: 0, target: 0, speed: 0, boost: 0, slow: 0, spring: 0 });
  const started = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [status, setStatus] = useState('READY TO RUSH');
  const track = useRef<Obstacle[]>(makeTrack());

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    const keys = new Set<string>();
    let touchX = 0;

    const resize = () => {
      const r = c.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      width = r.width;
      height = r.height;
      c.width = Math.max(1, width * d);
      c.height = Math.max(1, height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const keyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (['arrowleft', 'arrowright', 'a', 'd', ' '].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const keyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const touchStart = (e: TouchEvent) => { touchX = e.touches[0]?.clientX ?? 0; };
    const touchMove = (e: TouchEvent) => {
      if (!started.current || pausedRef.current) return;
      const x = e.touches[0]?.clientX ?? touchX;
      const dx = x - touchX;
      if (Math.abs(dx) > 18) {
        state.current.target = Math.max(-1, Math.min(1, state.current.target + (dx > 0 ? 1 : -1)));
        touchX = x;
      }
      e.preventDefault();
    };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    };
    const ball = (x: number, y: number, radius: number, color: string) => {
      const grad = ctx.createRadialGradient(x - radius * .35, y - radius * .45, 2, x, y, radius);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(.18, color); grad.addColorStop(1, '#06111f');
      ctx.fillStyle = grad; ctx.shadowBlur = 18; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    };
    const item = (o: Obstacle, x: number, y: number, scale: number) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.textAlign = 'center'; ctx.font = '900 10px system-ui';
      if (o.kind === 'coin') { ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#713f12'; ctx.fillText('S', 0, 4); }
      if (o.kind === 'boost') { ctx.fillStyle = '#22d3ee'; roundRect(-28, -7, 56, 14, 5); ctx.fillStyle = '#032b35'; ctx.fillText('BOOST', 0, 4); }
      if (o.kind === 'spring') { ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, 8); for (let i = 0; i < 5; i++) ctx.lineTo(-14 + i * 7, i % 2 ? -8 : 8); ctx.stroke(); ctx.fillStyle = '#a855f7'; ctx.fillRect(-18, 8, 36, 5); }
      if (o.kind === 'slow') { ctx.fillStyle = '#2563eb'; roundRect(-28, -7, 56, 14, 5); ctx.fillStyle = '#fff'; ctx.fillText('SLOW', 0, 4); }
      if (o.kind === 'kill') { ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(15, 12); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText('!', 0, 7); }
      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      const s = state.current;
      if (started.current && !pausedRef.current && !dead && !finished) {
        const dir = (keys.has('arrowleft') || keys.has('a') ? -1 : 0) + (keys.has('arrowright') || keys.has('d') ? 1 : 0);
        if (dir) s.target = Math.max(-1, Math.min(1, s.target + dir * dt * 3.5));
        const boosted = keys.has(' ') || s.boost > 0;
        const maxSpeed = s.slow > 0 ? 4.5 : boosted ? 13 : 8.5;
        s.speed += (maxSpeed - s.speed) * Math.min(1, dt * 5);
        if (s.boost > 0) s.boost = Math.max(0, s.boost - dt);
        if (s.slow > 0) s.slow = Math.max(0, s.slow - dt);
        if (s.spring > 0) { s.spring = Math.max(0, s.spring - dt); s.speed += 12 * dt; }
        s.lane += (s.target - s.lane) * Math.min(1, dt * 10);
        s.z = Math.min(LENGTH, s.z + s.speed * dt * 60);
        for (const o of track.current) {
          if (o.hit) continue;
          const dz = o.z - s.z;
          if (dz < -10 || dz > 28 || Math.abs(o.lane - s.lane) > .42) continue;
          o.hit = true;
          if (o.kind === 'coin') { setScore(v => v + 25); }
          if (o.kind === 'boost') { s.boost = 2.2; setScore(v => v + 10); }
          if (o.kind === 'spring') { s.spring = 1; s.speed += 8; setScore(v => v + 10); }
          if (o.kind === 'slow') { s.slow = 2; s.speed *= .5; }
          if (o.kind === 'kill') { s.speed = 0; started.current = false; setPlaying(false); setDead(true); setStatus('CRASHED'); }
        }
        if (s.z >= LENGTH) { started.current = false; setPlaying(false); setFinished(true); setStatus('FINISH — YOU WIN'); }
      }

      ctx.clearRect(0, 0, width, height);
      const sky = ctx.createLinearGradient(0, 0, 0, height); sky.addColorStop(0, '#061a32'); sky.addColorStop(.55, '#0b3652'); sky.addColorStop(1, '#03070d'); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      const horizon = height * .28; const top = width * .13; const bottom = width * 1.06;
      ctx.fillStyle = '#182536'; ctx.beginPath(); ctx.moveTo(width/2-top/2,horizon); ctx.lineTo(width/2+top/2,horizon); ctx.lineTo(width/2+bottom/2,height); ctx.lineTo(width/2-bottom/2,height); ctx.closePath(); ctx.fill();
      for (let lane = -1; lane <= 1; lane++) { ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.setLineDash([18,20]); ctx.beginPath(); ctx.moveTo(width/2+lane*top/6,horizon); ctx.lineTo(width/2+lane*bottom/6,height); ctx.stroke(); ctx.setLineDash([]); }
      for (let i = 0; i < 18; i++) { const d = ((i*260 - s.z) % 1800 + 1800) % 1800; const p = 1-d/1800; const y = horizon+p*p*(height-horizon); const rw = top+p*(bottom-top); ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.beginPath(); ctx.moveTo(width/2-rw/2,y); ctx.lineTo(width/2+rw/2,y); ctx.stroke(); }
      for (const o of track.current) { const dz=o.z-s.z; if (o.hit || dz < 8 || dz > 1100) continue; const p=1-dz/1100; const y=horizon+p*p*(height-horizon); const rw=top+p*(bottom-top); const x=width/2+o.lane*rw/6; item(o,x,y,.35+p*1.5); }
      const px=width/2+s.lane*bottom/6; ball(px,height*.79,Math.max(23,width*.042),'#38bdf8');
      ctx.fillStyle='rgba(0,0,0,.7)'; roundRect(14,14,Math.min(370,width-28),82,14); ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.fillText(`RUSH  ${Math.floor(s.z)} / ${LENGTH}m`,28,40); ctx.fillStyle='#22d3ee'; ctx.fillText(`SPEED ${s.speed.toFixed(1)}x`,28,65); ctx.fillStyle='#facc15'; ctx.fillText(`COINS ${scoreRef.current}`,170,65); ctx.fillStyle='rgba(255,255,255,.12)'; roundRect(28,76,Math.min(330,width-56),5,3); ctx.fillStyle='#22d3ee'; roundRect(28,76,Math.min(330,width-56)*s.z/LENGTH,5,3);
      if (countdown !== null) { ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,width,height); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='900 92px system-ui'; ctx.fillText(countdown > 0 ? String(countdown) : 'RUSH!', width/2,height*.52); ctx.textAlign='left'; }
      if (paused && !dead && !finished) { ctx.fillStyle='rgba(0,0,0,.58)'; ctx.fillRect(0,0,width,height); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='900 52px system-ui'; ctx.fillText('PAUSED',width/2,height*.48); ctx.textAlign='left'; }
      if (dead || finished) { ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(0,0,width,height); ctx.textAlign='center'; ctx.fillStyle=dead?'#ef4444':'#facc15'; ctx.font='900 50px system-ui'; ctx.fillText(dead?'CRASH!':'🏁 YOU WIN',width/2,height*.46); ctx.fillStyle='#fff'; ctx.font='700 18px system-ui'; ctx.fillText('Press PLAY AGAIN for a fresh race',width/2,height*.54); ctx.textAlign='left'; }
      raf=requestAnimationFrame(loop);
    };

    resize(); window.addEventListener('resize',resize); window.addEventListener('keydown',keyDown); window.addEventListener('keyup',keyUp); c.addEventListener('touchstart',touchStart,{passive:false}); c.addEventListener('touchmove',touchMove,{passive:false}); raf=requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); window.removeEventListener('keydown',keyDown); window.removeEventListener('keyup',keyUp); c.removeEventListener('touchstart',touchStart); c.removeEventListener('touchmove',touchMove); };
  }, [dead, finished, countdown, paused]);

  const playAgain = () => {
    state.current={z:0,lane:0,target:0,speed:0,boost:0,slow:0,spring:0}; track.current=makeTrack(); scoreRef.current=0; setScore(0); setDead(false); setFinished(false); setPaused(false); pausedRef.current=false; started.current=false; setCountdown(3); setStatus('GET READY');
    let n=3; const timer=window.setInterval(()=>{ n--; if(n<=0){window.clearInterval(timer);setCountdown(null);started.current=true;setPlaying(true);setStatus('RUSH!');}else setCountdown(n); },650);
  };
  const togglePause=()=>{if(!started.current||dead||finished||countdown!==null)return;setPaused(v=>!v);setPlaying(v=>!v);setStatus(paused?'RUSH!':'PAUSED');};
  const boost=()=>{if(started.current&&!pausedRef.current&&!dead&&!finished)state.current.boost=2;};

  return <main className="min-h-screen bg-[#02060d] text-white"><div className="mx-auto flex min-h-screen max-w-[1500px] flex-col p-3 sm:p-5"><header className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3"><button onClick={()=>router.push('/')} className="font-bold text-slate-400">← Savings</button><div className="text-center"><p className="text-[10px] font-black tracking-[.5em] text-cyan-400">JUSU</p><h1 className="text-3xl font-black">RUSH</h1></div><b className="text-yellow-300">{score} COINS</b></header><div className="grid flex-1 gap-3 lg:grid-cols-[230px_1fr]"><aside className="order-2 rounded-2xl border border-white/10 bg-[#09111e] p-4 lg:order-1"><p className="text-xs font-black tracking-[.2em] text-cyan-400">RACE GARAGE</p><h2 className="mt-2 text-xl font-black">2-PLAYER RUSH</h2><p className="mt-1 text-xs leading-5 text-slate-500">A clean race track with room to steer. Collect coins, hit boosts and springs, avoid slow zones and deadly hazards.</p><button onClick={playAgain} className="mt-4 w-full rounded-xl bg-cyan-400 py-3 font-black text-slate-950">PLAY</button><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={togglePause} disabled={!playing||countdown!==null} className="rounded-xl bg-white py-3 text-xs font-black text-black disabled:opacity-30">{paused?'▶ PLAY':'⏸ PAUSE'}</button><button onClick={playAgain} className="rounded-xl bg-white/10 py-3 text-xs font-black">↻ PLAY AGAIN</button></div><button onPointerDown={boost} disabled={!playing||paused} className="mt-2 w-full rounded-xl bg-yellow-300 py-3 text-xs font-black text-black disabled:opacity-30">⚡ BOOST</button><div className="mt-4 rounded-xl bg-black/30 p-3"><p className="text-[10px] text-slate-500">STATUS</p><p className="mt-1 text-xs font-bold">{status}</p></div><div className="mt-4 rounded-xl border border-white/10 p-3 text-xs text-slate-400"><b className="text-white">Controls</b><br/>Drag left/right on the track<br/>Keyboard: A/D or ←/→<br/>Space = boost</div></aside><section className="order-1 min-h-[68vh] overflow-hidden rounded-2xl border border-white/10 bg-black lg:order-2"><canvas ref={canvas} className="block h-[68vh] min-h-[520px] w-full touch-none" /></section></div></div></main>;
}
