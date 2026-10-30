/**
 * Connections proof engine — data coverage + trust + decision dependency.
 * Deterministic restaurant demo SSOT for /app/connections Overview.
 */

import type { RoleView } from "@/lib/product/types";
import {
  CONNECTION_CATALOG,
  categoryForDomain,
  type CatalogEntry,
  type ConnectionCategory,
} from "@/components/product/connections/VendorLogo";
import { dependentDecisionsFor } from "@/components/product/connections/dependentDecisions";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import {
  locationDisplayName,
  type DemoLocationId,
} from "@/lib/radr/product/demoOrg";

export type ConnectionHealthState =
  | "CONNECTED"
  | "DEGRADED"
  | "STALE"
  | "DISCONNECTED"
  | "ERROR";

export type ConnectionsCategoryFilter =
  | "All"
  | "POS"
  | "Reservations"
  | "Delivery"
  | "Payments"
  | "Accounting"
  | "Workforce"
  | "Inventory"
  | "External";

export type ConnectionsStatusFilter =
  | "all"
  | "connected"
  | "attention"
  | "available";

export type ConnectionRow = {
  id: string;
  name: string;
  domain: string;
  category: ConnectionCategory;
  status: ConnectionHealthState;
  freshness: string;
  coverageLabel: string;
  coverageDetail: string;
  unlocks: string[];
  impact: string | null;
  impactDetail: string | null;
  locationIds: DemoLocationId[];
  lastSuccessAt: string;
  expectedCadence: string;
};

export type CoverageCategory = {
  id: ConnectionsCategoryFilter;
  label: string;
  percent: number;
  color: string;
};

export type UnlockCapability = {
  id: string;
  title: string;
  detail: string;
  available: boolean;
  cta?: string;
};

export type DataObjectHealth = {
  id: string;
  name: string;
  state: "Healthy" | "Partial" | "Stale" | "Missing";
};

export type LocationLinkState = {
  id: DemoLocationId;
  name: string;
  state: "Connected" | "Degraded" | "Not connected";
};

export type ConfidenceImpact = {
  decisionId: string;
  label: string;
  from: number;
  to: number;
  reason: string;
};

export type ConnectionDetail = {
  row: ConnectionRow;
  objects: DataObjectHealth[];
  locations: LocationLinkState[];
  permissionScope: { read: string[]; write: string[] };
  connectedBy: string;
  connectedAt: string;
  lastChanged: string;
  confidenceImpacts: ConfidenceImpact[];
  affectedCapabilities: string[];
  dataHealthHref: string;
};

export type CoverageGap = {
  id: string;
  title: string;
  body: string;
  category: ConnectionsCategoryFilter;
  recommendedIds: string[];
};

export type SetupKind = "setup" | "request" | "notify";

export type SetupStep = {
  id: string;
  label: string;
  state: "pass" | "pending" | "info";
  detail?: string;
};

export type ConnectionsOverviewModel = {
  connectedCount: number;
  attentionCount: number;
  availableCount: number;
  coveragePercent: number;
  coverageTooltip: string;
  rows: ConnectionRow[];
  attention: ConnectionRow[];
  radrSees: string;
  radrSeesDetail: string;
  coverageByCategory: CoverageCategory[];
  unlocks: UnlockCapability[];
  recommended: CatalogEntry[];
  catalogAll: CatalogEntry[];
  categories: ConnectionsCategoryFilter[];
  gaps: CoverageGap[];
};

const RESTAURANT_IDS = NORTHSTAR_RESTAURANTS.locations.map(
  (l) => l.id as DemoLocationId,
);
const ESTATE_N = RESTAURANT_IDS.length;
const ESTATE_COVERAGE = `${ESTATE_N} locations`;

