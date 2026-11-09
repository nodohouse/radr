/** Publish a locale only when the rendered editorial copy actually exists in it. */
const ENGLISH_EDITORIAL = [
  "/", "/contact", "/demo", "/product", "/solutions", "/pricing", "/company", "/value-calculator",
  "/radr-explained", "/developers", "/resources/hospitality-decision-playbook",
  "/security", "/privacy", "/terms", "/imprint", "/cookies", "/research",
] as const;

export function englishEditorialOnly(path: string): boolean {
  const normalized = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return ENGLISH_EDITORIAL.some(prefix => normalized === prefix || prefix !== "/" && normalized.startsWith(`${prefix}/`));
}
