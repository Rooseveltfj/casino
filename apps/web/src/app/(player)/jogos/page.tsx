"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, Search } from "lucide-react";
import { Button } from "@casino/ui";

// ── Static catalogue ─────────────────────────────────────────────────────────

const CATEGORIES = [
  "Todos",
  "Slots",
  "Crash",
  "Ao Vivo",
  "Mesa",
  "Instant",
  "Esportes",
] as const;

type Category = (typeof CATEGORIES)[number];

interface Game {
  slug: string;
  name: string;
  category: string;
  rtp: string;
  color: string;
}

const ALL_GAMES: Game[] = [
  { slug: "aviatorx", name: "AviatorX", category: "Crash", rtp: "97.0", color: "#003d5c" },
  { slug: "diamond-mines", name: "Diamond Mines", category: "Instant", rtp: "97.0", color: "#1a1a4e" },
  { slug: "neon-dragon", name: "Neon Dragon", category: "Slots", rtp: "96.1", color: "#1a0030" },
  { slug: "plinko-pro", name: "Plinko Pro", category: "Instant", rtp: "97.0", color: "#002a1a" },
  { slug: "pirates-fortune", name: "Pirate's Fortune", category: "Slots", rtp: "95.5", color: "#2a1a00" },
  { slug: "live-roulette-royale", name: "Live Roulette Royale", category: "Ao Vivo", rtp: "97.3", color: "#1a0a2a" },
  { slug: "golden-fruit-frenzy", name: "Golden Fruit Frenzy", category: "Slots", rtp: "96.5", color: "#2a1a00" },
  { slug: "rocket-rush", name: "Rocket Rush", category: "Crash", rtp: "97.0", color: "#003d5c" },
  { slug: "live-blackjack-vip", name: "Live Blackjack VIP", category: "Ao Vivo", rtp: "99.3", color: "#0a1a2a" },
  { slug: "european-blackjack", name: "European Blackjack", category: "Mesa", rtp: "99.6", color: "#0a1a2a" },
  { slug: "european-roulette", name: "European Roulette", category: "Mesa", rtp: "97.3", color: "#1a0a2a" },
  { slug: "dice-duel", name: "Dice Duel", category: "Instant", rtp: "98.0", color: "#1a1a0a" },
  { slug: "sugar-bonanza", name: "Sugar Bonanza", category: "Slots", rtp: "96.8", color: "#2a0a1a" },
  { slug: "cyberpunk-neons", name: "Cyberpunk Neons", category: "Slots", rtp: "95.9", color: "#001a2a" },
  { slug: "live-baccarat-prestige", name: "Live Baccarat Prestige", category: "Ao Vivo", rtp: "98.9", color: "#1a2a0a" },
  { slug: "moon-launch", name: "Moon Launch", category: "Crash", rtp: "96.5", color: "#0a003d" },
  { slug: "baccarat-classic", name: "Baccarat Classic", category: "Mesa", rtp: "98.9", color: "#1a2a0a" },
  { slug: "keno-blitz", name: "Keno Blitz", category: "Instant", rtp: "95.0", color: "#1a1a1a" },
  { slug: "viking-thunder", name: "Viking Thunder", category: "Slots", rtp: "96.0", color: "#2a1a0a" },
  { slug: "aztec-gold-temple", name: "Aztec Gold Temple", category: "Slots", rtp: "96.2", color: "#2a1500" },
  { slug: "space-blast", name: "Space Blast", category: "Slots", rtp: "96.3", color: "#000a2a" },
  { slug: "crypto-crash", name: "Crypto Crash", category: "Crash", rtp: "97.0", color: "#001a1a" },
  { slug: "live-dragon-tiger", name: "Live Dragon Tiger", category: "Ao Vivo", rtp: "96.3", color: "#2a0a0a" },
  { slug: "casino-poker", name: "Casino Poker", category: "Mesa", rtp: "97.7", color: "#0a2a0a" },
];

export default function JogosPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [search, setSearch] = useState("");

  const filtered = ALL_GAMES.filter((g) => {
    const matchCat =
      activeCategory === "Todos" || g.category === activeCategory;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Todos os Jogos
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {ALL_GAMES.length} jogos disponíveis em modo demo
        </p>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat
                  ? "bg-accent-primary text-background shadow-glow-primary"
                  : "bg-surface-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-accent-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border-default text-text-muted shrink-0 w-full sm:w-52 focus-within:border-accent-primary transition-colors">
          <Search size={14} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogo…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* ── Game grid ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <Gamepad2 size={40} className="opacity-30" />
          <p>Nenhum jogo encontrado para &quot;{search}&quot;</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearch(""); setActiveCategory("Todos"); }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((game) => (
            <Link
              key={game.slug}
              href={`/jogos/${game.slug}`}
              className="group block"
            >
              <div className="relative rounded-xl overflow-hidden border border-border-default hover:border-accent-primary/50 transition-all hover:shadow-glow-primary bg-surface-elevated">
                <div
                  className="aspect-[3/4] flex flex-col items-center justify-center gap-2"
                  style={{
                    background: `radial-gradient(circle at 40% 30%, ${game.color}, #0A0E1A)`,
                  }}
                >
                  <Gamepad2 size={28} className="text-text-muted opacity-25" />
                  <span className="text-[9px] text-text-muted uppercase tracking-wider">
                    {game.category}
                  </span>
                  {/* Hover play */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" className="text-xs scale-90 group-hover:scale-100 transition-transform">
                      Jogar
                    </Button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {game.name}
                  </p>
                  <p className="text-[10px] font-mono text-accent-primary mt-0.5">
                    RTP {game.rtp}%
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
