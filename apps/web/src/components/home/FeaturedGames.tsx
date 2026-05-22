import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { GameCard, GameCardSkeleton } from "./GameCard";
import type { GameCardData } from "./GameCard";

// ── Server wrapper (receives data from page.tsx) ──────────────────────────────

export function FeaturedGamesSection({ games }: { games: GameCardData[] }) {
  if (games.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative z-10 px-4 sm:px-6 py-12 max-w-screen-2xl mx-auto"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-accent-primary uppercase tracking-widest mb-1">
            Em Destaque
          </p>
          <h2
            id="featured-heading"
            className="font-heading text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2"
          >
            <Zap size={20} className="text-accent-primary" aria-hidden="true" />
            Os mais jogados agora
          </h2>
        </div>
        <Link
          href="/jogos"
          className="flex items-center gap-1 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
        >
          Ver todos
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* ── Horizontal scroll grid (desktop wraps, mobile scrolls) ── */}
      <div
        className="
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3
          lg:overflow-visible overflow-x-auto
          lg:pb-0 pb-2
          snap-x snap-mandatory lg:snap-none
          scrollbar-none
        "
        style={{ scrollbarWidth: "none" }}
      >
        {games.map((game, i) => (
          <div key={game.id} className="snap-start min-w-[160px] lg:min-w-0">
            <GameCard game={game} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Skeleton fallback ─────────────────────────────────────────────────────────

export function FeaturedGamesSkeleton() {
  return (
    <section className="px-4 sm:px-6 py-12 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-surface-elevated rounded animate-pulse" />
          <div className="h-7 w-48 bg-surface-elevated rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
