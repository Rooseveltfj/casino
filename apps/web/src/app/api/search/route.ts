import { type NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, games } from "@casino/database";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: string;
  thumbnailUrl: string | null;
  rtp: string | null;
  isFeatured: boolean;
}

// ── In-memory cache (30 s TTL per unique query) ───────────────────────────────

interface CacheEntry {
  data: SearchResult[];
  expires: number;
}

const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

function getCached(key: string): SearchResult[] | null {
  const entry = CACHE.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  CACHE.delete(key);
  return null;
}

function setCache(key: string, data: SearchResult[]): void {
  // Evict if cache grows too large (prevent memory leak in long-running processes)
  if (CACHE.size > 500) {
    const now = Date.now();
    for (const [k, v] of CACHE) {
      if (v.expires <= now) CACHE.delete(k);
    }
  }
  CACHE.set(key, { data, expires: Date.now() + TTL_MS });
}

// ── Full-text search helpers ──────────────────────────────────────────────────

/**
 * Build a safe tsquery expression: splits on whitespace, removes special chars,
 * and ORs all terms for broad matching.
 */
function buildTsQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[!&|():*<>'\\]/g, ""))
    .filter(Boolean)
    .map((w) => `${w}:*`) // prefix search for each word
    .join(" | ");
}

async function searchWithFts(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const db = getDb();
  const tsQuery = buildTsQuery(query);

  if (!tsQuery) return [];

  const rows = await db.execute(sql`
    SELECT
      id::text,
      slug,
      name,
      provider,
      category::text AS category,
      thumbnail_url   AS "thumbnailUrl",
      rtp::text       AS rtp,
      is_featured     AS "isFeatured"
    FROM games
    WHERE is_active = true
      AND (
        to_tsvector('simple', name || ' ' || COALESCE(provider, ''))
          @@ to_tsquery('simple', ${tsQuery})
      )
    ORDER BY
      is_featured DESC,
      ts_rank(
        to_tsvector('simple', name || ' ' || COALESCE(provider, '')),
        to_tsquery('simple', ${tsQuery})
      ) DESC,
      play_count DESC
    LIMIT ${limit}
  `);

  // postgres.js driver returns rows directly (no .rows wrapper); cast via unknown
  return Array.from(rows) as unknown as SearchResult[];
}

async function searchWithIlike(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const db = getDb();
  const pattern = `%${query}%`;

  const rows = await db
    .select({
      id: games.id,
      slug: games.slug,
      name: games.name,
      provider: games.provider,
      category: games.category,
      thumbnailUrl: games.thumbnailUrl,
      rtp: games.rtp,
      isFeatured: games.isFeatured,
    })
    .from(games)
    .where(
      and(
        eq(games.isActive, true),
        or(
          ilike(games.name, pattern),
          ilike(games.provider, pattern),
          sql`${games.category}::text ILIKE ${pattern}`,
        ),
      ),
    )
    .orderBy(desc(games.isFeatured), desc(games.playCount), asc(games.name))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    thumbnailUrl: r.thumbnailUrl ?? null,
    rtp: r.rtp ?? null,
  }));
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let query: string;
  let limit: number;

  try {
    const body = (await req.json()) as { query?: unknown; limit?: unknown };
    query = typeof body.query === "string" ? body.query.trim() : "";
    limit = typeof body.limit === "number" ? Math.min(body.limit, 20) : 8;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [], query, total: 0 });
  }

  const cacheKey = `${query.toLowerCase()}:${limit}`;
  const cached   = getCached(cacheKey);

  if (cached) {
    return NextResponse.json(
      { results: cached, query, total: cached.length },
      { headers: { "X-Cache": "HIT", "Cache-Control": "private, max-age=30" } },
    );
  }

  try {
    let results: SearchResult[] = [];

    // 1. Try PostgreSQL FTS for better ranking
    try {
      results = await searchWithFts(query, limit);
    } catch {
      // FTS might fail if ts_vector extension is not set up or query is invalid
    }

    // 2. Fall back to ILIKE if FTS returned nothing
    if (results.length === 0) {
      results = await searchWithIlike(query, limit);
    }

    setCache(cacheKey, results);

    return NextResponse.json(
      { results, query, total: results.length },
      { headers: { "X-Cache": "MISS", "Cache-Control": "private, max-age=30" } },
    );
  } catch {
    // Database unavailable — serve empty results gracefully
    return NextResponse.json({ results: [], query, total: 0 });
  }
}

// GET not supported
export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
