import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/roles.decorator';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  list(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    return this.gamesService.list({
      category,
      featured: featured === 'true',
    });
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }
}
