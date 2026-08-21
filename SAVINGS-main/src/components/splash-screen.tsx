'use client';

import { useEffect, useState } from "react";

const NAME = "JUSU";
const STEP_MS = 320;

export function SplashScreen() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [direction, setDirection] = useState<"in" | "out">("in");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleCount((current) => {
        if (direction === "in") {
          if (current < NAME.length) return current + 1;
          setDirection("out");
          return current;
        }

        if (current > 0) return current - 1;
        setDirection("in");
        return current;
      });
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [direction]);

  return (
    <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-background text-primary">
      <div className="flex flex-col items-center gap-5">
        <div
          className="flex h-20 items-center justify-center sm:h-24"
          aria-label="JUSU loading"
          role="status"
          aria-live="polite"
        >
          {NAME.split("").map((letter, index) => {
            const visible = index < visibleCount;
            return (
              <span
                key={`${letter}-${index}`}
                className={`inline-block w-[0.72em] text-center text-6xl font-black tracking-tight transition-all duration-300 ease-out sm:text-7xl ${
                  visible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-2 scale-75 opacity-0"
                }`}
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70" aria-hidden="true" />
      </div>
    </main>
  );
}
