"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameFilters } from "./GameFilters";
import { FilterDrawer } from "./FilterDrawer";
import { GameHeader } from "./GameHeader";
import { GameGrid } from "./GameGrid";
import { getGames } from "@/app/actions/games";
import type { GameCardData } from "./game-card";
import type { GamesResult, CategoryFilter, VolatilityFilter, SortOption } from "@/app/actions/games";

// ── Props ─────────────────────────────────────────────────────────────────────

interface GamesPageClientProps {
  initialData: GamesResult;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  });

  const set = useCallback(
    (v: T) => {
      setValue(v);
      localStorage.setItem(key, JSON.stringify(v));
    },
    [key],
  );

  return [value, set];
}

// ── Main component ────────────────────────────────────────────────────────────

export function GamesPageClient({ initialData }: GamesPageClientProps) {
  const router = useRouter();
  const sp = useSearchParams();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cols, setCols] = useLocalStorage<3 | 4>("game-grid-cols", 4);

  // ── Server data state ────────────────────────────────────────────────────────
  const [loadedGames, setLoadedGames]     = useState<GameCardData[]>(initialData.games);
  const [totalCount, setTotalCount]       = useState(initialData.total);
  const [currentPage, setCurrentPage]     = useState(1);
  const [hasMore, setHasMore]             = useState(initialData.hasMore);
  const [hasError, setHasError]           = useState(false);
  const [isPending, startTransition]      = useTransition();

  // ── Read filter values from URL ──────────────────────────────────────────────
  const categories   = useMemo(() => (sp.get("category")?.split(",").filter(Boolean) ?? []) as CategoryFilter[], [sp]);
  const providers    = useMemo(() => sp.get("provider")?.split(",").filter(Boolean)    ?? [], [sp]);
  const minRtp       = useMemo(() => Number(sp.get("minRtp") ?? "0"),                          [sp]);
  const maxRtp       = useMemo(() => Number(sp.get("maxRtp") ?? "100"),                        [sp]);
  const volatility   = useMemo(() => (sp.get("volatility")?.split(",").filter(Boolean) ?? []) as VolatilityFilter[], [sp]);
  const featured     = useMemo(() => sp.get("featured") === "true",                            [sp]);
  const sort         = useMemo(() => (sp.get("sort") ?? "popular") as SortOption,              [sp]);

  // ── Filter key for change detection ─────────────────────────────────────────
  const filterKey = [
    categories.join(","),
    providers.join(","),
    minRtp,
    maxRtp,
    volatility.join(","),
    featured,
    sort,
  ].join("|");

  // ── Fetch from server when URL filters change (offline-first pattern) ────────
  // Local filter is applied instantly (useMemo below) while server round-trip is in flight.
  useEffect(() => {
    setHasError(false);
    setCurrentPage(1);

    startTransition(async () => {
      try {
        const result = await getGames({
          categories: categories.length ? categories : undefined,
          providers:  providers.length  ? providers  : undefined,
          minRtp:     minRtp  > 0       ? minRtp     : undefined,
          maxRtp:     maxRtp  < 100     ? maxRtp     : undefined,
          volatility: volatility.length ? volatility : undefined,
          featured:   featured          ? true        : undefined,
          sort,
          page: 1,
          limit: 20,
        });
        setLoadedGames(result.games);
        setTotalCount(result.total);
        setHasMore(result.hasMore);
      } catch {
        setHasError(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // ── Apply local filters instantly (offline-first) ────────────────────────────
  const locallyFiltered = useMemo(() => {
    let result = loadedGames;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q),
      );
    }

    // URL-based filters are already applied server-side, but if server
    // is still loading we also apply them to whatever is currently loaded.
    if (isPending) {
      if (categories.length)  result = result.filter((g) => categories.includes(g.category));
      if (providers.length)   result = result.filter((g) => providers.some((p) => g.provider.toLowerCase().includes(p.toLowerCase())));
      if (minRtp > 0)         result = result.filter((g) => g.rtp !== null && parseFloat(g.rtp) >= minRtp);
      if (maxRtp < 100)       result = result.filter((g) => g.rtp === null || parseFloat(g.rtp) <= maxRtp);
      if (volatility.length)  result = result.filter((g) => g.volatility && volatility.includes(g.volatility as VolatilityFilter));
      if (featured)           result = result.filter((g) => g.isFeatured);
    }

    return result;
  }, [loadedGames, searchQuery, isPending, categories, providers, minRtp, maxRtp, volatility, featured]);

  // ── Load more (infinite scroll) ──────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return;
    const nextPage = currentPage + 1;

    startTransition(async () => {
      try {
        const result = await getGames({
          categories: categories.length ? categories : undefined,
          providers:  providers.length  ? providers  : undefined,
          minRtp:     minRtp  > 0       ? minRtp     : undefined,
          maxRtp:     maxRtp  < 100     ? maxRtp     : undefined,
          volatility: volatility.length ? volatility : undefined,
          featured:   featured          ? true        : undefined,
          sort,
          page: nextPage,
          limit: 20,
        });
        setLoadedGames((prev) => [...prev, ...result.games]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
      } catch {
        // Silent fail on load more — user can scroll again to retry
      }
    });
  }, [isPending, hasMore, currentPage, categories, providers, minRtp, maxRtp, volatility, featured, sort]);

  // ── Clear all filters ────────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    router.push("?", { scroll: false });
    setSearchQuery("");
  }, [router]);

  // ── Cols persist ─────────────────────────────────────────────────────────────
  const handleColsChange = useCallback(
    (c: 3 | 4) => {
      setCols(c);
    },
    [setCols],
  );

  return (
    <div className="flex gap-0 min-h-[70vh]">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className="hidden sm:block w-56 shrink-0 border-r border-border-subtle px-4 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto"
        aria-label="Filtros de jogos"
      >
        <GameFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </aside>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-6">
        <GameHeader
          totalCount={searchQuery ? locallyFiltered.length : totalCount}
          cols={cols}
          onColsChange={handleColsChange}
          onOpenFilters={() => setDrawerOpen(true)}
        />

        <div className="mt-5">
          <GameGrid
            games={locallyFiltered}
            totalCount={searchQuery ? locallyFiltered.length : totalCount}
            cols={cols}
            isLoading={isPending}
            hasError={hasError}
            hasMore={hasMore && !searchQuery}
            onLoadMore={loadMore}
            onRetry={() => {
              setHasError(false);
              startTransition(async () => {
                try {
                  const r = await getGames({ sort, page: 1, limit: 20 });
                  setLoadedGames(r.games);
                  setTotalCount(r.total);
                  setHasMore(r.hasMore);
                } catch {
                  setHasError(true);
                }
              });
            }}
            onClearFilters={clearFilters}
          />
        </div>
      </main>
    </div>
  );
}
