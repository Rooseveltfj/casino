/**
 * APPEND-ONLY ledger — never UPDATE, only INSERT.
 * Each row records balance_before and balance_after for full auditability.
 * reference_id is the idempotency key: same key → silent no-op (ON CONFLICT DO NOTHING).
 */
import {
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { wallets } from "./wallets";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "bet",
  "win",
  "bonus_grant",
  "bonus_release",
  "adjustment",
  "rollback",
]);

export const walletTypeEnum = pgEnum("wallet_type", [
  "demo",
  "real",
  "bonus",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "restrict" }),
    type: transactionTypeEnum("type").notNull(),
    walletType: walletTypeEnum("wallet_type").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    balanceBefore: numeric("balance_before", {
      precision: 18,
      scale: 2,
    }).notNull(),
    balanceAfter: numeric("balance_after", {
      precision: 18,
      scale: 2,
    }).notNull(),
    /** Idempotency key supplied by the caller — must be globally unique */
    referenceId: uuid("reference_id").notNull(),
    gameRoundId: text("game_round_id"),
    provider: text("provider"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referenceIdUnique: unique("transactions_reference_id_key").on(
      t.referenceId,
    ),
    walletCreatedIdx: index("transactions_wallet_created_idx").on(
      t.walletId,
      t.createdAt,
    ),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
