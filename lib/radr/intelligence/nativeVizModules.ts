/**
 * Intelligence modules with native trajectory / bridge / scatter / flow viz.
 * Hub landing prefers these over metric-only cards.
 */

export const NATIVE_INTEL_VIZ_MODULES = new Set([
  "live_service",
  "live_revenue_trajectory",
  "revenue_pace_day",
  "revenue_pace_mtd",
  "settlement_bridge",
  "menu_contribution",
  "money_flow",
  "order_flow",
  "delivery_flow",
  "tonight_demand",
  "cancellation_intel",
  "hotel_pickup",
  "hotel_channel_mix",
]);

export function intelModuleHasNativeViz(moduleId: string): boolean {
  return NATIVE_INTEL_VIZ_MODULES.has(moduleId);
}

export function partitionIntelModules<T extends { id: string }>(
  modules: T[],
): { viz: T[]; text: T[] } {
  const viz: T[] = [];
  const text: T[] = [];
  for (const m of modules) {
    if (intelModuleHasNativeViz(m.id)) viz.push(m);
    else text.push(m);
  }
  return { viz, text };
}
