"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, Menu, Trophy, Tv } from "lucide-react";

const NAV_ITEMS = [
  { href: "/jogos", label: "Cassino", icon: Home },
  { href: "/ao-vivo", label: "Ao Vivo", icon: Tv },
  { href: "/esportes", label: "Esportes", icon: Trophy },
  { href: "/promocoes", label: "Promoções", icon: Gift },
  { href: "/perfil", label: "Menu", icon: Menu },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/jogos" && pathname.startsWith(href));
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface/95 backdrop-blur-lg border-t border-border-subtle"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around h-full px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-0 transition-all ${
                active
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 ${active ? "drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]" : ""}`}
              />
              <span className="text-[10px] font-medium truncate">{label}</span>
              {active && (
                <span className="absolute bottom-1 h-0.5 w-5 rounded-full bg-accent-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
