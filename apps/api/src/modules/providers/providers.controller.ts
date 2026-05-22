import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';

/**
 * Game provider adapter endpoints.
 * Handles launch-token generation and round-result callbacks (HMAC-verified).
 */
@ApiTags('providers')
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post(':provider/launch')
  launch(@Param('provider') provider: string, @Body() body: unknown) {
    return this.providersService.createLaunchToken(provider, body);
  }

  /** Provider webhook — HMAC signature verified before processing */
  @Post(':provider/callback')
  callback(@Param('provider') provider: string, @Body() body: unknown) {
    return this.providersService.handleCallback(provider, body);
  }
}
