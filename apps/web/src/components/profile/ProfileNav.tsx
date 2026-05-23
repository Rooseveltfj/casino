"use client";

import {
  ClipboardList,
  Gift,
  HeartHandshake,
  Shield,
  User as UserIcon,
  Wallet,
} from "lucide-react";

export type ProfileSection =
  | "conta"
  | "seguranca"
  | "carteira"
  | "historico"
  | "bonuses"
  | "responsavel";

interface NavItem {
  id: ProfileSection;
  label: string;
  icon: React.ElementType;
}

const ITEMS: NavItem[] = [
  { id: "conta",       label: "Minha conta",       icon: UserIcon      },
  { id: "seguranca",   label: "Segurança",         icon: Shield        },
  { id: "carteira",    label: "Carteira",          icon: Wallet        },
  { id: "historico",   label: "Histórico",         icon: ClipboardList },
  { id: "bonuses",     label: "Bônus",             icon: Gift          },
  { id: "responsavel", label: "Jogo Responsável",  icon: HeartHandshake},
];

interface ProfileNavProps {
  active: ProfileSection;
  onChange: (s: ProfileSection) => void;
}

export function ProfileNav({ active, onChange }: ProfileNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border-subtle pr-4 sticky top-20 self-start"
        aria-label="Navegação do perfil"
      >
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 mb-2">
          Configurações
        </p>
        <nav className="flex flex-col gap-0.5">
          {ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={active === id ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active === id
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile/Tablet: horizontal tabs */}
      <div
        role="tablist"
        aria-label="Seções do perfil"
        className="lg:hidden sticky top-16 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/80 backdrop-blur-md border-b border-border-subtle"
      >
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => onChange(id)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                active === id
                  ? "bg-accent-primary text-background"
                  : "bg-surface-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
