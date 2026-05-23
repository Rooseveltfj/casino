"use client";

import { useState } from "react";

type TabId = "game" | "info" | "chat";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "game", label: "Jogo" },
  { id: "info", label: "Info" },
  { id: "chat", label: "Chat" },
];

interface MobileTabsProps {
  game: React.ReactNode;
  info: React.ReactNode;
  chat: React.ReactNode;
  defaultTab?: TabId;
}

export function MobileTabs({
  game,
  info,
  chat,
  defaultTab = "game",
}: MobileTabsProps) {
  const [active, setActive] = useState<TabId>(defaultTab);

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Conteúdo do jogo"
        className="flex border-b border-border-subtle bg-surface sticky top-16 z-20"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={`flex-1 relative py-3 text-sm font-medium transition-colors ${
              active === tab.id
                ? "text-accent-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-accent-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        id={`tabpanel-${active}`}
        role="tabpanel"
        className="px-4 py-4 space-y-3"
      >
        {active === "game" && game}
        {active === "info" && info}
        {active === "chat" && chat}
      </div>
    </div>
  );
}
