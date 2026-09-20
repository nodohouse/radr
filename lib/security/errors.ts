import type { NextResponse } from "next/server";

/** Opaque client-facing errors. Log details server-side only. */
export const CLIENT_ERRORS = {
  unauthorized: "Unauthorized",
  forbidden: "We couldn't complete that request.",
  notFound: "Not found",
  badRequest: "Invalid request",
  rateLimited: "Too many requests. Please try again shortly.",
  generic: "We couldn't complete that request.",
} as const;

export function correlationId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logServerError(
  scope: string,
  error: unknown,
  id = correlationId(),
): string {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[radr:${scope}] ${id}`, message);
  return id;
}

export function withRateLimitHeaders(
  res: NextResponse,
  retryAfterSec: number,
): NextResponse {
  if (retryAfterSec > 0) {
    res.headers.set("Retry-After", String(retryAfterSec));
  }
  return res;
}
