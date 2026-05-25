"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { Button, toast } from "@casino/ui";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToWalletChanges } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WalletType = "demo" | "real" | "bonus";

export interface WalletBalances {
  demo: string;
  real: string;
  bonus: string;
  locked: string;
}

export interface WalletBalanceResponse {
  balances: WalletBalances;
  hasReal: boolean;
  isGuest: boolean;
}

interface WalletContextValue {
  balances: WalletBalances;
  hasReal: boolean;
  isGuest: boolean;
  isLoading: boolean;
  activeType: WalletType;
  setActiveType: (t: WalletType) => void;
  drawerOpen: boolean;
  openDrawer: (tab?: WalletType) => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  txRefreshKey: number;
}

const EMPTY_BALANCES: WalletBalances = {
  demo: "0.00",
  real: "0.00",
  bonus: "0.00",
  locked: "0.00",
};

const WalletContext = createContext<WalletContextValue | null>(null);

const ACTIVE_TYPE_KEY = "casino:wallet-type";
const LOW_BALANCE_THRESHOLD = 10;
const LOW_BALANCE_DISMISSED_KEY = "casino:low-balance-dismissed-at";
const LOW_BALANCE_COOLDOWN_MS = 1000 * 60 * 30; // 30 min

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchBalance(url: string): Promise<WalletBalanceResponse> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch wallet balance");
  return res.json() as Promise<WalletBalanceResponse>;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();

  const { data, isLoading, mutate } = useSWR<WalletBalanceResponse>(
    isLoggedIn ? "/api/wallet/balance" : null,
    fetchBalance,
    {
      refreshInterval: 15_000,
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const [activeType, setActiveTypeState] = useState<WalletType>("demo");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [txRefreshKey, setTxRefreshKey] = useState(0);
  const lowToastShownRef = useRef(false);

  // Restore active wallet type from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(ACTIVE_TYPE_KEY);
    if (stored === "demo" || stored === "real" || stored === "bonus") {
      setActiveTypeState(stored);
    }
  }, []);

  const setActiveType = useCallback((t: WalletType) => {
    setActiveTypeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_TYPE_KEY, t);
    }
  }, []);

  const refresh = useCallback(async () => {
    await mutate();
    setTxRefreshKey((k) => k + 1);
  }, [mutate]);

  const openDrawer = useCallback(
    (tab?: WalletType) => {
      if (tab) setActiveType(tab);
      setDrawerOpen(true);
    },
    [setActiveType],
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ── Supabase Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    const unsubscribe = subscribeToWalletChanges({
      userId: user.id,
      onWalletChange: () => {
        void mutate();
      },
      onTransactionInsert: () => {
        void mutate();
        setTxRefreshKey((k) => k + 1);
      },
    });
    return unsubscribe;
  }, [isLoggedIn, user?.id, mutate]);

  // ── Low-balance toast (demo < 10 fichas) ────────────────────────────────────
  useEffect(() => {
    if (!data || !isLoggedIn) return;
    const demoValue = parseFloat(data.balances.demo);
    if (Number.isNaN(demoValue)) return;

    if (demoValue >= LOW_BALANCE_THRESHOLD) {
      lowToastShownRef.current = false;
      return;
    }

    if (lowToastShownRef.current) return;

    // Cooldown — skip if recently dismissed
    if (typeof window !== "undefined") {
      const lastDismissed = window.sessionStorage.getItem(
        LOW_BALANCE_DISMISSED_KEY,
      );
      if (lastDismissed) {
        const age = Date.now() - parseInt(lastDismissed, 10);
        if (age < LOW_BALANCE_COOLDOWN_MS) return;
      }
    }

    lowToastShownRef.current = true;

    const t = toast({
      variant: "default",
      duration: 8000,
      title: "Saldo demo baixo",
      description: `Você tem R$ ${demoValue.toFixed(2)} restantes. Recarregue para continuar jogando.`,
      action: (
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            t.dismiss();
            openDrawer("demo");
          }}
          className="bg-warning text-black hover:bg-warning/90"
        >
          Adicionar fichas
        </Button>
      ),
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        LOW_BALANCE_DISMISSED_KEY,
        String(Date.now()),
      );
    }
  }, [data, isLoggedIn, openDrawer]);

  const value = useMemo<WalletContextValue>(
    () => ({
      balances: data?.balances ?? EMPTY_BALANCES,
      hasReal: data?.hasReal ?? false,
      isGuest: data?.isGuest ?? !isLoggedIn,
      isLoading: isLoading && !data,
      activeType,
      setActiveType,
      drawerOpen,
      openDrawer,
      closeDrawer,
      refresh,
      txRefreshKey,
    }),
    [
      data,
      isLoading,
      isLoggedIn,
      activeType,
      setActiveType,
      drawerOpen,
      openDrawer,
      closeDrawer,
      refresh,
      txRefreshKey,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used inside <WalletProvider>");
  }
  return ctx;
}
