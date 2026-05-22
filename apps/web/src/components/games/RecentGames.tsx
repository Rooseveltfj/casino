import { headers } from "next/headers";
import Link from "next/link";
import { Clock } from "lucide-react";
import { auth } from "@casino/database/auth";
import { getRecentGames } from "@/app/actions/games";
import { GameCard } from "./game-card";

// ── Server Component ──────────────────────────────────────────────────────────

export async function RecentGames() {
  // Get current session — headers() is needed for auth in RSC
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });

  if (!session?.user) return null;

  const games = await getRecentGames(session.user.id);
  if (!games.length) return null;

  return (
    <section
      aria-labelledby="recent-heading"
      className="px-4 sm:px-6 py-6 border-b border-border-subtle"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-accent-primary" aria-hidden="true" />
        <h2
          id="recent-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Continue de onde parou
        </h2>
        <Link
          href="/perfil"
          className="ml-auto text-xs text-accent-primary hover:underline"
        >
          Ver histórico
        </Link>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {games.map((game, i) => (
          <div key={game.id} className="shrink-0 w-36 sm:w-40">
            <GameCard game={game} index={i} noAnimate />
          </div>
        ))}
      </div>
    </section>
  );
}
