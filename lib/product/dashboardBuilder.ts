/**
 * Dashboard builder — module library catalog.
 *
 * Every entry is a real, renderable module: either an Intelligence module from the
 * registry, or a builder-native widget (note, decisions, verified, memory).
 * No placeholder tiles.
 *
 * Vertical adapts categories + filters — one builder, two operating grammars.
 */

import {
  getIntelligenceModule,
  type IntelModuleSize,
} from "@/lib/radr/intelligence/moduleRegistry";
import { moduleTitle } from "@/lib/product/dashboards";
import type { SizeConstraints } from "@/lib/product/dashboardLayout";

export type BuilderCategoryId =
  | "metrics"
  | "revenue"
  | "contribution"
  | "labor"
  | "service"
  | "kitchen"
  | "guests"
  | "inventory"
  | "decisions"
  | "value"
  | "memory"
  | "charts"
  | "text"
  /** Hotel-native categories (same builder). */
  | "property"
  | "demand"
  | "rooms"
  | "housekeeping"
  | "front_office"
  | "channels"
  | "external";

export const BUILDER_CATEGORIES: { id: BuilderCategoryId; label: string }[] = [
  { id: "metrics", label: "KPIs" },
  { id: "revenue", label: "Revenue" },
  { id: "contribution", label: "Contribution" },
  { id: "labor", label: "Labor" },
  { id: "service", label: "Operations" },
  { id: "kitchen", label: "Kitchen" },
  { id: "guests", label: "Guests" },
  { id: "inventory", label: "Procurement" },
  { id: "decisions", label: "Decisions" },
  { id: "value", label: "Value" },
  { id: "memory", label: "Memory" },
  { id: "charts", label: "Charts" },
  { id: "text", label: "Live & notes" },
];

/** Hotel widget library — hotel-native labels, restaurant-only modules filtered out. */
export const HOTEL_BUILDER_CATEGORIES: {
  id: BuilderCategoryId;
  label: string;
}[] = [
  { id: "property", label: "Property performance" },
  { id: "revenue", label: "Revenue" },
  { id: "demand", label: "Demand" },
  { id: "rooms", label: "Rooms" },
  { id: "front_office", label: "Front office" },
  { id: "housekeeping", label: "Housekeeping" },
  { id: "guests", label: "Guests" },
  { id: "labor", label: "Labor" },
  { id: "channels", label: "Channels" },
  { id: "decisions", label: "Decisions" },
  { id: "value", label: "Value" },
  { id: "memory", label: "Memory" },
  { id: "external", label: "External" },
  { id: "charts", label: "Charts" },
  { id: "text", label: "Notes" },
];

/** Builder-native widgets (not Intelligence registry modules). */
export const NATIVE_WIDGETS: Record<
  string,
  { id: string; title: string; description: string }
> = {
  builder_text: {
    id: "builder_text",
    title: "Note",
    description: "A line of context, a target, or a shift briefing.",
  },
  builder_decisions: {
    id: "builder_decisions",
    title: "Needs you",
    description: "Decisions waiting on a human, ranked for your role.",
  },
  builder_verified: {
    id: "builder_verified",
    title: "Verified since last check",
    description: "Decisions whose outcome has been verified.",
  },
  builder_memory: {
    id: "builder_memory",
    title: "Operating memory",
    description: "What RADR learned from verified outcomes.",
  },
};

export function isNativeWidget(moduleId: string): boolean {
  return moduleId in NATIVE_WIDGETS;
}

export const CATEGORY_MODULES: Record<BuilderCategoryId, string[]> = {
  metrics: [
    "money_flow",
    "revenue_pace_day",
    "revenue_pace_mtd",
    "hotel_occ_adr_revpar",
    "location_exposure",
    "order_flow",
  ],
  revenue: [
    "revenue_vs_forecast",
    "covers_vs_forecast",
    "revenue_pace_day",
    "revenue_pace_mtd",
    "hotel_pickup",
    "event_context",
    "channel_mix",
    "hotel_channel_mix",
    "hotel_occ_adr_revpar",
  ],
  contribution: [
    "menu_contribution",
    "top_dishes",
    "money_flow",
    "cost_movers",
    "settlement_bridge",
  ],
  labor: ["labor_productivity", "hk_productivity"],
  service: [
    "live_service",
    "tonight_demand",
    "demand_outlook",
    "room_readiness",
    "order_flow",
    "delivery_flow",
    "weather_context",
  ],
  kitchen: ["kitchen_pressure", "top_dishes", "stock_watch"],
  guests: [
    "booking_pace",
    "cancellation_intel",
    "hotel_cancellation",
    "tonight_demand",
  ],
  inventory: ["stock_watch", "supplier_variance", "cost_movers"],
  decisions: ["builder_decisions", "supplier_variance", "settlement_bridge"],
  value: [
    "verified_value_trend",
    "builder_verified",
    "money_flow",
    "cost_movers",
  ],
  memory: ["builder_memory"],
  charts: [
    "live_revenue_trajectory",
    "revenue_vs_forecast",
    "covers_vs_forecast",
    "demand_outlook",
    "verified_value_trend",
    "hotel_pickup",
    "channel_mix",
    "hotel_channel_mix",
  ],
  text: ["builder_text"],
  property: [
    "hotel_occ_adr_revpar",
    "revenue_vs_forecast",
    "location_exposure",
    "verified_value_trend",
    "money_flow",
  ],
  demand: [
    "hotel_pickup",
    "hotel_occ_adr_revpar",
    "event_context",
    "hotel_cancellation",
    "demand_outlook",
    "weather_context",
  ],
  rooms: ["room_readiness", "hotel_occ_adr_revpar"],
  housekeeping: ["room_readiness", "hk_productivity", "labor_productivity"],
  front_office: [
    "hotel_pickup",
    "room_readiness",
    "hotel_occ_adr_revpar",
    "builder_decisions",
  ],
  channels: ["hotel_channel_mix", "channel_mix", "hotel_cancellation"],
  external: ["weather_context", "event_context"],
};

