"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface Stat {
  prefix?: string;
  value: number | string;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 30, suffix: "+", label: "jogos disponíveis" },
  { value: "24", suffix: "/7", label: "suporte online" },
  { value: 100, suffix: "%", label: "criptografado" },
  { prefix: "R$", value: 0, suffix: "", label: "taxa de cadastro" },
];

// Animates a number from 0 to target when in view
function AnimatedNumber({ stat }: { stat: Stat }) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState<string | number>(
    prefersReduced ? stat.value : 0,
  );

  useEffect(() => {
    if (!isInView || prefersReduced || typeof stat.value !== "number") return;

    const target = stat.value;
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    }

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isInView, prefersReduced, stat.value]);

  return (
    <span
      ref={ref}
      className="font-heading font-black tabular-nums"
      style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
    >
      {stat.prefix}
      {typeof stat.value === "string" ? stat.value : display}
      {stat.suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section
      aria-label="Números da plataforma"
      className="relative z-10 border-y border-border-subtle bg-surface/60 backdrop-blur-md"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border-subtle">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center py-8 px-4 text-center gap-1 ${
                i % 2 === 0 ? "md:items-end" : "md:items-start"
              } md:items-center`}
            >
              {/* Gradient value */}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00D4FF 0%, #FFB800 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <AnimatedNumber stat={stat} />
              </span>
              <span className="text-xs sm:text-sm text-text-muted leading-tight max-w-[120px]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
