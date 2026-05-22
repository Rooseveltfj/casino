import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UserRole } from './roles.decorator';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

/**
 * Extracts the authenticated user from the request context.
 * Requires JwtAuthGuard to have run first (sets request.user).
 *
 * @example
 * \@Get('me')
 * getMe(\@CurrentUser() user: CurrentUserPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return (request as unknown as { user: CurrentUserPayload }).user;
  },
);
