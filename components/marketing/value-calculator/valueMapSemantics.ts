import type { CategoryId, CategoryResult, VerticalId } from "@/lib/marketing/value-calculator";

/** Analytical / modeled revenue categories → RADR blue. Recovery → green. */
export function isAnalyticalCategory(id: CategoryId): boolean {
  return (
    id === "revenue_pricing" ||
    id === "channel_mix" ||
    id === "perishable"
  );
}

export function categoryTone(
  id: CategoryId,
): "green" | "blue" {
  return isAnalyticalCategory(id) ? "blue" : "green";
}

export function categoryDisplayLabel(
  c: CategoryResult,
  vertical: VerticalId | null,
): string {
  if (vertical === "hotel") {
    if (c.id === "perishable") return "Perishable room revenue";
    if (c.id === "readiness") return "Room readiness";
    if (c.id === "revenue_pricing") return "Pricing / yield";
    if (c.id === "guest_experience") return "Guest experience";
  }
  if (vertical === "restaurant") {
    if (c.id === "revenue_pricing") return "Pricing / menu mix";
    if (c.id === "perishable") return "Perishable capacity";
    if (c.id === "guest_experience") return "Guest / revenue";
  }
  return c.label;
}

export function evidenceLabel(n: number) {
  if (n >= 0.65) return "HIGH";
  if (n >= 0.4) return "MEDIUM";
  return "LOW";
}

export function proveLabel(timeToProve: number) {
  if (timeToProve >= 0.8) return "FAST";
  if (timeToProve >= 0.55) return "MEDIUM";
  return "SLOWER";
}

export function effortLabel(effort: number) {
  if (effort <= 0.4) return "LOW";
  if (effort <= 0.55) return "MEDIUM";
  return "HIGHER";
}

/** Fixed 6 collision-safe sectors (degrees from +x, CSS y down). */
export const MAP_SECTOR_DEG = [-90, -30, 30, 90, 150, -150] as const;

export function reasonKind(
  reason: string,
): "supplied" | "assumed" | "unknown" {
  const r = reason.toLowerCase();
  if (r.includes("assumed") || r.includes("unknown")) return "assumed";
  if (r.includes("not") && r.includes("know")) return "unknown";
  return "supplied";
}
