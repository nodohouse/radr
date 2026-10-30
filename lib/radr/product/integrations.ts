/**
 * Connection fixtures — vendor systems RADR can reach.
 */

import type { RoleView } from "@/lib/product/types";
import { locationIdsForVertical } from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import { roleContextFor } from "./personas";
import { type DemoLocationId } from "./demoOrg";

export type SourceHealthStatus =
  | "CONNECTED"
  | "DEGRADED"
  | "STALE"
  | "DEMO";

export type SourceHealthRow = {
  id: string;
  name: string;
  domain: string;
  status: SourceHealthStatus;
  freshness: string;
  coverage: string;
  /** What this connection unlocks for Decisions. */
  unlocks: string[];
  lastSync: string;
  impact: string | null;
  locationIds: DemoLocationId[];
};

const RESTAURANT_IDS = NORTHSTAR_RESTAURANTS.locations.map(
  (l) => l.id as DemoLocationId,
);
const HOTEL_IDS = NORTHSTAR_HOTELS.locations.map(
  (l) => l.id as DemoLocationId,
);

const ALL_SOURCES: SourceHealthRow[] = [
  {
    id: "lightspeed",
    name: "Lightspeed",
    domain: "POS",
    status: "CONNECTED",
    freshness: "40s ago",
    coverage: "Orders · menu · tickets",
    unlocks: ["Revenue", "Covers", "Menu", "Average spend", "Service pace"],
    lastSync: "40s ago",
    impact: null,
    locationIds: RESTAURANT_IDS,
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    domain: "Reservations",
    status: "CONNECTED",
    freshness: "2m ago",
    coverage: "Covers · waitlist · guest profiles",
    unlocks: [
      "Booking pace",
      "Cancellations",
      "No-shows",
      "Walk-ins",
      "Guest behavior",
    ],
    lastSync: "2m ago",
    impact: null,
    locationIds: RESTAURANT_IDS,
  },
  {
    id: "toast-kds",
    name: "Toast KDS",
    domain: "Kitchen",
    status: "CONNECTED",
    freshness: "40s ago",
    coverage: "Ticket times · station load",
    unlocks: ["Ticket time", "Kitchen pressure", "Station load"],
    lastSync: "40s ago",
    impact: null,
    locationIds: RESTAURANT_IDS,
  },
  {
    id: "deliverect",
    name: "Deliverect",
    domain: "Delivery",
    status: "DEGRADED",
    freshness: "4m ago",
    coverage: "Uber Eats · Deliveroo",
    unlocks: ["Delivery share", "Channel fees", "Delivery load"],
    lastSync: "4m ago",
    impact: "Channel mix provisional",
    locationIds: RESTAURANT_IDS,
  },
  {
    id: "xero",
    name: "Xero",
    domain: "Accounting",
    status: "STALE",
    freshness: "6h ago",
    coverage: "Settlements · AP ledger",
    unlocks: ["Settlement", "AP", "Credits", "Verification"],
    lastSync: "6h ago",
    impact: "Affects settlement evidence freshness",
    locationIds: RESTAURANT_IDS,
  },
  {
    id: "mews",
    name: "Mews",
    domain: "PMS",
    status: "CONNECTED",
    freshness: "3m ago",
    coverage: "Rooms · stay · channel",
    unlocks: [
      "Occupancy",
      "ADR",
      "Arrivals",
      "Channel inventory",
      "Pickup",
    ],
    lastSync: "3m ago",
    impact: null,
    locationIds: HOTEL_IDS,
  },
];

export function sourcesForRole(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): SourceHealthRow[] {
  const ctx = roleContextFor(role, vertical);
  const allowed = locationIdsForVertical(vertical);
  const inVertical = ALL_SOURCES.filter((s) =>
    s.locationIds.some((id) => allowed.has(id)),
  );
  if (ctx.scopeType === "PORTFOLIO" || ctx.scopeType === "GROUP") {
    return inVertical;
  }
  return inVertical.filter((s) =>
    s.locationIds.some((id) => ctx.allowedLocationIds.includes(id)),
  );
}

/** Role scope + demo vertical — hide cross-vertical connection fixtures. */
export function sourcesForDemo(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): SourceHealthRow[] {
  const allowed = locationIdsForVertical(vertical);
  return sourcesForRole(role, vertical)
    .map((s) => ({
      ...s,
      locationIds: s.locationIds.filter((id) => allowed.has(id)),
    }))
    .filter((s) => s.locationIds.length > 0);
}

/** Quiet chrome summary — never invent floor counts. */
export function sourceIssueSummary(rows: SourceHealthRow[]): string | null {
  const degraded = rows.filter((r) => r.status === "DEGRADED").length;
  const stale = rows.filter((r) => r.status === "STALE").length;
  const total = degraded + stale;
  if (total === 0) return null;
  if (degraded > 0 && stale > 0) {
    return `${degraded} degraded · ${stale} stale`;
  }
  if (degraded > 0) {
    return `${degraded} source${degraded === 1 ? "" : "s"} degraded`;
  }
  return `${stale} source${stale === 1 ? "" : "s"} stale`;
}

/** @deprecated Prefer sourcesForRole — kept for callers migrating. */
export const IntegrationHealthService = {
  list: () => ALL_SOURCES,
  forRole: sourcesForRole,
  issueSummary: (role: RoleView) => sourceIssueSummary(sourcesForRole(role)),
};

export { ALL_SOURCES };
