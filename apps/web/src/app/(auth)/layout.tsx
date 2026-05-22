"use client";

import { motion } from "motion/react";
import { GlowOrb, Logo } from "@casino/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel — form ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm space-y-8">
          {/* Brand */}
          <div className="flex justify-center">
            <Logo size={48} showText text="Casino Platform" />
          </div>

          {/* Page content */}
          {children}
        </div>
      </div>

      {/* ── Right panel — decorative (hidden on mobile) ──────────────────── */}
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden bg-surface">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 60% 50%, rgba(0,212,255,0.08) 0%, rgba(255,184,0,0.05) 50%, transparent 80%)",
          }}
        />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"
          animate={{ y: [0, -40, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <GlowOrb size={220} color="cyan" intensity="normal" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 right-1/4"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <GlowOrb size={140} color="gold" intensity="subtle" />
        </motion.div>

        <motion.div
          className="absolute top-2/3 left-1/3"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{
            repeat: Infinity,
            duration: 9,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          <GlowOrb size={80} color="cyan" intensity="subtle" />
        </motion.div>

        {/* Center text */}
        <div className="relative z-10 text-center px-8 max-w-sm">
          <h2 className="font-heading text-2xl font-bold text-text-primary leading-tight">
            Entretenimento.
            <br />
            <span className="text-accent-primary">Seguro.</span> Transparente.
          </h2>
          <p className="mt-4 text-text-secondary text-sm leading-relaxed">
            Plataforma demo com jogos locais, carteira virtual e painel de
            administração completo.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Jogos", value: "30+" },
              { label: "RTP médio", value: "96.5%" },
              { label: "Modo", value: "Demo" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-lg font-bold text-accent-primary font-mono">
                  {value}
                </p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
