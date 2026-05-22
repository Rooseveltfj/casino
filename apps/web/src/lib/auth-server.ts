/**
 * Server-side auth helpers — import only in Server Components, API routes,
 * or middleware. Never import in Client Components.
 */
import { auth } from "@casino/database/auth";

export { auth };
export type { AuthSession, AuthUser, BetterAuthRole } from "@casino/database/auth";

/**
 * Get the current session from an incoming request (Server Component / Route Handler).
 * Returns null if the user is not authenticated.
 */
export async function getServerSession(
  headers: Headers,
): Promise<Awaited<ReturnType<typeof auth.api.getSession>>> {
  return auth.api.getSession({ headers });
}