const HOTEL_ONLY = new Set([
  "room_readiness",
  "hk_productivity",
  "hotel_pickup",
  "hotel_occ_adr_revpar",
  "hotel_channel_mix",
  "hotel_cancellation",
]);

const RESTAURANT_ONLY = new Set([
  "live_service",
  "top_dishes",
  "menu_contribution",
  "kitchen_pressure",
  "covers_vs_forecast",
  "delivery_flow",
  "order_flow",
  "live_revenue_trajectory",
]);

export type CatalogEntry = {
  id: string;
  title: string;
  description: string;
};

export function catalogEntry(moduleId: string): CatalogEntry | null {
  const native = NATIVE_WIDGETS[moduleId];
  if (native) return native;
  const def = getIntelligenceModule(moduleId);
  if (!def) return null;
  return {
    id: def.id,
    title: moduleTitle(def.id),
    description: def.description,
  };
}

export type CatalogCategory = {
  id: BuilderCategoryId;
  label: string;
  entries: CatalogEntry[];
};

/** Categories with their entries for one vertical; empty categories are dropped. */
export function builderCatalog(
  vertical: "restaurant" | "hotel",
): CatalogCategory[] {
  const cats =
    vertical === "hotel" ? HOTEL_BUILDER_CATEGORIES : BUILDER_CATEGORIES;
  return cats
    .map((cat) => {
      const entries = CATEGORY_MODULES[cat.id]
        .filter((id) =>
          vertical === "hotel"
            ? !RESTAURANT_ONLY.has(id)
            : !HOTEL_ONLY.has(id),
        )
        .map(catalogEntry)
        .filter((e): e is CatalogEntry => e !== null);
      // Dedupe within category while preserving order
      const seen = new Set<string>();
      const unique = entries.filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
      return { ...cat, entries: unique };
    })
    .filter((c) => c.entries.length > 0);
}

/** Category label for a module (first match) — shown in the Properties panel. */
export function categoryOfModule(
  moduleId: string,
  vertical: "restaurant" | "hotel" = "restaurant",
): string {
  const cats =
    vertical === "hotel" ? HOTEL_BUILDER_CATEGORIES : BUILDER_CATEGORIES;
  for (const cat of cats) {
    if (CATEGORY_MODULES[cat.id]?.includes(moduleId)) return cat.label;
  }
  for (const cat of BUILDER_CATEGORIES) {
    if (CATEGORY_MODULES[cat.id].includes(moduleId)) return cat.label;
  }
  return "Module";
}

const DIMS_BY_SIZE: Record<IntelModuleSize, { w: number; h: number }> = {
  full: { w: 12, h: 3 },
  half: { w: 6, h: 2 },
  compact: { w: 4, h: 2 },
};

export function defaultDims(moduleId: string): { w: number; h: number } {
  if (moduleId === "builder_text") return { w: 4, h: 1 };
  if (isNativeWidget(moduleId)) return { w: 6, h: 2 };
  const def = getIntelligenceModule(moduleId);
  return DIMS_BY_SIZE[def?.defaultSize ?? "half"];
}

/**
 * Size floors so widgets stay readable.
 * KPI ≥2 · Chart ≥4 · Live floor / tables ≥6 · Notes ≥2×1
 */
export function constraintsForModule(moduleId: string): SizeConstraints {
  if (moduleId === "builder_text") return { minW: 2, minH: 1, maxH: 4 };
  if (
    moduleId === "live_service" ||
    moduleId === "live_revenue_trajectory" ||
    moduleId === "order_flow" ||
    moduleId === "room_readiness"
  ) {
    return { minW: 6, minH: 2, maxH: 4 };
  }
  if (
    moduleId === "builder_decisions" ||
    moduleId === "builder_verified" ||
    moduleId === "builder_memory" ||
    moduleId === "top_dishes" ||
    moduleId === "stock_watch"
  ) {
    return { minW: 6, minH: 2, maxH: 5 };
  }
  if (
    CATEGORY_MODULES.charts.includes(moduleId) ||
    moduleId === "revenue_vs_forecast" ||
    moduleId === "verified_value_trend" ||
    moduleId === "settlement_bridge" ||
    moduleId === "covers_vs_forecast" ||
    moduleId === "hotel_pickup" ||
    moduleId === "hotel_channel_mix"
  ) {
    return { minW: 4, minH: 2, maxH: 4 };
  }
  if (
    CATEGORY_MODULES.metrics.includes(moduleId) ||
    CATEGORY_MODULES.property.includes(moduleId) ||
    moduleId === "labor_productivity" ||
    moduleId === "booking_pace" ||
    moduleId === "hotel_occ_adr_revpar"
  ) {
    return { minW: 2, minH: 1, maxH: 3 };
  }
  return { minW: 3, minH: 1, maxH: 4 };
}

