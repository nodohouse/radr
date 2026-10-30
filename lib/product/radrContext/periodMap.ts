/**
 * Route-aware period mapping — does not invent context.
 * Pages must not silently overwrite global period on mount;
 * navigation / shell sync uses this deliberately.
 */

import type { DashPeriod } from "@/lib/product/demo/dashboard";

export type RoutePeriodClass =
  | "control_center"
  | "live"
  | "operations"
  | "decisions"
  | "value"
  | "locations"
  | "memory"
  | "other";

export function routePeriodClass(pathname: string): RoutePeriodClass {
  const p = pathname.split("?")[0] || pathname;
  if (p === "/app" || p === "/app/") return "control_center";
  if (p.startsWith("/app/live") || p.startsWith("/app/lab/live-v2")) {
    return "live";
  }
  if (
    p.startsWith("/app/service") ||
    p.startsWith("/app/house") ||
    p.includes("house-readiness")
  ) {
    return "operations";
  }
  if (p.startsWith("/app/decisions")) return "decisions";
  if (p.startsWith("/app/value")) return "value";
  if (p.startsWith("/app/locations")) return "locations";
  if (p.startsWith("/app/memory")) return "memory";
  return "other";
}

/**
 * Map the user's current period into a period that is semantically valid
 * for the destination route. Prefer preserving when already valid.
 */
export function resolvePeriodForRoute(
  pathname: string,
  contextPeriod: DashPeriod,
): DashPeriod {
  const cls = routePeriodClass(pathname);

  switch (cls) {
    case "live":
    case "operations":
      if (
        contextPeriod === "mtd" ||
        contextPeriod === "ytd" ||
        contextPeriod === "wtd"
      ) {
        return "today";
      }
      return contextPeriod === "yesterday" ? "yesterday" : "today";

    case "decisions":
      // Live (today on CC) → Today; keep MTD if user already chose it.
      if (contextPeriod === "yesterday") return "today";
      return contextPeriod;

    case "value":
      if (
        contextPeriod === "today" ||
        contextPeriod === "yesterday" ||
        contextPeriod === "wtd"
      ) {
        return "mtd";
      }
      return contextPeriod;

    case "locations":
      // Portfolio body is MTD economics; do not overwrite global period.
      return contextPeriod;

    case "memory":
      return contextPeriod;

    case "control_center":
    case "other":
    default:
      return contextPeriod;
  }
}
