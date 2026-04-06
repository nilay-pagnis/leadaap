import type { NextRequest } from "next/server";

/**
 * In-memory sliding window rate limiter for middleware.
 * Note: on serverless, each instance has its own map — limits are per-instance, not global.
 * For strict global limits, use Redis (e.g. Upstash) later.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 8_000;

function pruneOld(now: number, windowMs: number) {
  const cutoff = now - windowMs;
  if (buckets.size <= MAX_KEYS) return;
  for (const [k, hits] of Array.from(buckets.entries())) {
    const next = hits.filter((t) => t > cutoff);
    if (next.length === 0) buckets.delete(k);
    else buckets.set(k, next);
  }
}

export function slidingWindowAllow(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  pruneOld(now, windowMs);

  const prev = buckets.get(key)?.filter((t) => t > cutoff) ?? [];
  if (prev.length >= max) {
    const oldest = Math.min(...prev);
    const retryMs = Math.max(windowMs - (now - oldest), 1000);
    return { ok: false, retryAfterSec: Math.ceil(retryMs / 1000) };
  }
  prev.push(now);
  buckets.set(key, prev);
  return { ok: true };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** POST /api rate limits (per IP). */
export function rateLimitApiPost(
  request: NextRequest,
  pathname: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip = clientIp(request);

  if (pathname === "/api/public/submit-lead") {
    return slidingWindowAllow(`post:submit-lead:${ip}`, 40, 60_000);
  }
  if (pathname === "/api/contact") {
    return slidingWindowAllow(`post:contact:${ip}`, 12, 60_000);
  }
  if (pathname === "/api/payments/submit") {
    return slidingWindowAllow(`post:payments:${ip}`, 15, 60_000);
  }
  return { ok: true };
}
