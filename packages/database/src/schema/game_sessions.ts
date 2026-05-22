import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { games } from "./games";
import { users } from "./users";

export const gameSessionStatusEnum = pgEnum("game_session_status", [
  "active",
  "closed",
  "expired",
]);

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "restrict" }),
  providerSessionId: text("provider_session_id"),
  launchToken: text("launch_token"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  totalBets: numeric("total_bets", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  totalWins: numeric("total_wins", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  status: gameSessionStatusEnum("status").notNull().default("active"),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
