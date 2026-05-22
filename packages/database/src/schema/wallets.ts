import {
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    currency: text("currency").notNull().default("BRL"),
    /** Cached balance — derived by background job from transactions table */
    balanceDemo: numeric("balance_demo", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    balanceReal: numeric("balance_real", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    balanceBonus: numeric("balance_bonus", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    /** Funds reserved for pending withdrawals or active bets */
    lockedBalance: numeric("locked_balance", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userCurrencyUnique: uniqueIndex("wallet_user_currency_idx").on(
      t.userId,
      t.currency,
    ),
  }),
);

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
