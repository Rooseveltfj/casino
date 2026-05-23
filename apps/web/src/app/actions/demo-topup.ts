"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import {
  auditLogs,
  getDb,
  transactions,
  wallets,
} from "@casino/database";
import { auth } from "@casino/database/auth";

const DEMO_TOPUP_AMOUNT = 200;

export async function addDemoChips(): Promise<
  { ok: true; newBalance: string } | { ok: false; error: string }
> {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

    const db = getDb();

    // Find or create wallet
    const [existingWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.user.id))
      .limit(1);

    let walletId: string;
    let currentBalance: number;

    if (existingWallet) {
      walletId = existingWallet.id;
      currentBalance = parseFloat(existingWallet.balanceDemo);
    } else {
      const [inserted] = await db
        .insert(wallets)
        .values({
          userId: session.user.id,
          currency: "BRL",
          balanceDemo: "0",
        })
        .returning({ id: wallets.id, balanceDemo: wallets.balanceDemo });
      if (!inserted) throw new Error("Falha ao criar carteira");
      walletId = inserted.id;
      currentBalance = parseFloat(inserted.balanceDemo);
    }

    const newBalance = currentBalance + DEMO_TOPUP_AMOUNT;

    // 1. Append-only ledger entry (per WALLET.md rules)
    await db.insert(transactions).values({
      walletId,
      type: "adjustment",
      walletType: "demo",
      amount: String(DEMO_TOPUP_AMOUNT),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      referenceId: randomUUID(),
      metadata: { reason: "demo_topup", source: "profile_button" },
    });

    // 2. Update wallet cache
    await db
      .update(wallets)
      .set({
        balanceDemo: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId));

    // 3. Audit log
    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "demo_topup",
      resourceType: "wallet",
      resourceId: walletId,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
      metadata: { amount: DEMO_TOPUP_AMOUNT, newBalance: newBalance.toFixed(2) },
    });

    revalidatePath("/perfil");
    return { ok: true, newBalance: newBalance.toFixed(2) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao adicionar fichas",
    };
  }
}
