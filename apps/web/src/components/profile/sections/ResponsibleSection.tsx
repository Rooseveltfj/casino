"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  HeartHandshake,
  LifeBuoy,
  Save,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  useToast,
} from "@casino/ui";
import { saveLimits } from "@/app/actions/limits";
import { selfExclude } from "@/app/actions/self-exclusion";
import { signOut } from "@/lib/auth";
import type { ResponsibleLimits } from "@/lib/profile.server";

interface ResponsibleSectionProps {
  initialLimits: ResponsibleLimits;
}

const SESSION_OPTIONS = [
  { value: 1, label: "1 hora" },
  { value: 2, label: "2 horas" },
  { value: 4, label: "4 horas" },
  { value: null, label: "Sem limite" },
] as const;

const EXCLUSION_OPTIONS = [
  { value: "1week" as const, label: "1 semana", color: "text-warning" },
  { value: "1month" as const, label: "1 mês", color: "text-warning" },
  { value: "6months" as const, label: "6 meses", color: "text-error" },
  { value: "permanent" as const, label: "Permanente", color: "text-error" },
];

// ── Limits form ───────────────────────────────────────────────────────────────

function LimitsCard({ initial }: { initial: ResponsibleLimits }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [limits, setLimits] = useState(initial);
  const [touched, setTouched] = useState(false);

  const update = <K extends keyof ResponsibleLimits>(
    key: K,
    value: ResponsibleLimits[K],
  ) => {
    setLimits((p) => ({ ...p, [key]: value }));
    setTouched(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const r = await saveLimits(limits);
      if (r.ok) {
        toast({
          variant: "success",
          title: "Limites salvos",
          description: "Suas configurações de jogo responsável foram aplicadas.",
        });
        setTouched(false);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: r.error,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Limites pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Deposit limits */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Limite de depósito
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dep-w" className="text-xs">Semanal (R$)</Label>
              <Input
                id="dep-w"
                type="number"
                min={0}
                value={limits.depositWeekly ?? ""}
                onChange={(e) =>
                  update(
                    "depositWeekly",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Sem limite"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dep-m" className="text-xs">Mensal (R$)</Label>
              <Input
                id="dep-m"
                type="number"
                min={0}
                value={limits.depositMonthly ?? ""}
                onChange={(e) =>
                  update(
                    "depositMonthly",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Sem limite"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Loss limits */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Limite de perda
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="loss-w" className="text-xs">Semanal (R$)</Label>
              <Input
                id="loss-w"
                type="number"
                min={0}
                value={limits.lossWeekly ?? ""}
                onChange={(e) =>
                  update(
                    "lossWeekly",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Sem limite"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="loss-m" className="text-xs">Mensal (R$)</Label>
              <Input
                id="loss-m"
                type="number"
                min={0}
                value={limits.lossMonthly ?? ""}
                onChange={(e) =>
                  update(
                    "lossMonthly",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Sem limite"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Session limit */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Tempo máximo de sessão por dia
          </p>
          <select
            value={limits.sessionMaxHours ?? ""}
            onChange={(e) =>
              update(
                "sessionMaxHours",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            className="w-full sm:w-48 h-10 px-3 rounded-lg bg-input border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
          >
            {SESSION_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Save */}
        {touched && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isPending} className="gap-1.5">
              <Save size={13} aria-hidden="true" />
              {isPending ? "Salvando…" : "Salvar limites"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Self-exclusion card ───────────────────────────────────────────────────────

function SelfExclusionCard() {
  const router = useRouter();
  const { toast } = useToast();
  const [period, setPeriod] =
    useState<(typeof EXCLUSION_OPTIONS)[number]["value"]>("1week");
  const [openConfirm1, setOpenConfirm1] = useState(false);
  const [openConfirm2, setOpenConfirm2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const periodLabel =
    EXCLUSION_OPTIONS.find((o) => o.value === period)?.label ?? period;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const r = await selfExclude({ period, confirm: true });
      if (!r.ok) {
        toast({
          variant: "destructive",
          title: "Erro na autoexclusão",
          description: r.error,
        });
        setOpenConfirm2(false);
        setSubmitting(false);
        return;
      }
      // Sign out and redirect with a reason flag
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login?reason=self-excluded");
          },
        },
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-error/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-error">
            <AlertTriangle size={16} aria-hidden="true" />
            Autoexclusão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            A autoexclusão suspende sua conta pelo período escolhido. Você não
            conseguirá fazer login, jogar nem depositar até o fim do prazo.
          </p>
          <div className="space-y-2">
            <Label htmlFor="excl-period">Período</Label>
            <select
              id="excl-period"
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value as (typeof EXCLUSION_OPTIONS)[number]["value"],
                )
              }
              className="w-full sm:w-64 h-10 px-3 rounded-lg bg-input border border-border-default text-text-primary text-sm focus:outline-none focus:border-error"
            >
              {EXCLUSION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="destructive"
            onClick={() => setOpenConfirm1(true)}
            className="gap-1.5"
          >
            <AlertTriangle size={13} aria-hidden="true" />
            Me autoexcluir
          </Button>
        </CardContent>
      </Card>

      {/* First confirmation */}
      <Dialog
        open={openConfirm1}
        onOpenChange={(o) => !o && setOpenConfirm1(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar autoexclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a se autoexcluir por{" "}
              <span className="text-error font-semibold">{periodLabel}</span>.
              Esta ação é irreversível durante o período.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirm1(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpenConfirm1(false);
                setOpenConfirm2(true);
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second (final) confirmation */}
      <Dialog
        open={openConfirm2}
        onOpenChange={(o) => !o && !submitting && setOpenConfirm2(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-error">
              ⚠ Última confirmação
            </DialogTitle>
            <DialogDescription>
              Ao clicar em &quot;Confirmar autoexclusão&quot;, sua conta será
              imediatamente suspensa e você será desconectado. Para reabrir
              antes do prazo, será necessário entrar em contato com o suporte.
            </DialogDescription>
          </DialogHeader>
          <div className="my-3 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-sm text-error font-semibold">
              Período: {periodLabel}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenConfirm2(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Processando…" : "Confirmar autoexclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResponsibleSection({ initialLimits }: ResponsibleSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-2">
          <HeartHandshake
            size={22}
            className="text-accent-primary"
            aria-hidden="true"
          />
          Jogo responsável
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Configure limites pessoais e ferramentas de proteção
        </p>
      </div>

      <LimitsCard initial={initialLimits} />
      <SelfExclusionCard />

      {/* Help resources */}
      <Card className="bg-surface-elevated border-accent-primary/30">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent-primary/10 shrink-0">
              <LifeBuoy
                size={18}
                className="text-accent-primary"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">
                Precisa de ajuda?
              </p>
              <p className="text-xs text-text-muted mt-1">
                Se você ou alguém próximo está enfrentando problemas com
                apostas, há ajuda disponível 24/7.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <a
                  href="https://www.cvv.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
                >
                  <ExternalLink size={11} aria-hidden="true" />
                  cvv.org.br
                </a>
                <Badge variant="outline" className="text-xs gap-1">
                  📞 188 (CVV)
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  📞 0800-100-1130 (Jogadores Anônimos)
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
