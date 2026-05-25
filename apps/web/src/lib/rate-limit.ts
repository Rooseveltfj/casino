/**
 * Rate limiter — Upstash Redis primary, in-memory fallback.
 *
 * Server-side only. Keys are namespaced by action + user + calendar day so each
 * day rolls over cleanly. TTL set to 24 h to clean up stale entries.
 */
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  ok: boolean;
  count: number;
  remaining: number;
  resetAt: Date;
}

// ── Redis client (singleton, gracefully degrades) ─────────────────────────────

let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}

// ── In-memory fallback ────────────────────────────────────────────────────────

const memCache = new Map<string, { count: number; expires: number }>();

function memoryCheck(
  key: string,
  max: number,
  ttlSec: number,
): RateLimitResult {
  const now = Date.now();
  const resetAt = new Date(now + ttlSec * 1000);

  const entry = memCache.get(key);
  if (entry && entry.expires > now) {
    entry.count += 1;
    return {
      ok: entry.count <= max,
      count: entry.count,
      remaining: Math.max(0, max - entry.count),
      resetAt: new Date(entry.expires),
    };
  }

  memCache.set(key, { count: 1, expires: now + ttlSec * 1000 });
  // Garbage collect old entries occasionally to prevent unbounded growth
  if (memCache.size > 5000) {
    for (const [k, v] of memCache) {
      if (v.expires <= now) memCache.delete(k);
    }
  }

  return { ok: true, count: 1, remaining: max - 1, resetAt };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Atomically increments a counter for (action, userId, day) and returns
 * whether the operation is still within the `max` limit.
 *
 * @param ttlSec — how long the counter survives (default: 24 h)
 */
export async function rateLimit(opts: {
  action: string;
  userId: string;
  max: number;
  ttlSec?: number;
}): Promise<RateLimitResult> {
  const { action, userId, max, ttlSec = 24 * 60 * 60 } = opts;
  const day = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:${action}:${userId}:${day}`;

  const redis = getRedis();
  if (!redis) {
    return memoryCheck(key, max, ttlSec);
  }

  try {
    const count = (await redis.incr(key)) as number;

    // Set TTL only on first increment of the day
    if (count === 1) await redis.expire(key, ttlSec);

    // Read remaining TTL to compute reset time
    const remainingTtl = (await redis.ttl(key)) as number;
    const resetAt = new Date(
      Date.now() + (remainingTtl > 0 ? remainingTtl : ttlSec) * 1000,
    );

    return {
      ok: count <= max,
      count,
      remaining: Math.max(0, max - count),
      resetAt,
    };
  } catch {
    // Redis hiccup — fall back to memory so the user isn't blocked
    return memoryCheck(key, max, ttlSec);
  }
}