/** Stable connection estate — coverage from DemoEstateRegistry via org. */
const DEMO_ROWS: ConnectionRow[] = [
  {
    id: "lightspeed",
    name: "Lightspeed",
    domain: "POS",
    category: "POS",
    status: "CONNECTED",
    freshness: "40s ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Revenue", "Covers", "Menu", "Average spend", "Service pace"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:14:22",
    expectedCadence: "60 sec",
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    domain: "Reservations",
    category: "Reservations",
    status: "CONNECTED",
    freshness: "2m ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Booking pace", "No-shows", "Guest profiles", "Waitlist"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:13:05",
    expectedCadence: "2 min",
  },
  {
    id: "opentable",
    name: "OpenTable",
    domain: "Reservations",
    category: "Reservations",
    status: "CONNECTED",
    freshness: "3m ago",
    coverageLabel: "5 locations",
    coverageDetail: `Partial · 5/${ESTATE_N}`,
    unlocks: ["Forward covers", "Cancellations", "Channel bookings"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS.slice(0, 5),
    lastSuccessAt: "20:12:01",
    expectedCadence: "3 min",
  },
  {
    id: "toast-kds",
    name: "Toast KDS",
    domain: "Kitchen",
    category: "POS",
    status: "CONNECTED",
    freshness: "40s ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Ticket time", "Kitchen pressure", "Station load"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:14:20",
    expectedCadence: "60 sec",
  },
  {
    id: "stripe",
    name: "Stripe",
    domain: "Payments",
    category: "Payments",
    status: "CONNECTED",
    freshness: "1m ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Payouts", "Refunds", "Disputes", "Settlement"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:14:01",
    expectedCadence: "60 sec",
  },
  {
    id: "deliverect",
    name: "Deliverect",
    domain: "Delivery",
    category: "Delivery",
    status: "DEGRADED",
    freshness: "4m ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Delivery share", "Channel fees", "Delivery load"],
    impact: "Channel mix provisional",
    impactDetail:
      "Channel mix provisional — some delivery data is incomplete.",
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:10:48",
    expectedCadence: "60 sec",
  },
  {
    id: "xero",
    name: "Xero",
    domain: "Accounting",
    category: "Accounting",
    status: "STALE",
    freshness: "6h ago",
    coverageLabel: ESTATE_COVERAGE,
    coverageDetail: "Estate coverage",
    unlocks: ["Settlement", "AP", "Credits"],
    impact: "Affects settlement evidence freshness",
    impactDetail:
      "Affects settlement evidence freshness — some financial data may be delayed.",
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "14:12:08",
    expectedCadence: "15 min",
  },
  {
    id: "weather",
    name: "Weather",
    domain: "External",
    category: "External",
    status: "CONNECTED",
    freshness: "12m ago",
    coverageLabel: "Estate",
    coverageDetail: "Context feed",
    unlocks: ["Terrace demand", "Walk-in shifts", "Delivery weather"],
    impact: null,
    impactDetail: null,
    locationIds: RESTAURANT_IDS,
    lastSuccessAt: "20:03:00",
    expectedCadence: "15 min",
  },
];

const COVERAGE_BY_CATEGORY: CoverageCategory[] = [
  { id: "POS", label: "POS", percent: 100, color: "#00a85a" },
  { id: "Reservations", label: "Reservations", percent: 100, color: "#0b5c38" },
  { id: "Delivery", label: "Delivery", percent: 75, color: "#d4923a" },
  { id: "Payments", label: "Payments", percent: 100, color: "#00a85a" },
  { id: "Accounting", label: "Accounting", percent: 50, color: "#d4534a" },
  { id: "Workforce", label: "Workforce", percent: 0, color: "#8a928d" },
];

const UNLOCKS: UnlockCapability[] = [
  {
    id: "revenue",
    title: "Revenue truth",
    detail: "Orders, payments, settlement",
    available: true,
  },
  {
    id: "booking",
    title: "Booking pace",
    detail: "Covers, no-shows, guest demand",
    available: true,
  },
  {
    id: "delivery",
    title: "Delivery load",
    detail: "Channel mix, fees, service pressure",
    available: true,
  },
  {
    id: "payment",
    title: "Payment settlement",
    detail: "Payouts, refunds, reconciliation",
    available: true,
  },
  {
    id: "menu",
    title: "Menu engineering",
    detail: "Item performance, margin",
    available: true,
  },
  {
    id: "guest",
    title: "Guest profiles",
    detail: "Frequency, spend, lifetime value",
    available: true,
  },
  {
    id: "workforce",
    title: "Workforce intelligence",
    detail: "Not fully available",
    available: false,
    cta: "Connect workforce",
  },
  {
    id: "inventory",
    title: "Inventory truth",
    detail: "Not fully available",
    available: false,
    cta: "Connect inventory",
  },
];

