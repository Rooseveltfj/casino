/**
 * Pure server-side game queries — used by Server Components and API routes.
 * NOT a Server Action file. Functions here cannot be called from Client Components.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  auditLogs,
  games,
  gameSessions,
  getDb,
  transactions,
  wallets,
} from "@casino/database";
import type { GameCardData } from "@/components/games/game-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GameDetail extends GameCardData {
  description: string;
  features: string[];
  countries: string[];
  minBet: string;
  maxBet: string;
}

export interface BetRecord {
  id: string;
  amount: string;
  type: "bet" | "win" | "rollback" | "adjustment";
  walletType: "demo" | "real" | "bonus";
  balanceAfter: string;
  gameRoundId: string | null;
  createdAt: string;
  /** Computed: positive means win, negative means loss */
  delta: number;
}

export interface TopWin {
  id: string;
  userInitials: string;
  amount: string;
  multiplier: string;
  createdAt: string;
}

export interface WalletBalances {
  demo: string;
  real: string;
  bonus: string;
  locked: string;
}

export interface LaunchResult {
  sessionId: string;
  gameUrl: string;
  provider: string;
}

// ── Fallback data (no DB) ─────────────────────────────────────────────────────

const DEMO_DETAILS: Record<string, Partial<GameDetail>> = {
  default: {
    description:
      "Mergulhe em uma experiência de cassino premium. Gráficos de última geração, gameplay envolvente e premiações generosas.",
    features: ["Free spins", "Multiplicadores", "Bonus rounds", "Auto-play"],
    countries: ["Brasil", "Argentina", "Chile", "Colômbia", "México"],
  },
};

const MOCK_TOP_WINS: TopWin[] = [
  { id: "tw1", userInitials: "JS", amount: "12500.00", multiplier: "250x", createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
  { id: "tw2", userInitials: "MC", amount: "8420.00",  multiplier: "168x", createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: "tw3", userInitials: "PS", amount: "5100.00",  multiplier: "102x", createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
  { id: "tw4", userInitials: "AR", amount: "3200.00",  multiplier: "64x",  createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString() },
  { id: "tw5", userInitials: "LF", amount: "1850.00",  multiplier: "37x",  createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
];

// ── Game lookup ───────────────────────────────────────────────────────────────

export async function getGameBySlug(slug: string): Promise<GameDetail | null> {
  try {
    const db = getDb();
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!game) return null;

    return {
      id: game.id,
      slug: game.slug,
      name: game.name,
      provider: game.provider,
      category: game.category,
      thumbnailUrl: game.thumbnailUrl ?? null,
      rtp: game.rtp ?? null,
      isFeatured: game.isFeatured,
      volatility: game.volatility ?? null,
      minBet: game.minBet,
      maxBet: game.maxBet,
      description: DEMO_DETAILS.default!.description!,
      features: DEMO_DETAILS.default!.features!,
      countries: DEMO_DETAILS.default!.countries!,
    };
  } catch {
    return null;
  }
}

// ── Recent bets for current user × game ───────────────────────────────────────

export async function getRecentBetsForGame(
  userId: string,
  gameId: string,
  limit = 10,
): Promise<BetRecord[]> {
  try {
    const db = getDb();

    // Get all sessions for this user × game
    const sessions = await db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(
        and(eq(gameSessions.userId, userId), eq(gameSessions.gameId, gameId)),
      )
      .limit(50);

    if (!sessions.length) return [];

    const sessionIds = sessions.map((s) => s.id);

    // Get user's wallets
    const userWallets = await db
      .select({ id: wallets.id })
      .from(wallets)
      .where(eq(wallets.userId, userId));

    if (!userWallets.length) return [];

    // Get transactions where game_round_id matches any session id
    const rows = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        walletType: transactions.walletType,
        balanceAfter: transactions.balanceAfter,
        gameRoundId: transactions.gameRoundId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          sql`${transactions.gameRoundId} = ANY(${sessionIds})`,
          sql`${transactions.walletId} = ANY(${userWallets.map((w) => w.id)})`,
        ),
      )
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      type: r.type as BetRecord["type"],
      walletType: r.walletType as BetRecord["walletType"],
      balanceAfter: r.balanceAfter,
      gameRoundId: r.gameRoundId,
      createdAt: r.createdAt.toISOString(),
      delta: r.type === "win" ? parseFloat(r.amount) : -parseFloat(r.amount),
    }));
  } catch {
    return [];
  }
}

// ── Top wins for a game (mocked for demo) ─────────────────────────────────────

export function getTopWinsForGame(_gameId: string): TopWin[] {
  // In production, this would query transactions JOIN game_sessions
  // ordered by amount DESC limit 5. For demo, return curated mock data.
  return MOCK_TOP_WINS;
}

// ── Wallet balance ────────────────────────────────────────────────────────────

export async function getWalletBalances(
  userId: string,
): Promise<WalletBalances> {
  try {
    const db = getDb();
    const [wallet] = await db
      .select({
        demo: wallets.balanceDemo,
        real: wallets.balanceReal,
        bonus: wallets.balanceBonus,
        locked: wallets.lockedBalance,
      })
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    return (
      wallet ?? {
        demo: "1000.00", // Default demo balance for newly registered users
        real: "0.00",
        bonus: "0.00",
        locked: "0.00",
      }
    );
  } catch {
    // Guest / no DB fallback
    return { demo: "1000.00", real: "0.00", bonus: "0.00", locked: "0.00" };
  }
}

// ── Launch game session ───────────────────────────────────────────────────────

export async function launchGameSession(opts: {
  slug: string;
  userId: string | null;
  walletType: "demo" | "real" | "bonus";
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<LaunchResult> {
  const { slug, userId, walletType, ipAddress, userAgent } = opts;

  // Default mock session for fallback
  const buildMockSession = (gameProvider = "Internal"): LaunchResult => {
    const sessionId = randomUUID();
    return {
      sessionId,
      gameUrl: `/jogos/${slug}/play?session=${sessionId}&wallet=${walletType}`,
      provider: gameProvider,
    };
  };

  try {
    const db = getDb();

    // Find game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!game) throw new Error("Game not found");

    // Create session
    const sessionId = randomUUID();
    if (userId) {
      await db.insert(gameSessions).values({
        id: sessionId,
        userId,
        gameId: game.id,
        providerSessionId: `mock-${sessionId.slice(0, 8)}`,
        launchToken: randomUUID(),
        status: "active",
      });

      // Audit log
      await db.insert(auditLogs).values({
        actorId: userId,
        actorType: "user",
        action: "game_launch",
        resourceType: "game",
        resourceId: game.id,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        metadata: { gameSlug: slug, walletType, sessionId },
      });
    }

    // Build provider URL
    const providerLower = game.provider.toLowerCase();
    let gameUrl: string;

    if (providerLower === "internal" || providerLower === "mock") {
      // Local Phaser game
      gameUrl = `/jogos/${slug}/play?session=${sessionId}&wallet=${walletType}`;
    } else if (providerLower === "pragmatic") {
      // Stub URL for Pragmatic Play (real integration via /api/providers/pragmatic/launch)
      gameUrl = `https://demo-gs.pragmaticplay.net/gs2c/openGame.do?symbol=${game.providerGameId}&token=${sessionId}`;
    } else {
      gameUrl = `/jogos/${slug}/play?session=${sessionId}&wallet=${walletType}`;
    }

    return { sessionId, gameUrl, provider: game.provider };
  } catch {
    // DB unavailable — return mock session so the UI still works
    return buildMockSession();
  }
}
