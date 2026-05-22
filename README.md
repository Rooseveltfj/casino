# Casino Platform

White-label online casino platform (slots, live casino, sportsbook) — demo mode with mock wallet and local Phaser games. Production-ready architecture: swap configs to plug in real providers (Pragmatic Play, Evolution Gaming, Pix PSP).

## Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15 App Router + Tailwind v4 + shadcn/ui |
| Backend | NestJS + Fastify + Drizzle ORM + PostgreSQL |
| Cache/Queues | Redis (Upstash) + BullMQ |
| Auth | Better-Auth + RBAC + 2FA TOTP |
| Validation | Zod v4 (shared front ↔ back) |
| Games | Phaser 3 + Matter.js |
| Real-time | Socket.IO |

## Structure

```
casino-platform/
├── apps/
│   ├── web/          # Next.js 15 player-facing app
│   └── api/          # NestJS backend
├── packages/
│   ├── config/
│   │   ├── eslint-config/      # @casino/eslint-config
│   │   ├── typescript-config/  # @casino/typescript-config
│   │   └── tailwind-config/    # @casino/tailwind-config
│   ├── database/     # Drizzle schema + migrations
│   ├── shared/       # Zod schemas shared across apps
│   └── ui/           # Shared React component library
└── docs/             # Internal documentation
```

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9 — `npm i -g pnpm`

## Getting started

```bash
# Install all dependencies
pnpm install

# Start all apps in watch mode
pnpm dev

# Build everything
pnpm build

# Type-check all packages
pnpm type-check

# Lint all packages
pnpm lint

# Run all tests
pnpm test

# Database
pnpm db:generate   # generate Drizzle migrations
pnpm db:migrate    # apply migrations
```

## Environment

Copy `.env.example` to `.env` in each app that needs it. Never commit `.env` files.

## Conventions

- Zero `any`. Zero `@ts-ignore`. Enforce via ESLint.
- Mobile-first: design at 375 px, expand.
- Wallet is an append-only double-entry ledger — never UPDATE transactions.
- Every financial operation carries an `idempotency_key`.
- All provider callbacks are HMAC-verified before processing.
- Use `logger.info/debug/error` — never `console.log`.
- All UI strings go through i18n from the start.
