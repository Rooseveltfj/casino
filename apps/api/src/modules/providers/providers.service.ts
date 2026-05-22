import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Adapter layer for game providers.
 * Supported:
 *   - "internal" / "mock" — all demo games run locally via Phaser
 *   - "pragmatic"         — Pragmatic Play stub (production)
 *
 * All callbacks MUST verify HMAC signature before processing.
 */
@Injectable()
export class ProvidersService {
  async createLaunchToken(provider: string, _payload: unknown): Promise<{ token: string }> {
    if (provider !== 'internal') {
      throw new BadRequestException(`Provider '${provider}' not configured`);
    }
    // TODO: create game_session row + sign launch token
    return { token: `demo-${Date.now()}` };
  }

  async handleCallback(provider: string, payload: unknown): Promise<{ ok: boolean }> {
    // TODO: verify HMAC signature from provider headers
    // TODO: delegate to WalletService for bet/win settlement
    void provider;
    void payload;
    return { ok: true };
  }
}
