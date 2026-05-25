"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Wallet } from "lucide-react";
import { Badge, Skeleton } from "@casino/ui";
import { useWallet, type WalletType } from "./wallet-provider";

// ── Currency formatter ────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatBRL(value: string): string {
  const n = parseFloat(value);
  return Number.isFinite(n) ? fmt.format(n) : "R$ 0,00";
}

// ── Badge appearance per wallet type ──────────────────────────────────────────

function WalletBadge({ type }: { type: WalletType }) {
  const config: Record<
    WalletType,
    { label: string; classes: string }
  > = {
    demo: {
      label: "DEMO",
      classes: "bg-warning/15 text-warning border-warning/30",
    },
    real: {
      label: "REAL",
      classes: "bg-success/15 text-success border-success/30",
    },
    bonus: {
      label: "BÔNUS",
      classes: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
    },
  };
  const cfg = config[type];
  return (
    <Badge
      variant="outline"
      className={`h-4 px-1.5 text-[10px] font-semibold leading-none tracking-wider ${cfg.classes}`}
    >
      {cfg.label}
    </Badge>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

interface WalletWidgetProps {
  className?: string;
}

export function WalletWidget({ className }: WalletWidgetProps) {
  const { balances, activeType, isLoading, openDrawer } = useWallet();
  const reduced = useReducedMotion();

  const balance = balances[activeType];
  const formatted = formatBRL(balance);

  if (isLoading) {
    return (
      <Skeleton
        className={`hidden sm:block h-9 w-32 rounded-lg ${className ?? ""}`}
      />
    );
  }

  return (
    <>
      {/* Desktop variant */}
      <button
        onClick={() => openDrawer()}
        className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default hover:border-accent-primary/40 hover:shadow-glow-primary transition-all text-sm group ${className ?? ""}`}
        aria-label={`Carteira: ${formatted} ${activeType}`}
      >
        <Wallet
          size={14}
          className="text-accent-primary group-hover:scale-110 transition-transform"
          aria-hidden="true"
        />

        <span className="font-mono text-text-primary tabular-nums overflow-hidden h-5 flex items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${activeType}:${balance}`}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { rotateX: -90, opacity: 0, y: -4 }
              }
              animate={
                reduced
                  ? { opacity: 1 }
                  : { rotateX: 0, opacity: 1, y: 0 }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { rotateX: 90, opacity: 0, y: 4 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="inline-block"
            >
              {formatted}
            </motion.span>
          </AnimatePresence>
        </span>

        <WalletBadge type={activeType} />
      </button>

      {/* Mobile variant — icon + badge only */}
      <button
        onClick={() => openDrawer()}
        className="sm:hidden flex items-center gap-1 p-2 rounded-lg text-accent-primary hover:bg-accent-primary/10 transition-colors relative"
        aria-label={`Carteira: ${formatted} ${activeType}`}
      >
        <Wallet size={20} aria-hidden="true" />
        <span className="absolute -top-1 -right-1">
          <WalletBadge type={activeType} />
        </span>
      </button>
    </>
  );
}
