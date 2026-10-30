/**
 * Dashboards library proof engine — presentation metadata over canonical templates.
 * Persistence / pin / duplicate remain in lib/product/dashboards.ts.
 */

import {
  DASHBOARD_TEMPLATES,
  moduleTitle,
  type DashboardTemplateSeed,
  type RadrDashboard,
} from "@/lib/product/dashboards";

export type LibraryView = "pinned" | "mine" | "templates" | "recent";

export type TemplateCategory =
  | "all"
  | "leadership"
  | "service"
  | "kitchen"
  | "finance"
  | "operations"
  | "guests"
  | "revenue"
  | "rooms";

export type TemplateBadge = "most-used" | "recommended" | "popular" | null;

export type PreviewKind =
  | "gm"
  | "coo"
  | "cfo"
  | "friday"
  | "live"
  | "chef"
  | "generic"
  | "hotel-gm"
  | "hotel-cfo"
  | "hotel-revenue"
  | "hotel-ops"
  | "hotel-fo"
  | "hotel-hk"
  | "hotel-brief"
  | "hotel-portfolio";

export type LibraryTemplate = {
  id: string;
  name: string;
  description: string;
  category: Exclude<TemplateCategory, "all">;
  roleLabel: string;
  badge: TemplateBadge;
  widgetLabels: string[];
  preview: PreviewKind;
  sharedUsers: number;
  updatedLabel: string;
  usageRank: number;
};

const RESTAURANT_IDS = new Set([
  "dash_gm",
  "dash_coo",
  "dash_cfo",
  "dash_friday_dinner",
  "dash_restaurant_live",
  "dash_head_chef",
]);

/** Library-visible hotel templates (legacy dash_hotel_coo filtered out). */
const HOTEL_LIBRARY_IDS = new Set([
  "dash_hotel_gm",
  "dash_hotel_cfo",
  "dash_hotel_revenue",
  "dash_hotel_ops",
  "dash_hotel_front_office",
  "dash_hotel_hk",
  "dash_hotel_morning_brief",
  "dash_hotel_portfolio",
]);

/** All hotel system IDs including legacy — for vertical filtering of stored boards. */
export const HOTEL_SYSTEM_IDS = new Set([
  ...HOTEL_LIBRARY_IDS,
  "dash_hotel_coo",
]);

const META: Record<
  string,
  {
    category: Exclude<TemplateCategory, "all">;
    roleLabel: string;
    badge: TemplateBadge;
    preview: PreviewKind;
    sharedUsers: number;
    updatedLabel: string;
    usageRank: number;
    description?: string;
  }
