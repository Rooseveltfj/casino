"use client";

import { useSession, signOut } from "@/lib/auth";
import type { BetterAuthRole } from "@/lib/auth";

export interface AuthUserSnapshot {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: BetterAuthRole;
}

type SessionUserWithRole = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  // additionalFields injected at runtime — cast needed because Better-Auth's
  // base TS types don't include user-defined additionalFields automatically
  role?: string;
};

/**
 * useAuth — primary auth hook for Client Components.
 */
export function useAuth() {
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  }

  const rawUser = session?.user as SessionUserWithRole | undefined;

  const user = rawUser
    ? ({
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        emailVerified: rawUser.emailVerified,
        image: rawUser.image,
        role: (rawUser.role as BetterAuthRole) ?? "player",
      } satisfies AuthUserSnapshot)
    : null;

  return {
    user,
    isLoading: isPending,
    isLoggedIn: !!user,
    signOut: handleSignOut,
  };
}