const FILTER_CATS: ConnectionsCategoryFilter[] = [
  "All",
  "POS",
  "Reservations",
  "Delivery",
  "Payments",
  "Accounting",
  "Workforce",
  "Inventory",
  "External",
];

const COVERAGE_TOOLTIP =
  "Coverage reflects the share of RADR’s required operational/financial data domains currently connected and healthy across the selected scope.";

function rankStatus(s: ConnectionHealthState): number {
  if (s === "STALE") return 0;
  if (s === "DEGRADED") return 1;
  if (s === "ERROR") return 2;
  return 3;
}

export function buildConnectionsOverview(
  _role: RoleView = "cfo",
  vertical: DemoVerticalFamily = "restaurant",
): ConnectionsOverviewModel {
  const world = vertical === "hotel" ? "hotel" : "restaurant";
  const rows = [...DEMO_ROWS].sort(
    (a, b) => rankStatus(a.status) - rankStatus(b.status) || a.name.localeCompare(b.name),
  );

  const connectedIds = new Set(rows.map((r) => r.id));
  const catalogAll = CONNECTION_CATALOG.filter(
    (c) =>
      !connectedIds.has(c.id) &&
      !rows.some((r) => r.name === c.name) &&
      (!c.worlds || c.worlds.includes(world)),
  );

  const attention = rows.filter(
    (r) => r.status === "DEGRADED" || r.status === "STALE",
  );

  // Recommended: missing workforce first, then high-value gaps
  const recommended = rankRecommended(catalogAll).slice(0, 7);

  // Deterministic summary SSOT (approved mock) — catalog lists remain live-filtered
  const availableCount = 13;

  return {
    connectedCount: 8,
    attentionCount: 2,
    availableCount,
    coveragePercent: 84,
    coverageTooltip: COVERAGE_TOOLTIP,
    rows,
    attention,
    radrSees: `${attention.length} systems are degrading decision confidence.`,
    radrSeesDetail:
      "Xero is stale and Deliverect is degraded. This may affect financial settlement, channel mix, and Decision confidence.",
    coverageByCategory: COVERAGE_BY_CATEGORY,
    unlocks: UNLOCKS,
    recommended,
    catalogAll,
    categories: FILTER_CATS,
    gaps: COVERAGE_GAPS,
  };
}

const COVERAGE_GAPS: CoverageGap[] = [
  {
    id: "workforce",
    title: "No workforce source connected",
    body: "This prevents labor forecasting, shift optimization, and labor variance explanation.",
    category: "Workforce",
    recommendedIds: ["planday", "deputy", "personio"],
  },
  {
    id: "inventory",
    title: "Inventory truth is incomplete",
    body: "Stock, usage, and depletion risk stay outside the twin until a procurement source is connected.",
    category: "Inventory",
    recommendedIds: ["marketman", "apicbase"],
  },
  {
    id: "accounting-health",
    title: "Accounting evidence is stale",
    body: "Xero lag reduces Verified Value confidence and Settlement / AP proof freshness for D-4102.",
    category: "Accounting",
    recommendedIds: [],
  },
];

