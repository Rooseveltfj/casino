"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  Crown,
  Gift,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { Badge, Separator, Skeleton } from "@casino/ui";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/app/actions/notifications";
import { useRealtimeNotifications } from "@/providers/realtime-provider";

// ── Icon + tone config per notification type ──────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationRow["type"],
  { icon: typeof Bell; tone: string; label: string }
> = {
  deposit_confirmed: {
    icon: CircleDollarSign,
    tone: "text-success bg-success/10",
    label: "Depósito",
  },
  withdrawal_processed: {
    icon: CircleDollarSign,
    tone: "text-success bg-success/10",
    label: "Saque",
  },
  bonus_granted: {
    icon: Gift,
    tone: "text-accent-primary bg-accent-primary/10",
    label: "Bônus",
  },
  bonus_released: {
    icon: Sparkles,
    tone: "text-accent-primary bg-accent-primary/10",
    label: "Bônus liberado",
  },
  kyc_approved: {
    icon: ShieldCheck,
    tone: "text-success bg-success/10",
    label: "KYC",
  },
  kyc_rejected: {
    icon: ShieldAlert,
    tone: "text-error bg-error/10",
    label: "KYC",
  },
  demo_topup: {
    icon: Sparkles,
    tone: "text-warning bg-warning/10",
    label: "Fichas demo",
  },
  account_suspended: {
    icon: ShieldAlert,
    tone: "text-warning bg-warning/10",
    label: "Conta",
  },
  self_exclusion: {
    icon: ShieldAlert,
    tone: "text-warning bg-warning/10",
    label: "Autoexclusão",
  },
  big_win: {
    icon: Trophy,
    tone: "text-accent-secondary bg-accent-secondary/10",
    label: "Grande vitória",
  },
  jackpot: {
    icon: Crown,
    tone: "text-accent-secondary bg-accent-secondary/10",
    label: "Jackpot",
  },
  promo: {
    icon: Megaphone,
    tone: "text-accent-primary bg-accent-primary/10",
    label: "Promoção",
  },
  system: {
    icon: Bell,
    tone: "text-text-secondary bg-surface-elevated",
    label: "Sistema",
  },
};

function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ── Item ──────────────────────────────────────────────────────────────────────

interface ItemProps {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: ItemProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const Icon = cfg.icon;
  const unread = notification.readAt === null;

  const handleClick = () => {
    if (unread) onMarkRead(notification.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
        unread
          ? "bg-accent-primary/[0.04] hover:bg-accent-primary/[0.08]"
          : "hover:bg-surface-elevated"
      }`}
    >
      <span
        className={`shrink-0 size-9 rounded-full flex items-center justify-center ${cfg.tone}`}
      >
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-text-primary truncate">
            {notification.title}
          </p>
          {unread && (
            <span
              className="size-1.5 rounded-full bg-accent-primary shrink-0"
              aria-label="Não lida"
            />
          )}
        </div>
        {notification.body && (
          <p className="text-xs text-text-secondary line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">
          {cfg.label} · {formatRelative(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

// ── Main bell ─────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    optimisticMarkRead,
    optimisticMarkAllRead,
  } = useRealtimeNotifications();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleMarkOne = useCallback(
    (id: string) => {
      optimisticMarkRead(id);
      startTransition(async () => {
        await markNotificationRead(id);
      });
    },
    [optimisticMarkRead],
  );

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return;
    optimisticMarkAllRead();
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }, [unreadCount, optimisticMarkAllRead]);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={18} aria-hidden="true" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center font-mono"
            >
              {badgeLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile overlay */}
            <motion.div
              key="bell-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="sm:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="bell-panel"
              role="dialog"
              aria-label="Notificações"
              aria-modal="true"
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.97 }
              }
              animate={
                reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.97 }
              }
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={[
                "z-[80] bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden flex flex-col",
                // Mobile: full sheet from top
                "fixed top-2 left-2 right-2 max-h-[80dvh]",
                // Desktop: anchored popover
                "sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-[380px] sm:max-h-[480px]",
              ].join(" ")}
            >
              <header className="shrink-0 flex items-center justify-between p-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-semibold text-text-primary">
                    Notificações
                  </h2>
                  {unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="bg-error/15 text-error border-error/30 h-5 px-1.5 text-[10px]"
                    >
                      {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    disabled={unreadCount === 0 || isPending}
                    className="hidden sm:inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                  >
                    <CheckCheck size={12} aria-hidden="true" />
                    Marcar todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="sm:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    aria-label="Fechar notificações"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              </header>

              <button
                type="button"
                onClick={handleMarkAll}
                disabled={unreadCount === 0 || isPending}
                className="sm:hidden flex items-center justify-center gap-1.5 text-xs text-text-secondary px-3 py-2 border-b border-border-subtle disabled:opacity-40"
              >
                <CheckCheck size={12} aria-hidden="true" />
                Marcar todas como lidas
              </button>

              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="space-y-2 p-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-2 rounded-lg"
                      >
                        <Skeleton className="size-9 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="size-12 mx-auto rounded-full bg-surface-elevated flex items-center justify-center mb-3">
                      <Check
                        size={20}
                        className="text-text-muted"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">
                      Tudo em dia!
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Você verá aqui depósitos, bônus, KYC e eventos da conta.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <NotificationItem
                          notification={n}
                          onMarkRead={handleMarkOne}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />
              <Link
                href="/perfil?tab=notificacoes"
                onClick={() => setOpen(false)}
                className="shrink-0 block text-center text-sm font-medium text-accent-primary hover:bg-accent-primary/10 transition-colors py-3"
              >
                Ver todas
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
