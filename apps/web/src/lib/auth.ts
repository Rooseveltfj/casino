"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import type { BetterAuthRole } from "@casino/database/auth";

// ── Minimal typed surface for the client ──────────────────────────────────────
// createAuthClient's inferred type references pnpm-internal zod@4 paths,
// triggering TS2742. We cast to this explicit interface to stay portable.

interface SignInResult {
  data: { session: { id: string }; user: { id: string } } | null;
  error: { message?: string; status?: number } | null;
}

interface AuthClientInterface {
  signIn: {
    email: (opts: {
      email: string;
      password: string;
      rememberMe?: boolean;
      callbackURL?: string;
    }) => Promise<SignInResult>;
  };
  signUp: {
    email: (opts: {
      name: string;
      email: string;
      password: string;
      callbackURL?: string;
    }) => Promise<SignInResult>;
  };
  signOut: (opts?: {
    fetchOptions?: { onSuccess?: () => void };
  }) => Promise<void>;
  useSession: () => {
    data: {
      session: { id: string; expiresAt: Date };
      user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string | null;
        role?: string;
      };
    } | null;
    isPending: boolean;
    error: Error | null;
  };
  forgetPassword: (opts: {
    email: string;
    redirectTo: string;
  }) => Promise<{ data: null; error: { message?: string } | null }>;
  verifyEmail: (opts: {
    query: { token: string };
  }) => Promise<{ data: null; error: { message?: string } | null }>;
  twoFactor: {
    enable: (opts: { password: string }) => Promise<{
      data: { totpURI: string } | null;
      error: { message?: string } | null;
    }>;
    verifyTotp: (opts: { code: string }) => Promise<{
      data: { status: boolean } | null;
      error: { message?: string } | null;
    }>;
  };
}

const _rawClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  plugins: [twoFactorClient({ twoFactorPage: "/2fa" })],
});

export const authClient = _rawClient as unknown as AuthClientInterface;

export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
export const useSession = authClient.useSession.bind(authClient);

export type { BetterAuthRole };
