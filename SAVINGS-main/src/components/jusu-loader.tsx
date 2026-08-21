"use client";

export function JusuLoader() {
  return (
    <div
      role="status"
      aria-label="Loading JUSU"
      className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-6"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-20 items-center justify-center" aria-hidden="true">
          {"JUSU".split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="jusu-loader-letter text-5xl font-black tracking-[-0.08em] text-primary sm:text-6xl"
              style={{ animationDelay: `${index * 180}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/40" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/80 [animation-delay:300ms]" />
        </div>
        <style jsx>{`
          .jusu-loader-letter {
            display: inline-block;
            opacity: 0;
            transform: translateY(8px) scale(0.88);
            animation: jusu-letter-cycle 1.8s ease-in-out infinite;
          }

          @keyframes jusu-letter-cycle {
            0%, 8% {
              opacity: 0;
              transform: translateY(8px) scale(0.88);
            }
            18%, 68% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            78%, 100% {
              opacity: 0;
              transform: translateY(-8px) scale(0.88);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .jusu-loader-letter {
              animation: none;
              opacity: 1;
              transform: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
