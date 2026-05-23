"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, getDb, users } from "@casino/database";
import { auth } from "@casino/database/auth";

// ── Schemas ───────────────────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  country: z.string().trim().length(2).optional(),
  locale: z.enum(["pt-BR", "en-US", "es-AR"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireSession() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });
  if (!session?.user) throw new Error("UNAUTHORIZED");
  return { session, hdrs };
}

// ── Action: update profile fields ─────────────────────────────────────────────

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { session, hdrs } = await requireSession();
    const parsed = UpdateProfileSchema.safeParse(input);

    if (!parsed.success) {
      return { ok: false, error: "Dados inválidos" };
    }

    const db = getDb();
    const updates: Record<string, string | Date> = { updatedAt: new Date() };
    if (parsed.data.displayName) updates.displayName = parsed.data.displayName;
    if (parsed.data.country) updates.country = parsed.data.country;
    if (parsed.data.locale) updates.locale = parsed.data.locale;

    await db.update(users).set(updates).where(eq(users.id, session.user.id));

    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "profile_update",
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
      error: err instanceof Error ? err.message : "Erro ao salvar perfil",
    };
  }
}

// ── Action: update avatar URL (called after Storage upload) ───────────────────

const UpdateAvatarSchema = z.object({
  imageUrl: z.string().url().or(z.literal("")),
});

export async function updateAvatarUrl(
  imageUrl: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { session, hdrs } = await requireSession();
    const parsed = UpdateAvatarSchema.safeParse({ imageUrl });
    if (!parsed.success) return { ok: false, error: "URL inválida" };

    const db = getDb();
    await db
      .update(users)
      .set({
        image: parsed.data.imageUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "avatar_update",
      resourceType: "user",
      resourceId: session.user.id,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
      metadata: { imageUrl: parsed.data.imageUrl },
    });

    revalidatePath("/perfil");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao atualizar avatar",
    };
  }
}