const OBJECTS_BY_SOURCE: Record<string, DataObjectHealth[]> = {
  lightspeed: [
    { id: "orders", name: "Orders", state: "Healthy" },
    { id: "payments", name: "Payments", state: "Healthy" },
    { id: "menu", name: "Menu items", state: "Healthy" },
    { id: "labor", name: "Labor punches", state: "Partial" },
    { id: "refunds", name: "Refunds", state: "Healthy" },
  ],
  xero: [
    { id: "bills", name: "Bills / AP", state: "Stale" },
    { id: "credits", name: "Credit notes", state: "Stale" },
    { id: "settlement", name: "Settlement", state: "Stale" },
  ],
  deliverect: [
    { id: "orders", name: "Delivery orders", state: "Partial" },
    { id: "fees", name: "Channel fees", state: "Partial" },
    { id: "mix", name: "Channel mix", state: "Partial" },
  ],
  sevenrooms: [
    { id: "bookings", name: "Reservations", state: "Healthy" },
    { id: "guests", name: "Guest profiles", state: "Healthy" },
    { id: "waitlist", name: "Waitlist", state: "Healthy" },
  ],
  stripe: [
    { id: "charges", name: "Charges", state: "Healthy" },
    { id: "payouts", name: "Payouts", state: "Healthy" },
    { id: "refunds", name: "Refunds", state: "Healthy" },
  ],
};

const CONFIDENCE_BY_SOURCE: Record<string, ConfidenceImpact[]> = {
  xero: [
    {
      decisionId: "dec_supplier_berlin",
      label: "D-4102",
      from: 92,
      to: 68,
      reason: "Accounting evidence stale",
    },
  ],
  deliverect: [
    {
      decisionId: "dec_peak_berlin",
      label: "D-1911",
      from: 88,
      to: 79,
      reason: "Channel mix provisional",
    },
    {
      decisionId: "dec_menu_peak_berlin",
      label: "D-7110",
      from: 86,
      to: 78,
      reason: "Delivery share incomplete",
    },
  ],
};

const AFFECTED_BY_SOURCE: Record<string, string[]> = {
  xero: [
    "Settlement evidence",
    "Supplier / AP proof",
    "Verified Value confidence",
    "Decision D-4102",
  ],
  deliverect: [
    "Channel mix",
    "Delivery fee leakage",
    "Decision D-1911",
    "Decision D-7110",
  ],
};

export function getConnectionDetail(
  id: string,
  rows: ConnectionRow[] = DEMO_ROWS,
): ConnectionDetail | null {
  const row = rows.find((r) => r.id === id);
  if (!row) return null;

  const locations: LocationLinkState[] = RESTAURANT_IDS.map((locId) => {
    const linked = row.locationIds.includes(locId);
    let state: LocationLinkState["state"] = "Not connected";
    if (linked) {
      state =
        row.status === "DEGRADED" || row.status === "STALE"
          ? "Degraded"
          : "Connected";
    }
    // Partial OpenTable — only first 5
    if (row.id === "opentable" && !linked) {
      state = "Not connected";
    }
    return {
      id: locId,
      name: locationDisplayName(locId),
      state,
    };
  });

  const objects =
    OBJECTS_BY_SOURCE[row.id] ??
    row.unlocks.slice(0, 4).map((u, i) => ({
      id: `${row.id}-obj-${i}`,
      name: u,
      state:
        row.status === "STALE"
          ? ("Stale" as const)
          : row.status === "DEGRADED"
            ? ("Partial" as const)
            : ("Healthy" as const),
    }));

  return {
    row,
    objects,
    locations,
    permissionScope: {
      read: row.unlocks.slice(0, 4),
      write: ["None"],
    },
    connectedBy: "Admin",
    connectedAt: "12 Sep 2026",
    lastChanged: "8 Oct 2026",
    confidenceImpacts: CONFIDENCE_BY_SOURCE[row.id] ?? [],
    affectedCapabilities: AFFECTED_BY_SOURCE[row.id] ?? [],
    dataHealthHref: `/app/data-health?source=${row.id}`,
  };
}

