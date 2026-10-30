/**
 * Custom dashboards — demo persistence (localStorage).
 * DB schema stub in drizzle for signed-in mode.
 */

import { INTELLIGENCE_REGISTRY } from "@/lib/radr/intelligence/moduleRegistry";
import { readDemoOrgSession } from "@/lib/radr/demo/demoOrgSession";
import {
  appendItem,
  normalizeLayout,
  sizeFromWidth,
} from "@/lib/product/dashboardLayout";
import {
  defaultSharedWith,
  normalizeSharedWith,
  type DashboardShareEntry,
} from "@/lib/product/dashboardSharing";

export type { DashboardShareEntry };
export type DashboardVisibility = "PRIVATE" | "SHARED" | "ROLE" | "ORGANIZATION";

export type DashboardWidgetSize = "S" | "M" | "L";

/** Per-widget configuration set from the builder Properties panel. */
export type DashboardWidgetConfig = {
  /** Overrides the module title in the widget header. */
  title?: string;
  /** Body for the Note widget. */
  text?: string;
  visualization?:
    | "kpi"
    | "line"
    | "area"
    | "bar"
    | "stacked"
    | "donut"
    | "table"
    | "sparkline"
    | "list"
    | "heatmap"
    | "waterfall";
  scopeMode?: "inherit" | "all" | "location";
  periodMode?:
    | "inherit"
    | "today"
    | "yesterday"
    | "wtd"
    | "mtd"
    | "ytd";
  comparison?: "none" | "plan" | "forecast" | "prior";
  showVariance?: boolean;
  showLive?: boolean;
  compact?: boolean;
};

export type DashboardWidget = {
  id: string;
  intelligenceModuleId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  size: DashboardWidgetSize;
  config?: DashboardWidgetConfig;
};

export type RadrDashboard = {
  id: string;
  name: string;
  description: string;
  visibility: DashboardVisibility;
  roleTemplate: string | null;
  widgets: DashboardWidget[];
  /** Demo ACL — people / teams / roles with View · Edit · Owner. */
  sharedWith: DashboardShareEntry[];
  pinned: boolean;
  pinOrder: number;
  updatedAt: string;
};

export const DASHBOARDS_KEY = "radr.dashboards.v1";
export const DEFAULT_LANDING_KEY = "radr.nav.defaultLanding.v1";
export const RECENT_DASHBOARDS_KEY = "radr.dashboards.recent.v1";
export const MAX_PINNED = 6;
/** Soft warning before hard pin limit. */
export const PIN_SOFT_LIMIT = 5;

export type DefaultLanding = "control-center" | `dashboard:${string}`;

/** Operational widget labels — never repeat the dashboard name in module headers. */
const MODULE_TITLE_OVERRIDES: Record<string, string> = {
  live_service: "Service pace",
  live_revenue_trajectory: "Revenue trajectory",
  revenue_vs_forecast: "Revenue vs forecast",
  revenue_pace_day: "Today's revenue pace",
  revenue_pace_mtd: "MTD revenue pace",
  booking_pace: "Reservation pace",
  labor_productivity: "Staffing",
  top_dishes: "Menu pulse",
  menu_contribution: "Menu contribution",
  kitchen_pressure: "Kitchen pressure",
  stock_watch: "Inventory watch",
  verified_value_trend: "Verified value",
  settlement_bridge: "Settlement bridge",
  supplier_variance: "Supplier variance",
  location_exposure: "Portfolio exposure",
  cost_movers: "Cost movers",
  cancellation_intel: "Cancellation recovery",
  channel_mix: "Channel mix",
  covers_vs_forecast: "Covers vs forecast",
  tonight_demand: "Tonight's demand",
  demand_outlook: "Demand outlook",
  builder_text: "Note",
  builder_decisions: "Needs you",
  builder_verified: "Verified since last check",
  builder_memory: "Operating memory",
  hotel_occ_adr_revpar: "Occ · ADR · RevPAR",
  hotel_pickup: "Pickup",
  hotel_channel_mix: "Channel mix",
  hotel_cancellation: "Cancellation risk",
  room_readiness: "Room readiness",
  hk_productivity: "Housekeeping productivity",
};

