"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  CreditCard,
  Gift,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from "@casino/ui";
import { addDemoChips } from "@/app/actions/demo-topup";

const fetcher = (url: string): Promise<BalancesResponse> =>
  fetch(url).then((r) => r.json() as Promise<BalancesResponse>);

interface BalancesResponse {
  balances: {
    demo: string;
    real: string;
    bonus: string;
    locked: string;
  };
  hasReal: boolean;
}

const PAYMENT_METHODS = [
  {
    id: "pix",
    name: "Pix",
    desc: "Instantâneo",
    icon: "⚡",
    available: true,
    color: "from-emerald-900/40 to-transparent",
  },
  {
    id: "card",
    name: "Cartão",
    desc: "Visa, Master, Elo",
    icon: "💳",
    available: false,
    color: "from-blue-900/40 to-transparent",
  },
  {
    id: "crypto",
    name: "Crypto",
    desc: "BTC, ETH, USDT",
    icon: "₿",
    available: false,
    color: "from-orange-900/40 to-transparent",
  },
] as const;

function formatBRL(v: string) {
  return parseFloat(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function WalletSection() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { data, mutate } = useSWR<BalancesResponse>(
    "/api/wallet/balance",
    fetcher,
    { refreshInterval: 15_000 },
  );

  const balances = data?.balances ?? {
    demo: "1000.00",
    real: "0.00",
    bonus: "0.00",
    locked: "0.00",
  };

  const handleDemoTopup = () => {
    startTransition(async () => {
      const result = await addDemoChips();
      if (result.ok) {
        toast({
          variant: "success",
          title: "+200 fichas adicionadas!",
          description: `Novo saldo demo: R$ ${formatBRL(result.newBalance)}`,
        });
        void mutate();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Carteira
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Seus saldos e métodos de pagamento
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Demo */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 90% 10%, rgba(255,184,0,0.25), transparent 60%)",
            }}
          />
          <CardContent className="pt-5 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-accent-secondary/10">
                <Sparkles
                  size={18}
                  className="text-accent-secondary"
                  aria-hidden="true"
                />
              </div>
              <Badge
                variant="gold"
                className="text-[10px]"
              >
                Demo
              </Badge>
            </div>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Saldo demo
            </p>
            <p className="font-mono text-2xl font-bold text-text-primary mt-1 tabular-nums">
              R$ {formatBRL(balances.demo)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDemoTopup}
              disabled={isPending}
              className="w-full mt-4 gap-1.5"
            >
              <Plus size={13} aria-hidden="true" />
              {isPending ? "Adicionando…" : "Adicionar 200 fichas"}
            </Button>
          </CardContent>
        </Card>

        {/* Real */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 90% 10%, rgba(0,212,255,0.25), transparent 60%)",
            }}
          />
          <CardContent className="pt-5 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-accent-primary/10">
                <CircleDollarSign
                  size={18}
                  className="text-accent-primary"
                  aria-hidden="true"
                />
              </div>
              <Badge className="text-[10px]">Real</Badge>
            </div>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Saldo real
            </p>
            <p className="font-mono text-2xl font-bold text-text-primary mt-1 tabular-nums">
              R$ {formatBRL(balances.real)}
            </p>
            <div className="grid grid-cols-2 gap-1.5 mt-4">
              <Button asChild size="sm" className="gap-1">
                <Link href="/carteira/deposito">
                  <ArrowDownToLine size={12} aria-hidden="true" />
                  Depositar
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link href="/carteira/saque">
                  <ArrowUpFromLine size={12} aria-hidden="true" />
                  Sacar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bonus */}
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 90% 10%, rgba(139,92,246,0.25), transparent 60%)",
            }}
          />
          <CardContent className="pt-5 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Gift size={18} className="text-purple-400" aria-hidden="true" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Bônus
              </Badge>
            </div>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Saldo bônus
            </p>
            <p className="font-mono text-2xl font-bold text-text-primary mt-1 tabular-nums">
              R$ {formatBRL(balances.bonus)}
            </p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>Rollover</span>
                <span>0 / 0</span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-accent-primary transition-all"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard
              size={16}
              className="text-accent-primary"
              aria-hidden="true"
            />
            Métodos de pagamento disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.id}
                className={`relative rounded-xl border p-4 transition-opacity ${
                  m.available
                    ? "border-border-default hover:border-accent-primary/50"
                    : "border-border-subtle opacity-50"
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-br ${m.color} pointer-events-none rounded-xl opacity-50`}
                />
                <div className="relative">
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <p className="text-sm font-semibold text-text-primary">
                    {m.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{m.desc}</p>
                  {m.available ? (
                    <Badge
                      variant="success"
                      className="text-[10px] mt-2 inline-flex"
                    >
                      Ativo no demo
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] mt-2 inline-flex"
                    >
                      Em breve
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
