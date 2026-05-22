import { SetMetadata } from '@nestjs/common';

export type UserRole =
  | 'player'
  | 'support'
  | 'finance'
  | 'admin'
  | 'superadmin';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

/** Restrict endpoint to specific roles. Must be combined with JwtAuthGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Mark an endpoint as public — JwtAuthGuard will skip authentication. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
