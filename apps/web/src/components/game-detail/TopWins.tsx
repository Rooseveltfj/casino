import { Trophy } from "lucide-react";
import type { TopWin } from "@/lib/games.server";

interface TopWinsProps {
  wins: TopWin[];
}

function formatTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function TopWins({ wins }: TopWinsProps) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle">
        <Trophy
          size={13}
          className="text-accent-secondary"
          aria-hidden="true"
        />
        <h3 className="text-xs font-semibold text-text-primary">
          Melhores ganhos
        </h3>
      </div>

      <div className="divide-y divide-border-subtle/40">
        {wins.map((win, i) => (
          <div
            key={win.id}
            className="flex items-center gap-2.5 px-3 py-2 text-xs"
          >
            {/* Rank */}
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                i === 0
                  ? "bg-accent-secondary text-background"
                  : i === 1
                    ? "bg-text-muted/30 text-text-primary"
                    : i === 2
                      ? "bg-orange-700/40 text-orange-200"
                      : "bg-surface text-text-muted"
              }`}
            >
              {i + 1}
            </span>

            {/* Avatar initials */}
            <span className="w-6 h-6 rounded-full bg-surface border border-border-subtle text-[9px] font-bold flex items-center justify-center text-text-secondary shrink-0">
              {win.userInitials}
            </span>

            {/* Amount + multiplier */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-success font-bold tabular-nums">
                R${" "}
                {parseFloat(win.amount).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-[10px] text-accent-secondary">
                {win.multiplier}
              </p>
            </div>

            {/* Time */}
            <span className="text-[10px] text-text-muted shrink-0">
              {formatTime(win.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
