import { type NextRequest, NextResponse } from "next/server";

interface SessionUser {
  id: string;
  role?: string;
  emailVerified: boolean;
}

interface SessionResponse {
  session: { id: string; expiresAt: string };
  user: SessionUser;
}

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

const AUTH_REQUIRED_PREFIXES = ["/perfil", "/jogos", "/carteira", "/bonuses"];
const ADMIN_REQUIRED_PREFIXES = ["/admin"];

async function getSession(request: NextRequest): Promise<SessionResponse | null> {
  try {
    const res = await fetch(
      new URL("/api/auth/get-session", request.nextUrl.origin),
      {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        // Use Next.js's built-in fetch caching — revalidate every 5 min
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as SessionResponse;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!needsAuth && !needsAdmin) return NextResponse.next();

  const session = await getSession(request);
  const loginUrl = new URL("/login", request.url);

  if (!session?.user) {
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (needsAdmin && !ADMIN_ROLES.has(session.user.role ?? "")) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/perfil/:path*",
    "/jogos/:path*",
    "/carteira/:path*",
    "/bonuses/:path*",
  ],
};
