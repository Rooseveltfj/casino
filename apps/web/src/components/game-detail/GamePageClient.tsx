"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { THUMB_GRADIENT } from "@/components/games/game-card";
import { useAuth } from "@/hooks/useAuth";
import { GameFrame } from "./GameFrame";
import { WalletSelector, type WalletType } from "./WalletSelector";
import { RecentBets } from "./RecentBets";
import { TopWins } from "./TopWins";
import { GameInfo } from "./GameInfo";
import { LiveChat } from "./LiveChat";
import { MobileTabs } from "./MobileTabs";
import type { GameDetail, TopWin } from "@/lib/games.server";

interface GamePageClientProps {
  game: GameDetail;
  topWins: TopWin[];
}

const STORAGE_KEY = "casino:wallet-type";

export function GamePageClient({ game, topWins }: GamePageClientProps) {
  const { isLoggedIn } = useAuth();
  const [walletType, setWalletType] = useState<WalletType>("demo");

  // Hydrate wallet selection from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as WalletType | null;
    if (stored === "demo" || stored === "real" || stored === "bonus") {
      setWalletType(stored);
    }
  }, []);

  const handleWalletChange = useCallback((w: WalletType) => {
    setWalletType(w);
    try {
      localStorage.setItem(STORAGE_KEY, w);
    } catch {
      // localStorage may be unavailable (private mode) — silently ignore
    }
  }, []);

  // ── Sidebar: header (game thumbnail + title row) ────────────────────────
  const sidebarHeader = (
    <div className="rounded-xl border border-border-default bg-surface-elevated p-3 flex items-center gap-3">
      <div
        className="w-12 h-10 rounded shrink-0 flex items-center justify-center text-xs font-bold text-white/50"
        style={{ background: THUMB_GRADIENT[game.category] }}
        aria-hidden="true"
      >
        {game.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary truncate">
          {game.name}
        </p>
        <p className="text-[11px] text-text-muted truncate">
          {game.provider} • RTP {game.rtp ?? "—"}%
        </p>
      </div>
    </div>
  );

  // Content groups for mobile tabs
  const gameTabContent = (
    <>
      {sidebarHeader}
      <WalletSelector
        walletType={walletType}
        onChange={handleWalletChange}
        isLoggedIn={isLoggedIn}
      />
      <RecentBets slug={game.slug} isLoggedIn={isLoggedIn} />
    </>
  );

  const infoTabContent = (
    <>
      <GameInfo game={game} />
      <TopWins wins={topWins} />
    </>
  );

  const chatTabContent = <LiveChat />;

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* ── Breadcrumb (desktop only) ─────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="hidden md:flex items-center gap-1 text-xs text-text-muted px-4 sm:px-6 py-3"
      >
        <Link
          href="/"
          className="hover:text-text-secondary transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={11} aria-hidden="true" /> Home
        </Link>
        <ChevronRight size={11} aria-hidden="true" />
        <Link href="/jogos" className="hover:text-text-secondary transition-colors">
          Jogos
        </Link>
        <ChevronRight size={11} aria-hidden="true" />
        <span className="text-text-primary font-medium" aria-current="page">
          {game.name}
        </span>
      </nav>

      {/* ── Desktop: game (70%) + sidebar (30%) ───────────────────────── */}
      <div className="hidden md:flex gap-4 px-4 sm:px-6 pb-6">
        {/* Left: game frame */}
        <div className="flex-1 min-w-0" style={{ flexBasis: "70%" }}>
          <GameFrame
            game={game}
            walletType={walletType}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Right: sidebar */}
        <aside
          className="w-full max-w-xs space-y-3 shrink-0"
          aria-label="Painel lateral do jogo"
          style={{ flexBasis: "30%" }}
        >
          {sidebarHeader}
          <WalletSelector
            walletType={walletType}
            onChange={handleWalletChange}
            isLoggedIn={isLoggedIn}
          />
          <RecentBets slug={game.slug} isLoggedIn={isLoggedIn} />
          <TopWins wins={topWins} />
          <GameInfo game={game} />
          <LiveChat />
        </aside>
      </div>

      {/* ── Mobile: full-width frame + tabs ──────────────────────────── */}
      <div className="md:hidden">
        {/* Game frame — full width, no padding for max real estate */}
        <div className="px-3 py-3">
          <GameFrame
            game={game}
            walletType={walletType}
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Tabs */}
        <MobileTabs
          game={gameTabContent}
          info={infoTabContent}
          chat={chatTabContent}
        />
      </div>
    </div>
  );
}
