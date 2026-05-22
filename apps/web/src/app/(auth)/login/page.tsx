"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label } from "@casino/ui";
import { signIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    try {
      const result = await signIn.email({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        callbackURL: "/perfil",
      });

      if (result.error) {
        setError(result.error.message ?? "Email ou senha inválidos.");
        return;
      }

      router.push("/perfil");
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Entrar na sua conta
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Bem-vindo de volta. Acesse sua conta para jogar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent-primary hover:underline"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Não tem conta?{" "}
        <Link href="/register" className="text-accent-primary hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </div>
  );
}
