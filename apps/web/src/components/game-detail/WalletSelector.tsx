"use client";

import { useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@casino/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WalletType = "demo" | "real" | "bonus";

interface BalanceResponse {
  balances: { demo: string; real: string; bonus: string; locked: string };
  hasReal: boolean;
  isGuest: boolean;
}

interface WalletSelectorProps {
  walletType: WalletType;
  onChange: (w: WalletType) => void;
  isLoggedIn: boolean;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

const fetcher = (url: string): Promise<BalanceResponse> =>
  fetch(url).then((r) => r.json() as Promise<BalanceResponse>);

// ── Component ─────────────────────────────────────────────────────────────────

export function WalletSelector({
  walletType,
  onChange,
  isLoggedIn,
}: WalletSelectorProps) {
  const { data, isLoading } = useSWR<BalanceResponse>(
    isLoggedIn ? "/api/wallet/balance" : null,
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );

  const balances = data?.balances ?? {
    demo: "1000.00",
    real: "0.00",
    bonus: "0.00",
    locked: "0.00",
  };
  const hasReal = data?.hasReal ?? false;

  // If user has no real balance and tries to use real wallet, force back to demo
  useEffect(() => {
    if (walletType === "real" && !hasReal && data && !isLoading) {
      onChange("demo");
    }
  }, [walletType, hasReal, data, isLoading, onChange]);

  const currentBalance = balances[walletType] ?? "0.00";
  const formattedBalance = `R$ ${parseFloat(currentBalance).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="rounded-xl bg-surface-elevated border border-border-default p-3">
      {/* Toggle row */}
      <div
        role="radiogroup"
        aria-label="Selecionar tipo de carteira"
        className="flex items-center gap-1 p-0.5 bg-background rounded-lg"
      >
        <button
          role="radio"
          aria-checked={walletType === "demo"}
          onClick={() => onChange("demo")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            walletType === "demo"
              ? "bg-accent-secondary text-background shadow-glow-gold"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          DEMO
        </button>
        <button
          role="radio"
          aria-checked={walletType === "real"}
          disabled={!isLoggedIn || !hasReal}
          onClick={() => onChange("real")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            walletType === "real"
              ? "bg-accent-primary text-background shadow-glow-primary"
              : "text-text-muted hover:text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-muted"
          }`}
        >
          REAL
          {(!isLoggedIn || !hasReal) && (
            <Lock size={9} className="inline ml-1 -mt-px" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Balance display */}
      <div className="mt-3 px-1">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Saldo {walletType === "demo" ? "Demo" : walletType === "real" ? "Real" : "Bônus"}
        </p>
        <p className="font-mono text-2xl font-bold text-text-primary mt-0.5 tabular-nums">
          {formattedBalance}
        </p>
        {walletType === "real" && parseFloat(balances.real) === 0 && (
          <Button
            asChild
            size="sm"
            className="w-full mt-2.5"
          >
            <Link href="/carteira/deposito">
              <CreditCard size={13} className="mr-1.5" aria-hidden="true" />
              Depositar agora
            </Link>
          </Button>
        )}
      </div>

      {/* Guest CTA */}
      {!isLoggedIn && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted text-center mb-2">
            Cadastre-se para apostar com saldo real
          </p>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
