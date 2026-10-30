/**
 * Context-preserving navigation helpers.
 * Prefer these over raw hrefs that drop persona / scope / period intent.
 */

import type { DashPeriod } from "@/lib/product/demo/dashboard";
import { resolvePeriodForRoute } from "./periodMap";

export type RadrNavParams = Record<string, string | undefined | null>;

export function buildAppHref(
  route: string,
  params?: RadrNavParams,
): string {
  const [path, existing] = route.split("?");
  const sp = new URLSearchParams(existing ?? "");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Decisions ledger — Needs your judgment band. */
export function decisionsNeedsYouHref(): string {
  return buildAppHref("/app/decisions", {
    band: "needs_you",
    stay: "1",
  });
}

export function decisionDetailHref(id: string): string {
  return `/app/decisions/${encodeURIComponent(id)}`;
}

export function controlCenterHref(): string {
  return buildAppHref("/app", { stay: "1" });
}

export function valueHref(params?: RadrNavParams): string {
  return buildAppHref("/app/value", { stay: "1", ...params });
}

export function liveHref(params?: RadrNavParams): string {
  return buildAppHref("/app/live", params);
}

export function operationsHref(params?: RadrNavParams): string {
  return buildAppHref("/app/service", params);
}

export function intelligenceHref(params?: RadrNavParams): string {
  return buildAppHref("/app/intelligence", { stay: "1", ...params });
}

export function dataHealthHref(params?: RadrNavParams): string {
  return buildAppHref("/app/data-health", { stay: "1", ...params });
}

export function locationsHref(params?: RadrNavParams): string {
  return buildAppHref("/app/locations", params);
}

/**
 * Period to apply when entering a route (intentional mapping).
 * Callers that own setPeriod should apply this before/during navigation.
 */
export function periodForNavigation(
  route: string,
  currentPeriod: DashPeriod,
): DashPeriod {
  return resolvePeriodForRoute(route, currentPeriod);
}
