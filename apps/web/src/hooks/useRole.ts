"use client";

import { useAuth } from "./useAuth";
import type { BetterAuthRole } from "@/lib/auth";

const ROLE_HIERARCHY: Record<BetterAuthRole, number> = {
  player: 0,
  support: 1,
  finance: 2,
  admin: 3,
  superadmin: 4,
};

/**
 * useRole — RBAC checks for Client Components.
 *
 * Usage:
 *   const { role, is, atLeast } = useRole();
 *   if (atLeast("admin")) { ... }
 *   if (is("superadmin")) { ... }
 */
export function useRole() {
  const { user, isLoading } = useAuth();
  const role: BetterAuthRole = (user?.role ?? "player") as BetterAuthRole;

  /** Exact role match */
  function is(...roles: BetterAuthRole[]): boolean {
    return roles.includes(role);
  }

  /** Role is at or above the given minimum in the hierarchy */
  function atLeast(minimum: BetterAuthRole): boolean {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
  }

  /** Role is strictly below the given ceiling */
  function below(ceiling: BetterAuthRole): boolean {
    return ROLE_HIERARCHY[role] < ROLE_HIERARCHY[ceiling];
  }

  return {
    role,
    isLoading,
    is,
    atLeast,
    below,
    isAdmin: atLeast("admin"),
    isSuperAdmin: is("superadmin"),
    isPlayer: is("player"),
  };
}
