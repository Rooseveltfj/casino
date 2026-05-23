import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { launchGameSession } from "@/lib/games.server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const VALID_WALLETS = ["demo", "real", "bonus"] as const;
type WalletType = (typeof VALID_WALLETS)[number];

function isValidWallet(v: unknown): v is WalletType {
  return typeof v === "string" && (VALID_WALLETS as readonly string[]).includes(v);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { slug } = await ctx.params;

  let walletType: WalletType = "demo";
  try {
    const body = (await req.json()) as { walletType?: unknown };
    if (isValidWallet(body.walletType)) walletType = body.walletType;
  } catch {
    // empty body is fine — defaults to demo
  }

  // Resolve user (optional — guest launches in demo mode)
  const hdrs = await headers();
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    userId = session?.user?.id ?? null;
  } catch {
    // ignore — proceed as guest
  }

  // Reject real-money launch without auth
  if (walletType === "real" && !userId) {
    return NextResponse.json(
      { error: "Login required for real-money play" },
      { status: 401 },
    );
  }

  try {
    const result = await launchGameSession({
      slug,
      userId,
      walletType,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip"),
      userAgent: hdrs.get("user-agent"),
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Launch failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Game not found" ? 404 : 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
