'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Kind='coin'|'boost'|'spring'|'slow'|'kill'|'ramp'|'hammer';
type Item={z:number;lane:-1|0|1;kind:Kind;hit:boolean};
const LENGTH=5000;
const LANES=[-1,0,1] as const;

function makeTrack():Item[]{
 const a:Item[]=[];
 for(let i=0;i<120;i++){
  const r=i%15;
  const kind:Kind=r===0?'spring':r===1?'kill':r===2?'slow':r===3||r===9?'boost':r===4||r===10?'ramp':r===5?'hammer':'coin';
  a.push({z:220+i*40+(i%4)*8,lane:LANES[(i*7)%3],kind,hit:false});
 }
 return a;
}

export default function JusuRushPage(){
 const router=useRouter();
 const canvas=useRef<HTMLCanvasElement>(null);
 const ws=useRef<WebSocket|null>(null);
 const started=useRef(false);
 const scoreRef=useRef(0);
 const game=useRef({z:0,lane:0,target:0,speed:0,boost:0,slow:0,spring:0});
 const [score,setScore]=useState(0);
 const [status,setStatus]=useState('READY TO RUSH');
 const [room,setRoom]=useState('');
 const [player,setPlayer]=useState<1|2>(1);
 const [playing,setPlaying]=useState(false);
 const [paused,setPaused]=useState(false);
 const [count,setCount]=useState<number|null>(null);
 const [dead,setDead]=useState(false);
 const [finished,setFinished]=useState(false);
 const [boosting,setBoosting]=useState(false);
 const remote=useRef<{z:number;lane:number}|null>(null);

 useEffect(()=>{scoreRef.current=score},[score]);

 useEffect(()=>{
  const c=canvas.current;if(!c)return;const g=c.getContext('2d');if(!g)return;
  const track=makeTrack();let raf=0,last=performance.now(),w=0,h=0;const keys=new Set<string>();
  const resize=()=>{const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;c.width=Math.max(1,w*d);c.height=Math.max(1,h*d);g.setTransform(d,0,0,d,0,0)};
  const keydown=(e:KeyboardEvent)=>{keys.add(e.key.toLowerCase());if(e.key===' '||e.key==='ArrowLeft'||e.key==='ArrowRight')e.preventDefault()};
  const keyup=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());
  let touchStartX=0;
  const touchStart=(e:TouchEvent)=>{const t=e.touches[0];if(t)touchStartX=t.clientX};
  const touchMove=(e:TouchEvent)=>{const t=e.touches[0];if(!t||paused)return;const dx=t.clientX-touchStartX;if(Math.abs(dx)>12){game.current.target=Math.max(-1,Math.min(1,game.current.target+(dx>0?1:-1)*.08));touchStartX=t.clientX}e.preventDefault()};
  const poly=(p:number[])=>{g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath()};
  const ball=(x:number,y:number,r:number,col:string)=>{g.save();g.shadowBlur=24;g.shadowColor=col;const gr=g.createRadialGradient(x-r*.45,y-r*.5,2,x,y,r);gr.addColorStop(0,'#fff');gr.addColorStop(.2,col);gr.addColorStop(1,'#030711');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore()};
  const drawItem=(it:Item,x:number,y:number,s:number)=>{g.save();g.translate(x,y);g.scale(s,s);g.textAlign='center';g.font='900 10px system-ui';
   if(it.kind==='coin'){g.fillStyle='#ffd43b';g.shadowBlur=15;g.shadowColor='#ffd43b';g.beginPath();g.arc(0,0,11,0,Math.PI*2);g.fill();g.fillStyle='#6b4700';g.fillText('S',0,4)}
   if(it.kind==='boost'){g.fillStyle='#22d3ee';g.fillRect(-30,-8,60,16);g.fillStyle='#06212b';g.fillText('BOOST',0,4)}
   if(it.kind==='spring'){g.strokeStyle='#c084fc';g.lineWidth=5;g.beginPath();for(let j=0;j<5;j++)g.lineTo(j*7-14,j%2?9:-9);g.stroke();g.fillStyle='#a855f7';g.fillRect(-18,9,36,5)}
   if(it.kind==='slow'){g.fillStyle='#2563eb';g.fillRect(-30,-8,60,16);g.fillStyle='#fff';g.fillText('SLOW',0,4)}
   if(it.kind==='kill'){g.fillStyle='#ef4444';poly([-20,12,0,-18,20,12]);g.fill();g.fillStyle='#fff';g.fillText('!',0,6)}
   if(it.kind==='ramp'){g.fillStyle='#f59e0b';poly([-30,15,30,15,30,-20]);g.fill()}
   if(it.kind==='hammer'){g.fillStyle='#94a3b8';g.fillRect(-4,-32,8,45);g.fillStyle='#ef4444';g.fillRect(-25,-35,50,12)}
   g.restore()};
  const loop=(now:number)=>{
   const dt=Math.min(.033,(now-last)/1000);last=now;const s=game.current;
   if(started.current&&!paused&&!dead&&!finished){
    const dir=(keys.has('arrowleft')||keys.has('a')?-1:0)+(keys.has('arrowright')||keys.has('d')?1:0);if(dir)s.target=Math.max(-1,Math.min(1,s.target+dir*dt*4));
    const boost=boosting||keys.has(' ')||keys.has('shift')||s.boost>0;const max=s.slow>0?4.5:boost?15:9;
    s.speed+=(max-s.speed)*Math.min(1,dt*5);if(s.boost>0)s.boost=Math.max(0,s.boost-dt);if(s.slow>0)s.slow=Math.max(0,s.slow-dt);if(s.spring>0){s.speed+=20*dt;s.spring-=dt}
    s.lane+=(s.target-s.lane)*Math.min(1,dt*9);s.z=Math.min(LENGTH,s.z+s.speed*dt*58);
    for(const it of track){if(it.hit)continue;const dz=it.z-s.z;if(dz<0||dz>38||Math.abs(it.lane-s.lane)>.38)continue;it.hit=true;if(it.kind==='coin')setScore(v=>v+25);if(it.kind==='boost')s.boost=2.5;if(it.kind==='spring'){s.spring=1;s.speed+=11}if(it.kind==='slow'){s.slow=2;s.speed*=.45}if(it.kind==='kill'){s.speed=0;setDead(true);setPlaying(false);setStatus('CRASHED')}if(it.kind==='ramp'){s.spring=.8;s.speed+=8}if(it.kind==='hammer')s.speed*=.25}
    if(s.z>=LENGTH){setFinished(true);setPlaying(false);setStatus('FINISH — YOU WIN')}
    if(ws.current?.readyState===1)ws.current.send(JSON.stringify({type:'state',room,player,z:s.z,lane:s.lane,score:scoreRef.current,finished:s.z>=LENGTH}));
   }
   g.clearRect(0,0,w,h);const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#061a32');sky.addColorStop(.5,'#0b3652');sky.addColorStop(1,'#03070d');g.fillStyle=sky;g.fillRect(0,0,w,h);
   const hz=h*.27,top=w*.12,bot=w*1.08;g.fillStyle='#1a2635';poly([w/2-top/2,hz,w/2+top/2,hz,w/2+bot/2,h,w/2-bot/2,h]);g.fill();
   for(let lane=-1;lane<=1;lane++){g.strokeStyle='rgba(255,255,255,.22)';g.setLineDash([16,18]);g.beginPath();g.moveTo(w/2+lane*top/6,hz);g.lineTo(w/2+lane*bot/6,h);g.stroke();g.setLineDash([])}
   for(let i=0;i<24;i++){const d=((i*220-s.z)%1800+1800)%1800,p=1-d/1800,y=hz+p*p*(h-hz),rw=top+p*(bot-top);g.strokeStyle=i%2?'rgba(34,211,238,.16)':'rgba(255,255,255,.09)';g.beginPath();g.moveTo(w/2-rw/2,y);g.lineTo(w/2+rw/2,y);g.stroke()}
   for(const it of track){const dz=it.z-s.z;if(it.hit||dz<5||dz>1250)continue;const p=1-dz/1250,y=hz+p*p*(h-hz),rw=top+p*(bot-top),x=w/2+it.lane*rw/6;drawItem(it,x,y,.35+p*1.5)}
   const px=w/2+s.lane*bot/6;ball(px,h*.78,Math.max(22,w*.04),player===1?'#38bdf8':'#fb4f72');
   if(remote.current){const dz=Math.max(0,Math.min(1250,remote.current.z-s.z)),p=1-dz/1250,y=hz+p*p*(h-hz),rw=top+p*(bot-top),x=w/2+remote.current.lane*rw/6;ball(x,y,Math.max(13,w*.025),player===1?'#fb4f72':'#38bdf8')}
   g.fillStyle='rgba(1,7,17,.82)';g.fillRect(14,14,Math.min(390,w-28),90);g.fillStyle='#fff';g.font='900 16px system-ui';g.fillText(`RUSH  ${Math.floor(s.z)} / ${LENGTH}m`,28,40);g.fillStyle='#22d3ee';g.fillText(`SPEED ${s.speed.toFixed(1)}x`,28,66);g.fillStyle='#facc15';g.fillText(`🪙 ${scoreRef.current} SP`,180,66);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(28,80,Math.min(350,w-56),5);g.fillStyle='#22d3ee';g.fillRect(28,80,Math.min(350,w-56)*s.z/LENGTH,5);
   if(count!==null){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.font='900 100px system-ui';g.fillText(count>0?String(count):'RUSH!',w/2,h*.52);g.textAlign='left'}
   if(paused&&!dead&&!finished){g.fillStyle='rgba(0,0,0,.62)';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.font='900 54px system-ui';g.fillText('PAUSED',w/2,h*.46);g.font='700 18px system-ui';g.fillText('Tap PLAY to continue',w/2,h*.53);g.textAlign='left'}
   if(dead||finished){g.fillStyle='rgba(0,0,0,.72)';g.fillRect(0,0,w,h);g.textAlign='center';g.fillStyle=dead?'#ef4444':'#facc15';g.font='900 52px system-ui';g.fillText(dead?'CRASH!':'🏁 YOU WIN',w/2,h*.46);g.fillStyle='#fff';g.font='700 20px system-ui';g.fillText('Tap PLAY AGAIN for a fresh race',w/2,h*.54);g.textAlign='left'}
   raf=requestAnimationFrame(loop);
  };
  resize();addEventListener('resize',resize);addEventListener('keydown',keydown);addEventListener('keyup',keyup);c.addEventListener('touchstart',touchStart,{passive:false});c.addEventListener('touchmove',touchMove,{passive:false});raf=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('keydown',keydown);removeEventListener('keyup',keyup);c.removeEventListener('touchstart',touchStart);c.removeEventListener('touchmove',touchMove)};
 },[paused,dead,finished,player,room,count,boosting]);

 const start=()=>{game.current={z:0,lane:0,target:0,speed:0,boost:0,slow:0,spring:0};scoreRef.current=0;setScore(0);setDead(false);setFinished(false);setPaused(false);started.current=false;setCount(3);setStatus('GET READY');let n=3;const timer=setInterval(()=>{n--;if(n<=0){clearInterval(timer);setCount(0);started.current=true;setPlaying(true);setStatus('RUSH!');setTimeout(()=>setCount(null),350)}else setCount(n)},700)};
 const togglePause=()=>{if(!started.current||dead||finished||count!==null)return;setPaused(v=>{const next=!v;setPlaying(!next);setStatus(next?'PAUSED':'RUSH!');return next})};
 const create=()=>{const code=Math.random().toString(36).slice(2,8).toUpperCase();setPlayer(1);setRoom(code);setStatus(`ROOM ${code} • PRACTICE READY`);start()};
 const join=()=>{if(room.length<4)return;setPlayer(2);setStatus(`ROOM ${room} • READY`);start();const url=process.env.NEXT_PUBLIC_JUSU_RUSH_WS_URL;if(url){const socket=new WebSocket(url);ws.current=socket;socket.onopen=()=>socket.send(JSON.stringify({type:'join',room,player:2}))}};
 const boost=()=>{if(started.current&&!paused&&!dead&&!finished){game.current.boost=2;setBoosting(true);setTimeout(()=>setBoosting(false),250)}};
 return <main className="min-h-screen bg-[#02060d] text-white"><div className="mx-auto flex min-h-screen max-w-[1500px] flex-col p-3 sm:p-5"><header className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3"><button onClick={()=>router.push('/')} className="font-bold text-slate-400">← Savings</button><div className="text-center"><p className="text-[10px] font-black tracking-[.5em] text-cyan-400">JUSU</p><h1 className="text-3xl font-black">RUSH</h1></div><b className="text-yellow-300">{score} SP</b></header><div className="grid flex-1 gap-3 lg:grid-cols-[250px_1fr]"><aside className="order-2 rounded-2xl border border-white/10 bg-[#09111e] p-4 lg:order-1"><p className="text-xs font-black tracking-[.2em] text-cyan-400">RACE GARAGE</p><h2 className="mt-2 text-xl font-black">2-PLAYER RUSH</h2><p className="mt-1 text-xs leading-5 text-slate-500">Roll, boost, jump, dodge and beat your friend.</p><button onClick={create} className="mt-4 w-full rounded-xl bg-cyan-400 py-3 font-black text-slate-950">START RACE</button><input value={room} onChange={e=>setRoom(e.target.value.toUpperCase().slice(0,6))} placeholder="ROOM CODE" className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-center font-black tracking-[.35em]"/><button onClick={join} disabled={room.length<4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 py-3 font-bold disabled:opacity-30">JOIN FRIEND</button><div className="mt-4 grid grid-cols-3 gap-2"><button onClick={togglePause} disabled={!started.current||dead||finished||count!==null} className="rounded-xl bg-white py-3 text-xs font-black text-black disabled:opacity-30">{paused?'▶ PLAY':'⏸ PAUSE'}</button><button onClick={start} className="rounded-xl bg-cyan-400 py-3 text-xs font-black text-slate-950">↻ PLAY AGAIN</button><button onPointerDown={boost} className="rounded-xl bg-yellow-300 py-3 text-xs font-black text-black">⚡ BOOST</button></div><div className="mt-4 rounded-xl bg-black/30 p-3"><p className="text-[10px] text-slate-500">STATUS</p><p className="mt-1 text-xs font-bold">{status}</p></div><div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-black"><span className="rounded-lg bg-yellow-400/10 p-2 text-yellow-300">🪙 COINS</span><span className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300">⚡ BOOST</span><span className="rounded-lg bg-purple-400/10 p-2 text-purple-300">🌀 SPRING</span><span className="rounded-lg bg-blue-400/10 p-2 text-blue-300">❄ SLOW</span><span className="rounded-lg bg-red-400/10 p-2 text-red-300">☠ KILL</span><span className="rounded-lg bg-orange-400/10 p-2 text-orange-300">↗ RAMP</span></div><p className="mt-4 text-[10px] leading-4 text-slate-600">Swipe left/right to steer. Tap BOOST or hold Space/Shift.</p>{(dead||finished)&&<button onClick={start} className="mt-4 w-full rounded-xl bg-white py-3 font-black text-black">REMATCH</button>}</aside><div className="relative min-h-[76vh] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><canvas ref={canvas} className="h-full min-h-[76vh] w-full touch-none"/><button onPointerDown={boost} className="absolute bottom-5 right-5 rounded-full border-4 border-cyan-200/40 bg-cyan-400 px-7 py-7 text-sm font-black text-slate-950 shadow-2xl active:scale-95">BOOST<br/>⚡</button>{!playing&&<div className="pointer-events-none absolute inset-x-0 bottom-24 text-center text-xs font-black tracking-widest text-slate-400">PRESS START RACE TO PLAY</div>}</div></div></div></main>;
}
