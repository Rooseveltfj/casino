/**
 * In-product notifications for player accounts.
 * Realtime delivery: insertion fires a Supabase Realtime postgres_changes event
 * on user:{userId} which the client subscribes to. Read state is mutable.
 */
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "deposit_confirmed",
  "withdrawal_processed",
  "bonus_granted",
  "bonus_released",
  "kyc_approved",
  "kyc_rejected",
  "demo_topup",
  "account_suspended",
  "self_exclusion",
  "big_win",
  "jackpot",
  "promo",
  "system",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userUnreadIdx: index("notifications_user_unread_idx").on(
      t.userId,
      t.readAt,
      sql`${t.createdAt} DESC`,
    ),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
