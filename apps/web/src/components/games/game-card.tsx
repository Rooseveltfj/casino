"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Skeleton } from "@casino/ui";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GameCardData {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: "slot" | "live" | "crash" | "table" | "instant" | "sport";
  thumbnailUrl: string | null;
  rtp: string | null;
  isFeatured: boolean;
  volatility?: string | null;
}

// ── Category config ───────────────────────────────────────────────────────────

export const CATEGORY_CONFIG = {
  slot:    { label: "Slot",       cls: "bg-accent-primary/90 text-background" },
  crash:   { label: "Crash",      cls: "bg-accent-secondary/90 text-background" },
  live:    { label: "Ao Vivo",    cls: "bg-purple-500/90 text-white" },
  table:   { label: "Mesa",       cls: "bg-blue-500/90 text-white" },
  instant: { label: "Instant Win",cls: "bg-emerald-500/90 text-white" },
  sport:   { label: "Esportes",   cls: "bg-orange-500/90 text-white" },
} as const;

// Gradient thumbnail placeholder per category
export const THUMB_GRADIENT: Record<GameCardData["category"], string> = {
  slot:    "radial-gradient(ellipse at 30% 30%, #1a3a5c, #0a1020)",
  crash:   "radial-gradient(ellipse at 30% 30%, #3a2a00, #150f00)",
  live:    "radial-gradient(ellipse at 30% 30%, #2d1a4a, #100820)",
  table:   "radial-gradient(ellipse at 30% 30%, #0a2a1a, #050f0a)",
  instant: "radial-gradient(ellipse at 30% 30%, #0a2535, #050c10)",
  sport:   "radial-gradient(ellipse at 30% 30%, #2a1400, #100800)",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface GameCardProps {
  game: GameCardData;
  index?: number;
  /** When true, disables the stagger entry animation (grid context) */
  noAnimate?: boolean;
  className?: string;
}

export function GameCard({
  game,
  index = 0,
  noAnimate = false,
  className = "",
}: GameCardProps) {
  const prefersReduced = useReducedMotion();
  const [imgLoaded, setImgLoaded] = useState(false);
  const cfg = CATEGORY_CONFIG[game.category];
  const showRtp = game.rtp !== null && parseFloat(game.rtp) >= 95;

  const animProps =
    noAnimate || prefersReduced
      ? {}
      : {
          initial: { x: 40, opacity: 0 },
          whileInView: { x: 0, opacity: 1 },
          viewport: { once: true, margin: "-40px" },
          transition: {
            delay: Math.min(index * 0.05, 0.35),
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          },
        };

  return (
    <motion.div {...animProps} className={`group relative ${className}`}>
      <Link
        href={`/jogos/${game.slug}`}
        className="block rounded-xl overflow-hidden border border-border-default hover:border-accent-primary/60 hover:shadow-glow-primary transition-all duration-300 bg-surface-elevated"
        aria-label={`Jogar ${game.name}`}
      >
        {/* Thumbnail 4:3 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: THUMB_GRADIENT[game.category] }}
          />

          {game.thumbnailUrl && (
            <>
              {!imgLoaded && (
                <Skeleton className="absolute inset-0 rounded-none" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={game.thumbnailUrl}
                alt=""
                aria-hidden="true"
                width={400}
                height={300}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          )}

          {/* Category badge */}
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${cfg.cls}`}
          >
            {cfg.label}
          </span>

          {/* RTP badge (≥ 95%) */}
          {showRtp && (
            <span className="absolute top-2 right-2 text-[10px] font-mono text-text-muted bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {parseFloat(game.rtp!).toFixed(1)}%
            </span>
          )}

          {/* Hover play overlay */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-accent-primary text-background font-bold text-sm px-5 py-2.5 rounded-full shadow-glow-primary scale-90 group-hover:scale-100 transition-transform duration-200">
              <Play size={14} fill="currentColor" aria-hidden="true" />
              Jogar
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-text-primary truncate leading-tight">
            {game.name}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">
            {game.provider}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function GameCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden bg-surface-elevated ${className}`}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="px-3 py-2.5 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
