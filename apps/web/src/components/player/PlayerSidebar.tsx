"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Dice5,
  Gift,
  Gamepad2,
  Home,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@casino/ui";

interface CategoryItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const CATEGORIES: CategoryItem[] = [
  { href: "/jogos", label: "Todos", icon: Home },
  { href: "/jogos?c=populares", label: "Populares", icon: TrendingUp },
  { href: "/jogos?c=novos", label: "Novos", icon: Sparkles },
  { href: "/jogos?c=slots", label: "Slots", icon: Gamepad2 },
  { href: "/ao-vivo", label: "Ao Vivo", icon: Tv, badge: "LIVE" },
  { href: "/jogos?c=crash", label: "Crash", icon: Rocket },
  { href: "/jogos?c=mesa", label: "Mesa", icon: Dice5 },
  { href: "/esportes", label: "Esportes", icon: BarChart3 },
  { href: "/favoritos", label: "Favoritos", icon: Star },
];

const ACTIVE_PROMOS = [
  { label: "Bônus de Boas-vindas", value: "100% até R$500", color: "cyan" },
  { label: "Cashback Semanal", value: "10% toda segunda", color: "gold" },
] as const;

export function PlayerSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    const path = href.split("?")[0] ?? href;
    return pathname === path || (path !== "/jogos" && pathname.startsWith(path));
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-60 bg-surface border-r border-border-subtle z-40 overflow-y-auto">
      {/* ── Categories ──────────────────────────────────────────────────── */}
      <div className="p-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">
          Categorias
        </p>
        <nav className="space-y-0.5">
          {CATEGORIES.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href + label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? "bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.15)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                }`}
              >
                <Icon
                  size={16}
                  className={`shrink-0 transition-colors ${
                    active
                      ? "text-accent-primary"
                      : "text-text-muted group-hover:text-text-primary"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[10px] font-bold text-error bg-error/20 border border-error/30 px-1.5 py-0.5 rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
                {active && (
                  <div className="w-1 h-1 rounded-full bg-accent-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Active promotions ────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border-subtle">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">
          Promoções Ativas
        </p>
        <div className="space-y-2">
          {ACTIVE_PROMOS.map(({ label, value, color }) => (
            <Link
              key={label}
              href="/promocoes"
              className="block p-2.5 rounded-lg bg-surface-elevated border border-border-default hover:border-accent-primary/40 transition-all group"
            >
              <div className="flex items-start gap-2">
                <Gift
                  size={14}
                  className={`shrink-0 mt-0.5 ${color === "cyan" ? "text-accent-primary" : "text-accent-secondary"}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{label}</p>
                  <p
                    className={`text-xs font-mono mt-0.5 ${color === "cyan" ? "text-accent-primary" : "text-accent-secondary"}`}
                  >
                    {value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Support widget ───────────────────────────────────────────────── */}
      <div className="p-3 mt-auto border-t border-border-subtle">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-elevated border border-border-default hover:border-accent-primary/40 hover:shadow-glow-primary transition-all text-sm group">
          <MessageCircle
            size={16}
            className="text-accent-primary group-hover:scale-110 transition-transform shrink-0"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">Suporte 24/7</p>
            <p className="text-xs text-text-muted">Chat ao vivo</p>
          </div>
          <Badge variant="success" className="ml-auto text-[10px] px-1.5 py-0">
            Online
          </Badge>
        </button>
      </div>
    </aside>
  );
}
