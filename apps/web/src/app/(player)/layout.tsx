"use client";

import { useEffect } from "react";
import { BottomNav } from "@/components/player/BottomNav";
import { PlayerFooter } from "@/components/player/PlayerFooter";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";

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
    </div>
  );
}
