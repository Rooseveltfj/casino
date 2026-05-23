"use client";

import { useState } from "react";
import { ChevronDown, Gift, Info } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@casino/ui";
import type { ProfileBonus } from "@/lib/profile.server";

interface BonusesSectionProps {
  active: ProfileBonus[];
  history: ProfileBonus[];
}

const TYPE_LABEL: Record<ProfileBonus["type"], string> = {
  welcome: "Boas-vindas",
  deposit: "Depósito",
  free_spins: "Free Spins",
  cashback: "Cashback",
};

const STATUS_LABEL: Record<ProfileBonus["status"], string> = {
  pending: "Pendente",
  active: "Ativo",
  completed: "Concluído",
  expired: "Expirado",
  cancelled: "Cancelado",
};

function StatusBadge({ status }: { status: ProfileBonus["status"] }) {
  const variant =
    status === "active" ? "success"
    : status === "pending" ? "warning"
    : status === "completed" ? "default"
    : "secondary";

  return (
    <Badge variant={variant} className="text-[10px]">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function formatBRL(v: string) {
  return parseFloat(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysUntil(d: Date | null): string {
  if (!d) return "Sem prazo";
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expirado";
  if (diff === 0) return "Expira hoje";
  if (diff === 1) return "Expira amanhã";
  return `Expira em ${diff} dias`;
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "Como funciona o rollover?",
    a: "O rollover é o requisito de apostas para liberar o saldo de bônus para saque. Por exemplo, com rollover 5x, você precisa apostar 5 vezes o valor do bônus antes de poder sacar.",
  },
  {
    q: "Quais jogos contam para o rollover?",
    a: "Slots contam 100%, mesa e ao vivo contam 10%, esportes contam 50%. Jogos crash não contribuem para o rollover de bônus de boas-vindas.",
  },
  {
    q: "O que acontece se meu bônus expirar?",
    a: "Se você não concluir o rollover até a data de expiração, o saldo de bônus restante será removido automaticamente da sua conta.",
  },
  {
    q: "Posso ter mais de um bônus ativo?",
    a: "Apenas um bônus pode estar ativo por vez. Para resgatar um novo bônus, conclua ou cancele o atual.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left hover:text-accent-primary transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-text-primary">{q}</span>
        <ChevronDown
          size={14}
          className={`text-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <p className="text-xs text-text-secondary pb-3 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BonusesSection({ active, history }: BonusesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Bônus
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Seus bônus ativos e histórico de promoções
        </p>
      </div>

      {/* Active bonuses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift
              size={16}
              className="text-accent-secondary"
              aria-hidden="true"
            />
            Bônus ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              Nenhum bônus ativo no momento.
            </p>
          ) : (
            <div className="space-y-3">
              {active.map((b) => {
                const wagered = parseFloat(b.wagered);
                const required = parseFloat(b.wageringRequirement);
                const pct = required > 0 ? Math.min((wagered / required) * 100, 100) : 0;

                return (
                  <div
                    key={b.id}
                    className="rounded-xl border border-border-default bg-surface-elevated p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-text-primary">
                            {TYPE_LABEL[b.type]}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="font-mono text-xl font-bold text-accent-secondary tabular-nums">
                          R$ {formatBRL(b.amount)}
                        </p>
                      </div>
                      <span className="text-xs text-text-muted">
                        {daysUntil(b.expiresAt)}
                      </span>
                    </div>

                    {/* Rollover bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-text-muted">Rollover</span>
                        <span className="font-mono text-text-secondary">
                          R$ {formatBRL(b.wagered)} / R$ {formatBRL(b.wageringRequirement)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de bônus</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              Você ainda não recebeu nenhum bônus.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-text-muted uppercase tracking-wider">
                    <th className="text-left font-medium pb-2">Tipo</th>
                    <th className="text-right font-medium pb-2">Valor</th>
                    <th className="text-center font-medium pb-2">Status</th>
                    <th className="text-right font-medium pb-2">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {history.map((b) => (
                    <tr key={b.id} className="text-text-secondary">
                      <td className="py-2.5">{TYPE_LABEL[b.type]}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">
                        R$ {formatBRL(b.amount)}
                      </td>
                      <td className="py-2.5 text-center">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-2.5 text-right text-[11px] text-text-muted">
                        {formatDate(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info
              size={16}
              className="text-accent-primary"
              aria-hidden="true"
            />
            Como funcionam os bônus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-1" />
          {FAQ.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
