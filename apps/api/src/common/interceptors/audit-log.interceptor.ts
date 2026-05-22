import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Intercepts write operations and emits an audit entry.
 * Currently logs via Pino; persistence to audit_logs table is a TODO
 * that will be wired once AuditLogsService / BullMQ is in place.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: CurrentUserPayload }>();

    if (!WRITE_METHODS.has(request.method)) {
      return next.handle();
    }

    const startMs = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            msg: 'audit:write',
            method: request.method,
            url: request.url,
            actorId: request.user?.id,
            actorRole: request.user?.role,
            durationMs: Date.now() - startMs,
          });
          // TODO: enqueue to BullMQ → write to audit_logs via DatabaseService
        },
        error: (err: unknown) => {
          this.logger.warn({
            msg: 'audit:write:failed',
            method: request.method,
            url: request.url,
            actorId: request.user?.id,
            error: String(err),
          });
        },
      }),
    );
  }
}
