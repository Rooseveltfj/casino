import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { getTransactions } from "@/lib/profile.server";
import type { TransactionRow } from "@/lib/profile.server";

const VALID_TYPES: TransactionRow["type"][] = [
  "deposit",
  "withdrawal",
  "bet",
  "win",
  "bonus_grant",
  "bonus_release",
  "adjustment",
  "rollback",
];

function isValidType(v: string | null): v is TransactionRow["type"] {
  return v !== null && (VALID_TYPES as readonly string[]).includes(v);
}

export async function GET(req: NextRequest) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = req.nextUrl;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const typeParam = url.searchParams.get("type");
  const type = isValidType(typeParam) ? typeParam : undefined;

  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");
  const fromDate = fromStr ? new Date(fromStr) : undefined;
  const toDate = toStr ? new Date(toStr) : undefined;

  const result = await getTransactions({
    userId: session.user.id,
    cursor,
    limit,
    type,
    fromDate,
    toDate,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
