/**
 * Public → fictional demo access helpers.
 * Marketing shows RADR; the demo lead form issues a limited guest grant.
 */

import { safeInternalPath } from "@/lib/security/safe-redirect";

export const DEMO_ENTRY_DEFAULT = "/app/enter";

/** Safe internal destinations allowed after demo signup / login. */
export function safeDemoNext(
  candidate: string | null | undefined,
  fallback = DEMO_ENTRY_DEFAULT,
): string {
  const path = safeInternalPath(candidate, fallback);
  // Only allow product / onboarding destinations — never marketing loops.
  if (
    path === "/app" ||
    path.startsWith("/app/") ||
    path === "/onboarding" ||
    path.startsWith("/onboarding/") ||
    path === "/select-org" ||
    path.startsWith("/select-org/")
  ) {
    return path;
  }
  return fallback;
}

/**
 * Entry form for a fictional demo without creating a workspace account.
 * Use from marketing CTAs instead of linking /app directly.
 */
export function demoSignupHref(next: string = DEMO_ENTRY_DEFAULT): string {
  const dest = safeDemoNext(next, DEMO_ENTRY_DEFAULT);
  const params = new URLSearchParams({
    intent: "demo",
    next: dest,
  });
  return `/signup?${params.toString()}`;
}

export function demoLoginHref(next: string = DEMO_ENTRY_DEFAULT): string {
  const dest = safeDemoNext(next, DEMO_ENTRY_DEFAULT);
  const params = new URLSearchParams({ next: dest });
  return `/login?${params.toString()}`;
}
