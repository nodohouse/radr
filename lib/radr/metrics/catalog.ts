/**
 * Domain metric catalog — role × vertical KPIs.
 * Data-driven; Control Center / onboarding read from here.
 */

import {
  metricDefinitionSchema,
  type MetricDefinition,
} from "@/lib/radr/domain/metricDefinition";

function m(
  partial: Parameters<typeof metricDefinitionSchema.parse>[0],
): MetricDefinition {
  return metricDefinitionSchema.parse(partial);
}

/** Seed metrics across restaurant / hotel / serviced apartments. */
export const DOMAIN_METRICS: MetricDefinition[] = [
  // —— Restaurant ——
  m({
    id: "covers",
    verticals: ["restaurant_full_service", "bar"],
    roles: ["gm", "head_chef", "kitchen", "owner", "coo"],
    label: "Covers",
    unit: "count",
    priority: 10,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "contribution",
    verticals: ["restaurant_full_service", "boutique_hotel", "serviced_apartments"],
    roles: ["gm", "cfo", "finance", "owner", "coo"],
    label: "Contribution",
    unit: "euro",
    priority: 12,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "labor_pct",
    verticals: ["restaurant_full_service", "boutique_hotel"],
    roles: ["gm", "cfo", "owner", "coo"],
    label: "Labor %",
    unit: "percent",
    priority: 20,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "walk_ins_expected",
    verticals: ["restaurant_full_service"],
    roles: ["gm", "host"],
    label: "Expected walk-ins",
    unit: "count",
    priority: 15,
    intelligenceClass: "PREDICTED",
  }),
  m({
    id: "cancellation_recovery",
    verticals: ["restaurant_full_service", "boutique_hotel", "serviced_apartments"],
    roles: ["gm", "hotel_gm", "revenue_manager", "cfo"],
    label: "Cancellation exposure",
    unit: "euro",
    priority: 18,
    intelligenceClass: "MISSED",
  }),
  m({
    id: "peak_pressure",
    verticals: ["restaurant_full_service"],
    roles: ["gm", "head_chef", "kitchen"],
    label: "Peak pressure",
    unit: "text",
    priority: 16,
    intelligenceClass: "PREDICTED",
  }),
  // —— Hotel ——
  m({
    id: "occupancy",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments", "vacation_rental"],
    roles: ["hotel_gm", "gm", "revenue_manager", "owner", "cfo", "coo"],
    label: "Occupancy",
    unit: "percent",
    priority: 10,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "adr",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments", "vacation_rental"],
    roles: ["hotel_gm", "revenue_manager", "owner", "cfo"],
    label: "ADR",
    unit: "euro",
    priority: 11,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "revpar",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments", "vacation_rental"],
    roles: ["hotel_gm", "revenue_manager", "owner", "cfo"],
    label: "RevPAR",
    unit: "euro",
    priority: 12,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "arrivals",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments"],
    roles: ["hotel_gm", "gm", "housekeeping_manager"],
    label: "Arrivals",
    unit: "count",
    priority: 13,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "departures",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments"],
    roles: ["hotel_gm", "housekeeping_manager", "gm"],
    label: "Departures",
    unit: "count",
    priority: 14,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "room_readiness",
    verticals: ["boutique_hotel", "hotel"],
    roles: ["hotel_gm", "housekeeping_manager"],
    label: "Room readiness",
    unit: "count",
    priority: 12,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "direct_share",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments"],
    roles: ["hotel_gm", "revenue_manager", "cfo", "owner"],
    label: "Direct share",
    unit: "percent",
    priority: 22,
    intelligenceClass: "MISSED",
  }),
  m({
    id: "distribution_cost",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments"],
    roles: ["cfo", "finance", "revenue_manager", "owner"],
    label: "Distribution cost",
    unit: "euro",
    priority: 20,
    intelligenceClass: "MISSED",
  }),
  m({
    id: "pickup",
    verticals: ["boutique_hotel", "hotel", "serviced_apartments"],
    roles: ["revenue_manager", "hotel_gm"],
    label: "Pickup",
    unit: "count",
    priority: 16,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "overnight_incidents",
    verticals: ["boutique_hotel", "hotel"],
    roles: ["hotel_gm"],
    label: "Overnight incidents",
    unit: "count",
    priority: 17,
    intelligenceClass: "MISSED",
  }),
  // —— Serviced apartments ——
  m({
    id: "turnovers",
    verticals: ["serviced_apartments", "vacation_rental"],
    roles: ["gm", "housekeeping_manager"],
    label: "Turnovers",
    unit: "count",
    priority: 11,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "orphan_nights",
    verticals: ["serviced_apartments", "vacation_rental"],
    roles: ["revenue_manager", "gm", "owner", "cfo"],
    label: "Orphan nights",
    unit: "count",
    priority: 15,
    intelligenceClass: "MISSED",
  }),
  m({
    id: "unit_readiness",
    verticals: ["serviced_apartments", "vacation_rental"],
    roles: ["gm", "housekeeping_manager"],
    label: "Unit readiness",
    unit: "count",
    priority: 12,
    intelligenceClass: "KNOWN",
  }),
  m({
    id: "maintenance_blocks",
    verticals: ["serviced_apartments", "vacation_rental", "boutique_hotel"],
    roles: ["gm", "hotel_gm", "cfo", "owner"],
    label: "Maintenance blocks",
    unit: "count",
    priority: 18,
    intelligenceClass: "MISSED",
  }),
  m({
    id: "verified_value",
    verticals: [
      "restaurant_full_service",
      "boutique_hotel",
      "serviced_apartments",
    ],
    roles: ["gm", "hotel_gm", "cfo", "owner", "finance", "coo"],
    label: "Verified Value",
    unit: "euro",
    priority: 25,
    intelligenceClass: "VERIFIED",
  }),
];

export function metricsForRole(
  vertical: string,
  roleId: string,
): MetricDefinition[] {
  return DOMAIN_METRICS.filter(
    (x) =>
      x.verticals.includes(vertical) &&
      (x.roles.length === 0 || x.roles.includes(roleId)) &&
      x.visibility !== "hidden",
  ).sort((a, b) => a.priority - b.priority);
}

export function getMetricDefinition(id: string): MetricDefinition | undefined {
  return DOMAIN_METRICS.find((x) => x.id === id);
}
