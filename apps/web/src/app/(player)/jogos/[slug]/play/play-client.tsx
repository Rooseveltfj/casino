"use client";

import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { THUMB_GRADIENT } from "@/components/games/game-card";
import type { GameCardData } from "@/components/games/game-card";

interface PlayClientProps {
  slug: string;
  gameName: string;
  category: GameCardData["category"];
  sessionId: string;
  walletType: "demo" | "real" | "bonus";
}

/**
 * Placeholder game canvas — runs inside the GameFrame iframe.
 *
 * TODO: replace with Phaser 3 + Matter.js mounting per game slug.
 *       The Phaser instance should:
 *         - load /games/{slug}/scene.js
 *         - read sessionId for bet placement
 *         - call /api/transactions for bet/win recording
 */
export function PlayClient({
  slug,
  gameName,
  category,
  sessionId,
  walletType,
}: PlayClientProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6"
      style={{ background: THUMB_GRADIENT[category] }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent, rgba(10,14,26,0.8))",
        }}
      />

      <div className="relative z-10 max-w-md space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/30">
          <Gamepad2
            size={32}
            className="text-accent-primary"
            aria-hidden="true"
          />
        </div>

        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            {gameName}
          </h1>
          <p className="text-text-secondary mt-2">
            Engine Phaser 3 + Matter.js — em desenvolvimento.
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-surface/80 backdrop-blur-md p-4 font-mono text-xs text-left space-y-1.5">
          <div className="flex justify-between gap-3">
            <span className="text-text-muted">slug</span>
            <span className="text-text-primary">{slug}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-text-muted">session</span>
            <span className="text-text-primary truncate">
              {sessionId.slice(0, 12)}…
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-text-muted">wallet</span>
            <span
              className={
                walletType === "demo"
                  ? "text-accent-secondary"
                  : "text-accent-primary"
              }
            >
              {walletType.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between gap-3 pt-1 border-t border-border-subtle">
            <span className="text-text-muted">elapsed</span>
            <span className="text-text-primary tabular-nums">{elapsed}s</span>
          </div>
        </div>

        <p className="text-[11px] text-text-muted">
          Esta tela é um placeholder. O jogo real renderiza aqui via Phaser 3
          quando integrado.
        </p>
      </div>
    </div>
  );
}
