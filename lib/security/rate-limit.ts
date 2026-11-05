/**
 * In-memory rate limiter for sensitive endpoints.
 * Production at scale should use Redis/Upstash; this is defense-in-depth for single-node / preview.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;
let lastSweepAt = 0;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  if (now - lastSweepAt >= 60000) {
    for (const [key, bucket] of buckets)
      if (bucket.resetAt <= now) buckets.delete(key);
    lastSweepAt = now;
  }
  const existing = buckets.get(opts.key);

  if (!existing || existing.resetAt <= now) {
    if (!existing && buckets.size >= MAX_BUCKETS)
      return { ok: false, remaining: 0, retryAfterSec: 60 };
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: opts.limit - existing.count,
    retryAfterSec: 0,
  };
}

/** Best-effort client key from request (IP-ish). Never trust for auth - only throttling. */
export function clientKeyFromRequest(req: Request, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

/** Test helper - clear buckets between tests. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
  lastSweepAt = 0;
}