function defaultPinnedTemplateIds(): { id: string; order: number }[] {
  const vertical =
    typeof window !== "undefined"
      ? readDemoOrgSession().vertical
      : "restaurant";
  if (vertical === "hotel") {
    return [
      { id: "dash_hotel_gm", order: 0 },
      { id: "dash_hotel_morning_brief", order: 1 },
    ];
  }
  return [
    { id: "dash_gm", order: 0 },
    { id: "dash_head_chef", order: 1 },
  ];
}

function isDefaultPinned(id: string): boolean {
  return defaultPinnedTemplateIds().some((p) => p.id === id);
}

function defaultPinOrder(id: string): number {
  return defaultPinnedTemplateIds().find((p) => p.id === id)?.order ?? 99;
}

export function dashboardsStorageKey(orgId?: string): string {
  const id =
    orgId ??
    (typeof window !== "undefined"
      ? readDemoOrgSession().orgId
      : "org_northstar_restaurants");
  return `${DASHBOARDS_KEY}.${id}`;
}

export function readDefaultLanding(): DefaultLanding {
  if (typeof window === "undefined") return "control-center";
  try {
    const v = localStorage.getItem(DEFAULT_LANDING_KEY);
    if (!v || v === "control-center") return "control-center";
    if (v.startsWith("dashboard:")) return v as DefaultLanding;
    return "control-center";
  } catch {
    return "control-center";
  }
}

export function writeDefaultLanding(v: DefaultLanding): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEFAULT_LANDING_KEY, v);
  window.dispatchEvent(new Event("radr-dashboards-changed"));
}

export function reorderPinned(
  orderedIds: string[],
): RadrDashboard[] {
  const list = readDashboards();
  const next = list.map((d) => {
    const idx = orderedIds.indexOf(d.id);
    if (idx < 0) return d;
    return { ...d, pinned: true, pinOrder: idx };
  });
  writeDashboards(next);
  return next;
}

export function resetPinOrder(): RadrDashboard[] {
  const list = readDashboards();
  const pinned = list
    .filter((d) => d.pinned)
    .sort((a, b) => a.name.localeCompare(b.name));
  const next = list.map((d) => {
    const idx = pinned.findIndex((p) => p.id === d.id);
    if (idx < 0) return d;
    return { ...d, pinOrder: idx };
  });
  writeDashboards(next);
  return next;
}

export type DashboardTemplateSeed = Omit<
  RadrDashboard,
  "updatedAt" | "pinned" | "pinOrder" | "sharedWith"
> & { sharedWith?: DashboardShareEntry[] };

