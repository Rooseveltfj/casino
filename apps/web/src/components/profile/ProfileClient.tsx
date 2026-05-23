"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileNav, type ProfileSection } from "./ProfileNav";
import { AccountSection } from "./sections/AccountSection";
import { SecuritySection } from "./sections/SecuritySection";
import { WalletSection } from "./sections/WalletSection";
import { HistorySection } from "./sections/HistorySection";
import { BonusesSection } from "./sections/BonusesSection";
import { ResponsibleSection } from "./sections/ResponsibleSection";
import type {
  ProfileBonus,
  ProfileUser,
  ResponsibleLimits,
} from "@/lib/profile.server";

const VALID_SECTIONS: ProfileSection[] = [
  "conta",
  "seguranca",
  "carteira",
  "historico",
  "bonuses",
  "responsavel",
];

interface ProfileClientProps {
  user: ProfileUser;
  twoFactorEnabled: boolean;
  activeBonuses: ProfileBonus[];
  bonusHistory: ProfileBonus[];
  limits: ResponsibleLimits;
}

export function ProfileClient({
  user,
  twoFactorEnabled,
  activeBonuses,
  bonusHistory,
  limits,
}: ProfileClientProps) {
  const [section, setSection] = useState<ProfileSection>("conta");

  // Sync section state with URL hash for shareable links
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as ProfileSection;
    if (VALID_SECTIONS.includes(fromHash)) setSection(fromHash);

    const handler = () => {
      const h = window.location.hash.slice(1) as ProfileSection;
      if (VALID_SECTIONS.includes(h)) setSection(h);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleChange = useCallback((s: ProfileSection) => {
    setSection(s);
    window.history.pushState(null, "", `#${s}`);
    // Scroll to top on mobile when switching sections
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <ProfileNav active={section} onChange={handleChange} />

        <main className="flex-1 min-w-0">
          {section === "conta" && <AccountSection user={user} />}
          {section === "seguranca" && (
            <SecuritySection twoFactorEnabled={twoFactorEnabled} />
          )}
          {section === "carteira" && <WalletSection />}
          {section === "historico" && <HistorySection />}
          {section === "bonuses" && (
            <BonusesSection active={activeBonuses} history={bonusHistory} />
          )}
          {section === "responsavel" && (
            <ResponsibleSection initialLimits={limits} />
          )}
        </main>
      </div>
    </div>
  );
}
