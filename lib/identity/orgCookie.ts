/** Active organization cookie — validated against membership server-side. */
export const ACTIVE_ORG_COOKIE = "radr-org-id";

export function parseActiveOrgCookie(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ACTIVE_ORG_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(ACTIVE_ORG_COOKIE.length + 1));
  return value || null;
}
