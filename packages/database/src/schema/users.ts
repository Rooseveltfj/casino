import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "player",
  "support",
  "finance",
  "admin",
  "superadmin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "self_excluded",
  "banned",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ── Better-Auth required fields ──────────────────────────────────────────
  name: text("name").notNull().default(""),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // ── Application fields ───────────────────────────────────────────────────
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("player"),
  status: userStatusEnum("status").notNull().default("active"),
  locale: text("locale").notNull().default("pt-BR"),
  country: text("country"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
