import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const gameCategoryEnum = pgEnum("game_category", [
  "slot",
  "live",
  "crash",
  "table",
  "instant",
  "sport",
]);

export const gameVolatilityEnum = pgEnum("game_volatility", [
  "low",
  "medium",
  "high",
]);

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  provider: text("provider").notNull(),
  providerGameId: text("provider_game_id").notNull(),
  name: text("name").notNull(),
  category: gameCategoryEnum("category").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  bannerUrl: text("banner_url"),
  rtp: numeric("rtp", { precision: 5, scale: 2 }),
  volatility: gameVolatilityEnum("volatility"),
  minBet: numeric("min_bet", { precision: 18, scale: 2 }).notNull().default("0.10"),
  maxBet: numeric("max_bet", { precision: 18, scale: 2 }).notNull().default("500.00"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDemoOnly: boolean("is_demo_only").notNull().default(true),
  playCount: integer("play_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
