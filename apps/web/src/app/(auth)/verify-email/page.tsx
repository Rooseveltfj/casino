"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@casino/ui";
import { authClient } from "@/lib/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    // Better-Auth exposes verifyEmail via the emailVerification plugin path
    (authClient as unknown as {
      verifyEmail: (opts: { query: { token: string } }) => Promise<{ error: { message?: string } | null }>;
    })
      .verifyEmail({ query: { token } })
      .then((result) => {
        if (result.error) {
          setStatus("error");
        } else {
          setStatus("success");
          setTimeout(() => router.push("/perfil"), 2000);
        }
      })
      .catch(() => setStatus("error"));
  }, [params, router]);

  return (
    <div className="space-y-4 text-center">
      {status === "verifying" && (
        <>
          <Spinner size="lg" color="primary" label="Verificando email…" />
          <p className="text-text-secondary text-sm">Verificando seu email…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-4xl">✅</div>
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Email verificado!
          </h1>
          <p className="text-sm text-text-secondary">
            Sua conta foi ativada. Redirecionando…
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-4xl">❌</div>
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Link inválido ou expirado
          </h1>
          <p className="text-sm text-text-secondary">
            O link de verificação não é válido ou já expirou.
          </p>
          <Link
            href="/login"
            className="text-accent-primary text-sm hover:underline"
          >
            Voltar para o login
          </Link>
        </>
      )}
    </div>
  );
}
