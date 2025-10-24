
'use client';

import { Logo } from "./logo";

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary animate-pulse">
      <div className="flex flex-col items-center gap-6 text-center">
         <Logo />
        <div>
            <p className="text-lg font-semibold tracking-wider text-muted-foreground">POWERED BY</p>
            <p className="text-2xl font-bold tracking-widest text-primary">JUSU TECH TEAM</p>
        </div>
      </div>
    </div>
  );
}
