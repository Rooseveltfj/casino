"use client";

import useSWR from "swr";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@casino/ui";
import type { BetRecord } from "@/lib/games.server";

interface RecentBetsProps {
  slug: string;
  isLoggedIn: boolean;
}

const fetcher = (url: string): Promise<{ bets: BetRecord[]; total: number }> =>
  fetch(url).then((r) => r.json() as Promise<{ bets: BetRecord[]; total: number }>);

function formatTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatAmount(v: string): string {
  return parseFloat(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function RecentBets({ slug, isLoggedIn }: RecentBetsProps) {
  const { data, isLoading } = useSWR<{ bets: BetRecord[]; total: number }>(
    isLoggedIn ? `/api/games/${slug}/bets` : null,
    fetcher,
    { refreshInterval: 5_000, revalidateOnFocus: false },
  );

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-elevated p-4 text-center">
        <p className="text-xs text-text-muted mb-2">
          Suas apostas aparecem aqui
        </p>
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  const bets = data?.bets ?? [];

  return (
    <div className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-primary">
          Suas apostas
        </h3>
        <span className="text-[10px] text-text-muted flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
          Ao vivo
        </span>
      </div>

      {/* Loading skeleton */}
      {isLoading && bets.length === 0 && (
        <div className="px-3 py-2 space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 rounded bg-surface animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && bets.length === 0 && (
        <div className="py-6 px-3 text-center">
          <p className="text-xs text-text-muted">
            Nenhuma aposta ainda neste jogo.
          </p>
          <p className="text-[10px] text-text-muted opacity-60 mt-1">
            Suas apostas aparecem aqui em tempo real.
          </p>
        </div>
      )}

      {/* Bet rows */}
      {bets.length > 0 && (
        <div className="divide-y divide-border-subtle/40">
          {bets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center justify-between px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {bet.delta >= 0 ? (
                  <TrendingUp
                    size={12}
                    className="text-success shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <TrendingDown
                    size={12}
                    className="text-error shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="text-text-secondary capitalize">{bet.type}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                <span
                  className={
                    bet.delta >= 0 ? "text-success" : "text-error"
                  }
                >
                  {bet.delta >= 0 ? "+" : "-"}R$ {formatAmount(bet.amount)}
                </span>
                <span className="text-text-muted text-[10px] w-12 text-right">
                  {formatTime(bet.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
