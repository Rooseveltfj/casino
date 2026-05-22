import { Suspense } from "react";
import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { getDb, games } from "@casino/database";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import {
  FeaturedGamesSection,
  FeaturedGamesSkeleton,
} from "@/components/home/FeaturedGames";
import {
  GameCatalogSection,
  GameCatalogSkeleton,
} from "@/components/home/GameCatalog";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { FinalCTA } from "@/components/home/FinalCTA";
import type { GameCardData } from "@/components/home/GameCard";

export const metadata: Metadata = {
  title: "Casino Platform — Jogue, Ganhe, Repita",
  description:
    "Mais de 30 jogos exclusivos: slots, crash, ao vivo, mesa e muito mais. Cadastro grátis em 60 segundos.",
};

// ── Data fetching helpers ─────────────────────────────────────────────────────

/** Static fallback when DATABASE_URL is not configured (demo / CI) */
const DEMO_GAMES: GameCardData[] = [
  { id: "1",  slug: "aviatorx",            name: "AviatorX",            provider: "Internal", category: "crash",   thumbnailUrl: null, rtp: "97.00", isFeatured: true  },
  { id: "2",  slug: "diamond-mines",       name: "Diamond Mines",       provider: "Internal", category: "instant", thumbnailUrl: null, rtp: "97.00", isFeatured: true  },
  { id: "3",  slug: "neon-dragon",         name: "Neon Dragon",         provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.10", isFeatured: true  },
  { id: "4",  slug: "plinko-pro",          name: "Plinko Pro",          provider: "Internal", category: "instant", thumbnailUrl: null, rtp: "97.00", isFeatured: true  },
  { id: "5",  slug: "pirates-fortune",     name: "Pirate's Fortune",    provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "95.50", isFeatured: true  },
  { id: "6",  slug: "live-roulette-royale",name: "Live Roulette Royale",provider: "Internal", category: "live",    thumbnailUrl: null, rtp: "97.30", isFeatured: true  },
  { id: "7",  slug: "golden-fruit-frenzy", name: "Golden Fruit Frenzy", provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.50", isFeatured: false },
  { id: "8",  slug: "rocket-rush",         name: "Rocket Rush",         provider: "Internal", category: "crash",   thumbnailUrl: null, rtp: "97.00", isFeatured: false },
  { id: "9",  slug: "live-blackjack-vip",  name: "Live Blackjack VIP",  provider: "Internal", category: "live",    thumbnailUrl: null, rtp: "99.28", isFeatured: false },
  { id: "10", slug: "european-roulette",   name: "European Roulette",   provider: "Internal", category: "table",   thumbnailUrl: null, rtp: "97.30", isFeatured: false },
  { id: "11", slug: "baccarat-classic",    name: "Baccarat Classic",    provider: "Internal", category: "table",   thumbnailUrl: null, rtp: "98.94", isFeatured: false },
  { id: "12", slug: "dice-duel",           name: "Dice Duel",           provider: "Internal", category: "instant", thumbnailUrl: null, rtp: "98.00", isFeatured: false },
  { id: "13", slug: "sugar-bonanza",       name: "Sugar Bonanza",       provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.80", isFeatured: false },
  { id: "14", slug: "cyberpunk-neons",     name: "Cyberpunk Neons",     provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "95.90", isFeatured: false },
  { id: "15", slug: "live-baccarat-prestige", name: "Live Baccarat Prestige", provider: "Internal", category: "live", thumbnailUrl: null, rtp: "98.94", isFeatured: false },
  { id: "16", slug: "moon-launch",         name: "Moon Launch",         provider: "Internal", category: "crash",   thumbnailUrl: null, rtp: "96.50", isFeatured: false },
  { id: "17", slug: "keno-blitz",          name: "Keno Blitz",          provider: "Internal", category: "instant", thumbnailUrl: null, rtp: "95.00", isFeatured: false },
  { id: "18", slug: "viking-thunder",      name: "Viking Thunder",      provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.00", isFeatured: false },
  { id: "19", slug: "aztec-gold-temple",   name: "Aztec Gold Temple",   provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.20", isFeatured: false },
  { id: "20", slug: "crypto-crash",        name: "Crypto Crash",        provider: "Internal", category: "crash",   thumbnailUrl: null, rtp: "97.00", isFeatured: false },
  { id: "21", slug: "live-dragon-tiger",   name: "Live Dragon Tiger",   provider: "Internal", category: "live",    thumbnailUrl: null, rtp: "96.27", isFeatured: false },
  { id: "22", slug: "casino-poker",        name: "Casino Poker",        provider: "Internal", category: "table",   thumbnailUrl: null, rtp: "97.68", isFeatured: false },
  { id: "23", slug: "diamond-rush-classic",name: "Diamond Rush Classic",provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "97.00", isFeatured: false },
  { id: "24", slug: "space-blast",         name: "Space Blast",         provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.30", isFeatured: false },
  { id: "25", slug: "book-of-nile",        name: "Book of Nile",        provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "95.80", isFeatured: false },
  { id: "26", slug: "football-prediction", name: "Football Prediction", provider: "Internal", category: "sport",   thumbnailUrl: null, rtp: "95.00", isFeatured: false },
  { id: "27", slug: "esports-fantasy",     name: "Esports Fantasy",     provider: "Internal", category: "sport",   thumbnailUrl: null, rtp: "95.00", isFeatured: false },
  { id: "28", slug: "european-blackjack",  name: "European Blackjack",  provider: "Internal", category: "table",   thumbnailUrl: null, rtp: "99.60", isFeatured: false },
  { id: "29", slug: "lucky-clover",        name: "Lucky Clover",        provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "97.20", isFeatured: false },
  { id: "30", slug: "mystic-forest",       name: "Mystic Forest",       provider: "Internal", category: "slot",    thumbnailUrl: null, rtp: "96.00", isFeatured: false },
];

async function fetchAllGames(): Promise<GameCardData[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: games.id,
        slug: games.slug,
        name: games.name,
        provider: games.provider,
        category: games.category,
        thumbnailUrl: games.thumbnailUrl,
        rtp: games.rtp,
        isFeatured: games.isFeatured,
      })
      .from(games)
      .where(and(eq(games.isActive, true)))
      .orderBy(desc(games.isFeatured), desc(games.playCount));

    return rows.map((r) => ({
      ...r,
      thumbnailUrl: r.thumbnailUrl ?? null,
      rtp: r.rtp ?? null,
    }));
  } catch {
    // DATABASE_URL not configured — serve static demo data
    return DEMO_GAMES;
  }
}

// ── Async server sections (each suspends independently) ───────────────────────

async function FeaturedAsync() {
  const allGames = await fetchAllGames();
  const featured = allGames.filter((g) => g.isFeatured).slice(0, 6);
  return <FeaturedGamesSection games={featured} />;
}

async function CatalogAsync() {
  const allGames = await fetchAllGames();
  return <GameCatalogSection games={allGames} />;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerHomePage() {
  return (
    <>
      {/* Section 1 — Hero (no data, renders immediately) */}
      <HeroSection />

      {/* Section 2 — Stats bar (no data, renders immediately) */}
      <StatsBar />

      {/* Section 3 — Featured games */}
      <Suspense fallback={<FeaturedGamesSkeleton />}>
        <FeaturedAsync />
      </Suspense>

      {/* Section 4 — Full catalogue with tabs + infinite scroll */}
      <Suspense fallback={<GameCatalogSkeleton />}>
        <CatalogAsync />
      </Suspense>

      {/* Section 5 — Promotions carousel (static data, no suspense) */}
      <PromoCarousel />

      {/* Section 6 — Final CTA (static, no data) */}
      <FinalCTA />
    </>
  );
}
