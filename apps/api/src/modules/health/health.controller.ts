import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { getDb } from '@casino/database';
import { Public } from '../../common/decorators/roles.decorator';

interface HealthResponse {
  status: 'ok' | 'degraded';
  db: 'ok' | 'error';
  redis: 'ok' | 'unavailable';
  timestamp: string;
  uptime: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — ping DB and Redis' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is degraded' })
  async check(): Promise<HealthResponse> {
    const [db, redis] = await Promise.all([
      this.pingDb(),
      this.pingRedis(),
    ]);

    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      redis,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  ready(): { ready: boolean } {
    return { ready: true };
  }

  private async pingDb(): Promise<'ok' | 'error'> {
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async pingRedis(): Promise<'ok' | 'unavailable'> {
    // TODO: inject Redis client and call redis.ping()
    return 'unavailable';
  }
}