export const DASHBOARD_TEMPLATES: DashboardTemplateSeed[] = [
  {
    id: "dash_gm",
    name: "General Manager",
    description: "Live pace, contribution, decisions, staffing.",
    visibility: "ROLE",
    roleTemplate: "gm",
    widgets: [
      w("live_service", 0, 0, 8, 2, "L"),
      w("revenue_vs_forecast", 8, 0, 4, 2, "M"),
      w("booking_pace", 0, 2, 6, 2, "M"),
      w("labor_productivity", 6, 2, 6, 2, "M"),
      w("top_dishes", 0, 4, 6, 2, "M"),
      w("stock_watch", 6, 4, 6, 2, "M"),
    ],
  },
  {
    id: "dash_coo",
    name: "COO",
    description: "Portfolio exposure, exceptions, procurement pressure.",
    visibility: "ROLE",
    roleTemplate: "coo",
    widgets: [
      w("location_exposure", 0, 0, 6, 2, "M"),
      w("revenue_pace_mtd", 6, 0, 6, 2, "M"),
      w("cancellation_intel", 0, 2, 6, 2, "M"),
      w("cost_movers", 6, 2, 6, 2, "M"),
      w("supplier_variance", 0, 4, 12, 2, "L"),
    ],
  },
  {
    id: "dash_cfo",
    name: "CFO",
    description: "Contribution, verified value, settlement, cost movers.",
    visibility: "ROLE",
    roleTemplate: "cfo",
    widgets: [
      w("revenue_vs_forecast", 0, 0, 6, 2, "M"),
      w("verified_value_trend", 6, 0, 6, 2, "M"),
      w("settlement_bridge", 0, 2, 6, 2, "M"),
      w("cost_movers", 6, 2, 6, 2, "M"),
      w("supplier_variance", 0, 4, 12, 2, "L"),
    ],
  },
  {
    id: "dash_friday_dinner",
    name: "Friday Dinner",
    description: "Berlin peak service lens.",
    visibility: "PRIVATE",
    roleTemplate: null,
    widgets: [
      w("live_service", 0, 0, 8, 2, "L"),
      w("booking_pace", 8, 0, 4, 2, "M"),
      w("top_dishes", 0, 2, 6, 2, "M"),
      w("labor_productivity", 6, 2, 6, 2, "M"),
    ],
  },
  {
    id: "dash_restaurant_live",
    name: "Restaurant Live",
    description: "Service trajectory and pressure.",
    visibility: "ROLE",
    roleTemplate: "gm",
    widgets: [w("live_service", 0, 0, 12, 3, "L")],
  },
  {
    id: "dash_hotel_gm",
    name: "Hotel General Manager",
    description: "Today’s property command center — occupancy, readiness, arrivals, Decisions.",
    visibility: "ROLE",
    roleTemplate: "hotel_gm",
    widgets: [
      w("hotel_occ_adr_revpar", 0, 0, 6, 2, "M"),
      w("room_readiness", 6, 0, 6, 2, "M"),
      w("hotel_pickup", 0, 2, 6, 2, "M"),
      w("hotel_channel_mix", 6, 2, 6, 2, "M"),
      w("builder_decisions", 0, 4, 6, 2, "M"),
      w("verified_value_trend", 6, 4, 6, 2, "M"),
    ],
  },
  {
    id: "dash_hotel_cfo",
    name: "Hotel CFO",
    description:
      "Portfolio performance, contribution, channel cost, exposure and Verified Value.",
    visibility: "ROLE",
    roleTemplate: "cfo",
    widgets: [
      w("revenue_vs_forecast", 0, 0, 6, 2, "M"),
      w("verified_value_trend", 6, 0, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 0, 2, 6, 2, "M"),
      w("location_exposure", 6, 2, 6, 2, "M"),
      w("hotel_channel_mix", 0, 4, 6, 2, "M"),
      w("cost_movers", 6, 4, 6, 2, "M"),
    ],
  },
  {
    id: "dash_hotel_revenue",
    name: "Revenue Manager",
    description:
      "Demand, pace, pricing and inventory — pickup, channel mix, forecast.",
    visibility: "ROLE",
    roleTemplate: "revenue_manager",
    widgets: [
      w("hotel_pickup", 0, 0, 6, 2, "M"),
      w("hotel_channel_mix", 6, 0, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 0, 2, 6, 2, "M"),
      w("hotel_cancellation", 6, 2, 6, 2, "M"),
      w("event_context", 0, 4, 6, 2, "M"),
      w("builder_decisions", 6, 4, 6, 2, "M"),
    ],
  },
  {
    id: "dash_hotel_ops",
    name: "Hotel Operations",
    description:
      "Live property readiness — arrivals, housekeeping, maintenance, front desk.",
    visibility: "ROLE",
    roleTemplate: "hotel_ops",
    widgets: [
      w("room_readiness", 0, 0, 8, 2, "L"),
      w("hotel_pickup", 8, 0, 4, 2, "M"),
      w("hk_productivity", 0, 2, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 6, 2, 6, 2, "M"),
      w("builder_decisions", 0, 4, 12, 2, "L"),
    ],
  },
  {
    id: "dash_hotel_front_office",
    name: "Front Office",
    description:
      "Arrivals, VIP, room readiness, upgrades and queue pressure.",
    visibility: "ROLE",
    roleTemplate: "front_office",
    widgets: [
      w("hotel_pickup", 0, 0, 6, 2, "M"),
      w("room_readiness", 6, 0, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 0, 2, 6, 2, "M"),
      w("builder_decisions", 6, 2, 6, 2, "M"),
    ],
  },
  {
    id: "dash_hotel_hk",
    name: "Housekeeping",
    description:
      "Rooms to clean · ready · arrival priority · attendant workload · reassignment.",
    visibility: "ROLE",
    roleTemplate: "housekeeping_manager",
    widgets: [
      w("room_readiness", 0, 0, 12, 3, "L"),
      w("hk_productivity", 0, 3, 6, 2, "M"),
      w("hotel_pickup", 6, 3, 6, 2, "M"),
      w("builder_decisions", 0, 5, 12, 2, "L"),
    ],
  },
  {
    id: "dash_hotel_morning_brief",
    name: "Morning Brief",
    description:
      "What happened overnight · what matters today · action before arrivals.",
    visibility: "ROLE",
    roleTemplate: "hotel_gm",
    widgets: [
      w("hotel_occ_adr_revpar", 0, 0, 4, 2, "M"),
      w("room_readiness", 4, 0, 4, 2, "M"),
      w("hotel_pickup", 8, 0, 4, 2, "M"),
      w("event_context", 0, 2, 6, 2, "M"),
      w("builder_decisions", 6, 2, 6, 2, "M"),
      w("verified_value_trend", 0, 4, 12, 2, "L"),
    ],
  },
  {
    id: "dash_hotel_portfolio",
    name: "Portfolio Performance",
    description:
      "Property health, revenue, contribution, exposure and Verified Value across the group.",
    visibility: "ROLE",
    roleTemplate: "coo",
    widgets: [
      w("location_exposure", 0, 0, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 6, 0, 6, 2, "M"),
      w("verified_value_trend", 0, 2, 6, 2, "M"),
      w("hotel_channel_mix", 6, 2, 6, 2, "M"),
      w("builder_decisions", 0, 4, 12, 2, "L"),
    ],
  },
  /** @deprecated Prefer dash_hotel_portfolio — kept for stored pins / deep links. */
  {
    id: "dash_hotel_coo",
    name: "Portfolio Performance (legacy)",
    description:
      "Property health, revenue, contribution, exposure and Verified Value across the group.",
    visibility: "ROLE",
    roleTemplate: "coo",
    widgets: [
      w("location_exposure", 0, 0, 6, 2, "M"),
      w("hotel_occ_adr_revpar", 6, 0, 6, 2, "M"),
      w("verified_value_trend", 0, 2, 6, 2, "M"),
      w("hotel_channel_mix", 6, 2, 6, 2, "M"),
      w("room_readiness", 0, 4, 12, 2, "L"),
    ],
  },
  {
    id: "dash_head_chef",
    name: "Head Chef",
    description: "Demand, kitchen, stock, prep.",
    visibility: "ROLE",
    roleTemplate: "chef",
    widgets: [
      w("live_service", 0, 0, 6, 2, "M"),
      w("top_dishes", 6, 0, 6, 2, "M"),
      w("stock_watch", 0, 2, 6, 2, "M"),
    ],
  },
];

