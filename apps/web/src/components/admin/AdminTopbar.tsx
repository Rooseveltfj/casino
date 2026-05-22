"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Home, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { Badge } from "@casino/ui";

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label =
      seg === "admin"
        ? "Dashboard"
        : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    return { label, href };
  });
}

const NOTIFICATIONS = [
  { id: 1, label: "Novo depósito pendente de KYC", time: "2 min", type: "warning" },
  { id: 2, label: "Saque de R$5.000 aguardando aprovação", time: "8 min", type: "error" },
  { id: 3, label: "3 novos cadastros hoje", time: "1h", type: "info" },
] as const;

export function AdminTopbar() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);
  const [darkMode, setDarkMode] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex items-center h-14 px-6 bg-surface/80 backdrop-blur-xl border-b border-border-subtle shrink-0 gap-4">
      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
        <Link href="/admin" className="text-text-muted hover:text-text-secondary transition-colors">
          <Home size={14} />
        </Link>
        {crumbs.slice(1).map(({ label, href }) => (
          <span key={href} className="flex items-center gap-1 min-w-0">
            <ChevronRight size={12} className="text-text-muted shrink-0" />
            <Link
              href={href}
              className="text-text-muted hover:text-text-secondary transition-colors truncate max-w-[120px]"
            >
              {label}
            </Link>
          </span>
        ))}
      </nav>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default text-text-muted text-sm hover:border-accent-primary/40 transition-colors w-52 shrink-0">
        <Search size={13} />
        <span className="flex-1 text-left text-xs">Buscar jogador, tx…</span>
        <kbd className="text-[10px] bg-surface border border-border-default px-1 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>

      {/* ── Right actions ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label="Notificações"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-error text-[9px] font-bold text-white flex items-center justify-center">
              {NOTIFICATIONS.length}
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border-default rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">Notificações</span>
                <Badge variant="destructive" className="text-[10px]">
                  {NOTIFICATIONS.length} novas
                </Badge>
              </div>
              <div className="divide-y divide-border-subtle">
                {NOTIFICATIONS.map(({ id, label, time, type }) => (
                  <button
                    key={id}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors text-left"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        type === "error"
                          ? "bg-error"
                          : type === "warning"
                            ? "bg-warning"
                            : "bg-accent-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{time} atrás</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border-subtle">
                <button className="text-xs text-accent-primary hover:underline">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle (admin-only feature) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Alternar tema"
          title={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
