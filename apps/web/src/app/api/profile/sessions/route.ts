import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@casino/database/auth";
import { getActiveSessions } from "@/lib/profile.server";

export async function GET() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const rows = await getActiveSessions(session.user.id);

  return NextResponse.json(
    {
      sessions: rows,
      currentSessionId: session.session.id,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
