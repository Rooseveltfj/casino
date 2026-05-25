"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Gift,
  LogOut,
  Shield,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Logo,
  Separator,
} from "@casino/ui";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { SearchTrigger } from "@/components/search/command-search";
import { WalletWidget } from "@/components/wallet/wallet-widget";
import { NotificationBell } from "@/components/notifications/notification-bell";

const NAV_LINKS = [
  { href: "/jogos", label: "Cassino" },
  { href: "/ao-vivo", label: "Ao Vivo" },
  { href: "/esportes", label: "Esportes" },
  { href: "/promocoes", label: "Promoções" },
] as const;

const AVATAR_MENU = [
  { href: "/perfil", label: "Meu Perfil", icon: User },
  { href: "/carteira", label: "Carteira", icon: Wallet },
  { href: "/bonuses", label: "Bônus", icon: Gift },
  { href: "/kyc", label: "Verificação KYC", icon: Shield },
] as const;

// ── Avatar Dropdown ───────────────────────────────────────────────────────────

function AvatarMenu() {
  const { user, signOut } = useAuth();
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-surface-elevated transition-colors"
        aria-label="Menu do usuário"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar className="size-8 border border-border-default">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
          <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <ChevronDown
          size={12}
          className={`text-text-muted hidden sm:block transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Menu do usuário"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border-default rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-3 py-3 border-b border-border-subtle">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name ?? "Jogador"}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
              <Badge variant="secondary" className="mt-1.5 text-xs capitalize">
                {role}
              </Badge>
            </div>

            <div className="py-1">
              {AVATAR_MENU.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>

            <Separator />
            <button
              role="menuitem"
              onClick={() => { setOpen(false); void signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={14} aria-hidden="true" />
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────

export function PlayerHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center h-full px-3 sm:px-6 gap-2 sm:gap-4 max-w-screen-2xl mx-auto">
        {/* ── Left: Logo + desktop nav ─────────────────────────────────── */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Logo size={34} />
          </Link>

          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "text-accent-primary bg-accent-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Centre: Search trigger (desktop) ─────────────────────────── */}
        <SearchTrigger
          variant="full"
          className="hidden md:flex flex-1 max-w-xs"
        />

        {/* ── Right: Auth section ───────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Mobile search icon */}
          <SearchTrigger variant="icon" className="md:hidden" />

          {isLoggedIn ? (
            <>
              <WalletWidget />
              <NotificationBell />
              <AvatarMenu />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Cadastrar</Link>
              </Button>
            </>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-surface border-t border-border-subtle"
          >
            <nav
              aria-label="Navegação mobile"
              className="px-4 py-3 flex flex-col gap-1"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(href)
                      ? "text-accent-primary bg-accent-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }`}
                >
                  {label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary"
                >
                  Entrar
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
