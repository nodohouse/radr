/**
 * Intelligence module registry — single catalog for hub + Control Center pins.
 * RADR owns which modules exist. Users choose which matter (max 6 on CC).
 */

import type { RoleView } from "@/lib/product/types";

export type IntelCategory =
  | "overview"
  | "live"
  | "revenue"
  | "menu"
  | "reservations"
  | "labor"
  | "procurement"
  | "payments"
  | "channels";

export type IntelModuleSize = "full" | "half" | "compact";

export type IntelJudgment =
  | "NO_ACTION"
  | "WATCHING"
  | "DECISION_FORMED"
  | "VERIFIED_OUTCOME"
  | "NEEDS_DATA";

export type IntelModuleDef = {
  id: string;
  title: string;
  description: string;
  category: IntelCategory;
  requiredEvidence: string[];
  supportedRoles: RoleView[] | "all";
  defaultSize: IntelModuleSize;
  pinningSupported: boolean;
  /** Higher = earlier in Suggested for role */
  rolePriority: Partial<Record<RoleView, number>>;
};

export const INTEL_CATEGORIES: {
  id: IntelCategory;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "live", label: "Live operations" },
  { id: "revenue", label: "Revenue · demand" },
  { id: "menu", label: "Menu · margin" },
  { id: "reservations", label: "Reservations · guests" },
  { id: "labor", label: "Labor" },
  { id: "procurement", label: "Procurement" },
  { id: "payments", label: "Payments · reconciliation" },
  { id: "channels", label: "Channels" },
];

export const MAX_CONTROL_CENTER_PINS = 6;
export const INTEL_PINS_KEY = "radr.intelligence.pins.v1";

