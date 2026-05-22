"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Clock,
  Gamepad2,
  MessageCircle,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  Tv,
  User,
  Wallet,
} from "lucide-react";
import { CATEGORY_CONFIG, THUMB_GRADIENT } from "@/components/games/game-card";
import type { GameCardData } from "@/components/games/game-card";
import { logGameSearch } from "@/app/actions/search-log";

// ── Static data ───────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: "deposit", label: "Depositar fundos", icon: Wallet, href: "/carteira/deposito" },
  { id: "profile", label: "Meu perfil", icon: User, href: "/perfil" },
  { id: "history", label: "Histórico", icon: Clock, href: "/carteira/historico" },
  { id: "support", label: "Suporte ao vivo", icon: MessageCircle, href: "/suporte" },
] as const;

const CATEGORY_ITEMS = [
  { id: "slot",    label: "Slots",       icon: Gamepad2, href: "/jogos?category=slot"    },
  { id: "crash",   label: "Crash",       icon: Rocket,   href: "/jogos?category=crash"   },
  { id: "live",    label: "Ao Vivo",     icon: Tv,       href: "/jogos?category=live"    },
  { id: "instant", label: "Instant Win", icon: Sparkles, href: "/jogos?category=instant" },
  { id: "sport",   label: "Esportes",    icon: Trophy,   href: "/jogos?category=sport"   },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type SearchResult = Pick<
  GameCardData,
  "id" | "slug" | "name" | "provider" | "category" | "thumbnailUrl" | "rtp" | "isFeatured"
>;

// ── useDebounce ───────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Mini game thumbnail ───────────────────────────────────────────────────────

function GameThumb({ game }: { game: SearchResult }) {
  const cat = CATEGORY_CONFIG[game.category];
  return (
    <div
      className="w-9 h-7 rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-white/50 overflow-hidden"
      style={{ background: THUMB_GRADIENT[game.category] }}
      aria-hidden="true"
    >
      {game.name[0]}
      {/* Badge overlay */}
      <span
        className={`absolute bottom-0 left-0 text-[8px] px-1 rounded-br ${cat.cls}`}
        style={{ fontSize: 7 }}
      >
        {cat.label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommandSearch() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router                = useRouter();
  const prefersReduced        = useReducedMotion();
  const abortRef              = useRef<AbortController | null>(null);

  // ── Global keyboard + custom event listeners ──────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);

    document.addEventListener("keydown", onKey);
    document.addEventListener("open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("open-search", onOpen);
    };
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setIsLoading(false);
    }
  }, [open]);

  // ── Debounced search ──────────────────────────────────────────────────────
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, limit: 8 }),
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<{ results: SearchResult[] }>)
      .then(({ results }) => {
        setResults(results);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") setIsLoading(false);
      });
  }, [debouncedQuery]);

  // ── Selection handlers ─────────────────────────────────────────────────────
  const handleGame = useCallback(
    (game: SearchResult) => {
      setOpen(false);
      router.push(`/jogos/${game.slug}`);
      // Fire-and-forget audit log
      void logGameSearch(query.trim(), game.slug);
    },
    [router, query],
  );

  const handleNav = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  // Matched categories when there's a query
  const matchedCategories =
    query.length >= 2
      ? CATEGORY_ITEMS.filter(
          (c) =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.id.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const showResults = query.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Busca global"
          className="fixed inset-0 z-[200]"
        >
          {/* ── Backdrop ─────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.15 }}
            onClick={() => setOpen(false)}
          />

          {/* ── Panel ────────────────────────────────────────────────── */}
          <div className="relative flex items-start justify-center pt-[14vh] px-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-xl bg-surface rounded-2xl border border-border-default shadow-2xl overflow-hidden"
              initial={prefersReduced ? {} : { opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReduced ? {} : { opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Command
                shouldFilter={false}
                aria-label="Busca de jogos"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-text-muted"
              >
                {/* ── Input ──────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
                  <Search
                    size={16}
                    className={`shrink-0 transition-colors ${isLoading ? "text-accent-primary animate-pulse" : "text-text-muted"}`}
                    aria-hidden="true"
                  />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Buscar jogos, categorias…"
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    autoFocus
                    aria-label="Buscar"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-text-muted hover:text-text-primary transition-colors text-xs"
                      aria-label="Limpar busca"
                    >
                      Limpar
                    </button>
                  )}
                  <kbd className="text-[10px] text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border-default shrink-0">
                    Esc
                  </kbd>
                </div>

                {/* ── Results ────────────────────────────────────────── */}
                <Command.List
                  className="max-h-[420px] overflow-y-auto p-1.5"
                  aria-label="Resultados da busca"
                >
                  {showResults ? (
                    <>
                      {/* Empty state */}
                      <Command.Empty className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                        <Search size={32} className="text-text-muted opacity-30" aria-hidden="true" />
                        <p className="text-sm text-text-muted">
                          {isLoading ? "Buscando…" : `Nenhum resultado para "${query}"`}
                        </p>
                        {!isLoading && (
                          <p className="text-xs text-text-muted opacity-60">
                            Tente outra palavra-chave
                          </p>
                        )}
                      </Command.Empty>

                      {/* Game results */}
                      {results.length > 0 && (
                        <Command.Group heading="Jogos">
                          {results.map((game) => (
                            <Command.Item
                              key={game.id}
                              value={`game-${game.slug}`}
                              onSelect={() => handleGame(game)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm aria-selected:bg-surface-elevated transition-colors group"
                            >
                              {/* Mini thumbnail */}
                              <div className="relative w-9 h-7 shrink-0">
                                <GameThumb game={game} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary truncate leading-tight group-aria-selected:text-accent-primary">
                                  {game.name}
                                </p>
                                <p className="text-[11px] text-text-muted truncate">
                                  {game.provider}
                                </p>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_CONFIG[game.category].cls}`}
                              >
                                {CATEGORY_CONFIG[game.category].label}
                              </span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {/* Category matches */}
                      {matchedCategories.length > 0 && (
                        <Command.Group heading="Categorias">
                          {matchedCategories.map(({ id, label, icon: Icon, href }) => (
                            <Command.Item
                              key={id}
                              value={`cat-${id}`}
                              onSelect={() => handleNav(href)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-text-secondary aria-selected:bg-surface-elevated aria-selected:text-text-primary transition-colors"
                            >
                              <Icon size={15} className="text-accent-primary shrink-0" aria-hidden="true" />
                              {label}
                              <span className="ml-auto text-xs text-text-muted">→</span>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {/* Always-visible quick actions */}
                      <Command.Group heading="Ações rápidas">
                        {QUICK_ACTIONS.map(({ id, label, icon: Icon, href }) => (
                          <Command.Item
                            key={id}
                            value={`action-${id}`}
                            onSelect={() => handleNav(href)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-text-secondary aria-selected:bg-surface-elevated aria-selected:text-text-primary transition-colors"
                          >
                            <Icon size={15} className="text-text-muted shrink-0" aria-hidden="true" />
                            {label}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  ) : (
                    <>
                      {/* ── Initial state: Quick actions ───────────── */}
                      <Command.Group heading="Ações rápidas">
                        {QUICK_ACTIONS.map(({ id, label, icon: Icon, href }) => (
                          <Command.Item
                            key={id}
                            value={`action-${id}`}
                            onSelect={() => handleNav(href)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-text-secondary aria-selected:bg-surface-elevated aria-selected:text-text-primary transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
                              <Icon size={14} className="text-text-muted" aria-hidden="true" />
                            </div>
                            {label}
                          </Command.Item>
                        ))}
                      </Command.Group>

                      <Command.Group heading="Categorias">
                        {CATEGORY_ITEMS.map(({ id, label, icon: Icon, href }) => (
                          <Command.Item
                            key={id}
                            value={`cat-init-${id}`}
                            onSelect={() => handleNav(href)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-text-secondary aria-selected:bg-surface-elevated aria-selected:text-text-primary transition-colors"
                          >
                            <Icon size={14} className="text-accent-primary shrink-0" aria-hidden="true" />
                            {label}
                            <span className="ml-auto text-xs text-text-muted">→</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}
                </Command.List>

                {/* ── Footer hint ─────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-2 border-t border-border-subtle text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <kbd className="bg-surface-elevated border border-border-default px-1 py-0.5 rounded text-[10px]">↑↓</kbd>
                    navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-surface-elevated border border-border-default px-1 py-0.5 rounded text-[10px]">↵</kbd>
                    abrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-surface-elevated border border-border-default px-1 py-0.5 rounded text-[10px]">Esc</kbd>
                    fechar
                  </span>
                  <span className="ml-auto">Casino Platform</span>
                </div>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Trigger button (for navbar) ───────────────────────────────────────────────

interface SearchTriggerProps {
  variant?: "full" | "icon";
  className?: string;
}

export function SearchTrigger({ variant = "full", className = "" }: SearchTriggerProps) {
  const open = () =>
    document.dispatchEvent(new CustomEvent("open-search"));

  if (variant === "icon") {
    return (
      <button
        onClick={open}
        aria-label="Abrir busca (Ctrl+K)"
        className={`p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors ${className}`}
      >
        <Search size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={open}
      aria-label="Abrir busca (Ctrl+K)"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border-default text-text-muted text-sm hover:border-accent-primary/40 transition-colors ${className}`}
    >
      <Search size={14} className="shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">Buscar jogos…</span>
      <kbd className="text-xs bg-surface border border-border-default px-1.5 py-0.5 rounded hidden sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
