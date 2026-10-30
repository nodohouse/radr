/** URL-safe org slug from name + short suffix for uniqueness. */
export function slugifyOrgName(name: string, suffix?: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const safe = base || "org";
  if (!suffix) return safe;
  return `${safe}-${suffix}`;
}
