import {
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const bonusTypeEnum = pgEnum("bonus_type", [
  "welcome",
  "deposit",
  "free_spins",
  "cashback",
]);

export const bonusStatusEnum = pgEnum("bonus_status", [
  "pending",
  "active",
  "completed",
  "expired",
  "cancelled",
]);

export const bonuses = pgTable("bonuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: bonusTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  wagered: numeric("wagered", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  wageringRequirement: numeric("wagering_requirement", {
    precision: 18,
    scale: 2,
  }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: bonusStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Bonus = typeof bonuses.$inferSelect;
export type NewBonus = typeof bonuses.$inferInsert;
