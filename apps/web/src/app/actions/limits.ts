"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditLogs, getDb } from "@casino/database";
import { auth } from "@casino/database/auth";

// ── Schema ────────────────────────────────────────────────────────────────────

const LimitsSchema = z.object({
  depositWeekly: z.number().int().nonnegative().nullable(),
  depositMonthly: z.number().int().nonnegative().nullable(),
  lossWeekly: z.number().int().nonnegative().nullable(),
  lossMonthly: z.number().int().nonnegative().nullable(),
  sessionMaxHours: z.number().int().min(1).max(24).nullable(),
});

export type LimitsInput = z.infer<typeof LimitsSchema>;

// ── Action ────────────────────────────────────────────────────────────────────

export async function saveLimits(
  input: LimitsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

    const parsed = LimitsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Limites inválidos" };

    const db = getDb();
    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "limits_updated",
      resourceType: "user",
      resourceId: session.user.id,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
      metadata: parsed.data,
    });

    revalidatePath("/perfil");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao salvar limites",
    };
  }
}
