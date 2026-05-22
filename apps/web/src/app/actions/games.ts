"use server";

import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDb, games, gameSessions } from "@casino/database";
import type { GameCardData } from "@/components/games/game-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SortOption = "popular" | "newest" | "rtp" | "az";
export type CategoryFilter = GameCardData["category"];
export type VolatilityFilter = "low" | "medium" | "high";

export interface GetGamesParams {
  categories?: CategoryFilter[];
  providers?: string[];
  minRtp?: number;
  maxRtp?: number;
  volatility?: VolatilityFilter[];
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface GamesResult {
  games: GameCardData[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ── Static fallback (no DB) ───────────────────────────────────────────────────

const FALLBACK: GameCardData[] = [
  { id:"1",  slug:"aviatorx",             name:"AviatorX",             provider:"Internal", category:"crash",   rtp:"97.00", thumbnailUrl:null, isFeatured:true,  volatility:"high"   },
  { id:"2",  slug:"diamond-mines",        name:"Diamond Mines",        provider:"Internal", category:"instant", rtp:"97.00", thumbnailUrl:null, isFeatured:true,  volatility:"high"   },
  { id:"3",  slug:"neon-dragon",          name:"Neon Dragon",          provider:"Internal", category:"slot",    rtp:"96.10", thumbnailUrl:null, isFeatured:true,  volatility:"high"   },
  { id:"4",  slug:"plinko-pro",           name:"Plinko Pro",           provider:"Internal", category:"instant", rtp:"97.00", thumbnailUrl:null, isFeatured:true,  volatility:"medium" },
  { id:"5",  slug:"pirates-fortune",      name:"Pirate's Fortune",     provider:"Internal", category:"slot",    rtp:"95.50", thumbnailUrl:null, isFeatured:true,  volatility:"high"   },
  { id:"6",  slug:"live-roulette-royale", name:"Live Roulette Royale", provider:"Internal", category:"live",    rtp:"97.30", thumbnailUrl:null, isFeatured:true,  volatility:"medium" },
  { id:"7",  slug:"golden-fruit-frenzy",  name:"Golden Fruit Frenzy",  provider:"Internal", category:"slot",    rtp:"96.50", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"8",  slug:"rocket-rush",          name:"Rocket Rush",          provider:"Internal", category:"crash",   rtp:"97.00", thumbnailUrl:null, isFeatured:false, volatility:"high"   },
  { id:"9",  slug:"live-blackjack-vip",   name:"Live Blackjack VIP",   provider:"Internal", category:"live",    rtp:"99.28", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"10", slug:"european-roulette",    name:"European Roulette",    provider:"Internal", category:"table",   rtp:"97.30", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"11", slug:"baccarat-classic",     name:"Baccarat Classic",     provider:"Internal", category:"table",   rtp:"98.94", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"12", slug:"dice-duel",            name:"Dice Duel",            provider:"Internal", category:"instant", rtp:"98.00", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"13", slug:"sugar-bonanza",        name:"Sugar Bonanza",        provider:"Internal", category:"slot",    rtp:"96.80", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"14", slug:"cyberpunk-neons",      name:"Cyberpunk Neons",      provider:"Internal", category:"slot",    rtp:"95.90", thumbnailUrl:null, isFeatured:false, volatility:"high"   },
  { id:"15", slug:"live-baccarat-prestige",name:"Live Baccarat Prestige",provider:"Internal",category:"live",  rtp:"98.94", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"16", slug:"moon-launch",          name:"Moon Launch",          provider:"Internal", category:"crash",   rtp:"96.50", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"17", slug:"keno-blitz",           name:"Keno Blitz",           provider:"Internal", category:"instant", rtp:"95.00", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"18", slug:"viking-thunder",       name:"Viking Thunder",       provider:"Internal", category:"slot",    rtp:"96.00", thumbnailUrl:null, isFeatured:false, volatility:"high"   },
  { id:"19", slug:"aztec-gold-temple",    name:"Aztec Gold Temple",    provider:"Internal", category:"slot",    rtp:"96.20", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"20", slug:"crypto-crash",         name:"Crypto Crash",         provider:"Internal", category:"crash",   rtp:"97.00", thumbnailUrl:null, isFeatured:false, volatility:"high"   },
  { id:"21", slug:"live-dragon-tiger",    name:"Live Dragon Tiger",    provider:"Internal", category:"live",    rtp:"96.27", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"22", slug:"casino-poker",         name:"Casino Poker",         provider:"Internal", category:"table",   rtp:"97.68", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"23", slug:"european-blackjack",   name:"European Blackjack",   provider:"Internal", category:"table",   rtp:"99.60", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"24", slug:"space-blast",          name:"Space Blast",          provider:"Internal", category:"slot",    rtp:"96.30", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"25", slug:"book-of-nile",         name:"Book of Nile",         provider:"Internal", category:"slot",    rtp:"95.80", thumbnailUrl:null, isFeatured:false, volatility:"high"   },
  { id:"26", slug:"lucky-clover",         name:"Lucky Clover",         provider:"Internal", category:"slot",    rtp:"97.20", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
  { id:"27", slug:"mystic-forest",        name:"Mystic Forest",        provider:"Internal", category:"slot",    rtp:"96.00", thumbnailUrl:null, isFeatured:false, volatility:"medium" },
  { id:"28", slug:"football-prediction",  name:"Football Prediction",  provider:"Internal", category:"sport",   rtp:"95.00", thumbnailUrl:null, isFeatured:false, volatility:null     },
  { id:"29", slug:"esports-fantasy",      name:"Esports Fantasy",      provider:"Internal", category:"sport",   rtp:"95.00", thumbnailUrl:null, isFeatured:false, volatility:null     },
  { id:"30", slug:"diamond-rush-classic", name:"Diamond Rush Classic", provider:"Internal", category:"slot",    rtp:"97.00", thumbnailUrl:null, isFeatured:false, volatility:"low"    },
];

function applyLocalFilters(
  data: GameCardData[],
  params: GetGamesParams,
): GameCardData[] {
  const { categories, providers, minRtp, maxRtp, volatility, featured, sort } = params;
  let result = [...data];

  if (categories?.length) result = result.filter((g) => categories.includes(g.category));
  if (providers?.length)  result = result.filter((g) => providers.some((p) => g.provider.toLowerCase().includes(p.toLowerCase())));
  if (minRtp !== undefined) result = result.filter((g) => g.rtp !== null && parseFloat(g.rtp) >= minRtp);
  if (maxRtp !== undefined) result = result.filter((g) => g.rtp === null || parseFloat(g.rtp) <= maxRtp);
  if (volatility?.length) result = result.filter((g) => g.volatility && volatility.includes(g.volatility as VolatilityFilter));
  if (featured) result = result.filter((g) => g.isFeatured);

  switch (sort) {
    case "newest": result.sort((a, b) => b.id.localeCompare(a.id)); break;
    case "rtp":    result.sort((a, b) => parseFloat(b.rtp ?? "0") - parseFloat(a.rtp ?? "0")); break;
    case "az":     result.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:       break; // popular = original order
  }

  return result;
}

// ── Cached DB query (module-level so Next.js can deduplicate) ─────────────────

const _queryGames = unstable_cache(
  async (paramsJson: string): Promise<{ rows: GameCardData[]; total: number }> => {
    const params = JSON.parse(paramsJson) as GetGamesParams;
    const {
      categories,
      providers,
      minRtp,
      maxRtp,
      volatility,
      featured,
      sort = "popular",
      page = 1,
      limit = 20,
    } = params;

    const db = getDb();
    const conds = [eq(games.isActive, true)];

    type GameCat  = "slot"|"live"|"crash"|"table"|"instant"|"sport";
    type GameVol  = "low"|"medium"|"high";
    if (categories?.length)  conds.push(inArray(games.category,   categories  as GameCat[]));
    if (providers?.length)   conds.push(inArray(games.provider,   providers));
    if (minRtp !== undefined) conds.push(gte(games.rtp, String(minRtp)));
    if (maxRtp !== undefined) conds.push(lte(games.rtp, String(maxRtp)));
    if (volatility?.length)  conds.push(inArray(games.volatility, volatility   as GameVol[]));
    if (featured)            conds.push(eq(games.isFeatured, true));

    const orderExpr = (() => {
      switch (sort) {
        case "newest": return desc(games.createdAt);
        case "rtp":    return desc(games.rtp);
        case "az":     return asc(games.name);
        default:       return desc(games.playCount);
      }
    })();

    const offset = (page - 1) * limit;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: games.id,
          slug: games.slug,
          name: games.name,
          provider: games.provider,
          category: games.category,
          thumbnailUrl: games.thumbnailUrl,
          rtp: games.rtp,
          isFeatured: games.isFeatured,
          volatility: games.volatility,
        })
        .from(games)
        .where(and(...conds))
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`cast(count(*) as integer)` })
        .from(games)
        .where(and(...conds)),
    ]);

    return { rows, total };
  },
  ["games-query"],
  { tags: ["games"], revalidate: 60 },
);

