'use client';

import { useEffect, useState } from "react";

const NAME = "JUSU";

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
    }, 280);

    return () => window.clearInterval(timer);
  }, [direction]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-primary">
      <div
        className="flex items-center justify-center text-5xl font-black tracking-[0.18em] sm:text-6xl"
        aria-label="JUSU loading"
      >
        {NAME.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`inline-block min-w-[0.7em] text-center transition-all duration-200 ease-out ${
              index < visibleCount
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-1 scale-75 opacity-0"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
