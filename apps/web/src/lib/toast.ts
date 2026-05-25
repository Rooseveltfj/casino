"use client";

/**
 * Typed toast wrappers around Sonner.
 *
 * Use these from any client component or server-action callback instead of
 * calling `sonner` directly — keeps tone/duration consistent across the app.
 *
 * Variants:
 *   success / error / warning / info — generic feedback
 *   game                              — long-lived in-game events with optional CTA
 *   jackpot                           — celebratory gold toast with confetti
 */
import { toast as sonnerToast, type ExternalToast } from "sonner";

// ── Durations (ms) ────────────────────────────────────────────────────────────

const DURATION_DEFAULT = 3_000;
const DURATION_GAME = 5_000;
const DURATION_JACKPOT = 8_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

interface BaseOpts {
  description?: string;
  duration?: number;
  id?: string | number;
  onDismiss?: () => void;
}

function build(opts: BaseOpts, extra: ExternalToast = {}): ExternalToast {
  return {
    description: opts.description,
    duration: opts.duration ?? DURATION_DEFAULT,
    id: opts.id,
    onDismiss: opts.onDismiss,
    ...extra,
  };
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// ── Confetti (lazy, offscreen) ────────────────────────────────────────────────

let confettiPromise: Promise<typeof import("canvas-confetti").default> | null =
  null;

function loadConfetti() {
  if (!confettiPromise) {
    confettiPromise = import("canvas-confetti").then((m) => m.default);
  }
  return confettiPromise;
}

function fireJackpotConfetti() {
  if (typeof window === "undefined") return;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReduced) return;

  const run = async () => {
    const confetti = await loadConfetti();
    const colors = ["#FFB800", "#FFD75E", "#00D4FF", "#00F5A0"];
    const defaults = {
      origin: { y: 0.7 },
      colors,
      disableForReducedMotion: true,
    };
    confetti({ ...defaults, particleCount: 80, spread: 70, startVelocity: 45 });
    confetti({
      ...defaults,
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      ...defaults,
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
    });
  };

  type IdleWindow = Window & {
    requestIdleCallback?: (cb: () => void) => number;
  };
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(() => void run());
  } else {
    window.setTimeout(() => void run(), 0);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

interface GameToastOpts extends BaseOpts {
  cta?: { label: string; onClick: () => void };
}

export const toast = {
  success(title: string, description?: string, opts: BaseOpts = {}) {
    return sonnerToast.success(title, build({ description, ...opts }));
  },

  error(title: string, description?: string, opts: BaseOpts = {}) {
    return sonnerToast.error(title, build({ description, ...opts }));
  },

  warning(title: string, description?: string, opts: BaseOpts = {}) {
    return sonnerToast.warning(title, build({ description, ...opts }));
  },

  info(title: string, description?: string, opts: BaseOpts = {}) {
    return sonnerToast.info(title, build({ description, ...opts }));
  },

  game(title: string, description?: string, opts: GameToastOpts = {}) {
    return sonnerToast(
      title,
      build(
        { description, duration: opts.duration ?? DURATION_GAME, ...opts },
        opts.cta
          ? {
              action: { label: opts.cta.label, onClick: opts.cta.onClick },
              className: "border-accent-primary/40 bg-accent-primary/5",
            }
          : { className: "border-accent-primary/40 bg-accent-primary/5" },
      ),
    );
  },

  jackpot(amount: number, opts: BaseOpts = {}) {
    fireJackpotConfetti();
    return sonnerToast(`🎰 JACKPOT!`, {
      description: `Você ganhou ${BRL.format(amount)}!`,
      duration: opts.duration ?? DURATION_JACKPOT,
      id: opts.id,
      onDismiss: opts.onDismiss,
      className:
        "border-accent-secondary/60 bg-accent-secondary/10 text-accent-secondary font-semibold shadow-glow-gold",
    });
  },

  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
};

export type Toast = typeof toast;
