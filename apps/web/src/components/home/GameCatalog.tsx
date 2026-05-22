"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Button } from "@casino/ui";
import { GameCard, GameCardSkeleton } from "./GameCard";
import type { GameCardData } from "./GameCard";

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryFilter = "all" | "slot" | "crash" | "live" | "table" | "instant" | "sport";

interface Tab {
  id: CategoryFilter;
  label: string;
}

const TABS: Tab[] = [
  { id: "all",     label: "Todos" },
  { id: "crash",   label: "Crash" },
  { id: "slot",    label: "Slots" },
  { id: "live",    label: "Ao Vivo" },
  { id: "table",   label: "Mesa" },
  { id: "instant", label: "Instant" },
];

const PAGE_SIZE = 20;

// ── Component ─────────────────────────────────────────────────────────────────

export function GameCatalog({ games }: { games: GameCardData[] }) {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? games
        : games.filter((g) => g.category === activeTab),
    [games, activeTab],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visible.length < filtered.length;

  // Reset pagination when tab changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "250px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleTabChange = useCallback((tab: CategoryFilter) => {
    setActiveTab(tab);
    // Scroll to section top when changing tab
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div>
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 overflow-x-auto pb-2 mb-6"
        role="tablist"
        aria-label="Categorias de jogos"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              aria-controls="games-grid"
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative shrink-0 px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200 whitespace-nowrap
                ${
                  active
                    ? "text-white bg-surface-elevated"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50"
                }
              `}
            >
              {tab.label}
              {/* Underline indicator */}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Game grid ────────────────────────────────────────────────── */}
      <div
        id="games-grid"
        role="tabpanel"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3"
      >
        {visible.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Gamepad2
              size={56}
              className="text-text-muted opacity-25"
              aria-hidden="true"
            />
            <p className="text-text-secondary text-sm">
              Nenhum jogo nessa categoria ainda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("all")}
            >
              Ver todos os jogos
            </Button>
          </div>
        ) : (
          visible.map((game, i) => (
            <GameCard key={game.id} game={game} index={i % PAGE_SIZE} />
          ))
        )}
      </div>

      {/* ── Infinite scroll sentinel ──────────────────────────────────── */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 mt-3"
        >
          {Array.from({ length: Math.min(4, filtered.length - visibleCount) }).map(
            (_, i) => (
              <GameCardSkeleton key={i} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ── Section wrapper (receives server data) ────────────────────────────────────

export function GameCatalogSection({ games }: { games: GameCardData[] }) {
  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="relative z-10 px-4 sm:px-6 py-12 max-w-screen-2xl mx-auto"
    >
      <div className="mb-8">
        <p className="text-[11px] font-bold text-accent-primary uppercase tracking-widest mb-1">
          Catálogo
        </p>
        <h2
          id="catalog-heading"
          className="font-heading text-xl sm:text-2xl font-bold text-text-primary"
        >
          Encontre seu jogo favorito
        </h2>
      </div>
      <GameCatalog games={games} />
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function GameCatalogSkeleton() {
  return (
    <section className="px-4 sm:px-6 py-12 max-w-screen-2xl mx-auto">
      <div className="space-y-2 mb-8">
        <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
        <div className="h-7 w-56 bg-surface-elevated rounded animate-pulse" />
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 bg-surface-elevated rounded-lg animate-pulse"
          />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
