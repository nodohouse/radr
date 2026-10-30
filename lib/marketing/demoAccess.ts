/**
 * Public → authenticated demo access helpers.
 * Marketing may SHOW RADR. Only signup unlocks /app.
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
 * Localized signup URL that unlocks the demo after account creation.
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
