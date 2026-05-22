import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { and, eq, gt } from "drizzle-orm";
import { getDb, users, sessions, auditLogs } from "@casino/database";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly config: ConfigService) {}

  private get db() {
    return getDb();
  }

  /**
   * Proxy a raw HTTP request to Better-Auth's handler.
   * Better-Auth runs its own routing — we just forward the request.
   */
  async handleRequest(req: FastifyRequest, res: FastifyReply): Promise<void> {
    // Lazy-import to avoid loading the DB connection at module initialisation
    const { auth } = await import("@casino/database/auth");

    const url = new URL(
      req.url,
      `http://${(req.headers.host as string | undefined) ?? "localhost:4000"}`,
    );

    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const response = await auth.handler(webRequest);

    void res.status(response.status);
    response.headers.forEach((value, key) => {
      void res.header(key, value);
    });

    const body = await response.text();
    void res.send(body);
  }

  /**
   * Validate a Better-Auth session cookie token against the DB.
   * Used by JwtAuthGuard to authenticate NestJS API requests.
   */
  async validateSessionToken(
    token: string,
  ): Promise<{ userId: string; role: string } | null> {
    try {
      const [session] = await this.db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(
          and(
            eq(sessions.token, token),
            gt(sessions.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!session) return null;

      const [user] = await this.db
        .select({ id: users.id, role: users.role, status: users.status })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user || user.status !== "active") return null;

      return { userId: user.id, role: user.role };
    } catch (err) {
      this.logger.error({ err }, "Session validation failed");
      return null;
    }
  }

  /**
   * Write an entry to audit_logs for auth events.
   */
  async writeAuditLog(opts: {
    actorId: string | null;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.db.insert(auditLogs).values({
        actorId: opts.actorId,
        actorType: opts.actorId ? "user" : "system",
        action: opts.action,
        resourceType: "auth",
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
        metadata: opts.metadata ?? {},
      });
    } catch (err) {
      this.logger.warn({ err }, "Failed to write audit log");
    }
  }

  /** Verify a session and return full user for NestJS request enrichment */
  async getSessionUser(
    token: string,
  ): Promise<typeof users.$inferSelect | null> {
    const session = await this.validateSessionToken(token);
    if (!session) return null;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user ?? null;
  }

  /** Unused — reserved placeholder */
  async verifyToken(_token: string): Promise<null> {
    throw new UnauthorizedException("Use validateSessionToken instead");
  }
}
