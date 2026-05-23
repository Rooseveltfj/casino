/**
 * Server-side queries for the profile page.
 * Used by Server Components, Server Actions, and API route handlers.
 */
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
  auditLogs,
  bonuses,
  getDb,
  sessions,
  transactions,
  users,
  wallets,
} from "@casino/database";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  displayName: string | null;
  role: "player" | "support" | "finance" | "admin" | "superadmin";
  status: "active" | "suspended" | "self_excluded" | "banned";
  locale: string;
  country: string | null;
  timezone: string;
  createdAt: Date;
}

export interface ProfileBalances {
  demo: string;
  real: string;
  bonus: string;
  locked: string;
}

export interface ProfileBonus {
  id: string;
  type: "welcome" | "deposit" | "free_spins" | "cashback";
  amount: string;
  wagered: string;
  wageringRequirement: string;
  status: "pending" | "active" | "completed" | "expired" | "cancelled";
  expiresAt: Date | null;
  createdAt: Date;
}

export interface TransactionRow {
  id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "bet"
    | "win"
    | "bonus_grant"
    | "bonus_release"
    | "adjustment"
    | "rollback";
  walletType: "demo" | "real" | "bonus";
  amount: string;
  balanceAfter: string;
  gameRoundId: string | null;
  provider: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ResponsibleLimits {
  depositWeekly: number | null;
  depositMonthly: number | null;
  lossWeekly: number | null;
  lossMonthly: number | null;
  sessionMaxHours: number | null;
}

export interface LoginHistoryEntry {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ActiveSession {
  id: string;
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function getProfileUser(
  userId: string,
): Promise<ProfileUser | null> {
  try {
    const db = getDb();
    const [u] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        displayName: users.displayName,
        role: users.role,
        status: users.status,
        locale: users.locale,
        country: users.country,
        timezone: users.timezone,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return u ?? null;
  } catch {
    return null;
  }
}

// ── Wallet balances (re-exported pattern from games.server) ───────────────────

export async function getProfileBalances(
  userId: string,
): Promise<ProfileBalances> {
  try {
    const db = getDb();
    const [w] = await db
      .select({
        demo: wallets.balanceDemo,
        real: wallets.balanceReal,
        bonus: wallets.balanceBonus,
        locked: wallets.lockedBalance,
      })
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    return w ?? { demo: "1000.00", real: "0.00", bonus: "0.00", locked: "0.00" };
  } catch {
    return { demo: "1000.00", real: "0.00", bonus: "0.00", locked: "0.00" };
  }
}

// ── Bonuses ───────────────────────────────────────────────────────────────────

export async function getActiveBonuses(
  userId: string,
): Promise<ProfileBonus[]> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(bonuses)
      .where(
        and(eq(bonuses.userId, userId), eq(bonuses.status, "active")),
      )
      .orderBy(desc(bonuses.createdAt))
      .limit(5);

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      wagered: r.wagered,
      wageringRequirement: r.wageringRequirement,
      status: r.status,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function getBonusHistory(
  userId: string,
  limit = 20,
): Promise<ProfileBonus[]> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(bonuses)
      .where(eq(bonuses.userId, userId))
      .orderBy(desc(bonuses.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      wagered: r.wagered,
      wageringRequirement: r.wageringRequirement,
      status: r.status,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

// ── Transactions (cursor pagination) ──────────────────────────────────────────

export interface GetTransactionsParams {
  userId: string;
  cursor?: string;
  limit?: number;
  type?: TransactionRow["type"];
  fromDate?: Date;
  toDate?: Date;
}

export async function getTransactions(
  params: GetTransactionsParams,
): Promise<{ rows: TransactionRow[]; nextCursor: string | null }> {
  const { userId, cursor, limit = 50, type, fromDate, toDate } = params;

  try {
    const db = getDb();

    // Get user's wallets
    const userWallets = await db
      .select({ id: wallets.id })
      .from(wallets)
      .where(eq(wallets.userId, userId));

    if (!userWallets.length) return { rows: [], nextCursor: null };

    const conds = [
      sql`${transactions.walletId} = ANY(${userWallets.map((w) => w.id)})`,
    ];

    if (type) conds.push(eq(transactions.type, type));
    if (fromDate) conds.push(gte(transactions.createdAt, fromDate));
    if (toDate) conds.push(lte(transactions.createdAt, toDate));

    // Cursor pagination: get one extra row to know if there's a next page
    if (cursor) {
      const [cursorRow] = await db
        .select({ createdAt: transactions.createdAt })
        .from(transactions)
        .where(eq(transactions.id, cursor))
        .limit(1);

      if (cursorRow) {
        conds.push(lte(transactions.createdAt, cursorRow.createdAt));
      }
    }

    const rows = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        walletType: transactions.walletType,
        amount: transactions.amount,
        balanceAfter: transactions.balanceAfter,
        gameRoundId: transactions.gameRoundId,
        provider: transactions.provider,
        metadata: transactions.metadata,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(and(...conds))
      .orderBy(desc(transactions.createdAt), desc(transactions.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const trimmed = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (trimmed[trimmed.length - 1]?.id ?? null) : null;

    return {
      rows: trimmed.map((r) => ({
        id: r.id,
        type: r.type,
        walletType: r.walletType,
        amount: r.amount,
        balanceAfter: r.balanceAfter,
        gameRoundId: r.gameRoundId,
        provider: r.provider,
        metadata: r.metadata as Record<string, unknown>,
        createdAt: r.createdAt,
      })),
      nextCursor,
    };
  } catch {
    return { rows: [], nextCursor: null };
  }
}

// ── Login history (from audit_logs) ───────────────────────────────────────────

export async function getLoginHistory(
  userId: string,
  limit = 10,
): Promise<LoginHistoryEntry[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: auditLogs.id,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(eq(auditLogs.actorId, userId), eq(auditLogs.action, "login")),
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return rows;
  } catch {
    return [];
  }
}

// ── Active sessions ───────────────────────────────────────────────────────────

export async function getActiveSessions(
  userId: string,
): Promise<ActiveSession[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: sessions.id,
        token: sessions.token,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        createdAt: sessions.createdAt,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));

    return rows;
  } catch {
    return [];
  }
}

// ── Responsible-gaming limits (from latest audit_log entry) ───────────────────

const EMPTY_LIMITS: ResponsibleLimits = {
  depositWeekly: null,
  depositMonthly: null,
  lossWeekly: null,
  lossMonthly: null,
  sessionMaxHours: null,
};

export async function getResponsibleLimits(
  userId: string,
): Promise<ResponsibleLimits> {
  try {
    const db = getDb();
    const [latest] = await db
      .select({ metadata: auditLogs.metadata })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.actorId, userId),
          eq(auditLogs.action, "limits_updated"),
        ),
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);

    if (!latest?.metadata) return EMPTY_LIMITS;

    const m = latest.metadata as Partial<ResponsibleLimits>;
    return {
      depositWeekly: m.depositWeekly ?? null,
      depositMonthly: m.depositMonthly ?? null,
      lossWeekly: m.lossWeekly ?? null,
      lossMonthly: m.lossMonthly ?? null,
      sessionMaxHours: m.sessionMaxHours ?? null,
    };
  } catch {
    return EMPTY_LIMITS;
  }
}
