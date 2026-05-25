"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";
import {
  subscribeToNotifications,
  type NotificationPayload,
} from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import type { NotificationRow } from "@/app/actions/notifications";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListResponse {
  rows: NotificationRow[];
  unreadCount: number;
  nextCursor: string | null;
}

interface RealtimeContextValue {
  notifications: NotificationRow[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  optimisticMarkRead: (id: string) => void;
  optimisticMarkAllRead: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ── Toast routing per notification type ───────────────────────────────────────

type ToastKind = "success" | "warning" | "error" | "info" | "game" | "jackpot";

const TYPE_TO_TOAST: Record<string, ToastKind> = {
  deposit_confirmed: "success",
  withdrawal_processed: "success",
  bonus_granted: "success",
  bonus_released: "success",
  kyc_approved: "success",
  kyc_rejected: "error",
  demo_topup: "success",
  account_suspended: "warning",
  self_exclusion: "warning",
  big_win: "game",
  jackpot: "jackpot",
  promo: "info",
  system: "info",
};

function routeToast(n: NotificationPayload | NotificationRow) {
  const kind = TYPE_TO_TOAST[n.type] ?? "info";
  const title = n.title;
  const body = "body" in n ? (n.body ?? undefined) : undefined;

  if (kind === "jackpot") {
    const amount = Number(
      (n.metadata as { amount?: number | string }).amount ?? 0,
    );
    toast.jackpot(amount || 0);
    return;
  }
  if (kind === "game") {
    toast.game(title, body);
    return;
  }
  toast[kind](title, body);
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchNotifications(url: string): Promise<ListResponse> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json() as Promise<ListResponse>;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [seenIds] = useState<Set<string>>(() => new Set());

  const { data, isLoading, mutate } = useSWR<ListResponse>(
    isLoggedIn ? "/api/notifications?limit=20" : null,
    fetchNotifications,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  // Seed seen IDs from initial load so we don't re-toast notifications we
  // already have when the user first lands on the page.
  useEffect(() => {
    if (!data?.rows) return;
    for (const n of data.rows) seenIds.add(n.id);
  }, [data?.rows, seenIds]);

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const optimisticMarkRead = useCallback(
    (id: string) => {
      void mutate((cur) => {
        if (!cur) return cur;
        const now = new Date();
        return {
          ...cur,
          rows: cur.rows.map((n) =>
            n.id === id && !n.readAt ? { ...n, readAt: now } : n,
          ),
          unreadCount: Math.max(0, cur.unreadCount - 1),
        };
      }, false);
    },
    [mutate],
  );

  const optimisticMarkAllRead = useCallback(() => {
    void mutate((cur) => {
      if (!cur) return cur;
      const now = new Date();
      return {
        ...cur,
        rows: cur.rows.map((n) => (n.readAt ? n : { ...n, readAt: now })),
        unreadCount: 0,
      };
    }, false);
  }, [mutate]);

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    const unsubscribe = subscribeToNotifications({
      userId: user.id,
      onInsert: (payload) => {
        if (seenIds.has(payload.id)) return;
        seenIds.add(payload.id);
        routeToast(payload);
        void mutate();
      },
      onUpdate: () => {
        void mutate();
      },
    });
    return unsubscribe;
  }, [isLoggedIn, user?.id, mutate, seenIds]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      notifications: data?.rows ?? [],
      unreadCount: data?.unreadCount ?? 0,
      isLoading: isLoading && !data,
      refresh,
      optimisticMarkRead,
      optimisticMarkAllRead,
    }),
    [data, isLoading, refresh, optimisticMarkRead, optimisticMarkAllRead],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRealtimeNotifications(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error(
      "useRealtimeNotifications must be used inside <RealtimeProvider>",
    );
  }
  return ctx;
}
