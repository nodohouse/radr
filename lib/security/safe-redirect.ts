/**
 * Safe post-login redirects. Never allow open redirects to external hosts.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = "/onboarding",
): string {
  if (!candidate) return fallback;
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (/[\r\n\0]/.test(trimmed)) return fallback;
  // Block protocol-relative and scheme injection via encoded tricks
  try {
    const decoded = decodeURIComponent(trimmed);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) return fallback;
  } catch {
    return fallback;
  }
  return trimmed;
}
