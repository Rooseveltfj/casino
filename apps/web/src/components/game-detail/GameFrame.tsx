"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Expand,
  Gamepad2,
  Minimize,
  Play,
  RefreshCw,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Spinner } from "@casino/ui";
import { THUMB_GRADIENT } from "@/components/games/game-card";
import type { GameDetail } from "@/lib/games.server";

type LaunchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "playing"; gameUrl: string; sessionId: string }
  | { kind: "error"; message: string };

interface GameFrameProps {
  game: GameDetail;
  walletType: "demo" | "real" | "bonus";
  isLoggedIn: boolean;
  isDemoOnly?: boolean;
}

export function GameFrame({
  game,
  walletType,
  isLoggedIn,
  isDemoOnly,
}: GameFrameProps) {
  const [state, setState] = useState<LaunchState>({ kind: "idle" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prefersReduced = useReducedMotion();

  // ── Launch ────────────────────────────────────────────────────────────────
  const launch = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const res = await fetch(`/api/games/${game.slug}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletType }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Erro ao iniciar o jogo");
      }

      const data = (await res.json()) as {
        sessionId: string;
        gameUrl: string;
      };

      setState({
        kind: "playing",
        gameUrl: data.gameUrl,
        sessionId: data.sessionId,
      });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Erro inesperado",
      });
    }
  }, [game.slug, walletType]);

  // ── Fullscreen handlers ──────────────────────────────────────────────────
  const enterFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;

    // Standard + WebKit (iOS Safari)
    if (el.requestFullscreen) {
      void el.requestFullscreen();
    } else {
      const webkitEl = el as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (webkitEl.webkitRequestFullscreen) {
        void webkitEl.webkitRequestFullscreen();
      }
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={frameRef}
      className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-border-default bg-background"
      style={{ background: THUMB_GRADIENT[game.category] }}
    >
      {/* ── Demo badge (top-right corner) ─────────────────────────────── */}
      {(isDemoOnly || walletType === "demo") && state.kind !== "playing" && (
        <span className="absolute top-3 right-3 z-20 px-2 py-1 text-[10px] font-bold tracking-wider bg-accent-secondary text-background rounded-md shadow-glow-gold">
          DEMO
        </span>
      )}

      {/* ── Idle state: thumbnail + launch button ─────────────────────── */}
      {state.kind === "idle" && (
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          {/* Dark vignette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"
          />

          <div className="relative z-10 flex flex-col items-center gap-5 max-w-md">
            <Gamepad2
              size={48}
              className="text-accent-primary opacity-60"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
                {game.name}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                {game.provider} • RTP {game.rtp ?? "—"}%
              </p>
            </div>

            {isLoggedIn ? (
              <Button
                size="lg"
                onClick={launch}
                className="text-base font-bold px-8 shadow-glow-primary group"
              >
                <Play
                  size={16}
                  className="mr-1.5 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  aria-hidden="true"
                />
                Iniciar jogo
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-text-secondary text-sm">
                  Cadastre-se grátis para começar a jogar
                </p>
                <div className="flex gap-2">
                  <Button asChild size="lg" className="font-bold">
                    <Link href="/register">Cadastrar grátis →</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Entrar</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────── */}
      {state.kind === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
          <div className="relative">
            <Spinner size="xl" color="primary" label="Carregando jogo…" />
            <div
              aria-hidden="true"
              className="absolute inset-0 blur-xl opacity-50"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.6), transparent)",
              }}
            />
          </div>
          <p className="text-text-secondary text-sm">Iniciando sessão…</p>
        </div>
      )}

      {/* ── Playing state: iframe ─────────────────────────────────────── */}
      {state.kind === "playing" && (
        <>
          <iframe
            ref={iframeRef}
            src={state.gameUrl}
            title={`Jogo: ${game.name}`}
            className="absolute inset-0 w-full h-full border-0 bg-background"
            allow="autoplay; fullscreen; gamepad; pointer-lock"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          {/* Floating fullscreen button */}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            aria-label={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
            className="absolute bottom-3 right-3 z-20 p-2 rounded-lg bg-black/60 backdrop-blur-md border border-border-strong text-text-primary hover:bg-black/80 hover:border-accent-primary transition-all"
          >
            {isFullscreen ? (
              <Minimize size={16} aria-hidden="true" />
            ) : (
              <Expand size={16} aria-hidden="true" />
            )}
          </button>

          {/* Session ID badge */}
          <span className="absolute bottom-3 left-3 z-20 text-[10px] font-mono text-text-muted bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
            #{state.sessionId.slice(0, 8)}
          </span>
        </>
      )}

      {/* ── Error state ───────────────────────────────────────────────── */}
      {state.kind === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-background/90 backdrop-blur-sm">
          <AlertCircle size={36} className="text-error" aria-hidden="true" />
          <div>
            <p className="font-semibold text-text-primary">
              Não foi possível iniciar o jogo
            </p>
            <p className="text-sm text-text-muted mt-1">{state.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={launch}>
            <RefreshCw size={13} className="mr-1.5" aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
