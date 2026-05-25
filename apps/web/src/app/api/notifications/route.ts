import { NextResponse, type NextRequest } from "next/server";
import { listNotifications } from "@/app/actions/notifications";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);

  const result = await listNotifications({ cursor, limit });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