> = {
  dash_gm: {
    category: "leadership",
    roleLabel: "GM",
    badge: "most-used",
    preview: "gm",
    sharedUsers: 4,
    updatedLabel: "Updated today",
    usageRank: 1,
    description:
      "Live pace, contribution, Decisions, and team performance in one view.",
  },
  dash_coo: {
    category: "leadership",
    roleLabel: "COO",
    badge: "recommended",
    preview: "coo",
    sharedUsers: 3,
    updatedLabel: "Updated 2 days ago",
    usageRank: 3,
    description: "Portfolio exposure, location health, and exception pressure.",
  },
  dash_cfo: {
    category: "finance",
    roleLabel: "CFO",
    badge: "popular",
    preview: "cfo",
    sharedUsers: 2,
    updatedLabel: "Updated yesterday",
    usageRank: 2,
    description: "Contribution, Verified Value, settlement, and cost movers.",
  },
  dash_friday_dinner: {
    category: "service",
    roleLabel: "SERVICE",
    badge: null,
    preview: "friday",
    sharedUsers: 1,
    updatedLabel: "Updated 3 days ago",
    usageRank: 4,
    description: "Peak Friday dinner — covers, kitchen, menu, and recovery.",
  },
  dash_restaurant_live: {
    category: "service",
    roleLabel: "OPS",
    badge: null,
    preview: "live",
    sharedUsers: 5,
    updatedLabel: "Updated 1 hour ago",
    usageRank: 5,
    description: "Live floor — revenue, turns, wait times, and staffing.",
  },
  dash_head_chef: {
    category: "kitchen",
    roleLabel: "CHEF",
    badge: "recommended",
    preview: "chef",
    sharedUsers: 2,
    updatedLabel: "Updated 12 min ago",
    usageRank: 6,
    description: "Kitchen load, prep readiness, stock, and ticket pace.",
  },
  dash_hotel_gm: {
    category: "leadership",
    roleLabel: "GM",
    badge: "most-used",
    preview: "hotel-gm",
    sharedUsers: 4,
    updatedLabel: "Updated today",
    usageRank: 1,
    description:
      "Today’s property command center — occupancy, ADR, RevPAR, readiness, arrivals.",
  },
  dash_hotel_cfo: {
    category: "finance",
    roleLabel: "CFO",
    badge: "popular",
    preview: "hotel-cfo",
    sharedUsers: 3,
    updatedLabel: "Updated yesterday",
    usageRank: 2,
    description:
      "Portfolio performance, contribution, channel cost, exposure and Verified Value.",
  },
  dash_hotel_revenue: {
    category: "revenue",
    roleLabel: "REVENUE",
    badge: "recommended",
    preview: "hotel-revenue",
    sharedUsers: 3,
    updatedLabel: "Updated 2 hours ago",
    usageRank: 3,
    description:
      "Demand, pace, pricing and inventory — pickup, channel mix, forecast.",
  },
  dash_hotel_ops: {
    category: "operations",
    roleLabel: "OPS",
    badge: null,
    preview: "hotel-ops",
    sharedUsers: 2,
    updatedLabel: "Updated 1 hour ago",
    usageRank: 4,
    description:
      "Live property readiness — arrivals, housekeeping, front desk, Decisions.",
  },
  dash_hotel_front_office: {
    category: "operations",
    roleLabel: "FRONT OFFICE",
    badge: null,
    preview: "hotel-fo",
    sharedUsers: 2,
    updatedLabel: "Updated 40 min ago",
    usageRank: 5,
    description:
      "Arrivals, VIP, room readiness, upgrades and queue pressure.",
  },
  dash_hotel_hk: {
    category: "rooms",
    roleLabel: "HOUSEKEEPING",
    badge: "recommended",
    preview: "hotel-hk",
    sharedUsers: 2,
    updatedLabel: "Updated 18 min ago",
    usageRank: 6,
    description:
      "Rooms to clean · ready · arrival priority · attendant workload.",
  },
  dash_hotel_morning_brief: {
    category: "leadership",
    roleLabel: "GM",
    badge: "popular",
    preview: "hotel-brief",
    sharedUsers: 5,
    updatedLabel: "Updated this morning",
    usageRank: 7,
    description:
      "Overnight close · today’s occupancy · readiness gap · 3 RADR priorities.",
  },
  dash_hotel_portfolio: {
    category: "leadership",
    roleLabel: "OWNER",
    badge: null,
    preview: "hotel-portfolio",
    sharedUsers: 2,
    updatedLabel: "Updated yesterday",
    usageRank: 8,
    description:
      "Property health, revenue, contribution, exposure and Verified Value.",
  },
};

export const TEMPLATE_CATEGORIES: {
  id: TemplateCategory;
  label: string;
}[] = [
  { id: "all", label: "All templates" },
  { id: "leadership", label: "Leadership" },
  { id: "service", label: "Service" },
  { id: "kitchen", label: "Kitchen" },
  { id: "finance", label: "Finance" },
  { id: "operations", label: "Operations" },
  { id: "guests", label: "Guest Experience" },
];

export const HOTEL_TEMPLATE_CATEGORIES: {
  id: TemplateCategory;
  label: string;
}[] = [
  { id: "all", label: "All templates" },
  { id: "leadership", label: "Leadership" },
  { id: "revenue", label: "Revenue" },
  { id: "operations", label: "Operations" },
  { id: "rooms", label: "Rooms" },
  { id: "finance", label: "Finance" },
  { id: "guests", label: "Guests" },
];

export const RESTAURANT_ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "GM", label: "GM" },
  { value: "COO", label: "COO" },
  { value: "CFO", label: "CFO" },
  { value: "CHEF", label: "Chef" },
  { value: "SERVICE", label: "Service" },
  { value: "OPS", label: "Ops" },
];

export const HOTEL_ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "GM", label: "GM" },
  { value: "CFO", label: "CFO" },
  { value: "REVENUE", label: "Revenue" },
  { value: "OPS", label: "Operations" },
  { value: "FRONT OFFICE", label: "Front Office" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "OWNER", label: "Owner" },
];

export const LIBRARY_TABS: { id: LibraryView; label: string }[] = [
  { id: "pinned", label: "Pinned" },
  { id: "mine", label: "My dashboards" },
  { id: "templates", label: "Templates" },
  { id: "recent", label: "Recently used" },
];

export function parseLibraryView(raw: string | null): LibraryView {
  if (
    raw === "pinned" ||
    raw === "mine" ||
    raw === "templates" ||
    raw === "recent"
  ) {
    return raw;
  }
  return "pinned";
}

