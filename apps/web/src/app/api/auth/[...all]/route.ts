import { auth } from "@casino/database/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better-Auth catch-all handler mounted at /api/auth/*.
 * All auth operations (sign-in, sign-up, 2FA, sessions, etc.)
 * are handled here — no custom logic needed in Next.js.
 */
export const { GET, POST } = toNextJsHandler(auth);
