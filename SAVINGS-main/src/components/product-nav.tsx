'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items=[['/','Home'],['/goals','Goals'],['/transactions','Activity'],['/rewards','Rewards'],['/jusu-rush','RUSH'],['/analytics','Analytics'],['/profile','Profile']];

export default function ProductNav(){
 const path=usePathname();
 return <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4"><Link href="/" className="text-lg font-black tracking-tight">SAVINGS<span className="text-primary">.</span></Link><div className="hidden items-center gap-1 md:flex">{items.map(([href,label])=><Link key={href} href={href} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${path===href?'bg-primary/10 text-primary':'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{label}</Link>)}</div><Link href="/jusu-rush" className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950">PLAY RUSH</Link></div><div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:hidden">{items.map(([href,label])=><Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${path===href?'bg-primary/10 text-primary':'text-muted-foreground'}`}>{label}</Link>)}</div></nav>
}