"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  X,
} from "lucide-react";
import { Button, Separator } from "@casino/ui";
import { useWallet, type WalletType } from "./wallet-provider";
import { WalletTransactions } from "./wallet-transactions";
import { DemoTopupDialog } from "./demo-topup-dialog";

const TABS: { value: WalletType; label: string; tone: string }[] = [
  {
    value: "demo",
    label: "Demo",
    tone: "data-[active=true]:text-warning data-[active=true]:border-warning",
  },
  {
    value: "real",
    label: "Real",
    tone: "data-[active=true]:text-success data-[active=true]:border-success",
  },
  {
    value: "bonus",
    label: "Bônus",
    tone: "data-[active=true]:text-accent-primary data-[active=true]:border-accent-primary",
  },
];

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatBRL(value: string): string {
  const n = parseFloat(value);
  return Number.isFinite(n) ? fmt.format(n) : "R$ 0,00";
}

export function WalletDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    activeType,
    setActiveType,
    balances,
    hasReal,
    txRefreshKey,
  } = useWallet();
  const reduced = useReducedMotion();
  const [topupOpen, setTopupOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerOpen, closeDrawer]);

  const activeBalance = balances[activeType];

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="wallet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="wallet-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Carteira"
              initial={
                reduced ? { opacity: 0 } : { x: "100%", opacity: 0.5 }
              }
              animate={
                reduced ? { opacity: 1 } : { x: 0, opacity: 1 }
              }
              exit={
                reduced ? { opacity: 0 } : { x: "100%", opacity: 0.5 }
              }
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 280,
              }}
              className="fixed top-0 right-0 z-[90] h-dvh w-full sm:w-[420px] bg-surface border-l border-border-default shadow-2xl flex flex-col"
            >
              {/* Header */}
              <header className="shrink-0 border-b border-border-subtle">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-text-primary">
                      Carteira
                    </h2>
                    <p className="text-xs text-text-muted">
                      Saldos e transações recentes
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    aria-label="Fechar carteira"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                {/* Tabs */}
                <div
                  role="tablist"
                  aria-label="Tipo de carteira"
                  className="flex px-4"
                >
                  {TABS.map((t) => {
                    const active = t.value === activeType;
                    const disabled = t.value === "real" && !hasReal;
                    return (
                      <button
                        key={t.value}
                        role="tab"
                        aria-selected={active}
                        aria-controls={`wallet-panel-${t.value}`}
                        disabled={disabled}
                        data-active={active}
                        onClick={() => setActiveType(t.value)}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium border-b-2 border-transparent transition-colors text-text-muted hover:text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed ${t.tone}`}
                      >
                        {t.label}
                        {disabled && (
                          <span className="block text-[10px] font-normal text-text-muted">
                            (sem saldo)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active balance display */}
                <div className="px-4 pt-4 pb-5">
                  <p className="text-xs uppercase tracking-wider text-text-muted">
                    Saldo {TABS.find((t) => t.value === activeType)?.label}
                  </p>
                  <p className="font-mono text-3xl font-semibold text-text-primary mt-1 tabular-nums">
                    {formatBRL(activeBalance)}
                  </p>
                  {activeType === "bonus" &&
                    parseFloat(balances.locked) > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        {formatBRL(balances.locked)} bloqueado em rollover
                      </p>
                    )}
                </div>

                {/* Quick actions */}
                <div
                  role="tabpanel"
                  id={`wallet-panel-${activeType}`}
                  className="px-4 pb-4 grid grid-cols-3 gap-2"
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="flex flex-col h-auto py-2.5 gap-1"
                    onClick={() => {
                      closeDrawer();
                      window.location.assign("/carteira/depositar");
                    }}
                  >
                    <ArrowDownToLine size={16} aria-hidden="true" />
                    <span className="text-[11px]">Depositar Pix</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col h-auto py-2.5 gap-1"
                    disabled={!hasReal}
                    onClick={() => {
                      closeDrawer();
                      window.location.assign("/carteira/sacar");
                    }}
                  >
                    <ArrowUpFromLine size={16} aria-hidden="true" />
                    <span className="text-[11px]">Sacar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeType !== "demo"}
                    className="flex flex-col h-auto py-2.5 gap-1 border-warning/40 text-warning hover:bg-warning/10 disabled:border-border-default disabled:text-text-muted"
                    onClick={() => setTopupOpen(true)}
                  >
                    <Sparkles size={16} aria-hidden="true" />
                    <span className="text-[11px]">Add fichas</span>
                  </Button>
                </div>
              </header>

              {/* Transactions list */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Últimas transações
                  </h3>
                  <span className="text-[10px] text-text-muted">
                    Atualiza em tempo real
                  </span>
                </div>
                <Separator className="mb-2" />
                <WalletTransactions
                  walletType={activeType}
                  refreshKey={txRefreshKey}
                  limit={15}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <DemoTopupDialog open={topupOpen} onOpenChange={setTopupOpen} />
    </>
  );
}