/** Where a widget header link should point (null = no link). */
export function widgetHref(moduleId: string): string | null {
  switch (moduleId) {
    case "builder_text":
      return null;
    case "builder_decisions":
    case "builder_verified":
      return "/app/decisions";
    case "builder_memory":
      return "/app/memory";
    default:
      return `/app/intelligence?module=${moduleId}`;
  }
}

export const WIDTH_PRESETS: { label: string; w: number }[] = [
  { label: "S", w: 4 },
  { label: "M", w: 6 },
  { label: "L", w: 8 },
  { label: "XL", w: 12 },
];

/**
 * Persona-priority module order for Auto Arrange.
 * Hotel CFO: financial truth above fold · GM: readiness · Revenue: pace · etc.
 */
export const HOTEL_PERSONA_MODULE_PRIORITY: Record<string, string[]> = {
  cfo: [
    "revenue_vs_forecast",
    "verified_value_trend",
    "location_exposure",
    "hotel_channel_mix",
    "cost_movers",
    "hotel_occ_adr_revpar",
    "builder_decisions",
    "money_flow",
  ],
  hotel_gm: [
    "hotel_occ_adr_revpar",
    "room_readiness",
    "hotel_pickup",
    "builder_decisions",
    "hotel_channel_mix",
    "verified_value_trend",
    "hk_productivity",
  ],
  revenue_manager: [
    "hotel_pickup",
    "hotel_channel_mix",
    "hotel_occ_adr_revpar",
    "hotel_cancellation",
    "event_context",
    "builder_decisions",
    "demand_outlook",
  ],
  hotel_ops: [
    "room_readiness",
    "hotel_pickup",
    "hk_productivity",
    "builder_decisions",
    "hotel_occ_adr_revpar",
    "labor_productivity",
  ],
  front_office: [
    "hotel_pickup",
    "room_readiness",
    "hotel_occ_adr_revpar",
    "builder_decisions",
    "hotel_cancellation",
  ],
  housekeeping_manager: [
    "room_readiness",
    "hk_productivity",
    "hotel_pickup",
    "builder_decisions",
    "labor_productivity",
  ],
  coo: [
    "location_exposure",
    "hotel_occ_adr_revpar",
    "verified_value_trend",
    "hotel_channel_mix",
    "builder_decisions",
    "revenue_vs_forecast",
  ],
};

export const RESTAURANT_PERSONA_MODULE_PRIORITY: Record<string, string[]> = {
  cfo: [
    "revenue_vs_forecast",
    "verified_value_trend",
    "settlement_bridge",
    "location_exposure",
    "cost_movers",
    "builder_decisions",
  ],
  gm: [
    "live_service",
    "revenue_vs_forecast",
    "booking_pace",
    "labor_productivity",
    "builder_decisions",
  ],
  chef: [
    "kitchen_pressure",
    "top_dishes",
    "stock_watch",
    "live_service",
    "builder_decisions",
  ],
  coo: [
    "location_exposure",
    "revenue_pace_mtd",
    "builder_decisions",
    "verified_value_trend",
  ],
};

export function personaModulePriority(
  vertical: "restaurant" | "hotel",
  roleTemplate: string | null | undefined,
): string[] {
  const role = (roleTemplate ?? "").toLowerCase();
  if (vertical === "hotel") {
    if (role.includes("housekeep")) return HOTEL_PERSONA_MODULE_PRIORITY.housekeeping_manager!;
    if (role === "front_office") return HOTEL_PERSONA_MODULE_PRIORITY.front_office!;
    if (role === "hotel_ops" || role === "ops") return HOTEL_PERSONA_MODULE_PRIORITY.hotel_ops!;
    if (role === "revenue_manager") return HOTEL_PERSONA_MODULE_PRIORITY.revenue_manager!;
    if (role === "cfo") return HOTEL_PERSONA_MODULE_PRIORITY.cfo!;
    if (role === "coo") return HOTEL_PERSONA_MODULE_PRIORITY.coo!;
    return HOTEL_PERSONA_MODULE_PRIORITY.hotel_gm!;
  }
  if (role === "cfo") return RESTAURANT_PERSONA_MODULE_PRIORITY.cfo!;
  if (role === "chef") return RESTAURANT_PERSONA_MODULE_PRIORITY.chef!;
  if (role === "coo") return RESTAURANT_PERSONA_MODULE_PRIORITY.coo!;
  return RESTAURANT_PERSONA_MODULE_PRIORITY.gm!;
}
