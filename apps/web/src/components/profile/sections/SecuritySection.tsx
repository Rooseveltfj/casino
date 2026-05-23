"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Check,
  Key,
  Loader2,
  LogOut,
  Monitor,
  Shield,
  ShieldCheck,
  Smartphone,
  X,
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
import { authClient } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionsResponse {
  sessions: Array<{
    id: string;
    token: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    expiresAt: string;
  }>;
  currentSessionId: string;
}

interface LoginsResponse {
  logins: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
  }>;
}

interface SecuritySectionProps {
  twoFactorEnabled: boolean;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json() as Promise<T>);

// ── Helpers ───────────────────────────────────────────────────────────────────

function deviceFromUserAgent(ua: string | null): string {
  if (!ua) return "Dispositivo desconhecido";
  if (/iPhone|iPad/i.test(ua)) return "iPhone/iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Outro";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// ── Password change card ──────────────────────────────────────────────────────

function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit =
    current.length >= 8 && next.length >= 8 && next === confirm && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Falha ao trocar senha",
          description: result.error.message ?? "Verifique sua senha atual.",
        });
      } else {
        toast({
          variant: "success",
          title: "Senha alterada",
          description: "Outras sessões foram encerradas por segurança.",
        });
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Key size={16} className="text-accent-primary" aria-hidden="true" />
          Trocar senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="current-pw">Senha atual</Label>
            <Input
              id="current-pw"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pw">Nova senha</Label>
            <Input
              id="new-pw"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw">Confirmar nova senha</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={confirm.length > 0 && confirm !== next}
            />
            {confirm.length > 0 && confirm !== next && (
              <p className="text-[11px] text-error">As senhas não coincidem.</p>
            )}
          </div>
          <Button type="submit" disabled={!canSubmit} className="gap-1.5">
            {saving && (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            )}
            {saving ? "Salvando…" : "Atualizar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── 2FA dialog ────────────────────────────────────────────────────────────────

function TwoFactorCard({ enabled: initialEnabled }: { enabled: boolean }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [open, setOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [step, setStep] = useState<"password" | "verify">("password");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setOpen(false);
    setStep("password");
    setPassword("");
    setTotpURI(null);
    setCode("");
  };

  const requestEnable = async () => {
    setLoading(true);
    try {
      const r = await authClient.twoFactor.enable({ password });
      if (r.error || !r.data?.totpURI) {
        toast({
          variant: "destructive",
          title: "Senha incorreta",
          description: r.error?.message ?? "Verifique e tente novamente",
        });
      } else {
        setTotpURI(r.data.totpURI);
        setStep("verify");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    setLoading(true);
    try {
      const r = await authClient.twoFactor.verifyTotp({ code });
      if (r.error) {
        toast({
          variant: "destructive",
          title: "Código inválido",
          description: r.error.message ?? "Verifique o código",
        });
      } else {
        setEnabled(true);
        reset();
        toast({
          variant: "success",
          title: "2FA ativado!",
          description: "Seus próximos logins exigirão o código.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setDisabling(true);
    try {
      const r = await authClient.twoFactor.disable({ password });
      if (r.error) {
        toast({
          variant: "destructive",
          title: "Falha ao desabilitar",
          description: r.error.message ?? "Senha incorreta",
        });
      } else {
        setEnabled(false);
        reset();
        toast({
          variant: "default",
          title: "2FA desabilitado",
          description: "Considere reativá-lo para mais segurança.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado",
      });
    } finally {
      setDisabling(false);
    }
  };

  // Generate QR code image URL from TOTP URI
  const qrImage = totpURI
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpURI)}&bgcolor=131826&color=00D4FF`
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield
              size={16}
              className={enabled ? "text-success" : "text-text-muted"}
              aria-hidden="true"
            />
            Autenticação de dois fatores (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {enabled ? (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck size={11} aria-hidden="true" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Desativado</Badge>
                )}
              </div>
              <p className="text-xs text-text-muted">
                {enabled
                  ? "Sua conta está protegida com autenticação adicional."
                  : "Adicione uma camada extra de segurança ao seu login."}
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant={enabled ? "outline" : "default"}
              size="sm"
            >
              {enabled ? "Desabilitar" : "Habilitar 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent>
          {!enabled && step === "password" && (
            <>
              <DialogHeader>
                <DialogTitle>Habilitar 2FA</DialogTitle>
                <DialogDescription>
                  Digite sua senha atual para gerar o QR Code.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="enable-pw">Senha atual</Label>
                <Input
                  id="enable-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={reset}>
                  Cancelar
                </Button>
                <Button
                  onClick={requestEnable}
                  disabled={!password || loading}
                  className="gap-1.5"
                >
                  {loading && (
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  )}
                  Continuar
                </Button>
              </DialogFooter>
            </>
          )}

          {!enabled && step === "verify" && qrImage && (
            <>
              <DialogHeader>
                <DialogTitle>Escaneie o QR Code</DialogTitle>
                <DialogDescription>
                  Use Google Authenticator, Authy ou 1Password.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-surface rounded-xl border border-border-default">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImage}
                    alt="QR Code TOTP"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-xs text-text-muted text-center break-all max-w-xs font-mono">
                  Ou cole esta chave no app:{" "}
                  <span className="text-text-secondary">
                    {totpURI?.match(/secret=([^&]+)/)?.[1] ?? totpURI}
                  </span>
                </p>
                <div className="w-full space-y-2">
                  <Label htmlFor="totp-code">Digite o código de 6 dígitos</Label>
                  <Input
                    id="totp-code"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="text-center font-mono text-lg tracking-widest"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("password")}>
                  Voltar
                </Button>
                <Button
                  onClick={verifyAndEnable}
                  disabled={code.length !== 6 || loading}
                >
                  {loading ? "Verificando…" : "Confirmar"}
                </Button>
              </DialogFooter>
            </>
          )}

          {enabled && (
            <>
              <DialogHeader>
                <DialogTitle>Desabilitar 2FA</DialogTitle>
                <DialogDescription>
                  Digite sua senha para remover a proteção 2FA.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="disable-pw">Senha atual</Label>
                <Input
                  id="disable-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={reset}>
                  Cancelar
                </Button>
                <Button
                  onClick={disable}
                  disabled={!password || disabling}
                  variant="destructive"
                >
                  {disabling ? "Removendo…" : "Confirmar desativação"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sessions card ─────────────────────────────────────────────────────────────

function SessionsCard() {
  const { toast } = useToast();
  const { data, mutate } = useSWR<SessionsResponse>(
    "/api/profile/sessions",
    fetcher,
    { refreshInterval: 30_000 },
  );

  const revoke = async (token: string) => {
    try {
      const r = await authClient.revokeSession({ token });
      if (r.error) {
        toast({
          variant: "destructive",
          title: "Falha ao encerrar sessão",
          description: r.error.message ?? "Tente novamente",
        });
      } else {
        toast({
          variant: "success",
          title: "Sessão encerrada",
        });
        void mutate();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Monitor
            size={16}
            className="text-accent-primary"
            aria-hidden="true"
          />
          Sessões ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data?.sessions?.length ? (
          <p className="text-sm text-text-muted text-center py-4">
            Nenhuma sessão ativa.
          </p>
        ) : (
          <div className="divide-y divide-border-subtle/40">
            {data.sessions.map((s) => {
              const isCurrent = s.id === data.currentSessionId;
              const device = deviceFromUserAgent(s.userAgent);
              const isMobile = /iPhone|Android|iPad/i.test(s.userAgent ?? "");

              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="p-2 rounded-lg bg-surface-elevated shrink-0">
                    {isMobile ? (
                      <Smartphone
                        size={14}
                        className="text-text-secondary"
                        aria-hidden="true"
                      />
                    ) : (
                      <Monitor
                        size={14}
                        className="text-text-secondary"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">
                        {device}
                      </p>
                      {isCurrent && (
                        <Badge variant="success" className="text-[10px] gap-0.5">
                          <Check size={9} aria-hidden="true" />
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {s.ipAddress ?? "IP desconhecido"} • {relativeTime(s.createdAt)}
                    </p>
                  </div>
                  {!isCurrent && (
                    <Button
                      onClick={() => revoke(s.token)}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-error border-error/40 hover:bg-error/10"
                    >
                      <LogOut size={11} aria-hidden="true" />
                      Encerrar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Login history card ────────────────────────────────────────────────────────

function LoginHistoryCard() {
  const { data } = useSWR<LoginsResponse>(
    "/api/profile/login-history",
    fetcher,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de login</CardTitle>
      </CardHeader>
      <CardContent>
        {!data?.logins?.length ? (
          <p className="text-sm text-text-muted text-center py-4">
            Sem registros de login.
          </p>
        ) : (
          <div className="space-y-2">
            {data.logins.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-border-subtle/30 last:border-0"
              >
                <div className="flex items-center gap-2 text-text-secondary">
                  <Monitor size={11} className="shrink-0" aria-hidden="true" />
                  <span>{deviceFromUserAgent(l.userAgent)}</span>
                  <span className="text-text-muted">•</span>
                  <span className="font-mono text-text-muted">
                    {l.ipAddress ?? "—"}
                  </span>
                </div>
                <span className="text-text-muted">{formatDate(l.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SecuritySection({ twoFactorEnabled }: SecuritySectionProps) {
  // Suppress unused warning for X icon — kept for future per-row close button
  void X;
  void Separator;
  useEffect(() => {
    // no-op — placeholder for future analytics
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Segurança
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Proteja sua conta com senha forte, 2FA e gerencie suas sessões
        </p>
      </div>

      <PasswordCard />
      <TwoFactorCard enabled={twoFactorEnabled} />
      <SessionsCard />
      <LoginHistoryCard />
    </div>
  );
}
