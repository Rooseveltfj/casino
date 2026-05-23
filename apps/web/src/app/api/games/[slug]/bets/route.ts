import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { getGameBySlug, getRecentBetsForGame } from "@/lib/games.server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;

  // Resolve session
  const hdrs = await headers();
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    userId = session?.user?.id ?? null;
  } catch {
    // proceed as guest
  }

  if (!userId) {
    return NextResponse.json(
      { bets: [], total: 0 },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const game = await getGameBySlug(slug);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const bets = await getRecentBetsForGame(userId, game.id, 10);

  return NextResponse.json(
    { bets, total: bets.length },
    {
      headers: {
        // Short cache to allow SWR polling without thrashing the DB
        "Cache-Control": "private, max-age=2",
      },
    },
  );
}
