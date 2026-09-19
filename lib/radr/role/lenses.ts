/**
 * RoleLens registry — known / missed / predicted + Control Center modules.
 */

import {
  roleLensSchema,
  type ControlCenterModule,
  type RoleLens,
} from "@/lib/radr/domain/roleLens";
import type { DemoVertical } from "@/lib/radr/operating/resolveProfile";
import type { RoleView } from "@/lib/product/types";

function lens(partial: Parameters<typeof roleLensSchema.parse>[0]): RoleLens {
  return roleLensSchema.parse(partial);
}

export const ROLE_LENSES: RoleLens[] = [
  // Restaurant
  lens({
    roleId: "gm",
    verticals: ["restaurant_full_service"],
    primaryResponsibility: "Run tonight's service well",
    decisions: ["Staffing", "Terrace", "Recovery", "Guest exceptions"],
    knownMetrics: ["covers", "reservations", "labor", "sales"],
    missedSignals: ["walk-ins", "contribution", "table recovery", "stockout timing"],
    predictedSignals: ["walk_ins", "no_show", "peak_pressure", "covers"],
    controlCenterModules: ["pre_shift", "attention", "handling", "predictions"],
    typicalActions: ["Approve staffing", "Open terrace", "Recover table"],
    verifiedOutcomes: ["Verified recovery", "Service within plan"],
    metricIds: ["covers", "contribution", "peak_pressure", "cancellation_recovery"],
    predictionTypes: ["walk_ins", "no_show", "service_pressure"],
  }),
  lens({
    roleId: "cfo",
    verticals: ["restaurant_full_service"],
    primaryResponsibility: "Find leakage and explain margin",
    decisions: ["Supplier credits", "Settlements", "Labor overrun"],
    knownMetrics: ["revenue", "labor", "food_cost", "pnl"],
    missedSignals: ["delivery commission", "contract variance", "menu contribution"],
    predictedSignals: ["close_contribution", "supplier_recovery"],
    controlCenterModules: ["contribution", "financial_exceptions", "fleet_health"],
    typicalActions: ["Approve credit chase", "Flag settlement"],
    verifiedOutcomes: ["Verified credits", "Reconciled variance"],
    metricIds: ["contribution", "labor_pct", "verified_value"],
    predictionTypes: ["close_contribution", "margin_variance"],
  }),
  lens({
    roleId: "head_chef",
    verticals: ["restaurant_full_service"],
    primaryResponsibility: "Protect the kitchen tonight",
    decisions: ["Prep", "86", "Allergies", "Substitutions"],
    knownMetrics: ["prep", "stock", "reservations"],
    missedSignals: ["dish sellout timing", "ingredient demand", "waste economics"],
    predictedSignals: ["dish_demand", "stockout", "ticket_pressure"],
    controlCenterModules: ["kitchen_pressure", "attention", "predictions"],
    typicalActions: ["86 dish", "Reallocate prep"],
    verifiedOutcomes: ["No material stockout"],
    metricIds: ["covers", "peak_pressure"],
    predictionTypes: ["dish_demand", "stockout"],
  }),
  lens({
    roleId: "owner",
    verticals: ["restaurant_full_service"],
    primaryResponsibility: "Understand the business in five seconds",
    decisions: ["Where to intervene", "Capital allocation"],
    knownMetrics: ["sales", "covers", "labor_pct"],
    missedSignals: ["which decisions moved margin", "recoverable leakage"],
    predictedSignals: ["contribution_forecast", "value_at_risk"],
    controlCenterModules: ["fleet_health", "contribution", "attention"],
    typicalActions: ["Escalate outlier location"],
    verifiedOutcomes: ["Verified Value"],
    metricIds: ["contribution", "verified_value", "covers"],
    predictionTypes: ["contribution_forecast"],
  }),
  // Hotel
  lens({
    roleId: "hotel_gm",
    verticals: ["boutique_hotel"],
    primaryResponsibility: "Run the property successfully today",
    decisions: ["Housekeeping sequence", "Recovery path", "Guest moments"],
    knownMetrics: ["occupancy", "arrivals", "departures", "adr", "readiness"],
    missedSignals: ["readiness risk", "OTA contribution quality", "overnight context"],
    predictedSignals: ["room_readiness_risk", "refill_probability", "upgrade"],
    controlCenterModules: [
      "house_brief",
      "overnight",
      "in_house",
      "attention",
      "handling",
      "arrival_moments",
      "property_units",
      "predictions",
    ],
    typicalActions: ["Approve HK swap", "Hold direct inventory"],
    verifiedOutcomes: ["Verified late-checkout", "Recovered room night"],
    metricIds: [
      "occupancy",
      "arrivals",
      "room_readiness",
      "adr",
      "revpar",
      "direct_share",
    ],
    predictionTypes: ["room_readiness_risk", "refill_probability", "upgrade"],
  }),
  lens({
    roleId: "revenue_manager",
    verticals: ["boutique_hotel", "serviced_apartments"],
    primaryResponsibility: "Optimize inventory and pricing",
    decisions: ["Rate", "Channel release", "Min stay", "Orphan nights"],
    knownMetrics: ["occupancy", "adr", "revpar", "pickup", "pace"],
    missedSignals: ["net channel contribution", "refill probability", "direct conversion"],
    predictedSignals: ["occupancy", "cancellation", "pickup", "orphan_night"],
    controlCenterModules: [
      "revenue_pace",
      "channel_mix",
      "attention",
      "predictions",
      "orphan_nights",
    ],
    typicalActions: ["Hold OTA 90 min", "Open 1-night stay"],
    verifiedOutcomes: ["Verified refill", "Direct conversion"],
    metricIds: ["occupancy", "adr", "revpar", "pickup", "direct_share", "orphan_nights"],
    predictionTypes: ["occupancy", "cancellation", "orphan_night", "refill_probability"],
  }),
  lens({
    roleId: "housekeeping_manager",
    verticals: ["boutique_hotel", "serviced_apartments"],
    primaryResponsibility: "Ready the next rooms/units on time",
    decisions: ["Cleaner allocation", "Sequence", "Maintenance handoff"],
    knownMetrics: ["dirty", "clean", "inspected", "departures"],
    missedSignals: ["late probability", "arrival urgency", "duration by room"],
    predictedSignals: ["completion_time", "late_room", "workload"],
    controlCenterModules: [
      "housekeeping_board",
      "attention",
      "predictions",
      "turnover_board",
    ],
    typicalActions: ["Reallocate cleaners", "Escalate maintenance"],
    verifiedOutcomes: ["Arrival on-time readiness"],
    metricIds: ["room_readiness", "departures", "arrivals", "turnovers", "unit_readiness"],
    predictionTypes: ["room_readiness_risk", "turnover_completion", "cleaning_duration"],
  }),
  lens({
    roleId: "cfo",
    verticals: ["boutique_hotel", "serviced_apartments"],
    primaryResponsibility: "Revenue quality and reconciliation",
    decisions: ["Exceptions", "Distribution fees", "Close"],
    knownMetrics: ["room_revenue", "expenses", "occupancy"],
    missedSignals: ["OTA effective commission", "HK cost / occupied room", "settlement"],
    predictedSignals: ["close_contribution", "distribution_expense"],
    controlCenterModules: [
      "contribution",
      "financial_exceptions",
      "channel_mix",
      "predictions",
    ],
    typicalActions: ["Chase settlement", "Flag commission variance"],
    verifiedOutcomes: ["Verified contribution"],
    metricIds: ["contribution", "distribution_cost", "verified_value", "adr"],
    predictionTypes: ["close_contribution", "distribution_expense"],
  }),
  // Residences ops — use gm as operations manager lens
  lens({
    roleId: "gm",
    verticals: ["serviced_apartments", "vacation_rental"],
    primaryResponsibility: "Run stays and turnovers correctly today",
    decisions: ["Turnover sequence", "Maintenance", "Guest support", "Orphan fill"],
    knownMetrics: ["check_ins", "check_outs", "cleaning", "maintenance"],
    missedSignals: ["late turnover risk", "arrival/cleaning conflict", "vacant night sell"],
    predictedSignals: ["turnover_completion", "unit_readiness", "orphan_night"],
    controlCenterModules: [
      "house_brief",
      "turnover_board",
      "attention",
      "handling",
      "predictions",
      "orphan_nights",
    ],
    typicalActions: ["Reallocate cleaner", "Escalate maintenance", "Open orphan night"],
    verifiedOutcomes: ["On-time check-in", "Verified orphan fill"],
    metricIds: [
      "occupancy",
      "turnovers",
      "unit_readiness",
      "orphan_nights",
      "maintenance_blocks",
    ],
    predictionTypes: ["turnover_completion", "orphan_night", "unit_readiness"],
  }),
  lens({
    roleId: "owner",
    verticals: ["serviced_apartments", "vacation_rental", "boutique_hotel"],
    primaryResponsibility: "Portfolio value and contribution",
    decisions: ["Which units/properties need capital or intervention"],
    knownMetrics: ["revenue", "occupancy", "adr"],
    missedSignals: ["unit contribution", "downtime economics", "channel leakage"],
    predictedSignals: ["unit_demand", "contribution"],
    controlCenterModules: ["portfolio_strip", "contribution", "attention"],
    typicalActions: ["Review outlier unit"],
    verifiedOutcomes: ["Verified Value"],
    metricIds: ["occupancy", "adr", "contribution", "verified_value"],
    predictionTypes: ["contribution_forecast"],
  }),
];

