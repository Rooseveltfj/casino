// Sentry MUST be imported before anything else — captures all exceptions
import './instrument';

import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // nestjs-pino handles logging
      trustProxy: true,
    }),
    { bufferLogs: true },
  );

  // ── Pino logger ─────────────────────────────────────────────────────────
  app.useLogger(app.get(Logger));
  await app.flushLogs();

  // ── Security ─────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: isDev ? false : undefined,
  });

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Idempotency-Key',
      'X-Request-Id',
    ],
  });

  // ── Global exception filter ───────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Swagger (dev only) ────────────────────────────────────────────────────
  if (isDev) {
    patchNestJsSwagger();
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Casino Platform API')
      .setDescription(
        'White-label online casino REST API — demo mode (all games local)',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('health', 'Infrastructure health checks')
      .addTag('auth', 'Authentication (Better-Auth)')
      .addTag('users', 'Player & staff profiles')
      .addTag('wallet', 'Double-entry ledger')
      .addTag('games', 'Game catalogue & sessions')
      .addTag('psp', 'PSP / Pix payments (demo stub)')
      .addTag('bonuses', 'Bonus engine')
      .addTag('admin', 'Back-office endpoints (RBAC)')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
  if (isDev) {
    logger.log(
      `📖 Swagger docs: http://localhost:${port}/api/docs`,
      'Bootstrap',
    );
  }
}

bootstrap().catch((err: unknown) => {
  process.stderr.write(`Fatal bootstrap error: ${String(err)}\n`);
  process.exit(1);
});
