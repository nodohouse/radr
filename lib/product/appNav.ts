/**
 * Canonical product navigation — ONE source for desktop rail + mobile.
 * Primary destinations + More (secondary). No parallel shell generations.
 */

export type AppNavItem = {
  id: string;
  href: string;
  label: string;
  /** Short label for collapsed tooltip / mobile */
  shortLabel?: string;
  exact?: boolean;
  /** Badge path key in navAttention */
  badgePath?: string;
};

export type AppNavSection = {
  id: string;
  label?: string;
  items: AppNavItem[];
};

/** CONTROL — attention + judgment */
export const NAV_CONTROL: AppNavItem[] = [
  {
    id: "control-center",
    href: "/app",
    label: "Control Center",
    shortLabel: "Control",
    exact: true,
    badgePath: "/app",
  },
  {
    id: "decisions",
    href: "/app/decisions",
    label: "Decisions",
    badgePath: "/app/decisions",
  },
  {
    id: "value",
    href: "/app/value",
    label: "Value",
    shortLabel: "Value",
  },
];

/**
 * HOUSE — back-of-house standards vs observed stock.
 */
export const NAV_HOUSE: AppNavItem[] = [
  {
    id: "house",
    href: "/app/house",
    label: "Back of house",
    shortLabel: "BOH",
    badgePath: "/app/house",
  },
];

/** OPERATE — locations + physical service + intelligence */
export const NAV_OPERATE: AppNavItem[] = [
  {
    id: "locations",
    href: "/app/locations",
    label: "Locations",
  },
  {
    id: "service",
    href: "/app/service",
    label: "Service Map",
    shortLabel: "Floor",
  },
  {
    id: "memory",
    href: "/app/memory",
    label: "Memory",
    shortLabel: "Memory",
  },
  {
    id: "intelligence",
    href: "/app/intelligence",
    label: "Intelligence",
    shortLabel: "Intel",
  },
];

/** SYSTEM — trust + connections */
export const NAV_SYSTEM: AppNavItem[] = [
  {
    id: "connections",
    href: "/app/connections",
    label: "Connections",
  },
  {
    id: "data-health",
    href: "/app/data-health",
    label: "Data Health",
  },
];

/** @deprecated use NAV_CONTROL — kept for import compatibility */
export const NAV_CORE = NAV_CONTROL;
/** @deprecated use NAV_OPERATE */
export const NAV_INTELLIGENCE = NAV_OPERATE.filter(
  (i) => i.id === "memory" || i.id === "intelligence",
);
/** @deprecated use NAV_SYSTEM */
export const NAV_DATA = NAV_SYSTEM;

/** EXPLORE — secondary / experimental */
export const NAV_EXPLORE: AppNavItem[] = [
  {
    id: "ask",
    href: "/app/ask",
    label: "Ask RADR",
    shortLabel: "Ask",
  },
];

/**
 * Primary operating rail — destinations that answer tonight's questions.
 * ONE list for every route. Do not invent parallel generations.
 */
export const RAIL_PRIMARY_NAV: AppNavItem[] = [
  {
    ...NAV_CONTROL[0]!,
    label: "Control Center",
    shortLabel: "Control",
  },
  NAV_CONTROL[1]!,
  {
    id: "live",
    href: "/app/live",
    label: "Live",
    shortLabel: "Live",
  },
  {
    ...NAV_OPERATE.find((i) => i.id === "service")!,
    label: "Operations",
    shortLabel: "Ops",
  },
  { ...NAV_HOUSE[0]!, label: "BOH", shortLabel: "BOH" },
  {
    id: "guests",
    href: "/app/guests",
    label: "Guests",
    shortLabel: "Guests",
  },
  NAV_OPERATE.find((i) => i.id === "intelligence")!,
  NAV_CONTROL[2]!,
  {
    id: "reports",
    href: "/app/reports",
    label: "Reports",
    shortLabel: "Reports",
  },
];

/**
 * More — capabilities that must remain reachable without crowding the rail.
 * Rendered under primary in AppSidebar.
 */