// ── Public API ────────────────────────────────────────────────────────────────

export async function getGames(params: GetGamesParams = {}): Promise<GamesResult> {
  const limit = params.limit ?? 20;
  const page  = params.page  ?? 1;

  try {
    const { rows, total } = await _queryGames(JSON.stringify(params));
    return {
      games: rows.map((r) => ({
        ...r,
        thumbnailUrl: r.thumbnailUrl ?? null,
        rtp: r.rtp ?? null,
        volatility: r.volatility ?? null,
      })),
      total,
      page,
      hasMore: page * limit < total,
    };
  } catch {
    // DB not configured — serve filtered static data
    const filtered = applyLocalFilters(FALLBACK, params);
    const start  = (page - 1) * limit;
    const slice  = filtered.slice(start, start + limit);
    return {
      games: slice,
      total: filtered.length,
      page,
      hasMore: page * limit < filtered.length,
    };
  }
}

// ── Recent games for logged-in user ──────────────────────────────────────────

export async function getRecentGames(userId: string): Promise<GameCardData[]> {
  try {
    const db = getDb();

    // Last 6 unique games played
    const sessions = await db
      .select({ gameId: gameSessions.gameId })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.startedAt))
      .limit(12);

    if (!sessions.length) return [];

    const uniqueIds = [...new Set(sessions.map((s) => s.gameId))].slice(0, 6);

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
        volatility: games.volatility,
      })
      .from(games)
      .where(inArray(games.id, uniqueIds));

    // Preserve session order (most recent first)
    return uniqueIds
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined)
      .map((r) => ({
        ...r,
        thumbnailUrl: r.thumbnailUrl ?? null,
        rtp: r.rtp ?? null,
        volatility: r.volatility ?? null,
      }));
  } catch {
    return [];
  }
}
