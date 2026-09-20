/**
 * Integration / source-health fixtures — scoped by persona locations.
 */

import type { RoleView } from "@/lib/product/types";
import { roleContextFor } from "./personas";
import { DEMO_LOCATIONS, type DemoLocationId } from "./demoOrg";

export type SourceHealthStatus =
  | "CONNECTED"
  | "DEGRADED"
  | "STALE"
  | "DEMO";

export type SourceHealthRow = {
  id: string;
  name: string;
  status: SourceHealthStatus;
  freshness: string;
  coverage: string;
  lastSync: string;
  impact: string | null;
  /** Locations this source belongs to. Empty = org-wide. */
  locationIds: DemoLocationId[];
};

const ALL_SOURCES: SourceHealthRow[] = [
  {
    id: "pos",
    name: "POS",
    status: "CONNECTED",
    freshness: "40s ago",
    coverage: "Covers · ticket · menu",
    lastSync: "40s ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "reservations",
    name: "Reservations",
    status: "CONNECTED",
    freshness: "2m ago",
    coverage: "Inbound covers · waitlist",
    lastSync: "2m ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "kds",
    name: "KDS",
    status: "CONNECTED",
    freshness: "40s ago",
    coverage: "Ticket times · station load",
    lastSync: "40s ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "delivery",
    name: "Delivery",
    status: "DEGRADED",
    freshness: "4m ago",
    coverage: "Intake volume lag",
    lastSync: "4m ago",
    impact: "Affects D-1911 forecast confidence",
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "procurement",
    name: "Procurement",
    status: "CONNECTED",
    freshness: "1h ago",
    coverage: "Supplier invoices · contracts",
    lastSync: "1h ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "accounting",
    name: "Accounting",
    status: "STALE",
    freshness: "6h ago",
    coverage: "AP · invoice lines",
    lastSync: "6h ago",
    impact: "Affects D-4102 evidence freshness",
    locationIds: [DEMO_LOCATIONS.berlin.id],
  },
  {
    id: "pms",
    name: "PMS",
    status: "CONNECTED",
    freshness: "3m ago",
    coverage: "Canal House inventory",
    lastSync: "3m ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.canal.id],
  },
  {
    id: "channel",
    name: "Channel manager",
    status: "CONNECTED",
    freshness: "5m ago",
    coverage: "OTA · direct rates · pickup",
    lastSync: "5m ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.canal.id],
  },
  {
    id: "unit_pms",
    name: "Unit PMS",
    status: "CONNECTED",
    freshness: "4m ago",
    coverage: "Chiado unit calendar · orphans",
    lastSync: "4m ago",
    impact: null,
    locationIds: [DEMO_LOCATIONS.chiado.id],
  },
];

export function sourcesForRole(role: RoleView): SourceHealthRow[] {
  const ctx = roleContextFor(role);
  if (ctx.scopeType === "PORTFOLIO" || ctx.scopeType === "GROUP") {
    return ALL_SOURCES;
  }
  return ALL_SOURCES.filter((s) =>
    s.locationIds.some((id) => ctx.allowedLocationIds.includes(id)),
  );
}

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
