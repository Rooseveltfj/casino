# Deploy Guide — Casino Platform

## Architecture overview

```
GitHub → CI (GitHub Actions) → Merge to main
                                    │
                    ┌───────────────┴─────────────────┐
                    │                                   │
              Vercel (web)                       Railway (api)
              Next.js 15                        NestJS + Fastify
                    │                                   │
                    └──────────────┬────────────────────┘
                                   │
                              Supabase (PostgreSQL)
                              Upstash (Redis)
                              Sentry (observability)
```

---

## 1. Environment Variables

### Local development (`apps/web/.env.local` and root `.env.local`)

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/casino_dev` | Local PostgreSQL |
| `BETTER_AUTH_SECRET` | Any 32-char string | `openssl rand -hex 16` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Web app origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API origin |
| `REDIS_URL` | `redis://localhost:6379` | Local Redis |
| `DB_DEBUG` | `true` | Optional SQL logging |

### Vercel (preview + prod) — set in dashboard

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) |
| `BETTER_AUTH_SECRET` | Random 32-char secret (different from dev!) |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Railway API URL |
| `SENTRY_DSN` | Sentry project DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN (exposed to browser) |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (source-map upload) |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project slug |

### Railway (API) — set in dashboard

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Supabase Session Pooler URL (port 5432, direct) |
| `REDIS_URL` | Upstash Redis connection URL |
| `BETTER_AUTH_SECRET` | Same as Vercel (shared secret) |
| `CORS_ORIGIN` | Vercel app URL |
| `SENTRY_DSN` | Sentry project DSN |
| `PORT` | `4000` (Railway sets this automatically) |
| `NODE_ENV` | `production` |

### GitHub Actions Secrets — set in repo Settings → Secrets

| Secret | Used by |
|---|---|
| `VERCEL_TOKEN` | Vercel CLI authentication |
| `VERCEL_ORG_ID` | Vercel org (from `vercel env pull`) |
| `VERCEL_PROJECT_ID` | Vercel project (from `vercel env pull`) |
| `RAILWAY_TOKEN` | Railway CLI authentication |
| `RAILWAY_SERVICE_NAME` | Railway service name |
| `DATABASE_URL` | Migration job |
| `API_PROD_URL` | Health-check URL after Railway deploy |
| `TURBO_TOKEN` | Vercel Remote Cache (optional, speeds up CI) |
| `TURBO_TEAM` | Vercel team slug (optional) |

---

## 2. Supabase Setup (step by step)

