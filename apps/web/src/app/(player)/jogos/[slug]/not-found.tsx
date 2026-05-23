import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Button } from "@casino/ui";

export default function GameNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center">
      <div className="relative">
        <Gamepad2
          size={64}
          className="text-text-muted opacity-25"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 blur-2xl opacity-30 scale-150"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">
          Jogo não encontrado
        </h1>
        <p className="text-sm text-text-muted mt-1">
          O jogo que você procura não existe ou foi removido.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/jogos">Ver todos os jogos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Voltar à home</Link>
        </Button>
      </div>
    </div>
  );
}
