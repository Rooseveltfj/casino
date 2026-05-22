"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import type { SortOption, CategoryFilter } from "@/app/actions/games";

// ── Category label map ────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<CategoryFilter, string> = {
  slot:    "Slots",
  crash:   "Crash",
  table:   "Mesa",
  live:    "Ao Vivo",
  sport:   "Esportes",
  instant: "Instant Win",
};

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "popular", label: "Populares" },
  { id: "newest",  label: "Mais novos" },
  { id: "rtp",     label: "RTP Alto" },
  { id: "az",      label: "A–Z" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameHeaderProps {
  totalCount: number;
  cols: 3 | 4;
  onColsChange: (c: 3 | 4) => void;
  onOpenFilters: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GameHeader({
  totalCount,
  cols,
  onColsChange,
  onOpenFilters,
}: GameHeaderProps) {
  const sp = useSearchParams();

  const activeCategory = (sp.get("category")?.split(",")[0] as CategoryFilter | undefined);
  const sort = (sp.get("sort") ?? "popular") as SortOption;

  function updateSort(s: SortOption) {
    const params = new URLSearchParams(sp.toString());
    if (s === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", s);
    }
    params.delete("page");
    window.history.pushState(null, "", `?${params.toString()}`);
    // Trigger a popstate so useSearchParams re-reads
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="space-y-3">
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-xs text-text-muted">
          <li>
            <Link href="/" className="hover:text-text-secondary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={12} />
          </li>
          <li>
            <Link href="/jogos" className={`hover:text-text-secondary transition-colors ${!activeCategory ? "text-text-primary font-medium" : ""}`}>
              Jogos
            </Link>
          </li>
          {activeCategory && (
            <>
              <li aria-hidden="true">
                <ChevronRight size={12} />
              </li>
              <li
                className="text-text-primary font-medium"
                aria-current="page"
              >
                {CATEGORY_LABEL[activeCategory]}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* ── Controls bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Game count */}
        <p className="text-sm text-text-secondary shrink-0">
          <span className="font-bold text-text-primary font-mono tabular-nums">
            {totalCount}
          </span>{" "}
          {totalCount === 1 ? "jogo" : "jogos"}
        </p>

        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={sort}
            onChange={(e) => updateSort(e.target.value as SortOption)}
            className="h-8 px-2 pr-7 text-xs rounded-lg border border-border-default bg-surface-elevated text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-accent-primary transition-colors"
            aria-label="Ordenar jogos"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892b0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            {SORT_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        {/* Grid cols toggle (desktop only) */}
        <div
          className="hidden sm:flex items-center gap-1 shrink-0"
          role="group"
          aria-label="Colunas do grid"
        >
          <button
            onClick={() => onColsChange(3)}
            aria-pressed={cols === 3}
            aria-label="3 colunas"
            className={`p-1.5 rounded-lg border transition-colors ${
              cols === 3
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                : "border-border-default text-text-muted hover:text-text-secondary"
            }`}
          >
            <Grid3x3 size={15} aria-hidden="true" />
          </button>
          <button
            onClick={() => onColsChange(4)}
            aria-pressed={cols === 4}
            aria-label="4 colunas"
            className={`p-1.5 rounded-lg border transition-colors ${
              cols === 4
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                : "border-border-default text-text-muted hover:text-text-secondary"
            }`}
          >
            <Grid2x2 size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Mobile filters button */}
        <button
          onClick={onOpenFilters}
          className="sm:hidden flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg border border-border-default text-text-secondary hover:border-accent-primary hover:text-text-primary transition-colors shrink-0"
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal size={13} aria-hidden="true" />
          Filtros
        </button>
      </div>
    </div>
  );
}

// Unused imports suppressed — kept for when needed
void LayoutGrid;
