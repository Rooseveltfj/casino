import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { getDb } from "./client";
import { users, sessions, accounts, verifications } from "./schema/index";

// ── Exported types ────────────────────────────────────────────────────────────

export type BetterAuthRole =
  | "player"
  | "support"
  | "finance"
  | "admin"
  | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: BetterAuthRole;
  status: "active" | "suspended" | "self_excluded" | "banned";
  locale: string;
  displayName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: AuthUser;
}

/**
 * Minimal typed surface for the Better-Auth instance.
 * Narrows to only what we actually consume — avoids TS2742 which fires because
 * better-auth's inferred type references a pnpm-internal zod@4 path that
 * TypeScript cannot write into a portable declaration.
 */
interface BetterAuthInstance {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (ctx: {
      headers: Headers | Record<string, string>;
    }) => Promise<AuthSession | null>;
    signInEmail: (ctx: {
      body: { email: string; password: string; rememberMe?: boolean };
      asResponse?: boolean;
    }) => Promise<{
      data: AuthSession | null;
      error: { message?: string } | null;
    }>;
    signUpEmail: (ctx: {
      body: { email: string; password: string; name: string };
      asResponse?: boolean;
    }) => Promise<{
      data: AuthSession | null;
      error: { message?: string } | null;
    }>;
    signOut: (ctx: {
      headers: Headers | Record<string, string>;
    }) => Promise<{ data: boolean; error: null }>;
  };
}

type EmailHookData = {
  user: { id: string; email: string; name: string };
  url: string;
  token: string;
};

export const auth: BetterAuthInstance = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendVerificationEmail: async ({ user, url }: EmailHookData) => {
      if (process.env.NODE_ENV !== "production") {
        process.stdout.write(`[auth:dev] ✉  Verify ${user.email} → ${url}\n`);
        return;
      }
      // TODO: Resend integration — await resend.emails.send({ to: user.email, ... })
    },

    sendResetPassword: async ({ user, url }: EmailHookData) => {
      if (process.env.NODE_ENV !== "production") {
        process.stdout.write(
          `[auth:dev] 🔑 Reset password ${user.email} → ${url}\n`,
        );
        return;
      }
      // TODO: Resend integration
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: { type: "string" as const, required: false, defaultValue: "player", input: false },
      status: { type: "string" as const, required: false, defaultValue: "active", input: false },
      locale: { type: "string" as const, required: false, defaultValue: "pt-BR", input: true },
      displayName: { type: "string" as const, required: false, input: true },
    },
  },

  plugins: [
    twoFactor({
      issuer: process.env.NEXT_PUBLIC_APP_NAME ?? "Casino Platform",
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    },
    generateId: randomUUID,
  },

  rateLimit: { enabled: true, window: 60 * 15, max: 5 },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    process.env.API_URL ?? "http://localhost:4000",
  ].filter(Boolean),
}) as unknown as BetterAuthInstance;
