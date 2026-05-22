"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@casino/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // eslint-disable-next-line no-console
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="p-4 rounded-full bg-error/10 border border-error/30">
        <AlertTriangle size={32} className="text-error" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-bold text-text-primary">
          Erro no painel administrativo
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Ocorreu um erro inesperado. Recarregue a página ou contate o suporte técnico.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-text-muted mt-2">ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        <RefreshCw size={14} className="mr-1.5" />
        Tentar novamente
      </Button>
    </div>
  );
}