export const INTELLIGENCE_REGISTRY: Record<string, IntelModuleDef> = {
  live_service: {
    id: "live_service",
    title: "Live Service",
    description: "Actual vs forecast through the current service.",
    category: "live",
    requiredEvidence: ["pos", "reservations", "kds"],
    supportedRoles: "all",
    defaultSize: "full",
    pinningSupported: true,
    rolePriority: { gm: 100, coo: 90, fb_operator: 95, head_chef: 80, cfo: 20 },
  },

  live_revenue_trajectory: {
    id: "live_revenue_trajectory",
    title: "Live revenue trajectory",
    description: "Observed to forecast from open through close.",
    category: "live",
    requiredEvidence: ["pos"],
    supportedRoles: "all",
    defaultSize: "full",
    pinningSupported: true,
    rolePriority: { gm: 98, cfo: 70, coo: 85 },
  },
  money_flow: {
    id: "money_flow",
    title: "Money flow",
    description: "Gross to contribution pace with evidence classes.",
    category: "live",
    requiredEvidence: ["pos", "labor", "procurement"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 95, gm: 75, owner: 90 },
  },
  order_flow: {
    id: "order_flow",
    title: "Order flow",
    description: "Channel orders, revenue share, fee drag.",
    category: "live",
    requiredEvidence: ["pos", "delivery"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 80, fb_operator: 85 },
  },
  delivery_flow: {
    id: "delivery_flow",
    title: "Delivery stream",
    description: "Delivery surge, fees, kitchen load.",
    category: "channels",
    requiredEvidence: ["delivery"],
    supportedRoles: "all",
    defaultSize: "compact",
    pinningSupported: true,
    rolePriority: { gm: 70, cfo: 60 },
  },
  stock_watch: {
    id: "stock_watch",
    title: "Stock watch",
    description: "Modeled or observed stock risk linked to menu.",
    category: "procurement",
    requiredEvidence: ["procurement", "pos"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { head_chef: 95, gm: 78 },
  },
  demand_outlook: {
    id: "demand_outlook",
    title: "Demand outlook",
    description: "Bookings, walk-ins, weather, and events combined.",
    category: "live",
    requiredEvidence: ["reservations"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 88, coo: 80 },
  },
  top_dishes: {
    id: "top_dishes",
    title: "Top Dishes",
    description: "Revenue, contribution, and kitchen-minute efficiency.",
    category: "menu",
    requiredEvidence: ["pos"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: {
      gm: 85,
      head_chef: 100,
      fb_operator: 90,
      cfo: 40,
      coo: 50,
    },
  },
  menu_contribution: {
    id: "menu_contribution",
    title: "Menu contribution",
    description: "Contribution vs popularity matrix.",
    category: "menu",
    requiredEvidence: ["pos", "procurement"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { head_chef: 90, cfo: 55, gm: 60 },
  },
  revenue_vs_forecast: {
    id: "revenue_vs_forecast",
    title: "Revenue vs forecast",
    description: "Period revenue against the operating forecast.",
    category: "revenue",
    requiredEvidence: ["pos"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 90, coo: 70, gm: 65, owner: 80 },
  },
  covers_vs_forecast: {
    id: "covers_vs_forecast",
    title: "Covers vs forecast",
    description: "Guest volume against expected covers.",
    category: "revenue",
    requiredEvidence: ["pos", "reservations"],
    supportedRoles: "all",
    defaultSize: "compact",
    pinningSupported: true,
    rolePriority: { gm: 70, coo: 65 },
  },
  settlement_bridge: {
    id: "settlement_bridge",
    title: "Settlement bridge",
    description: "POS expected → processor → accounting.",
    category: "payments",
    requiredEvidence: ["pos", "accounting"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 95, finance: 100 },
  },
  supplier_variance: {
    id: "supplier_variance",
    title: "Supplier variance",
    description: "Invoice vs contracted rates.",
    category: "procurement",
    requiredEvidence: ["procurement", "accounting"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 85, finance: 90 },
  },
  cost_movers: {
    id: "cost_movers",
    title: "Cost movers",
    description: "Vendor SKU price drift, fill rate, and exposure.",
    category: "procurement",
    requiredEvidence: ["procurement", "accounting"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 92, coo: 88, finance: 90, gm: 45 },
  },
  verified_value_trend: {
    id: "verified_value_trend",
    title: "Verified Value trend",
    description: "Cumulative sealed outcomes this period.",
    category: "overview",
    requiredEvidence: [],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 100, owner: 95, coo: 60 },
  },
  location_exposure: {
    id: "location_exposure",
    title: "Location exposure",
    description: "Active exposure across the portfolio.",
    category: "overview",
    requiredEvidence: [],
    supportedRoles: ["cfo", "coo", "owner", "regional", "finance"],
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 80, coo: 85, owner: 75 },
  },
  kitchen_pressure: {
    id: "kitchen_pressure",
    title: "Kitchen pressure",
    description: "Modeled load vs intervention threshold.",
    category: "live",
    requiredEvidence: ["kds", "pos"],
    supportedRoles: "all",
    defaultSize: "compact",
    pinningSupported: true,
    rolePriority: { head_chef: 95, gm: 75, coo: 55 },
  },
  booking_pace: {
    id: "booking_pace",
    title: "Booking pace",
    description: "Reservations vs comparable services.",
    category: "reservations",
    requiredEvidence: ["reservations"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 55, revenue_manager: 90, coo: 50 },
  },
  labor_productivity: {
    id: "labor_productivity",
    title: "Labor productivity",
    description: "Revenue and covers per labor hour.",
    category: "labor",
    requiredEvidence: ["labor", "pos"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { coo: 75, gm: 50, cfo: 45 },
  },
  channel_mix: {
    id: "channel_mix",
    title: "Channel mix",
    description: "Direct vs delivery contribution share.",
    category: "channels",
    requiredEvidence: ["pos", "delivery"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 50, gm: 45, revenue_manager: 70 },
  },
  revenue_pace_day: {
    id: "revenue_pace_day",
    title: "Revenue pace · today",
    description: "Actual vs expected-now vs close vs daily target.",
    category: "revenue",
    requiredEvidence: ["pos", "forecast"],
    supportedRoles: "all",
    defaultSize: "full",
    pinningSupported: true,
    rolePriority: { gm: 95, cfo: 70, coo: 80, owner: 75 },
  },
  revenue_pace_mtd: {
    id: "revenue_pace_mtd",
    title: "Revenue pace · MTD",
    description: "MTD actual, plan, and month-end forecast.",
    category: "revenue",
    requiredEvidence: ["pos", "forecast", "accounting"],
    supportedRoles: ["cfo", "owner", "coo", "finance"],
    defaultSize: "full",
    pinningSupported: true,
    rolePriority: { cfo: 100, owner: 90, finance: 95 },
  },
  tonight_demand: {
    id: "tonight_demand",
    title: "Tonight's demand",
    description: "Bookings × event × weather combined expectation.",
    category: "live",
    requiredEvidence: ["reservations", "weather", "events"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 88, coo: 85, fb_operator: 70 },
  },
  weather_context: {
    id: "weather_context",
    title: "Weather context",
    description: "Weather as operational impact — not a weather widget.",
    category: "live",
    requiredEvidence: ["weather"],
    supportedRoles: "all",
    defaultSize: "compact",
    pinningSupported: true,
    rolePriority: { gm: 55, coo: 50 },
  },
  event_context: {
    id: "event_context",
    title: "Event context",
    description: "Local events as demand drivers with historical association.",
    category: "revenue",
    requiredEvidence: ["events"],
    supportedRoles: "all",
    defaultSize: "compact",
    pinningSupported: true,
    rolePriority: { gm: 60, revenue_manager: 75, coo: 55 },
  },
  cancellation_intel: {
    id: "cancellation_intel",
    title: "Cancellation intelligence",
    description: "Released covers, recovered vs still exposed.",
    category: "reservations",
    requiredEvidence: ["reservations", "pos"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 80, coo: 75, cfo: 55 },
  },

  /* —— Hotel operating world —— */
  room_readiness: {
    id: "room_readiness",
    title: "Room readiness",
    description: "Ready vs arrivals · at-risk check-ins · HK bottleneck.",
    category: "live",
    requiredEvidence: ["pms", "housekeeping"],
    supportedRoles: "all",
    defaultSize: "full",
    pinningSupported: true,
    rolePriority: { gm: 100, coo: 95, revenue_manager: 40 },
  },
  hotel_pickup: {
    id: "hotel_pickup",
    title: "Pickup & occupancy",
    description: "Tonight occupancy expectation vs pace and events.",
    category: "revenue",
    requiredEvidence: ["pms", "channels"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 90, revenue_manager: 100, cfo: 55 },
  },
  hotel_occ_adr_revpar: {
    id: "hotel_occ_adr_revpar",
    title: "Occ · ADR · RevPAR",
    description: "Core hotel economics vs budget and pace.",
    category: "revenue",
    requiredEvidence: ["pms"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { cfo: 95, revenue_manager: 95, gm: 80, owner: 90 },
  },
  hk_productivity: {
    id: "hk_productivity",
    title: "Housekeeping productivity",
    description: "Rooms per shift · floor lag · staffing Decision.",
    category: "labor",
    requiredEvidence: ["housekeeping", "pms"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 85, coo: 90 },
  },
  hotel_channel_mix: {
    id: "hotel_channel_mix",
    title: "Distribution mix",
    description: "Direct vs OTA net contribution and hold windows.",
    category: "channels",
    requiredEvidence: ["channels", "pms"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { revenue_manager: 95, cfo: 70, gm: 75 },
  },
  hotel_cancellation: {
    id: "hotel_cancellation",
    title: "Cancellation recovery",
    description: "Released nights · recover vs orphan exposure.",
    category: "reservations",
    requiredEvidence: ["pms", "channels"],
    supportedRoles: "all",
    defaultSize: "half",
    pinningSupported: true,
    rolePriority: { gm: 70, revenue_manager: 85, cfo: 50 },
  },
};

/** Category pills — labels remapped per vertical. */
export function intelCategoriesForVertical(
  vertical: "restaurant" | "hotel",
): { id: IntelCategory; label: string }[] {
  if (vertical === "hotel") {
    return [
      { id: "overview", label: "Overview" },
      { id: "live", label: "Live operations" },
      { id: "revenue", label: "Revenue & demand" },
      { id: "reservations", label: "Arrivals & stays" },
      { id: "labor", label: "Housekeeping" },
      { id: "channels", label: "Distribution" },
      { id: "payments", label: "Payments & reconciliation" },
    ];
  }
  return INTEL_CATEGORIES;
}

export function listIntelligenceModules(): IntelModuleDef[] {
  return Object.values(INTELLIGENCE_REGISTRY);
}

export function getIntelligenceModule(id: string): IntelModuleDef | null {
  return INTELLIGENCE_REGISTRY[id] ?? null;
}

export function modulesForCategory(
  category: IntelCategory | "all",
): IntelModuleDef[] {
  const all = listIntelligenceModules();
  if (category === "all") return all;
  return all.filter((m) => m.category === category);
}

export function suggestedModulesForRole(role: RoleView): IntelModuleDef[] {
  return listIntelligenceModules()
    .filter((m) => {
      if (m.supportedRoles === "all") return true;
      return m.supportedRoles.includes(role);
    })
    .map((m) => ({
      m,
      score: m.rolePriority[role] ?? 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.m);
}
