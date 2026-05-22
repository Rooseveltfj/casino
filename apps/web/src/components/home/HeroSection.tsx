"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Logo } from "@casino/ui";

// ── Glow orbs ─────────────────────────────────────────────────────────────────

interface OrbProps {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  animX: number[];
  animY: number[];
  duration: number;
  delay?: number;
}

function GlowOrb({
  color,
  size,
  initialX,
  initialY,
  animX,
  animY,
  duration,
  delay = 0,
}: OrbProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: `radial-gradient(circle at 40% 40%, ${color} 0%, transparent 70%)`,
        filter: "blur(120px)",
        willChange: "transform",
      }}
      animate={
        prefersReduced
          ? {}
          : { x: animX, y: animY }
      }
      transition={{
        repeat: Infinity,
        duration,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// ── Scroll indicator ──────────────────────────────────────────────────────────

function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      aria-label="Rolar para baixo"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-text-secondary transition-colors"
      animate={prefersReduced ? {} : { y: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      exit={{ opacity: 0 }}
      onClick={() =>
        document
          .getElementById("catalog")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    >
      <ChevronDown size={28} />
    </motion.button>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const headlineRef = useRef<HTMLHeadingElement>(null);

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "min(100svh, 100vh)" }}
    >
      {/* ── Mesh gradient background ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,212,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(255,184,0,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 50% 10%, rgba(139,92,246,0.07) 0%, transparent 60%),
            #0A0E1A
          `,
        }}
      />

      {/* ── Animated glow orbs (transform-only for zero jank) ─────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <GlowOrb
          color="rgba(0,212,255,0.15)"
          size={700}
          initialX="-15%"
          initialY="-10%"
          animX={[0, 80, -40, 0]}
          animY={[0, 60, -30, 0]}
          duration={28}
        />
        <GlowOrb
          color="rgba(255,184,0,0.12)"
          size={500}
          initialX="55%"
          initialY="40%"
          animX={[0, -60, 30, 0]}
          animY={[0, -50, 40, 0]}
          duration={22}
          delay={4}
        />
        <GlowOrb
          color="rgba(139,92,246,0.10)"
          size={400}
          initialX="30%"
          initialY="50%"
          animX={[0, 50, -20, 0]}
          animY={[0, -40, 20, 0]}
          duration={18}
          delay={8}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 mb-6">
            <Logo size={18} />
            <span className="text-xs font-semibold text-accent-primary uppercase tracking-widest">
              Casino Platform Demo
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          ref={headlineRef}
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-black leading-[0.95] tracking-tight"
          style={{
            fontSize: "clamp(48px, 10vw, 96px)",
            background: "linear-gradient(110deg, #00D4FF 0%, #00E8FF 35%, #FFB800 70%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Jogue.&nbsp;Ganhe.
          <br />
          Repita.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 text-text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Mais de{" "}
          <span className="text-text-primary font-semibold">30 jogos exclusivos</span>.
          Cadastro em{" "}
          <span className="text-text-primary font-semibold">60 segundos</span>.
          Sem depósito para começar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {/* Primary CTA with pulsing glow */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-lg blur-lg opacity-60"
              style={{
                background: "rgba(0,212,255,0.4)",
                animation: prefersReduced
                  ? "none"
                  : "pulse-glow 2.5s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes pulse-glow {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
              }
              @media (prefers-reduced-motion: reduce) {
                .pulse-glow { animation: none !important; }
              }
            `}</style>
            <Button
              asChild
              size="lg"
              className="relative font-bold text-base px-8 shadow-glow-primary"
            >
              <Link href="/register">Começar agora →</Link>
            </Button>
          </div>

          {/* Secondary CTA */}
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 border-border-strong hover:border-accent-primary"
            onClick={() =>
              document
                .getElementById("catalog")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Ver jogos
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted"
        >
          {["🔒 SSL 256-bit", "🎮 Demo gratuito", "⚡ Acesso imediato", "🇧🇷 Suporte em PT"].map(
            (badge) => (
              <span
                key={badge}
                className="flex items-center gap-1 border border-border-subtle px-3 py-1 rounded-full"
              >
                {badge}
              </span>
            ),
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #0A0E1A 100%)",
        }}
      />
    </section>
  );
}
