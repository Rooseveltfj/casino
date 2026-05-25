"use client";

import { useCallback, useState, useTransition } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from "@casino/ui";
import { addDemoChips } from "@/app/actions/demo-topup";
import { useWallet } from "./wallet-provider";

const TOPUP_AMOUNT = 200;
const DAILY_LIMIT = 5;

interface DemoTopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoTopupDialog({ open, onOpenChange }: DemoTopupDialogProps) {
  const { refresh } = useWallet();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<string | null>(null);

  const handleConfirm = useCallback(() => {
    setError(null);
    setRateLimitedUntil(null);

    startTransition(async () => {
      const result = await addDemoChips();

      if (result.ok) {
        toast({
          variant: "success",
          title: "Fichas adicionadas!",
          description: `+R$ ${TOPUP_AMOUNT.toFixed(2)} em fichas demo. Restam ${result.remaining} no dia.`,
        });
        await refresh();
        onOpenChange(false);
        return;
      }

      if (result.rateLimited) {
        setRateLimitedUntil(result.resetAt ?? null);
      }
      setError(result.error);
    });
  }, [refresh, onOpenChange]);

  const formattedReset = rateLimitedUntil
    ? new Date(rateLimitedUntil).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-warning/15 text-warning flex items-center justify-center">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>Adicionar fichas demo</DialogTitle>
              <DialogDescription>
                Recarga grátis para continuar jogando.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border-default bg-surface-elevated p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text-muted">Você receberá</span>
              <span className="font-mono text-2xl font-semibold text-warning">
                +R$ {TOPUP_AMOUNT.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Limite: {DAILY_LIMIT} recargas grátis por dia.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className={`rounded-lg border p-3 flex items-start gap-2 ${
                rateLimitedUntil
                  ? "border-warning/40 bg-warning/10"
                  : "border-error/40 bg-error/10"
              }`}
            >
              <AlertTriangle
                size={16}
                className={`shrink-0 mt-0.5 ${rateLimitedUntil ? "text-warning" : "text-error"}`}
                aria-hidden="true"
              />
              <div className="text-xs">
                <p className="text-text-primary font-medium">{error}</p>
                {formattedReset && (
                  <p className="text-text-muted mt-0.5">
                    Próxima recarga liberada em {formattedReset}.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || Boolean(rateLimitedUntil)}
            className="bg-warning text-black hover:bg-warning/90"
          >
            {isPending ? "Adicionando..." : "Confirmar recarga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
