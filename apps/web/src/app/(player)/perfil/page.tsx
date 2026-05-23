import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@casino/database/auth";
import {
  getActiveBonuses,
  getBonusHistory,
  getProfileUser,
  getResponsibleLimits,
} from "@/lib/profile.server";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Meu perfil — Casino Platform",
  description: "Gerencie sua conta, segurança, carteira e configurações.",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  // ── Resolve current session ─────────────────────────────────────────────
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/perfil");
  }

  // ── Fetch profile data in parallel ──────────────────────────────────────
  const [user, activeBonuses, bonusHistory, limits] = await Promise.all([
    getProfileUser(session.user.id),
    getActiveBonuses(session.user.id),
    getBonusHistory(session.user.id, 20),
    getResponsibleLimits(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  // 2FA status — Better-Auth stores this on the user; we read it from session
  // via a lookup-safe pattern: not available in plain user → assume false
  const twoFactorEnabled =
    "twoFactorEnabled" in session.user
      ? Boolean(
          (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
        )
      : false;

  return (
    <ProfileClient
      user={user}
      twoFactorEnabled={twoFactorEnabled}
      activeBonuses={activeBonuses}
      bonusHistory={bonusHistory}
      limits={limits}
    />
  );
}
