/**
 * modulesForIntelligenceCategory — strict category routing.
 * Overview uses role recommendations. Other categories never leak Live Service
 * unless the category is live / reservations.
 */

import type { IntelCategory } from "@/lib/radr/intelligence/moduleRegistry";
import { modulesForCategory } from "@/lib/radr/intelligence/moduleRegistry";

const RESTAURANT_MAP: Record<Exclude<IntelCategory, "overview">, string[]> = {
  live: [
    "live_service",
    "revenue_pace_day",
    "tonight_demand",
    "weather_context",
    "kitchen_pressure",
    "booking_pace",
  ],
  revenue: [
    "revenue_pace_mtd",
    "revenue_vs_forecast",
    "covers_vs_forecast",
    "booking_pace",
    "event_context",
    "channel_mix",
    "verified_value_trend",
  ],
  menu: ["top_dishes", "menu_contribution"],
  reservations: [
    "cancellation_intel",
    "booking_pace",
    "covers_vs_forecast",
    "tonight_demand",
  ],
  labor: ["labor_productivity", "kitchen_pressure", "covers_vs_forecast"],
  procurement: ["cost_movers", "supplier_variance", "stock_watch", "menu_contribution"],
  payments: ["settlement_bridge"],
  channels: ["channel_mix", "settlement_bridge", "location_exposure"],
};

const HOTEL_MAP: Record<Exclude<IntelCategory, "overview">, string[]> = {
  live: [
    "room_readiness",
    "revenue_pace_day",
    "hk_productivity",
    "hotel_pickup",
    "weather_context",
  ],
  revenue: [
    "hotel_occ_adr_revpar",
    "hotel_pickup",
    "revenue_pace_mtd",
    "event_context",
    "verified_value_trend",
  ],
  menu: ["room_readiness", "hotel_occ_adr_revpar"],
  reservations: [
    "hotel_cancellation",
    "hotel_pickup",
    "room_readiness",
  ],
  labor: ["hk_productivity", "room_readiness"],
  procurement: ["hotel_channel_mix"],
  payments: ["settlement_bridge", "verified_value_trend"],
  channels: [
    "hotel_channel_mix",
    "hotel_cancellation",
    "location_exposure",
  ],
};

export function modulesForIntelligenceCategory(
  category: IntelCategory,
  overviewIds: string[],
  vertical: "restaurant" | "hotel" = "restaurant",
): string[] {
  if (category === "overview") return overviewIds;

  const map = vertical === "hotel" ? HOTEL_MAP : RESTAURANT_MAP;
  return map[category] ?? modulesForCategory(category).map((m) => m.id);
}