export function parseTemplateCategory(raw: string | null): TemplateCategory {
  if (
    raw === "leadership" ||
    raw === "service" ||
    raw === "kitchen" ||
    raw === "finance" ||
    raw === "operations" ||
    raw === "guests" ||
    raw === "revenue" ||
    raw === "rooms"
  ) {
    return raw;
  }
  return "all";
}

function enrichTemplate(t: DashboardTemplateSeed): LibraryTemplate {
  const m = META[t.id] ?? {
    category: "operations" as const,
    roleLabel: "OPS",
    badge: null,
    preview: "generic" as const,
    sharedUsers: 1,
    updatedLabel: "Updated recently",
    usageRank: 99,
  };
  return {
    id: t.id,
    name: t.name,
    description: m.description ?? t.description,
    category: m.category,
    roleLabel: m.roleLabel,
    badge: m.badge,
    widgetLabels: t.widgets
      .slice(0, 4)
      .map((w) => moduleTitle(w.intelligenceModuleId)),
    preview: m.preview,
    sharedUsers: m.sharedUsers,
    updatedLabel: m.updatedLabel,
    usageRank: m.usageRank,
  };
}

export function libraryTemplates(isHotel: boolean): LibraryTemplate[] {
  return DASHBOARD_TEMPLATES.filter((t) =>
    isHotel ? HOTEL_LIBRARY_IDS.has(t.id) : RESTAURANT_IDS.has(t.id),
  ).map(enrichTemplate);
}

export function filterLibraryTemplates(
  templates: LibraryTemplate[],
  query: string,
  category: TemplateCategory,
  roleFilter: string,
  sort: "relevant" | "used" | "newest",
): LibraryTemplate[] {
  const q = query.trim().toLowerCase();
  let list = templates.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (
      roleFilter &&
      roleFilter !== "all" &&
      t.roleLabel.toLowerCase() !== roleFilter.toLowerCase()
    ) {
      return false;
    }
    if (!q) return true;
    return [t.name, t.description, t.roleLabel, t.category, ...t.widgetLabels]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
  if (sort === "used") {
    list = [...list].sort((a, b) => a.usageRank - b.usageRank);
  } else if (sort === "newest") {
    list = [...list].reverse();
  } else {
    list = [...list].sort((a, b) => a.usageRank - b.usageRank);
  }
  return list;
}

export function formatRelativeUpdate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "Updated recently";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `Updated ${Math.max(1, mins)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Updated yesterday";
  return `Updated ${days} days ago`;
}

export function pinnedPreviewFor(dash: RadrDashboard): PreviewKind {
  const id = dash.id;
  if (id.includes("hotel_morning") || id.includes("morning_brief"))
    return "hotel-brief";
  if (id.includes("hotel_cfo")) return "hotel-cfo";
  if (id.includes("hotel_revenue")) return "hotel-revenue";
  if (id.includes("hotel_front")) return "hotel-fo";
  if (id.includes("hotel_hk") || id.includes("housekeep")) return "hotel-hk";
  if (id.includes("hotel_ops")) return "hotel-ops";
  if (id.includes("hotel_portfolio") || id.includes("hotel_coo"))
    return "hotel-portfolio";
  if (id.includes("hotel_gm") || id.startsWith("dash_hotel_"))
    return "hotel-gm";
  if (dash.id.includes("chef") || dash.roleTemplate === "chef") return "chef";
  if (dash.id.includes("cfo") || dash.roleTemplate === "cfo") return "cfo";
  if (dash.id.includes("coo") || dash.roleTemplate === "coo") return "coo";
  if (dash.id.includes("friday")) return "friday";
  if (dash.id.includes("live")) return "live";
  return "gm";
}

export function categoryTagsFor(dash: RadrDashboard, isHotel = false): string[] {
  const role = (dash.roleTemplate ?? "").toLowerCase();
  if (isHotel || dash.id.startsWith("dash_hotel_")) {
    if (role === "cfo") return ["Finance", "Contribution", "Verified Value"];
    if (role === "revenue_manager") return ["Revenue", "Pace", "Channels"];
    if (role.includes("housekeep")) return ["Rooms", "Housekeeping", "Readiness"];
    if (role === "front_office") return ["Arrivals", "Front Office", "Upgrades"];
    if (role === "coo") return ["Portfolio", "Properties", "Exposure"];
    return ["Property", "Readiness", "Decisions"];
  }
  if (role === "cfo") return ["Finance", "Value", "Exposure"];
  if (role === "coo") return ["Operations", "Portfolio", "Exceptions"];
  if (role === "chef") return ["Kitchen", "Inventory", "Prep"];
  if (dash.id.includes("friday")) return ["Service", "Kitchen", "Guests"];
  return ["Operations", "People", "Guest Experience"];
}
