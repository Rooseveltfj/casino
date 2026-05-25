"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, getDb, sessions, users } from "@casino/database";
import { auth } from "@casino/database/auth";
import { notifyUser } from "@/app/actions/notifications";

const SelfExcludeSchema = z.object({
  period: z.enum(["1week", "1month", "6months", "permanent"]),
  confirm: z.literal(true),
});

export type SelfExcludeInput = z.infer<typeof SelfExcludeSchema>;

function computeExpiry(period: SelfExcludeInput["period"]): Date | null {
  const now = Date.now();
  switch (period) {
    case "1week":     return new Date(now + 7   * 24 * 60 * 60 * 1000);
    case "1month":    return new Date(now + 30  * 24 * 60 * 60 * 1000);
    case "6months":   return new Date(now + 180 * 24 * 60 * 60 * 1000);
    case "permanent": return null;
    default:          return null;
  }
}

export async function selfExclude(
  input: SelfExcludeInput,
): Promise<{ ok: true; period: string } | { ok: false; error: string }> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

    const parsed = SelfExcludeSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Dados inválidos" };

    const db = getDb();
    const expiresAt = computeExpiry(parsed.data.period);

    // 1. Mark account as self-excluded
    await db
      .update(users)
      .set({ status: "self_excluded", updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    // 2. Revoke ALL active sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, session.user.id));

    // 3. Audit log (legal requirement)
    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "self_exclusion",
      resourceType: "user",
      resourceId: session.user.id,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
      metadata: {
        period: parsed.data.period,
        expiresAt: expiresAt?.toISOString() ?? null,
      },
    });

    // 4. Notification — informa o player (e quaisquer outras abas) que a conta foi suspensa
    await notifyUser({
      userId: session.user.id,
      type: "self_exclusion",
      title: "Conta suspensa por autoexclusão",
      body:
        parsed.data.period === "permanent"
          ? "Sua conta foi marcada como autoexcluída permanentemente."
          : `Sua conta ficará bloqueada até ${expiresAt?.toLocaleDateString("pt-BR")}.`,
      metadata: {
        period: parsed.data.period,
        expiresAt: expiresAt?.toISOString() ?? null,
      },
    });

    return { ok: true, period: parsed.data.period };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro na autoexclusão",
    };
  }
}
