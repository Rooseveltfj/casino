# ── Stage 1: Install all deps and build ─────────────────────────────────────
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /repo

# Copy workspace manifests first for layer-cache efficiency
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/typescript-config/package.json packages/config/typescript-config/
COPY packages/database/package.json                  packages/database/
COPY apps/api/package.json                            apps/api/

# Install all workspace deps (production + dev needed for build)
RUN pnpm install --frozen-lockfile

# Copy full source
COPY packages/ packages/
COPY apps/api/ apps/api/

# Build shared packages first, then the API
RUN pnpm --filter @casino/database build
RUN pnpm --filter api build

# Prune to production-only deps for the API
RUN pnpm deploy --filter=api --prod /app/deploy

# ── Stage 2: Lean runtime image ──────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

WORKDIR /app

# Copy production node_modules (from pnpm deploy output)
COPY --from=builder --chown=nestjs:nodejs /app/deploy/node_modules ./node_modules

# Copy compiled API
COPY --from=builder --chown=nestjs:nodejs /repo/apps/api/dist ./dist

# Copy compiled database package (needed at runtime for DB schema + queries)
COPY --from=builder --chown=nestjs:nodejs /repo/packages/database/dist \
     ./node_modules/@casino/database/dist

# Copy the package.json (needed by Node module resolution)
COPY --from=builder --chown=nestjs:nodejs /repo/apps/api/package.json ./package.json

USER nestjs

EXPOSE 4000
ENV NODE_ENV=production \
    PORT=4000

HEALTHCHECK \
  --interval=30s \
  --timeout=10s \
  --start-period=20s \
  --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/main"]
