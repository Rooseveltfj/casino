import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PspService } from './psp.service';

/**
 * PSP adapter — Pix stub in demo mode.
 * In demo: deposits require manual admin confirmation via /admin/psp/:id/confirm.
 */
@ApiTags('psp')
@ApiBearerAuth()
@Controller('psp')
export class PspController {
  constructor(private readonly pspService: PspService) {}

  @Post('deposit')
  createDeposit(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: unknown,
  ) {
    return this.pspService.createDeposit(user.id, body);
  }

  @Post('withdraw')
  requestWithdrawal(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: unknown,
  ) {
    return this.pspService.requestWithdrawal(user.id, body);
  }

  @Get('transactions/:id')
  getTransaction(@Param('id') id: string) {
    return this.pspService.getTransaction(id);
  }
}
