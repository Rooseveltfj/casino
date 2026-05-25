"use client";

import { useEffect } from "react";
import { Toaster } from "@casino/ui";
import { BottomNav } from "@/components/player/BottomNav";
import { PlayerFooter } from "@/components/player/PlayerFooter";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { CommandSearch } from "@/components/search/command-search";
import { NotificationToaster } from "@/components/notifications/notification-toaster";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { WalletDrawer } from "@/components/wallet/wallet-drawer";
import { RealtimeProvider } from "@/providers/realtime-provider";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lenis smooth scroll — disabled when user prefers reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    let rafId: number;

    // Dynamic import so Lenis is never in the SSR bundle
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        touchMultiplier: 2,
      });

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }).catch(() => {
      // Lenis failed to load — native scroll is the fallback
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <RealtimeProvider>
      <WalletProvider>
        <div className="min-h-screen bg-background">
          <PlayerHeader />

          <div className="relative z-10 flex">
            <PlayerSidebar />

            <div className="flex flex-col flex-1 md:ml-60 min-w-0">
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <PlayerFooter />
            </div>
          </div>

          <BottomNav />

          {/* Global command palette — handles Cmd+K globally */}
          <CommandSearch />

          {/* Wallet slide-over drawer */}
          <WalletDrawer />

          {/* Toast notifications (new Sonner-based) */}
          <NotificationToaster />

          {/* Legacy Radix toasts — still used by /perfil sections */}
          <Toaster />
        </div>
      </WalletProvider>
    </RealtimeProvider>
  );
}