export function buildSetupSteps(
  entry: CatalogEntry,
  kind: SetupKind,
): SetupStep[] {
  if (kind === "notify") {
    return [
      {
        id: "queued",
        label: "Notify list",
        state: "pass",
        detail: `We’ll email when ${entry.name} ships.`,
      },
    ];
  }
  if (kind === "request") {
    return [
      {
        id: "request",
        label: "Access request",
        state: "pass",
        detail: "Enterprise connector — implementation approval required.",
      },
      {
        id: "review",
        label: "Partner review",
        state: "pending",
        detail: "Typical turnaround 3–5 business days.",
      },
    ];
  }
  return [
    { id: "auth", label: "Authentication", state: "pass" },
    { id: "perms", label: "Permissions", state: "pass", detail: "Read-only" },
    {
      id: "locations",
      label: "Locations",
      state: "pass",
      detail: "8 found",
    },
    { id: "sample", label: "Sample data", state: "pass" },
    { id: "freshness", label: "Freshness", state: "pass" },
    {
      id: "sync",
      label: "Start sync",
      state: "pending",
      detail: "Ready when you confirm.",
    },
  ];
}

function rankRecommended(catalog: CatalogEntry[]): CatalogEntry[] {
  const priority = (c: CatalogEntry): number => {
    if (c.category === "Workforce" && c.status === "AVAILABLE") return 0;
    if (c.category === "Inventory" && c.status === "AVAILABLE") return 1;
    if (c.category === "POS" && c.status === "AVAILABLE") return 2;
    if (c.category === "Delivery" && c.status === "AVAILABLE") return 3;
    if (c.status === "AVAILABLE") return 4;
    if (c.status === "REQUEST_ACCESS") return 5;
    return 6;
  };
  return [...catalog].sort(
    (a, b) => priority(a) - priority(b) || a.name.localeCompare(b.name),
  );
}

export function filterConnectionRows(
  rows: ConnectionRow[],
  query: string,
  category: ConnectionsCategoryFilter,
  status: ConnectionsStatusFilter,
): ConnectionRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((r) => {
    if (category !== "All" && r.category !== category) return false;
    if (status === "available") return false;
    if (
      status === "attention" &&
      r.status !== "DEGRADED" &&
      r.status !== "STALE"
    ) {
      return false;
    }
    if (status === "connected" && r.status !== "CONNECTED") return false;
    if (!q) return true;
    const deps = dependentDecisionsFor(r.id)
      .map((d) => d.label)
      .join(" ");
    return [r.name, r.domain, r.category, r.coverageLabel, deps, ...r.unlocks]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function filterCatalog(
  catalog: CatalogEntry[],
  query: string,
  category: ConnectionsCategoryFilter,
  status: ConnectionsStatusFilter,
): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  return catalog.filter((c) => {
    if (category !== "All" && c.category !== category) return false;
    if (status === "connected" || status === "attention") return false;
    if (status === "available" && c.status !== "AVAILABLE") return false;
    if (!q) return true;
    return [c.name, c.domain, c.category, c.data, c.unlocks]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function parseConnectionsCategory(
  raw: string | null,
): ConnectionsCategoryFilter {
  if (
    raw === "POS" ||
    raw === "Reservations" ||
    raw === "Delivery" ||
    raw === "Payments" ||
    raw === "Accounting" ||
    raw === "Workforce" ||
    raw === "Inventory" ||
    raw === "External"
  ) {
    return raw;
  }
  if (raw === "pos") return "POS";
  if (raw === "reservations") return "Reservations";
  if (raw === "delivery") return "Delivery";
  if (raw === "payments") return "Payments";
  if (raw === "accounting") return "Accounting";
  if (raw === "workforce") return "Workforce";
  if (raw === "inventory") return "Inventory";
  if (raw === "external") return "External";
  return "All";
}

export function parseConnectionsStatus(
  raw: string | null,
): ConnectionsStatusFilter {
  if (
    raw === "connected" ||
    raw === "attention" ||
    raw === "available"
  ) {
    return raw;
  }
  return "all";
}

export function parseConnectionSystemId(
  raw: string | null,
  rows: ConnectionRow[],
): string | null {
  if (!raw) return null;
  const hit = rows.find(
    (r) =>
      r.id === raw ||
      r.name.toLowerCase().replace(/\s+/g, "-") === raw.toLowerCase(),
  );
  return hit?.id ?? null;
}

export { categoryForDomain, dependentDecisionsFor };
