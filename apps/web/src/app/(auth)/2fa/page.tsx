"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label } from "@casino/ui";
import { authClient } from "@/lib/auth";

const twoFactorClient = authClient.twoFactor;

export default function TwoFactorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") ?? "verify"; // "verify" | "setup"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);

  // ── Setup flow: generate QR code ─────────────────────────────────────────
  async function handleSetup() {
    setError("");
    setLoading(true);
    try {
      const result = await twoFactorClient.enable({ password: "" });
      if ("error" in result && result.error) {
        setError("Falha ao gerar QR code.");
        return;
      }
      if ("data" in result && result.data) {
        setQrCode((result.data as { totpURI?: string }).totpURI ?? null);
      }
    } catch {
      setError("Erro inesperado ao configurar 2FA.");
    } finally {
      setLoading(false);
    }
  }

  // ── Verify TOTP code ────────────────────────────────────────────────────
  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const code = fd.get("code") as string;

    try {
      if (mode === "setup") {
        const result = await twoFactorClient.verifyTotp({ code });
        if ("error" in result && result.error) {
          setError("Código inválido. Verifique seu aplicativo.");
          return;
        }
        setSetupDone(true);
      } else {
        const result = await twoFactorClient.verifyTotp({ code });
        if ("error" in result && result.error) {
          setError("Código inválido ou expirado.");
          return;
        }
        router.push("/perfil");
      }
    } catch {
      setError("Erro ao verificar o código.");
    } finally {
      setLoading(false);
    }
  }

  // ── Setup completed ───────────────────────────────────────────────────────
  if (setupDone) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">🔐</div>
        <h1 className="font-heading text-xl font-bold text-text-primary">
          2FA ativado com sucesso!
        </h1>
        <p className="text-sm text-text-secondary">
          A partir de agora, todos os logins exigem o código do seu aplicativo
          autenticador.
        </p>
        <Button className="w-full" onClick={() => router.push("/perfil")}>
          Ir para o perfil
        </Button>
      </div>
    );
  }

  // ── Setup flow ─────────────────────────────────────────────────────────
  if (mode === "setup" && !qrCode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Ativar verificação em dois fatores
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Aumente a segurança da sua conta com um código TOTP.
          </p>
        </div>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>Instale Google Authenticator ou Authy no seu celular</li>
          <li>Clique em "Gerar QR Code" abaixo</li>
          <li>Escaneie o QR Code com o aplicativo</li>
          <li>Digite o código de 6 dígitos para confirmar</li>
        </ol>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <Button className="w-full" onClick={handleSetup} disabled={loading}>
          {loading ? "Gerando…" : "Gerar QR Code"}
        </Button>
      </div>
    );
  }

  // ── QR Code display + verification ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          {mode === "setup" ? "Escaneie o QR Code" : "Código de verificação"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {mode === "setup"
            ? "Escaneie com seu aplicativo autenticador e confirme abaixo."
            : "Digite o código de 6 dígitos do seu aplicativo autenticador."}
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          {/* Display QR code as a link (app renders actual QR via a library) */}
          <div className="p-4 bg-white rounded-lg inline-block">
            <p className="text-xs text-black break-all max-w-[200px]">
              {qrCode}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="code">Código de 6 dígitos</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            autoComplete="one-time-code"
            className="tracking-widest text-center font-mono text-lg"
            required
          />
        </div>

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verificando…" : "Verificar código"}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href="/login" className="text-text-muted hover:text-text-secondary">
          ← Cancelar
        </Link>
      </p>
    </div>
  );
}
