import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { getWalletBalances } from "@/lib/games.server";

export async function GET() {
  const hdrs = await headers();

  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: hdrs as unknown as Headers,
    });
    userId = session?.user?.id ?? null;
  } catch {
    // guest
  }

  if (!userId) {
    return NextResponse.json(
      {
        balances: { demo: "0.00", real: "0.00", bonus: "0.00", locked: "0.00" },
        hasReal: false,
        isGuest: true,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const balances = await getWalletBalances(userId);
  const hasReal = parseFloat(balances.real) > 0;

  return NextResponse.json(
    { balances, hasReal, isGuest: false },
    { headers: { "Cache-Control": "private, max-age=5" } },
  );
}
