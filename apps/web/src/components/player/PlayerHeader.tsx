"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Gift,
  LogOut,
  Menu,
  Search,
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

// ── Search Dialog ─────────────────────────────────────────────────────────────

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Dialog */}
        <motion.div
          initial={{ y: -20, scale: 0.96, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -20, scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
            <Search size={18} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jogos, provedores…"
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm outline-none"
            />
            <kbd className="text-xs text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border-default">
              Esc
            </kbd>
          </div>

          {/* Suggestions placeholder */}
          <div className="p-3">
            {query.length === 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-text-muted px-2 pb-1">Populares</p>
                {["AviatorX", "Diamond Mines", "Neon Dragon", "Live Roulette"].map((g) => (
                  <button
                    key={g}
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-text-primary text-sm transition-colors text-left"
                  >
                    <Search size={14} className="text-text-muted" />
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted text-sm py-4">
                Sem resultados para &quot;{query}&quot;
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

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
      >
        <Avatar className="size-8 border border-border-default">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
          <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
        <ChevronDown
          size={12}
          className={`text-text-muted hidden sm:block transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border-default rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* User info */}
            <div className="px-3 py-3 border-b border-border-subtle">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name ?? "Jogador"}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
              <Badge variant="secondary" className="mt-1.5 text-xs capitalize">
                {role}
              </Badge>
            </div>

            {/* Menu links */}
            <div className="py-1">
              {AVATAR_MENU.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>

            <Separator />
            <button
              onClick={() => { setOpen(false); void signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={14} />
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
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cmd+K / Ctrl+K open search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 h-16 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex items-center h-full px-3 sm:px-6 gap-2 sm:gap-4 max-w-screen-2xl mx-auto">
          {/* ── Left: Logo + desktop nav ─────────────────────────────────── */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center">
              <Logo size={34} />
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
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

          {/* ── Centre: Search ────────────────────────────────────────────── */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-lg bg-surface-elevated border border-border-default text-text-muted text-sm hover:border-accent-primary/40 transition-colors"
          >
            <Search size={14} className="shrink-0" />
            <span className="flex-1 text-left">Buscar jogos…</span>
            <kbd className="text-xs bg-surface border border-border-default px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>

          {/* ── Right: Auth section ───────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {isLoggedIn ? (
              <>
                {/* Wallet badge (desktop) */}
                <button
                  onClick={() => router.push("/carteira")}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-default hover:border-accent-primary/40 hover:shadow-glow-primary transition-all text-sm"
                >
                  <Wallet size={14} className="text-accent-primary" />
                  <span className="font-mono text-text-primary">R$&nbsp;1.000,00</span>
                </button>

                {/* Wallet icon (mobile) */}
                <button
                  onClick={() => router.push("/carteira")}
                  className="sm:hidden p-2 rounded-lg text-accent-primary hover:bg-accent-primary/10 transition-colors"
                  aria-label="Carteira"
                >
                  <Wallet size={20} />
                </button>

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
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-surface border-t border-border-subtle"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
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

      {/* Global search dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
