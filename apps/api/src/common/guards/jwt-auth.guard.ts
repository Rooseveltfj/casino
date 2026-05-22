import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { IS_PUBLIC_KEY } from "../decorators/roles.decorator";
import { AuthService } from "../../modules/auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow routes decorated with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractSessionToken(request);

    if (!token) {
      throw new UnauthorizedException("Authentication required");
    }

    // Validate the Better-Auth session token against the database
    const user = await this.authService.getSessionUser(token);
    if (!user) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    // Attach user to request for downstream handlers
    (request as unknown as Record<string, unknown>).user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      displayName: user.displayName,
    };

    return true;
  }

  /**
   * Extract Better-Auth session token from:
   * 1. Authorization: Bearer <token>
   * 2. better-auth.session_token cookie
   */
  private extractSessionToken(req: FastifyRequest): string | undefined {
    const auth = req.headers.authorization ?? "";
    const [type, bearer] = auth.split(" ");
    if (type === "Bearer" && bearer) return bearer;

    // Cookie fallback — Better-Auth sets this cookie name
    const cookies = req.headers.cookie ?? "";
    const match = /better-auth\.session_token=([^;]+)/.exec(cookies);
    return match?.[1];
  }
}
