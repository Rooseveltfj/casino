import { Suspense } from "react";
import type { Metadata } from "next";
import { getGames } from "@/app/actions/games";
import { GamesPageClient } from "@/components/games/GamesPageClient";
import { RecentGames } from "@/components/games/RecentGames";
import { GameCardSkeleton } from "@/components/games/game-card";
import type { CategoryFilter, VolatilityFilter, SortOption } from "@/app/actions/games";

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Jogos — Casino Platform",
  description:
    "Explore mais de 30 jogos: slots, crash, ao vivo, mesa e esportes. Filtre por categoria, RTP e volatilidade.",
};

// ── Search params types (Next.js 15: searchParams is a Promise) ───────────────

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}

// ── Skeleton for the whole client area ───────────────────────────────────────

function GamesPageSkeleton() {
  return (
    <div className="flex gap-0">
      {/* Sidebar skeleton */}
      <div className="hidden sm:block w-56 shrink-0 px-4 py-4 border-r border-border-subtle space-y-6">
        <div className="h-9 bg-surface-elevated rounded-lg animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>

      {/* Main skeleton */}
      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-3 mb-6">
          <div className="h-4 w-48 bg-surface-elevated rounded animate-pulse" />
          <div className="h-5 w-24 bg-surface-elevated rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function JogosPage({ searchParams }: PageProps) {
  // In Next.js 15, searchParams is a Promise
  const params = await searchParams;

  // Parse initial filter state from URL for SSR
  const categories = getStringParam(params, "category")
    ?.split(",")
    .filter(Boolean) as CategoryFilter[] | undefined;
  const providers = getStringParam(params, "provider")
    ?.split(",")
    .filter(Boolean);
  const minRtp = Number(getStringParam(params, "minRtp") ?? "0");
  const maxRtp = Number(getStringParam(params, "maxRtp") ?? "100");
  const volatility = getStringParam(params, "volatility")
    ?.split(",")
    .filter(Boolean) as VolatilityFilter[] | undefined;
  const featured    = getStringParam(params, "featured") === "true";
  const sort        = (getStringParam(params, "sort") ?? "popular") as SortOption;

  // Initial server fetch (pre-renders with correct filter state for SSR / shareable URLs)
  const initialData = await getGames({
    categories: categories?.length  ? categories  : undefined,
    providers:  providers?.length   ? providers   : undefined,
    minRtp:     minRtp  > 0         ? minRtp      : undefined,
    maxRtp:     maxRtp  < 100       ? maxRtp      : undefined,
    volatility: volatility?.length  ? volatility  : undefined,
    featured:   featured            ? true         : undefined,
    sort,
    page: 1,
    limit: 20,
  });

  return (
    <div className="min-h-screen">
      {/* "Continue de onde parou" — only renders when user is logged in */}
      <Suspense fallback={null}>
        <RecentGames />
      </Suspense>

      {/* Main games UI — wrapped in Suspense so useSearchParams works */}
      <Suspense fallback={<GamesPageSkeleton />}>
        <GamesPageClient initialData={initialData} />
      </Suspense>
    </div>
  );
}
