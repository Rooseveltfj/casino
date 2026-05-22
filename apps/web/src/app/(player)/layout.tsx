"use client";

import { motion } from "motion/react";
import { BottomNav } from "@/components/player/BottomNav";
import { PlayerFooter } from "@/components/player/PlayerFooter";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";

// Animated background orbs — fixed, pointer-events-none
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orb 1 — large cyan, top-left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: "5%",
          left: "-5%",
          background:
            "radial-gradient(circle at 40% 40%, rgba(0,212,255,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ y: [-30, 30, -30], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      />

      {/* Orb 2 — medium gold, bottom-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          bottom: "10%",
          right: "-3%",
          background:
            "radial-gradient(circle at 60% 60%, rgba(255,184,0,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ y: [0, -40, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 2 }}
      />

      {/* Orb 3 — small cyan, centre-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          top: "40%",
          right: "20%",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <BackgroundOrbs />

      {/* Sticky header */}
      <PlayerHeader />

      {/* Body: sidebar + main */}
      <div className="relative z-10 flex">
        {/* Desktop sidebar */}
        <PlayerSidebar />

        {/* Main content — offset by sidebar on desktop, padded for bottom-nav on mobile */}
        <div className="flex flex-col flex-1 md:ml-60 min-w-0">
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <PlayerFooter />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
