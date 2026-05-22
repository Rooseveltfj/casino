"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  Gamepad2,
  Gift,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, Badge, Logo, Separator } from "@casino/ui";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { signOut } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
}

interface SidebarSection {
  key: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

const SECTIONS: SidebarSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    key: "players",
    label: "Jogadores",
    icon: Users,
    children: [
      { href: "/admin/jogadores", label: "Lista de jogadores" },
      { href: "/admin/kyc", label: "Verificação KYC" },
      { href: "/admin/auto-exclusao", label: "Auto-exclusão" },
    ],
  },
  {
    key: "finance",
    label: "Financeiro",
    icon: CreditCard,
    children: [
      { href: "/admin/transacoes", label: "Transações" },
      { href: "/admin/depositos", label: "Depósitos" },
      { href: "/admin/saques", label: "Saques" },
      { href: "/admin/ajustes", label: "Ajustes manuais" },
    ],
  },
  {
    key: "games",
    label: "Jogos",
    icon: Gamepad2,
    children: [
      { href: "/admin/jogos/catalogo", label: "Catálogo" },
      { href: "/admin/jogos/providers", label: "Provedores" },
      { href: "/admin/jogos/config", label: "Configuração" },
    ],
  },
  {
    key: "bonuses",
    label: "Bônus",
    icon: Gift,
    children: [
      { href: "/admin/bonus/campanhas", label: "Campanhas" },
      { href: "/admin/bonus/rollover", label: "Regras de rollover" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    children: [
      { href: "/admin/marketing/banners", label: "Banners" },
      { href: "/admin/marketing/promocoes", label: "Promoções" },
      { href: "/admin/marketing/cms", label: "CMS" },
    ],
  },
  {
    key: "compliance",
    label: "Compliance",
    icon: FileText,
    children: [
      { href: "/admin/compliance/relatorios", label: "Relatórios SPA/MF" },
      { href: "/admin/compliance/audit", label: "Audit log" },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    icon: Settings,
    children: [
      { href: "/admin/config/geral", label: "Geral" },
      { href: "/admin/config/seguranca", label: "Segurança" },
      { href: "/admin/config/rbac", label: "RBAC" },
      { href: "/admin/config/integracoes", label: "Integrações" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { role } = useRole();

  // Track which sections are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of SECTIONS) {
      if (section.children) {
        // Auto-expand the section that contains the current route
        initial[section.key] = section.children.some((c) =>
          pathname.startsWith(c.href),
        );
      }
    }
    return initial;
  });

  function toggle(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isChildActive(children: NavItem[]) {
    return children.some((c) => pathname.startsWith(c.href));
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <aside className="flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border-subtle z-50 overflow-hidden">
      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border-subtle shrink-0">
        <Logo size={28} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            Casino Platform
          </p>
          <p className="text-[11px] text-text-muted">Backoffice</p>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const hasChildren = !!section.children?.length;

          // Direct link (no children)
          if (!hasChildren && section.href) {
            const active = pathname === section.href;
            return (
              <Link
                key={section.key}
                href={section.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {section.label}
              </Link>
            );
          }

          // Collapsible section
          const childActive = hasChildren && isChildActive(section.children!);
          const isOpen = expanded[section.key] ?? childActive;

          return (
            <div key={section.key}>
              <button
                onClick={() => toggle(section.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  childActive
                    ? "text-accent-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                }`}
              >
                <Icon
                  size={16}
                  className={`shrink-0 ${childActive ? "text-accent-primary" : ""}`}
                />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  size={14}
                  className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && section.children && (
                <div className="ml-5 mt-0.5 pl-3 border-l border-border-subtle space-y-0.5">
                  {section.children.map((child) => {
                    const active = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          active
                            ? "text-accent-primary bg-accent-primary/8"
                            : "text-text-muted hover:text-text-secondary hover:bg-surface-elevated"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: user + actions ───────────────────────────────────────── */}
      <div className="border-t border-border-subtle shrink-0">
        {/* Back to site */}
        <Link
          href="/jogos"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors border-b border-border-subtle"
        >
          <ExternalLink size={14} />
          Voltar ao site
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="size-8 border border-border-default shrink-0">
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name ?? "Admin"}
            </p>
            <Badge variant="secondary" className="text-[10px] capitalize mt-0.5">
              {role}
            </Badge>
          </div>
          <button
            onClick={() => { void signOut(); void router.push("/login"); }}
            className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
