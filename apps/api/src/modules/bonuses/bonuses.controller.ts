import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { BonusesService } from './bonuses.service';

@ApiTags('bonuses')
@ApiBearerAuth()
@Controller('bonuses')
export class BonusesController {
  constructor(private readonly bonusesService: BonusesService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.bonusesService.listForUser(user.id);
  }
}
