import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { getLoginHistory } from "@/lib/profile.server";

export async function GET() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const logins = await getLoginHistory(session.user.id, 10);

  return NextResponse.json(
    { logins },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
