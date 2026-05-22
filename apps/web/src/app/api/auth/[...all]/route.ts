import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Better-Auth catch-all handler at /api/auth/*.
 *
 * Uses a dynamic import so that if DATABASE_URL is missing (local dev without
 * a real database configured), the module initialisation error is caught and
 * the route returns a safe empty-session response instead of a 500.
 */
async function getHandler() {
  const { auth } = await import("@casino/database/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  return toNextJsHandler(auth);
}

export async function GET(req: NextRequest) {
  try {
    const handler = await getHandler();
    return handler.GET(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("DATABASE_URL")) {
      // Dev environment without a database — return an empty session
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const handler = await getHandler();
    return handler.POST(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL in .env.local." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}
