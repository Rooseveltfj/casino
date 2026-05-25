"use client";

import { useEffect } from "react";
import useSWR from "swr";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Coins,
  Gift,
  Sparkles,
  TrendingUp,
  Undo2,
} from "lucide-react";
import { Skeleton } from "@casino/ui";
import type { TransactionRow } from "@/lib/profile.server";
import type { WalletType } from "./wallet-provider";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TransactionsResponse {
  rows: TransactionRow[];
  nextCursor: string | null;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchTransactions(url: string): Promise<TransactionsResponse> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json() as Promise<TransactionsResponse>;
}

// ── Visual config per transaction type ────────────────────────────────────────

const TX_CONFIG: Record<
  TransactionRow["type"],
  { label: string; icon: typeof Coins; tone: "in" | "out" | "neutral" }
> = {
  deposit: { label: "Depósito", icon: ArrowDownLeft, tone: "in" },
  withdrawal: { label: "Saque", icon: ArrowUpRight, tone: "out" },
  bet: { label: "Aposta", icon: Coins, tone: "out" },
  win: { label: "Ganho", icon: TrendingUp, tone: "in" },
  bonus_grant: { label: "Bônus recebido", icon: Gift, tone: "in" },
  bonus_release: { label: "Bônus liberado", icon: Sparkles, tone: "in" },
  adjustment: { label: "Ajuste", icon: CircleDollarSign, tone: "neutral" },
  rollback: { label: "Estorno", icon: Undo2, tone: "neutral" },
};

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatBRL(value: string): string {
  const n = parseFloat(value);
  return Number.isFinite(n) ? fmt.format(n) : "—";
}

function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h atrás`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} d atrás`;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface WalletTransactionsProps {
  walletType: WalletType;
  refreshKey: number;
  limit?: number;
}

export function WalletTransactions({
  walletType,
  refreshKey,
  limit = 15,
}: WalletTransactionsProps) {
  const url = `/api/profile/transactions?walletType=${walletType}&limit=${limit}`;
  const { data, isLoading, error, mutate } = useSWR<TransactionsResponse>(
    url,
    fetchTransactions,
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  // Refresh when realtime triggers via provider
  useEffect(() => {
    if (refreshKey > 0) void mutate();
  }, [refreshKey, mutate]);

  if (isLoading && !data) {
    return (
      <ul className="space-y-2" aria-label="Carregando transações">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-sm text-text-muted">
        Erro ao carregar transações.
      </div>
    );
  }

  const rows = data?.rows ?? [];
  if (!rows.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-muted">
          Nenhuma transação ainda nesta carteira.
        </p>
        <p className="text-xs text-text-muted mt-1">
          Suas próximas operações aparecerão aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1" aria-label="Últimas transações">
      {rows.map((tx) => {
        const cfg = TX_CONFIG[tx.type];
        const Icon = cfg.icon;
        const amount = parseFloat(tx.amount);
        const isPositive = cfg.tone === "in" || amount > 0;
        const sign = cfg.tone === "neutral" ? "" : isPositive ? "+" : "−";
        const toneClass =
          cfg.tone === "in"
            ? "text-success bg-success/10"
            : cfg.tone === "out"
              ? "text-error bg-error/10"
              : "text-text-muted bg-surface-elevated";
        const amountClass =
          cfg.tone === "in"
            ? "text-success"
            : cfg.tone === "out"
              ? "text-error"
              : "text-text-secondary";

        return (
          <li
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`shrink-0 size-9 rounded-full flex items-center justify-center ${toneClass}`}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {cfg.label}
                </p>
                <p className="text-xs text-text-muted">
                  {formatRelative(tx.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className={`text-sm font-mono font-medium ${amountClass}`}>
                {sign}
                {formatBRL(Math.abs(amount).toFixed(2))}
              </p>
              <p className="text-[10px] font-mono text-text-muted">
                {formatBRL(tx.balanceAfter)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
