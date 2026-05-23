"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
  isVip?: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", username: "João S.",  avatar: "JS", text: "Boa sorte galera!", timestamp: Date.now() - 1000 * 60 * 8 },
  { id: "m2", username: "Maria C.", avatar: "MC", text: "Acabei de ganhar 12x 🎉", timestamp: Date.now() - 1000 * 60 * 6, isVip: true },
  { id: "m3", username: "Pedro X.", avatar: "PX", text: "Esse jogo é viciante", timestamp: Date.now() - 1000 * 60 * 4 },
  { id: "m4", username: "Ana L.",   avatar: "AL", text: "RTP alto, vale a pena", timestamp: Date.now() - 1000 * 60 * 2 },
  { id: "m5", username: "Casino", avatar: "🎰", text: "Bem-vindo ao chat ao vivo!", timestamp: Date.now() - 1000 * 30 },
];

function formatTime(ts: number): string {
  const diffM = Math.floor((Date.now() - ts) / 60_000);
  if (diffM < 1) return "agora";
  if (diffM < 60) return `${diffM} min`;
  return `${Math.floor(diffM / 60)}h`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LiveChat() {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on mount
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  /*
   * WebSocket structure ready — uncomment when the live-chat backend is online.
   *
   * useEffect(() => {
   *   const ws = new WebSocket(process.env.NEXT_PUBLIC_CHAT_WS_URL ?? "");
   *   ws.onmessage = (event) => {
   *     const msg = JSON.parse(event.data) as ChatMessage;
   *     setMessages((prev) => [...prev, msg]);
   *   };
   *   return () => ws.close();
   * }, []);
   */

  return (
    <div className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle shrink-0">
        <MessageCircle
          size={13}
          className="text-accent-primary"
          aria-hidden="true"
        />
        <h3 className="text-xs font-semibold text-text-primary">
          Chat ao vivo
        </h3>
        <span className="ml-auto text-[10px] text-text-muted flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
          12 online
        </span>
      </div>

      {/* Messages list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5"
        role="log"
        aria-label="Mensagens do chat"
        aria-live="polite"
      >
        {MOCK_MESSAGES.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 px-1">
            {/* Avatar */}
            <span
              className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold border ${
                msg.isVip
                  ? "bg-accent-secondary text-background border-accent-secondary"
                  : "bg-surface text-text-secondary border-border-subtle"
              }`}
            >
              {msg.avatar}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-[11px] font-semibold ${msg.isVip ? "text-accent-secondary" : "text-text-primary"}`}
                >
                  {msg.username}
                </span>
                {msg.isVip && (
                  <span className="text-[8px] px-1 rounded bg-accent-secondary/20 text-accent-secondary font-bold">
                    VIP
                  </span>
                )}
                <span className="text-[10px] text-text-muted">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-xs text-text-secondary break-words">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* "Coming soon" banner */}
      <div className="px-3 py-1.5 bg-accent-primary/10 border-y border-accent-primary/20 text-center">
        <p className="text-[10px] text-accent-primary">
          💬 Chat disponível na versão completa
        </p>
      </div>

      {/* Input (disabled) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
        className="flex items-center gap-1.5 px-2 py-2 shrink-0"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Em breve…"
          disabled
          className="flex-1 h-8 px-2.5 text-xs rounded-lg bg-background border border-border-default text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Mensagem do chat"
        />
        <button
          type="submit"
          disabled
          aria-label="Enviar mensagem"
          className="p-1.5 rounded-lg bg-surface border border-border-default text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={13} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