export function roleLensFor(
  roleId: string,
  vertical: string,
): RoleLens | null {
  return (
    ROLE_LENSES.find(
      (l) => l.roleId === roleId && l.verticals.includes(vertical),
    ) ?? null
  );
}

export function modulesForRole(
  roleId: string,
  vertical: string,
): ControlCenterModule[] {
  return roleLensFor(roleId, vertical)?.controlCenterModules ?? [];
}

/** Demo role groups filtered by active vertical. */
export function demoRoleGroupsForVertical(vertical: DemoVertical): {
  label: string;
  roles: RoleView[];
}[] {
  if (vertical === "boutique_hotel") {
    return [
      {
        label: "Property",
        roles: ["hotel_gm", "housekeeping_manager", "revenue_manager"],
      },
      { label: "Finance", roles: ["cfo", "finance"] },
      { label: "Executive", roles: ["owner"] },
    ];
  }
  if (vertical === "serviced_apartments") {
    return [
      {
        label: "Operations",
        roles: ["gm", "housekeeping_manager", "revenue_manager"],
      },
      { label: "Finance", roles: ["cfo", "finance"] },
      { label: "Executive", roles: ["owner"] },
    ];
  }
  return [
    { label: "Operations", roles: ["gm", "coo", "fb_operator", "regional"] },
    { label: "Finance", roles: ["cfo", "finance"] },
    { label: "Service", roles: ["head_chef", "kitchen", "host", "server"] },
    { label: "Executive", roles: ["owner"] },
  ];
}
