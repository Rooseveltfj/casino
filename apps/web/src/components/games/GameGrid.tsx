"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Gamepad2, RefreshCw } from "lucide-react";
import { Button } from "@casino/ui";
import { GameCard, GameCardSkeleton } from "./game-card";
import type { GameCardData } from "./game-card";

// ── Grid column class map ─────────────────────────────────────────────────────

const COLS_CLASS = {
  3: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5",
} as const;

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="relative">
        <Gamepad2
          size={64}
          className="text-text-muted opacity-20"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 blur-xl opacity-20 scale-150"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
          }}
        />
      </div>
      <div>
        <p className="text-base font-semibold text-text-primary">
          Nenhum jogo encontrado
        </p>
        <p className="text-sm text-text-muted mt-1">
          Tente ajustar ou limpar os filtros.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
      <AlertTriangle
        size={40}
        className="text-error opacity-60"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-text-primary">
          Erro ao carregar jogos
        </p>
        <p className="text-xs text-text-muted mt-1">
          Verifique sua conexão e tente novamente.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw size={13} className="mr-1.5" aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────

function LoadingRow({ cols }: { cols: 3 | 4 }) {
  return (
    <>
      {Array.from({ length: cols === 3 ? 3 : 4 }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface GameGridProps {
  games: GameCardData[];
  totalCount: number;
  cols: 3 | 4;
  isLoading: boolean;
  hasError: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function GameGrid({
  games,
  totalCount,
  cols,
  isLoading,
  hasError,
  hasMore,
  onLoadMore,
  onRetry,
  onClearFilters,
}: GameGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — triggers onLoadMore when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  const gridClass = `grid ${COLS_CLASS[cols]} gap-3`;

  return (
    <div>
      <div className={gridClass} id="games-grid" aria-label="Lista de jogos">
        {/* Game cards */}
        {games.map((game, i) => (
          <GameCard
            key={game.id}
            game={game}
            index={i % 20}
            noAnimate={i < 20} // first page loads without stagger to avoid delay
          />
        ))}

        {/* Initial loading state */}
        {isLoading && games.length === 0 && <LoadingRow cols={cols} />}

        {/* Error state */}
        {hasError && !isLoading && (
          <ErrorState onRetry={onRetry} />
        )}

        {/* Empty state */}
        {!isLoading && !hasError && games.length === 0 && totalCount === 0 && (
          <EmptyState onClear={onClearFilters} />
        )}
      </div>

      {/* Infinite scroll sentinel + loading indicator */}
      {(hasMore || (isLoading && games.length > 0)) && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className={`${gridClass} mt-3`}
        >
          <LoadingRow cols={cols} />
        </div>
      )}
    </div>
  );
}
