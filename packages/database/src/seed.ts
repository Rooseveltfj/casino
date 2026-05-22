/**
 * Development seed — creates demo users, wallets, and 30 mock games.
 * Run: pnpm --filter @casino/database db:seed
 *
 * Idempotent: safe to run multiple times (ON CONFLICT DO NOTHING).
 */
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, closeDb } from "./client";
import {
  users,
  wallets,
  transactions,
  games,
  type NewGame,
  type NewUser,
} from "./schema/index";

// Load env from monorepo root before anything else
dotenv.config({ path: resolve(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

// ─── Game catalogue ────────────────────────────────────────────────────────────

const GAME_CATALOGUE: Array<
  Omit<NewGame, "id" | "providerGameId" | "thumbnailUrl" | "provider"> & {
    rtp: string;
  }
> = [
  // Slots ×12
  { slug: "golden-fruit-frenzy", name: "Golden Fruit Frenzy", category: "slot", rtp: "96.50", volatility: "medium", isFeatured: true, minBet: "0.20", maxBet: "200.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "neon-dragon", name: "Neon Dragon", category: "slot", rtp: "96.10", volatility: "high", isFeatured: true, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "book-of-nile", name: "Book of Nile", category: "slot", rtp: "95.80", volatility: "high", isFeatured: false, minBet: "0.10", maxBet: "300.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "diamond-rush-classic", name: "Diamond Rush Classic", category: "slot", rtp: "97.00", volatility: "low", isFeatured: false, minBet: "0.10", maxBet: "100.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "space-blast", name: "Space Blast", category: "slot", rtp: "96.30", volatility: "medium", isFeatured: false, minBet: "0.20", maxBet: "200.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "lucky-clover", name: "Lucky Clover", category: "slot", rtp: "97.20", volatility: "low", isFeatured: false, minBet: "0.10", maxBet: "100.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "mystic-forest", name: "Mystic Forest", category: "slot", rtp: "96.00", volatility: "medium", isFeatured: false, minBet: "0.20", maxBet: "250.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "pirates-fortune", name: "Pirate's Fortune", category: "slot", rtp: "95.50", volatility: "high", isFeatured: true, minBet: "0.10", maxBet: "400.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "aztec-gold-temple", name: "Aztec Gold Temple", category: "slot", rtp: "96.20", volatility: "medium", isFeatured: false, minBet: "0.10", maxBet: "300.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "cyberpunk-neons", name: "Cyberpunk Neons", category: "slot", rtp: "95.90", volatility: "high", isFeatured: true, minBet: "0.20", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "sugar-bonanza", name: "Sugar Bonanza", category: "slot", rtp: "96.80", volatility: "medium", isFeatured: false, minBet: "0.20", maxBet: "200.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "viking-thunder", name: "Viking Thunder", category: "slot", rtp: "96.00", volatility: "high", isFeatured: false, minBet: "0.10", maxBet: "400.00", isActive: true, isDemoOnly: true, playCount: 0 },

  // Crash ×4
  { slug: "aviatorx", name: "AviatorX", category: "crash", rtp: "97.00", volatility: "high", isFeatured: true, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "rocket-rush", name: "Rocket Rush", category: "crash", rtp: "97.00", volatility: "high", isFeatured: false, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "moon-launch", name: "Moon Launch", category: "crash", rtp: "96.50", volatility: "medium", isFeatured: false, minBet: "0.20", maxBet: "300.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "crypto-crash", name: "Crypto Crash", category: "crash", rtp: "97.00", volatility: "high", isFeatured: true, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },

  // Live ×4
  { slug: "live-baccarat-prestige", name: "Live Baccarat Prestige", category: "live", rtp: "98.94", volatility: "low", isFeatured: true, minBet: "1.00", maxBet: "5000.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "live-roulette-royale", name: "Live Roulette Royale", category: "live", rtp: "97.30", volatility: "medium", isFeatured: true, minBet: "0.50", maxBet: "3000.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "live-blackjack-vip", name: "Live Blackjack VIP", category: "live", rtp: "99.28", volatility: "low", isFeatured: false, minBet: "1.00", maxBet: "5000.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "live-dragon-tiger", name: "Live Dragon Tiger", category: "live", rtp: "96.27", volatility: "low", isFeatured: false, minBet: "0.50", maxBet: "2000.00", isActive: true, isDemoOnly: true, playCount: 0 },

  // Table ×4
  { slug: "european-blackjack", name: "European Blackjack", category: "table", rtp: "99.60", volatility: "low", isFeatured: false, minBet: "0.50", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "european-roulette", name: "European Roulette", category: "table", rtp: "97.30", volatility: "medium", isFeatured: false, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "baccarat-classic", name: "Baccarat Classic", category: "table", rtp: "98.94", volatility: "low", isFeatured: false, minBet: "1.00", maxBet: "1000.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "casino-poker", name: "Casino Poker", category: "table", rtp: "97.68", volatility: "medium", isFeatured: false, minBet: "1.00", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },

  // Instant ×4 (mines, plinko, dice, keno)
  { slug: "diamond-mines", name: "Diamond Mines", category: "instant", rtp: "97.00", volatility: "high", isFeatured: true, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "plinko-pro", name: "Plinko Pro", category: "instant", rtp: "97.00", volatility: "medium", isFeatured: true, minBet: "0.10", maxBet: "200.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "dice-duel", name: "Dice Duel", category: "instant", rtp: "98.00", volatility: "medium", isFeatured: false, minBet: "0.10", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "keno-blitz", name: "Keno Blitz", category: "instant", rtp: "95.00", volatility: "low", isFeatured: false, minBet: "0.50", maxBet: "200.00", isActive: true, isDemoOnly: true, playCount: 0 },

  // Sport ×2
  { slug: "football-prediction", name: "Football Prediction", category: "sport", rtp: "95.00", volatility: undefined, isFeatured: false, minBet: "1.00", maxBet: "1000.00", isActive: true, isDemoOnly: true, playCount: 0 },
  { slug: "esports-fantasy", name: "Esports Fantasy", category: "sport", rtp: "95.00", volatility: undefined, isFeatured: false, minBet: "1.00", maxBet: "500.00", isActive: true, isDemoOnly: true, playCount: 0 },
];

// ─── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  const db = getDb();

  process.stdout.write("🌱 Starting seed...\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const adminHash = await hashPassword("Admin123!");
  const playerHash = await hashPassword("Demo123!");

  const seedUsers: NewUser[] = [
    {
      email: "admin@demo.local",
      name: "Super Admin",
      displayName: "Super Admin",
      passwordHash: adminHash,
      role: "superadmin",
      status: "active",
      emailVerified: true,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
    },
    {
      email: "joao@demo.local",
      name: "João Silva",
      displayName: "João Silva",
      passwordHash: playerHash,
      role: "player",
      status: "active",
      emailVerified: true,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
    },
    {
      email: "maria@demo.local",
      name: "Maria Costa",
      displayName: "Maria Costa",
      passwordHash: playerHash,
      role: "player",
      status: "active",
      emailVerified: true,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
    },
    {
      email: "pedro@demo.local",
      name: "Pedro Santos",
      displayName: "Pedro Santos",
      passwordHash: playerHash,
      role: "player",
      status: "active",
      emailVerified: true,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
    },
  ];

  const insertedUsers = await db
    .insert(users)
    .values(seedUsers)
    .onConflictDoNothing()
    .returning({ id: users.id, email: users.email });

  process.stdout.write(`  ✓ ${insertedUsers.length} users inserted\n`);

  // Resolve user IDs (works even if rows already existed)
  async function getUserId(email: string) {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!row) throw new Error(`User ${email} not found after seed`);
    return row.id;
  }

  const adminId = await getUserId("admin@demo.local");
  const joaoId = await getUserId("joao@demo.local");
  const mariaId = await getUserId("maria@demo.local");
  const pedroId = await getUserId("pedro@demo.local");

  // ── 2. Wallets ────────────────────────────────────────────────────────────

  const walletSeeds = [
    { userId: joaoId, balanceDemo: "5000.00" },
    { userId: mariaId, balanceDemo: "1000.00" },
    { userId: pedroId, balanceDemo: "200.00" },
  ];

  for (const { userId, balanceDemo } of walletSeeds) {
    const inserted = await db
      .insert(wallets)
      .values({ userId, currency: "BRL" })
      .onConflictDoNothing()
      .returning({ id: wallets.id });

    if (inserted.length === 0) continue; // Already existed

    const walletId = inserted[0]?.id;
    if (!walletId) continue;

    // Insert the initial adjustment transaction (append-only ledger)
    await db.insert(transactions).values({
      walletId,
      type: "adjustment",
      walletType: "demo",
      amount: balanceDemo,
      balanceBefore: "0.00",
      balanceAfter: balanceDemo,
      referenceId: randomUUID(),
      metadata: { reason: "seed:initial_demo_balance" },
    });

    // Sync the wallet cache (background-job equivalent)
    await db
      .update(wallets)
      .set({ balanceDemo, updatedAt: new Date() })
      .where(eq(wallets.id, walletId));
  }

  process.stdout.write("  ✓ Wallets + initial ledger entries created\n");

  // ── 3. Games ─────────────────────────────────────────────────────────────

  const gameRows: NewGame[] = GAME_CATALOGUE.map((g) => ({
    ...g,
    provider: "internal",
    providerGameId: g.slug,
    thumbnailUrl: `/games/${g.slug}/thumb.webp`,
    bannerUrl: `/games/${g.slug}/banner.webp`,
    volatility: g.volatility ?? null,
    rtp: g.rtp,
  }));

  const insertedGames = await db
    .insert(games)
    .values(gameRows)
    .onConflictDoNothing()
    .returning({ slug: games.slug });

  process.stdout.write(`  ✓ ${insertedGames.length} games inserted\n`);

  // ── Done ──────────────────────────────────────────────────────────────────
  process.stdout.write(
    `\n✅ Seed complete.\n` +
      `   Admin:   admin@demo.local  / Admin123!\n` +
      `   Players: joao | maria | pedro @demo.local  / Demo123!\n`,
  );

  void adminId; // suppress unused-variable lint
}

seed()
  .catch((err) => {
    process.stderr.write(`\n❌ Seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(() => closeDb());