export const RAIL_MORE_NAV: AppNavItem[] = [
  {
    ...NAV_OPERATE.find((i) => i.id === "memory")!,
    label: "Memory",
    shortLabel: "Memory",
  },
  {
    ...NAV_OPERATE.find((i) => i.id === "locations")!,
    label: "Locations",
    shortLabel: "Loc",
  },
  {
    ...NAV_SYSTEM.find((i) => i.id === "connections")!,
    label: "Connections",
    shortLabel: "Connect",
  },
  {
    ...NAV_SYSTEM.find((i) => i.id === "data-health")!,
    label: "Data Health",
    shortLabel: "Health",
  },
  {
    id: "dashboards",
    href: "/app/dashboards",
    label: "Dashboards",
    shortLabel: "Dash",
  },
  {
    id: "settings",
    href: "/app/settings",
    label: "Settings",
    shortLabel: "Settings",
    exact: true,
  },
];

/** @deprecated Prefer RAIL_MORE_NAV */
export const RAIL_UTILITY_NAV: AppNavItem[] = RAIL_MORE_NAV;

export const NAV_SECTIONS: AppNavSection[] = [
  {
    id: "primary",
    label: "Operate",
    items: RAIL_PRIMARY_NAV,
  },
  {
    id: "more",
    label: "More",
    items: RAIL_MORE_NAV,
  },
];

/** Pocket briefing — primary mobile destinations. */
export const MOBILE_TABS: AppNavItem[] = [
  NAV_CONTROL[0]!,
  NAV_CONTROL[1]!,
  {
    id: "live",
    href: "/app/live",
    label: "Live",
    shortLabel: "Live",
  },
  NAV_HOUSE[0]!,
  {
    id: "more",
    href: "#more",
    label: "More",
    shortLabel: "More",
  },
];

export const SIDEBAR_COLLAPSED_PX = 68;
export const SIDEBAR_EXPANDED_PX = 216;
export const SIDEBAR_PIN_KEY = "radr.sidebar.pinned";

/**
 * Active nav from pathname. Prefer longest matching prefix so only one
 * primary destination wins (e.g. /app/decisions/[id] → Decisions, not Center).
 */
export function isNavActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  const path = pathname.replace(/\/$/, "") || "/app";
  const target = href.replace(/\/$/, "") || "/app";
  // Lab Live aliases to product Live during promotion.
  if (
    target === "/app/lab/live-v2" ||
    target === "/app/live" ||
    path === "/app/lab/live-v2" ||
    path.startsWith("/app/live")
  ) {
    const liveTarget =
      target === "/app/lab/live-v2" || target === "/app/live";
    const livePath =
      path === "/app/lab/live-v2" || path.startsWith("/app/live");
    if (liveTarget && livePath) return true;
  }
  if (exact || target === "/app") {
    return path === target;
  }
  return path === target || path.startsWith(`${target}/`);
}

export function allPrimaryNavItems(): AppNavItem[] {
  return [...RAIL_PRIMARY_NAV, ...RAIL_MORE_NAV];
}

/** Vertical-aware rail labels — same hrefs, native operating language. */
export function railPrimaryNavForVertical(
  vertical: "restaurant" | "hotel",
): AppNavItem[] {
  if (vertical !== "hotel") return RAIL_PRIMARY_NAV;
  return RAIL_PRIMARY_NAV.map((item) => {
    if (item.id === "house") {
      return { ...item, label: "House", shortLabel: "House" };
    }
    return item;
  });
}

export function railMoreNavForVertical(
  vertical: "restaurant" | "hotel",
): AppNavItem[] {
  if (vertical !== "hotel") return RAIL_MORE_NAV;
  return RAIL_MORE_NAV.map((item) => {
    if (item.id === "locations") {
      return { ...item, label: "Properties", shortLabel: "Props" };
    }
    return item;
  });
}

/** @deprecated Prefer RAIL_PRIMARY_NAV — header horizontal nav removed. */
export const HEADER_PRIMARY_NAV = RAIL_PRIMARY_NAV;

/** @deprecated More menu — use RAIL_MORE_NAV. */
export type MoreNavGroup = "system" | "workspace" | "admin";
/** @deprecated */
export type MoreNavItem = AppNavItem & {
  description: string;
  group: MoreNavGroup;
};
/** @deprecated */
export const HEADER_MORE_NAV: MoreNavItem[] = RAIL_MORE_NAV.map((item) => ({
  ...item,
  description: item.label,
  group:
    item.id === "settings" || item.id === "data-health" || item.id === "connections"
      ? ("system" as const)
      : ("workspace" as const),
}));
/** @deprecated */
export const MORE_GROUP_LABELS: Record<MoreNavGroup, string> = {
  system: "System",
  workspace: "Workspace",
  admin: "Administration",
};
