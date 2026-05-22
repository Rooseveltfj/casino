import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { z } from 'zod';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BonusesModule } from './modules/bonuses/bonuses.module';
import { GamesModule } from './modules/games/games.module';
import { HealthModule } from './modules/health/health.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { PspModule } from './modules/psp/psp.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().optional(),
});

@Module({
  imports: [
    // ── Infrastructure ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => EnvSchema.parse(config),
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: false,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000, // 1 minute (ms)
        limit: 100,
      },
    ]),

    // ── Feature modules ─────────────────────────────────────────────────────
    HealthModule,
    AuthModule,
    UsersModule,
    WalletModule,
    GamesModule,
    ProvidersModule,
    PspModule,
    BonusesModule,
    AdminModule,
  ],

  providers: [
    // Apply ThrottlerGuard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
