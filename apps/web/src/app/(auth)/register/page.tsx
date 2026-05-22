"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label } from "@casino/ui";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        password,
        callbackURL: "/perfil",
      });

      if (result.error) {
        setError(result.error.message ?? "Erro ao criar conta.");
        return;
      }

      // Registration succeeded — email verification is required
      setSuccess(true);
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">✉️</div>
        <h1 className="font-heading text-xl font-bold text-text-primary">
          Verifique seu email
        </h1>
        <p className="text-sm text-text-secondary">
          Enviamos um link de verificação para o seu email. Clique no link para
          ativar sua conta.
        </p>
        <p className="text-xs text-text-muted">
          Em modo dev, o link aparece no terminal do servidor.
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
          Criar conta
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Cadastre-se grátis e comece a jogar no modo demo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" type="text" placeholder="Seu nome" autoComplete="name" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
