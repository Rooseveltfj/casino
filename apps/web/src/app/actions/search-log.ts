"use server";

import { headers } from "next/headers";
import { getDb, auditLogs } from "@casino/database";
import { auth } from "@casino/database/auth";

/**
 * Writes a game_search event to audit_logs.
 * Non-critical — swallows all errors silently so a logging failure
 * never surfaces to the user.
 */
export async function logGameSearch(
  query: string,
  gameSlug: string,
): Promise<void> {
  try {
    const hdrs       = await headers();
    const session    = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });

    const db = getDb();

    await db.insert(auditLogs).values({
      actorId:      session?.user?.id ?? null,
      actorType:    session?.user ? "user" : "system",
      action:       "game_search",
      resourceType: "game",
      resourceId:   gameSlug,
      ipAddress:    hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent:    hdrs.get("user-agent") ?? null,
      metadata:     { query, gameSlug },
    });
  } catch {
    // Non-critical — intentionally swallowed
  }
}