export function isSystemTemplate(id: string): boolean {
  return DASHBOARD_TEMPLATES.some((t) => t.id === id);
}

function w(
  intelligenceModuleId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  size: DashboardWidgetSize,
): DashboardWidget {
  return {
    id: `w_${intelligenceModuleId}_${x}_${y}`,
    intelligenceModuleId,
    x,
    y,
    w: width,
    h: height,
    size,
  };
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function seedDashboardFromTemplate(
  t: DashboardTemplateSeed,
  pin: boolean,
  pinOrder: number,
): RadrDashboard {
  return {
    ...t,
    sharedWith: t.sharedWith?.length
      ? normalizeSharedWith(t.sharedWith, t.id)
      : defaultSharedWith(t.id),
    pinned: pin,
    pinOrder,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDashboard(d: RadrDashboard): RadrDashboard {
  return {
    ...d,
    sharedWith: normalizeSharedWith(d.sharedWith, d.id),
    visibility: d.visibility ?? "PRIVATE",
  };
}

function mergeSeedTemplates(stored: RadrDashboard[]): RadrDashboard[] {
  const byId = new Map(stored.map((d) => [d.id, normalizeDashboard(d)]));
  let changed = stored.some(
    (d, i) =>
      !d.sharedWith ||
      JSON.stringify(d.sharedWith) !== JSON.stringify(byId.get(d.id)?.sharedWith),
  );
  // Always rewrite if any entry lacked sharedWith.
  if (!changed) {
    for (const d of stored) {
      if (!Array.isArray(d.sharedWith)) {
        changed = true;
        break;
      }
    }
  }
  for (const t of DASHBOARD_TEMPLATES) {
    if (!byId.has(t.id)) {
      byId.set(
        t.id,
        seedDashboardFromTemplate(
          t,
          isDefaultPinned(t.id),
          defaultPinOrder(t.id),
        ),
      );
      changed = true;
      continue;
    }
    // Resync Hotel brief templates when grid advances (mockup rebuild).
    if (t.id === "dash_hotel_gm" || t.id === "dash_hotel_morning_brief") {
      const cur = byId.get(t.id)!;
      const sig = (ws: {
        intelligenceModuleId: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }[]) =>
        ws
          .map((w) => `${w.intelligenceModuleId}:${w.x}:${w.y}:${w.w}:${w.h}`)
          .join("|");
      if (sig(cur.widgets) !== sig(t.widgets)) {
        byId.set(t.id, {
          ...seedDashboardFromTemplate(t, cur.pinned, cur.pinOrder),
          sharedWith: cur.sharedWith,
        });
        changed = true;
      }
    }
  }
  const merged = [...byId.values()].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned) return a.pinOrder - b.pinOrder;
    return a.name.localeCompare(b.name);
  });
  if (changed) writeDashboards(merged);
  return merged;
}

