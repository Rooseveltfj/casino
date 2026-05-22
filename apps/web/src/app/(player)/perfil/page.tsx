"use client";

import Link from "next/link";
import { Calendar, CreditCard, Gamepad2, Settings, Shield } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@casino/ui";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

const RECENT_SESSIONS = [
  { game: "AviatorX", date: "Hoje, 14:32", bets: "R$ 25,00", wins: "R$ 48,50", result: "win" },
  { game: "Diamond Mines", date: "Hoje, 13:15", bets: "R$ 10,00", wins: "R$ 0,00", result: "loss" },
  { game: "Neon Dragon", date: "Ontem, 20:40", bets: "R$ 50,00", wins: "R$ 125,00", result: "win" },
  { game: "Live Roulette", date: "Ontem, 19:12", bets: "R$ 30,00", wins: "R$ 30,00", result: "neutral" },
  { game: "Plinko Pro", date: "21/05, 11:05", bets: "R$ 15,00", wins: "R$ 9,00", result: "loss" },
] as const;

const BALANCE_TYPES = [
  { label: "Saldo Demo", value: "R$ 1.000,00", color: "accent-primary", icon: "🎮" },
  { label: "Saldo Real", value: "R$ 0,00", color: "text-text-secondary", icon: "💰" },
  { label: "Bônus", value: "R$ 0,00", color: "accent-secondary", icon: "🎁" },
] as const;

export default function PerfilPage() {
  const { user, isLoggedIn } = useAuth();
  const { role } = useRole();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <p className="text-text-secondary text-sm">
          Faça login para ver seu perfil.
        </p>
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── User info card ────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="size-16 border-2 border-accent-primary/40 shadow-glow-primary">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 text-xs bg-success text-background px-1 py-0.5 rounded-full border border-background">
                ✓
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-heading text-xl font-bold text-text-primary">
                  {user?.name ?? "Jogador"}
                </h1>
                <Badge variant="secondary" className="capitalize">
                  {role}
                </Badge>
                {user?.emailVerified && (
                  <Badge variant="success" className="text-[10px]">
                    <Shield size={10} className="mr-1" /> Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-muted">{user?.email}</p>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Calendar size={11} />
                Membro desde Mai 2026
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/perfil/editar">
                  <Settings size={14} className="mr-1.5" />
                  Editar perfil
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/kyc">
                  <Shield size={14} className="mr-1.5" />
                  Verificar KYC
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Balance cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BALANCE_TYPES.map(({ label, value, icon }) => (
          <Card key={label} className="hover:border-border-strong transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="font-mono text-lg font-bold text-text-primary mt-0.5">
                    {value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/carteira/deposito">
            <CreditCard size={14} className="mr-1.5" />
            Depositar
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/carteira/saque">Sacar</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/carteira/historico">Histórico</Link>
        </Button>
      </div>

      {/* ── Recent sessions ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 size={18} className="text-accent-primary" />
            Sessões Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0 divide-y divide-border-subtle">
            {RECENT_SESSIONS.map(({ game, date, bets, wins, result }) => (
              <div key={date + game} className="flex items-center gap-3 py-3">
                {/* Result indicator */}
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    result === "win"
                      ? "bg-success"
                      : result === "loss"
                        ? "bg-error"
                        : "bg-text-muted"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {game}
                  </p>
                  <p className="text-xs text-text-muted">{date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-muted">Apostas: {bets}</p>
                  <p
                    className={`text-xs font-mono font-medium ${
                      result === "win"
                        ? "text-success"
                        : result === "loss"
                          ? "text-error"
                          : "text-text-muted"
                    }`}
                  >
                    Ganhos: {wins}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-3" />
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/carteira/historico">Ver histórico completo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
