"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Label } from "@casino/ui";
import { authClient } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    try {
      // Better-Auth exposes forgetPassword on the client (sends reset email)
      await (authClient as unknown as {
        forgetPassword: (opts: { email: string; redirectTo: string }) => Promise<unknown>;
      }).forgetPassword({
        email: fd.get("email") as string,
        redirectTo: "/reset-password",
      });
      setSent(true);
    } catch {
      setError("Não foi possível enviar o email. Verifique o endereço.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">📬</div>
        <h1 className="font-heading text-xl font-bold text-text-primary">
          Email enviado
        </h1>
        <p className="text-sm text-text-secondary">
          Se houver uma conta com esse email, você receberá um link para
          redefinir sua senha.
        </p>
        <Link href="/login" className="text-accent-primary text-sm hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Esqueceu a senha?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando…" : "Enviar link de recuperação"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="text-accent-primary hover:underline">
          ← Voltar para o login
        </Link>
      </p>
    </div>
  );
}