export function readDashboards(): RadrDashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const key = dashboardsStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded = DASHBOARD_TEMPLATES.map((t) =>
        seedDashboardFromTemplate(
          t,
          isDefaultPinned(t.id),
          defaultPinOrder(t.id),
        ),
      );
      writeDashboards(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as RadrDashboard[];
    if (!Array.isArray(parsed)) {
      return seedDefaults();
    }
    return mergeSeedTemplates(parsed);
  } catch {
    return seedDefaults();
  }
}

function seedDefaults(): RadrDashboard[] {
  const seeded = DASHBOARD_TEMPLATES.map((t) =>
    seedDashboardFromTemplate(
      t,
      isDefaultPinned(t.id),
      defaultPinOrder(t.id),
    ),
  );
  writeDashboards(seeded);
  return seeded;
}

export function writeDashboards(list: RadrDashboard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(dashboardsStorageKey(), JSON.stringify(list));
  window.dispatchEvent(new Event("radr-dashboards-changed"));
}

export function pinnedDashboards(list: RadrDashboard[]): RadrDashboard[] {
  return list
    .filter((d) => d.pinned)
    .sort((a, b) => a.pinOrder - b.pinOrder)
    .slice(0, MAX_PINNED);
}

export function createDashboardFromTemplate(
  templateIndex: number,
  name?: string,
): RadrDashboard {
  const t = DASHBOARD_TEMPLATES[templateIndex] ?? DASHBOARD_TEMPLATES[0]!;
  const list = readDashboards();
  const existing = list.find((d) => d.id === t.id);
  if (existing && !name) return existing;
  const id = uid("dash");
  const dash: RadrDashboard = {
    ...t,
    id,
    name: name ?? t.name,
    pinned: false,
    pinOrder: 99,
    updatedAt: new Date().toISOString(),
    widgets: t.widgets.map((x) => ({ ...x, id: uid("w") })),
    sharedWith: defaultSharedWith(id),
    visibility: "PRIVATE",
  };
  writeDashboards([dash, ...list]);
  return dash;
}

export function openDashboardTemplate(templateId: string): RadrDashboard | null {
  const list = readDashboards();
  return list.find((d) => d.id === templateId) ?? null;
}

export function createEmptyDashboard(name: string): RadrDashboard {
  const list = readDashboards();
  const id = uid("dash");
  const dash: RadrDashboard = {
    id,
    name,
    description: "Build this around the questions you ask most.",
    visibility: "PRIVATE",
    roleTemplate: null,
    widgets: [],
    sharedWith: defaultSharedWith(id),
    pinned: false,
    pinOrder: 99,
    updatedAt: new Date().toISOString(),
  };
  writeDashboards([dash, ...list]);
  return dash;
}

export type PinToggleResult = {
  list: RadrDashboard[];
  /** True when pin was refused because MAX_PINNED was reached. */
  blocked: boolean;
  pinned: boolean;
  pinnedCount: number;
};