1. **Create account** — go to [supabase.com](https://supabase.com) → Sign up free
2. **New project** — Click "New Project", choose:
   - Name: `casino-platform`
   - Database password: generate a strong one (save it!)
   - Region: South America (São Paulo) for lowest latency
3. **Wait ~2 minutes** for provisioning
4. **Get connection strings** — Settings → Database:
   - **Transaction Pooler** (for serverless/Vercel): port 6543, `?pgbouncer=true`
   - **Session Mode** (for Railway/NestJS): port 5432
5. **Copy `DATABASE_URL`** in both formats above
6. **Row Level Security** — Table Editor → for each table → Enable RLS
   - Our backend bypasses RLS using the service_role key
   - Run this in SQL Editor for each sensitive table:
     ```sql
     ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
     ALTER TABLE wallets  ENABLE ROW LEVEL SECURITY;
     ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
     -- Policy for service role (API bypasses RLS)
     CREATE POLICY "service role bypass" ON users    USING (auth.role() = 'service_role');
     CREATE POLICY "service role bypass" ON wallets  USING (auth.role() = 'service_role');
     ```
7. **Run migrations** — see section 3 below

---

## 3. Upstash Redis Setup (step by step)

1. Go to [console.upstash.com](https://console.upstash.com) → Sign up free
2. **Create Database**:
   - Name: `casino-redis`
   - Type: Regional (pick São Paulo / US-East for lowest latency)
   - Plan: Free (starts at 0, 10K commands/day)
3. **Copy `REDIS_URL`** — looks like `redis://:password@host:port`
4. **Copy `UPSTASH_REDIS_REST_URL`** and `UPSTASH_REDIS_REST_TOKEN` (for edge-compatible client)
5. Add both to Railway and Vercel env vars

---

## 4. Running Migrations

### Locally
```bash
# Generate new migration from schema changes
pnpm --filter @casino/database db:generate

# Apply pending migrations
DATABASE_URL="postgresql://..." pnpm --filter @casino/database db:migrate

# Seed demo data
DATABASE_URL="postgresql://..." pnpm --filter @casino/database db:seed
```

### In production (CI runs this automatically)
The `deploy-prod.yml` workflow runs migrations before deploying. To run manually:
```bash
# Via Railway CLI (if you have access)
railway run --service=casino-api pnpm --filter @casino/database db:migrate

# Or connect directly with psql
psql "$DATABASE_URL" -f packages/database/src/migrations/XXXX_name.sql
```

---

## 5. Rollback Procedures

### Web (Vercel)
```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>

# Or via dashboard: Vercel → Project → Deployments → promote any previous build
```

### API (Railway)
```bash
# View deployment history
railway deployments --service=casino-api

# Rollback to a previous deployment
railway rollback --service=casino-api --deployment=<deployment-id>
```

### Database rollback
There is no automated DB rollback. For schema changes:
1. Write a compensating migration (inverse operation)
2. Apply it: `pnpm --filter @casino/database db:migrate`

---

## 6. Accessing Logs

### Vercel (web)
- Dashboard → Project → Deployments → select deployment → Runtime Logs
- CLI: `vercel logs <deployment-url>`
- Real-time: `vercel logs --follow`

### Railway (API)
- Dashboard → Service → Deployments → select deployment → Logs
- CLI: `railway logs --service=casino-api`
- Real-time: `railway logs --tail --service=casino-api`

### Sentry (errors + performance)
- [sentry.io](https://sentry.io) → select project → Issues / Performance
- Errors are tagged by `environment` (production / development)
- Filter by: `service:casino-api` or `service:casino-web`

### GitHub Actions
- Repository → Actions → select workflow run → see job logs
- Download logs: each job has a "..." menu → Download logs

---

## 7. Sentry: Test Error Capture

### Web (Next.js)
```typescript
// Temporary test — add to any page, remove after confirming
import * as Sentry from "@sentry/nextjs";
Sentry.captureException(new Error("Test error from Casino Platform web"));
```

### API (NestJS)
```typescript
// In any service
import * as Sentry from "@sentry/node";
Sentry.captureException(new Error("Test error from Casino Platform API"));
```

Check Sentry dashboard → Issues within ~30 seconds.

---

## 8. Expected Costs (Free Tier → MVP)

| Service | Free tier | Paid (after MVP) |
|---|---|---|
| **Vercel** | 100GB bandwidth, unlimited previews | Pro $20/mo (custom domain, more bandwidth) |
| **Railway** | $5 credit/mo (~500h container) | Pay-as-you-go, ~R$25-50/mo for small API |
| **Supabase** | 500MB DB, 5GB bandwidth, 2 projects | Pro $25/mo (8GB DB, daily backups) |
| **Upstash Redis** | 10K commands/day, 256MB | Pay-per-use, ~R$5-20/mo |
| **Sentry** | 5K errors/mo, 10K perf events | Team $26/mo (100K errors) |
| **GitHub Actions** | 2,000 min/mo public, 500 min private | $0.008/min over limit |
| **Total MVP** | **R$ 0** | **~R$ 80-150/mo** with real traffic |

> 💡 **Cost optimisation tips:**
> - Use Vercel's Edge Network — no separate CDN needed
> - Railway scales to zero when idle (set `sleepApplication: true` for staging)
> - Supabase Connection Pooling (PgBouncer) reduces DB connections from Vercel
> - Upstash global replication only needed if serving multiple continents

---

## 9. CI Status Checks (required for PR merge)

Configure these as required status checks in GitHub:
- Settings → Branches → `main` → Require status checks:
  - `Lint`
  - `Type Check`
  - `Test (Vitest)`
  - `Build`

---

## 10. First-Time Setup Checklist

- [ ] Create Supabase project and run `pnpm db:migrate`
- [ ] Create Upstash Redis database
- [ ] Create Sentry project (type: Next.js; install `@sentry/nextjs` wizard)
- [ ] Import GitHub repo to Vercel, set Root Directory = `apps/web`
- [ ] Set all Vercel env vars (see section 1)
- [ ] Import GitHub repo to Railway, set Dockerfile path
- [ ] Set all Railway env vars (see section 1)
- [ ] Add all GitHub Actions secrets (see section 1)
- [ ] Enable branch protection on `main` with required status checks
- [ ] Open a test PR → verify CI passes and preview URL appears
- [ ] Merge to `main` → verify production deploy succeeds
