"use client";

import { useState, useTransition } from "react";
import { Check, Mail, Pencil, Save } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  useToast,
} from "@casino/ui";
import { AvatarUpload } from "../AvatarUpload";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileUser } from "@/lib/profile.server";

const COUNTRIES = [
  { code: "BR", label: "Brasil" },
  { code: "AR", label: "Argentina" },
  { code: "CL", label: "Chile" },
  { code: "CO", label: "Colômbia" },
  { code: "MX", label: "México" },
  { code: "PE", label: "Peru" },
  { code: "UY", label: "Uruguai" },
  { code: "PT", label: "Portugal" },
  { code: "ES", label: "Espanha" },
  { code: "US", label: "Estados Unidos" },
] as const;

const LOCALES = [
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "en-US", label: "English (US)" },
  { code: "es-AR", label: "Español (Argentina)" },
] as const;

interface AccountSectionProps {
  user: ProfileUser;
}

export function AccountSection({ user }: AccountSectionProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(
    user.displayName ?? user.name,
  );
  const [country, setCountry] = useState(user.country ?? "");
  const [locale, setLocale] = useState(user.locale);
  const [hasChanges, setHasChanges] = useState(false);

  const memberSince = user.createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const save = () => {
    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        country: country || undefined,
        locale: locale as "pt-BR" | "en-US" | "es-AR",
      });
      if (result.ok) {
        toast({
          variant: "success",
          title: "Perfil atualizado",
          description: "Suas alterações foram salvas.",
        });
        setHasChanges(false);
        setEditingName(false);
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Minha conta
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="pt-6">
          <AvatarUpload
            currentImage={user.image}
            userName={displayName}
            onUpdated={() => {
              // No state to update here — the server already persisted the new URL
              // and the page will revalidate on next navigation.
            }}
          />
        </CardContent>
      </Card>

      {/* Info form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Display name (inline editable) */}
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Nome de exibição</Label>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setHasChanges(true);
                  }}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingName(false);
                    if (e.key === "Escape") {
                      setDisplayName(user.displayName ?? user.name);
                      setEditingName(false);
                      setHasChanges(false);
                    }
                  }}
                  autoFocus
                  className="flex-1"
                  maxLength={60}
                />
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="group flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors w-full text-left py-2"
              >
                <span className="font-medium">{displayName}</span>
                <Pencil
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <Separator />

          {/* Email (readonly) */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface text-sm text-text-muted">
              <Mail size={14} className="shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">{user.email}</span>
              {user.emailVerified ? (
                <Badge variant="success" className="text-[10px] gap-0.5">
                  <Check size={9} aria-hidden="true" /> Verificado
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">
                  Não verificado
                </Badge>
              )}
            </div>
            {!user.emailVerified && (
              <p className="text-[11px] text-warning">
                Verifique seu email para liberar todas as funcionalidades.
              </p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label htmlFor="country">País</Label>
            <select
              id="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setHasChanges(true);
              }}
              className="w-full h-10 px-3 rounded-lg bg-input border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="">Selecione</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Locale */}
          <div className="space-y-1.5">
            <Label htmlFor="locale">Idioma</Label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => {
                setLocale(e.target.value);
                setHasChanges(true);
              }}
              className="w-full h-10 px-3 rounded-lg bg-input border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <Separator />

          {/* Member since */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Membro desde</span>
            <span className="text-sm font-medium text-text-primary">
              {memberSince}
            </span>
          </div>

          {/* Save button */}
          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button onClick={save} disabled={isPending} className="gap-1.5">
                <Save size={13} aria-hidden="true" />
                {isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