export function togglePinDashboard(id: string): PinToggleResult {
  const list = readDashboards();
  const current = list.find((d) => d.id === id);
  const pinned = list.filter((d) => d.pinned);
  if (!current) {
    return {
      list,
      blocked: false,
      pinned: false,
      pinnedCount: pinned.length,
    };
  }
  if (current.pinned) {
    const next = list.map((d) =>
      d.id === id ? { ...d, pinned: false, pinOrder: 99 } : d,
    );
    writeDashboards(next);
    return {
      list: next,
      blocked: false,
      pinned: false,
      pinnedCount: pinned.length - 1,
    };
  }
  if (pinned.length >= MAX_PINNED) {
    return {
      list,
      blocked: true,
      pinned: false,
      pinnedCount: pinned.length,
    };
  }
  const next = list.map((d) =>
    d.id === id ? { ...d, pinned: true, pinOrder: pinned.length } : d,
  );
  writeDashboards(next);
  return {
    list: next,
    blocked: false,
    pinned: true,
    pinnedCount: pinned.length + 1,
  };
}

export function recordDashboardOpen(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECENT_DASHBOARDS_KEY);
    const prev = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [id, ...prev.filter((x) => x !== id)].slice(0, 12);
    localStorage.setItem(RECENT_DASHBOARDS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function readRecentDashboardIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_DASHBOARDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Create a user-owned copy from a template/dashboard (does not mutate templates). */
export function applyDashboardTemplate(templateId: string): RadrDashboard | null {
  return duplicateDashboard(templateId);
}

export function saveDashboard(dash: RadrDashboard): void {
  const list = readDashboards();
  const next = list.map((d) => (d.id === dash.id ? { ...dash, updatedAt: new Date().toISOString() } : d));
  writeDashboards(next);
}

export function deleteDashboard(id: string): boolean {
  if (isSystemTemplate(id)) return false;
  const list = readDashboards();
  if (!list.some((d) => d.id === id)) return false;
  writeDashboards(list.filter((d) => d.id !== id));
  try {
    const recent = readRecentDashboardIds().filter((x) => x !== id);
    localStorage.setItem(RECENT_DASHBOARDS_KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
  return true;
}

export function moduleTitle(id: string): string {
  return MODULE_TITLE_OVERRIDES[id] ?? INTELLIGENCE_REGISTRY[id]?.title ?? id;
}

export function getDashboard(id: string): RadrDashboard | null {
  return readDashboards().find((d) => d.id === id) ?? null;
}

/** Layout-safe widgets for a stored dashboard (repairs legacy overlaps). */
export function layoutWidgets(widgets: DashboardWidget[]): DashboardWidget[] {
  return normalizeLayout(widgets).map((w) => ({ ...w, size: sizeFromWidth(w.w) }));
}

export function newWidget(
  intelligenceModuleId: string,
  dims: { w: number; h: number },
  at: { x: number; y: number } = { x: 0, y: 0 },
): DashboardWidget {
  return {
    id: uid("w"),
    intelligenceModuleId,
    x: at.x,
    y: at.y,
    w: dims.w,
    h: dims.h,
    size: sizeFromWidth(dims.w),
  };
}

export function addModuleToDashboard(
  dashboardId: string,
  intelligenceModuleId: string,
  dims: { w: number; h: number } = { w: 6, h: 2 },
): RadrDashboard | null {
  const list = readDashboards();
  const dash = list.find((d) => d.id === dashboardId);
  if (!dash) return null;
  const widgets = appendItem(
    layoutWidgets(dash.widgets),
    newWidget(intelligenceModuleId, dims),
  );
  const updated = {
    ...dash,
    widgets,
    updatedAt: new Date().toISOString(),
  };
  writeDashboards(list.map((d) => (d.id === dashboardId ? updated : d)));
  return updated;
}

/** Copy of any dashboard (stored or template) with fresh widget ids. */
export function duplicateDashboard(
  sourceId: string,
  name?: string,
): RadrDashboard | null {
  const list = readDashboards();
  const src = list.find((d) => d.id === sourceId);
  if (!src) return null;
  const id = uid("dash");
  const dash: RadrDashboard = {
    ...structuredClone(src),
    id,
    name: name ?? `${src.name} (copy)`,
    pinned: false,
    pinOrder: 99,
    visibility: "PRIVATE",
    sharedWith: defaultSharedWith(id),
    updatedAt: new Date().toISOString(),
    widgets: src.widgets.map((x) => ({ ...structuredClone(x), id: uid("w") })),
  };
  writeDashboards([dash, ...list]);
  return dash;
}
