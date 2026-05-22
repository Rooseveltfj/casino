/**
 * PSP transactions — Pix stub in demo mode.
 * In production: pixKey is stored encrypted; real PSP webhook confirms status.
 * In demo: an admin manually confirms the deposit via the backoffice.
 */
import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { transactions } from "./transactions";
import { users } from "./users";

export const pspDirectionEnum = pgEnum("psp_direction", [
  "deposit",
  "withdrawal",
]);

export const pspStatusEnum = pgEnum("psp_status", [
  "pending",
  "confirmed",
  "cancelled",
  "failed",
]);

export const pspTransactions = pgTable("psp_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletTransactionId: uuid("wallet_transaction_id").references(
    () => transactions.id,
    { onDelete: "set null" },
  ),
  direction: pspDirectionEnum("direction").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  /** Plaintext in demo; AES-256-GCM encrypted in production */
  pixKey: text("pix_key"),
  qrCodeUrl: text("qr_code_url"),
  qrCodePayload: text("qr_code_payload"),
  status: pspStatusEnum("status").notNull().default("pending"),
  /** Admin who manually confirmed in demo mode */
  confirmedBy: uuid("confirmed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

export type PspTransaction = typeof pspTransactions.$inferSelect;
export type NewPspTransaction = typeof pspTransactions.$inferInsert;
