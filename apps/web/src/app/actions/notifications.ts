"use server";

import { headers } from "next/headers";
import { and, count, desc, eq, isNull, lte, sql } from "drizzle-orm";
import {
  getDb,
  notifications,
  type NotificationType,
} from "@casino/database";
import { auth } from "@casino/database/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationRow {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotifyUserInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

// ── Internal helper: publish a notification ───────────────────────────────────
// Realtime delivery happens automatically via Supabase postgres_changes —
// any client subscribed on `user:{userId}` receives the INSERT event.

export async function notifyUser(
  input: NotifyUserInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const db = getDb();
    const [row] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        metadata: input.metadata ?? {},
      })
      .returning({ id: notifications.id });

    if (!row) return { ok: false, error: "Falha ao criar notificação" };
    return { ok: true, id: row.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao notificar",
    };
  }
}

// ── List notifications (cursor pagination) ────────────────────────────────────

export interface ListNotificationsInput {
  cursor?: string;
  limit?: number;
}

export async function listNotifications(
  input: ListNotificationsInput = {},
): Promise<{
  rows: NotificationRow[];
  unreadCount: number;
  nextCursor: string | null;
}> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) {
      return { rows: [], unreadCount: 0, nextCursor: null };
    }

    const db = getDb();
    const userId = session.user.id;
    const limit = Math.min(input.limit ?? 20, 100);

    const conds = [eq(notifications.userId, userId)];

    if (input.cursor) {
      const [cursorRow] = await db
        .select({ createdAt: notifications.createdAt })
        .from(notifications)
        .where(eq(notifications.id, input.cursor))
        .limit(1);
      if (cursorRow) {
        conds.push(lte(notifications.createdAt, cursorRow.createdAt));
      }
    }

    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        metadata: notifications.metadata,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(and(...conds))
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const trimmed = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? (trimmed[trimmed.length - 1]?.id ?? null)
      : null;

    const [counts] = await db
      .select({ unread: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );

    return {
      rows: trimmed.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        metadata: r.metadata as Record<string, unknown>,
        readAt: r.readAt,
        createdAt: r.createdAt,
      })),
      unreadCount: counts?.unread ?? 0,
      nextCursor,
    };
  } catch {
    return { rows: [], unreadCount: 0, nextCursor: null };
  }
}

// ── Mark one as read ──────────────────────────────────────────────────────────

export async function markNotificationRead(
  id: string,
): Promise<{ ok: boolean }> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return { ok: false };

    const db = getDb();
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, session.user.id),
          isNull(notifications.readAt),
        ),
      );

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Mark all as read ──────────────────────────────────────────────────────────

export async function markAllNotificationsRead(): Promise<{
  ok: boolean;
  updated: number;
}> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return { ok: false, updated: 0 };

    const db = getDb();
    const result = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          isNull(notifications.readAt),
        ),
      )
      .returning({ id: notifications.id });

    return { ok: true, updated: result.length };
  } catch {
    return { ok: false, updated: 0 };
  }
}

// ── Unread count (lightweight, for badge polling fallback) ────────────────────

export async function getUnreadCount(): Promise<number> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return 0;

    const db = getDb();
    const [row] = await db
      .select({ unread: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          isNull(notifications.readAt),
        ),
      );
    return row?.unread ?? 0;
  } catch {
    return 0;
  }
}

// Silences unused import warning when an action needs the sql helper later.
void sql;
