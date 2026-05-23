import { CATEGORY_CONFIG } from "@/components/games/game-card";
import type { GameDetail } from "@/lib/games.server";

interface GameInfoProps {
  game: GameDetail;
}

const VOLATILITY_LABEL = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
} as const;

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium text-right">{value}</span>
    </div>
  );
}

export function GameInfo({ game }: GameInfoProps) {
  const cat = CATEGORY_CONFIG[game.category];

  return (
    <div className="rounded-xl border border-border-default bg-surface-elevated overflow-hidden">
      {/* Title row */}
      <div className="px-3 py-2 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-primary">
          Sobre o jogo
        </h3>
      </div>

      <div className="p-3 space-y-3">
        {/* Specs */}
        <div className="divide-y divide-border-subtle/40">
          <StatRow
            label="Categoria"
            value={
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${cat.cls}`}
              >
                {cat.label}
              </span>
            }
          />
          <StatRow label="Provedor" value={game.provider} />
          <StatRow
            label="RTP"
            value={
              <span className="font-mono text-accent-primary">
                {game.rtp ?? "—"}%
              </span>
            }
          />
          {game.volatility && (
            <StatRow
              label="Volatilidade"
              value={
                VOLATILITY_LABEL[
                  game.volatility as keyof typeof VOLATILITY_LABEL
                ] ?? game.volatility
              }
            />
          )}
          <StatRow
            label="Aposta mínima"
            value={
              <span className="font-mono">
                R${" "}
                {parseFloat(game.minBet).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            }
          />
          <StatRow
            label="Aposta máxima"
            value={
              <span className="font-mono">
                R${" "}
                {parseFloat(game.maxBet).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            }
          />
        </div>

        {/* Description */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Descrição
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Features */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Características
          </p>
          <div className="flex flex-wrap gap-1">
            {game.features.map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full border border-border-default bg-surface text-text-secondary"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Disponível em
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            {game.countries.join(" • ")}
          </p>
        </div>
      </div>
    </div>
  );
}
