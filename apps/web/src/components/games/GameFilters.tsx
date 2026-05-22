"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@casino/ui";
import type { CategoryFilter, VolatilityFilter } from "@/app/actions/games";

// ── Filter config ─────────────────────────────────────────────────────────────

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "slot",    label: "Slots" },
  { id: "crash",   label: "Crash" },
  { id: "table",   label: "Mesa" },
  { id: "live",    label: "Ao Vivo" },
  { id: "sport",   label: "Esportes" },
  { id: "instant", label: "Instant Win" },
];

const PROVIDERS = [
  { id: "Internal",  label: "Mock Casino",       available: true  },
  { id: "Pragmatic", label: "Pragmatic Play",    available: false },
  { id: "Evolution", label: "Evolution Gaming",  available: false },
] as const;

const VOLATILITY: { id: VolatilityFilter; label: string }[] = [
  { id: "low",    label: "Baixa"  },
  { id: "medium", label: "Média"  },
  { id: "high",   label: "Alta"   },
];

// ── Dual Range Slider ─────────────────────────────────────────────────────────

function DualRangeSlider({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const thumbCls = `
    absolute w-full appearance-none bg-transparent pointer-events-none
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:pointer-events-auto
    [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-accent-primary
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:shadow-glow-primary
    [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:h-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-accent-primary
    [&::-moz-range-thumb]:border-0
    [&::-moz-range-thumb]:cursor-pointer
  `;

  return (
    <div>
      <div className="relative h-5">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-surface-elevated">
          <div
            className="absolute h-full rounded-full bg-accent-primary"
            style={{ left: `${min}%`, right: `${100 - max}%` }}
          />
        </div>

        {/* Min thumb */}
        <input
          type="range"
          min={0}
          max={100}
          value={min}
          className={thumbCls}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= max) onChange(v, max);
          }}
          aria-label="RTP mínimo"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={0}
          max={100}
          value={max}
          className={thumbCls}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= min) onChange(min, v);
          }}
          aria-label="RTP máximo"
        />
      </div>
      <div className="flex justify-between text-[11px] text-text-muted mt-1">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
        checked ? "bg-accent-primary" : "bg-surface-elevated border border-border-default"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface GameFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  /** Called when URL-synced params are about to change */
  onClose?: () => void;
}

export function GameFilters({
  searchQuery,
  onSearchChange,
  onClose,
}: GameFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();

  // ── Read filter state from URL ─────────────────────────────────────────────
  const activeCategories = (sp.get("category")?.split(",").filter(Boolean) ??
    []) as CategoryFilter[];
  const activeProviders   = sp.get("provider")?.split(",").filter(Boolean) ?? [];
  const minRtp            = Number(sp.get("minRtp") ?? "0");
  const maxRtp            = Number(sp.get("maxRtp") ?? "100");
  const activeVolatility  = (sp.get("volatility")?.split(",").filter(Boolean) ??
    []) as VolatilityFilter[];
  const featured          = sp.get("featured") === "true";

  const hasActiveFilters =
    activeCategories.length > 0 ||
    activeProviders.length > 0 ||
    minRtp > 0 ||
    maxRtp < 100 ||
    activeVolatility.length > 0 ||
    featured;

  // ── Generic URL param updater ───────────────────────────────────────────────
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, sp],
  );

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggleCategory = (id: CategoryFilter) => {
    const next = activeCategories.includes(id)
      ? activeCategories.filter((c) => c !== id)
      : [...activeCategories, id];
    updateParam("category", next.length ? next.join(",") : null);
  };

  const toggleProvider = (id: string) => {
    const next = activeProviders.includes(id)
      ? activeProviders.filter((p) => p !== id)
      : [...activeProviders, id];
    updateParam("provider", next.length ? next.join(",") : null);
  };

  const toggleVolatility = (id: VolatilityFilter) => {
    const next = activeVolatility.includes(id)
      ? activeVolatility.filter((v) => v !== id)
      : [...activeVolatility, id];
    updateParam("volatility", next.length ? next.join(",") : null);
  };

  const clearAll = () => {
    router.push("?", { scroll: false });
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* ── Busca local ──────────────────────────────────────────────── */}
      <FilterSection title="Buscar">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nome do jogo…"
          className="w-full h-9 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
          aria-label="Buscar jogos"
        />
      </FilterSection>

      {/* ── Categoria ────────────────────────────────────────────────── */}
      <FilterSection title="Categoria">
        <div className="space-y-2">
          {CATEGORIES.map(({ id, label }) => (
            <label
              key={id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(id)}
                onChange={() => toggleCategory(id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  activeCategories.includes(id)
                    ? "bg-accent-primary border-accent-primary"
                    : "border-border-default group-hover:border-accent-primary/50"
                }`}
              >
                {activeCategories.includes(id) && (
                  <svg
                    viewBox="0 0 10 8"
                    className="w-2.5 h-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── Provedor ─────────────────────────────────────────────────── */}
      <FilterSection title="Provedor">
        <div className="space-y-2">
          {PROVIDERS.map(({ id, label, available }) => (
            <label
              key={id}
              className={`flex items-center gap-2.5 ${available ? "cursor-pointer group" : "opacity-50 cursor-not-allowed"}`}
            >
              <input
                type="checkbox"
                disabled={!available}
                checked={available && activeProviders.includes(id)}
                onChange={() => available && toggleProvider(id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  available && activeProviders.includes(id)
                    ? "bg-accent-primary border-accent-primary"
                    : "border-border-default"
                }`}
              >
                {available && activeProviders.includes(id) && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-text-secondary flex-1">{label}</span>
              {!available && (
                <span className="text-[10px] bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded text-text-muted">
                  Em breve
                </span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── RTP range ────────────────────────────────────────────────── */}
      <FilterSection title="RTP (%)">
        <DualRangeSlider
          min={minRtp}
          max={maxRtp}
          onChange={(min, max) => {
            updateParam("minRtp", min > 0   ? String(min) : null);
            updateParam("maxRtp", max < 100 ? String(max) : null);
          }}
        />
      </FilterSection>

      {/* ── Volatilidade ─────────────────────────────────────────────── */}
      <FilterSection title="Volatilidade">
        <div className="flex gap-2 flex-wrap">
          {VOLATILITY.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleVolatility(id)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                activeVolatility.includes(id)
                  ? "bg-accent-primary border-accent-primary text-background"
                  : "border-border-default text-text-secondary hover:border-accent-primary/50 hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Apenas em destaque ────────────────────────────────────────── */}
      <FilterSection title="Mostrar apenas">
        <div className="flex items-center justify-between">
          <label
            htmlFor="featured-toggle"
            className="text-sm text-text-secondary cursor-pointer select-none"
          >
            Em destaque
          </label>
          <ToggleSwitch
            id="featured-toggle"
            checked={featured}
            onChange={(v) => updateParam("featured", v ? "true" : null)}
          />
        </div>
      </FilterSection>

      {/* ── Clear ────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="w-full border-error/40 text-error hover:bg-error/10 hover:border-error gap-1.5"
        >
          <X size={13} aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
