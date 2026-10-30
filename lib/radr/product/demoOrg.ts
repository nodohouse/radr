/**
 * Northstar Hospitality Group — single demo organization + location IDs.
 * Every Decision references these IDs. No NODO contamination.
 *
 * Demo universe: 12 total locations · 3 connected to RADR pilot.
 */

export const DEMO_ORG = {
  id: "org_northstar",
  name: "Northstar Hospitality Group",
  shortName: "Northstar",
  /** Full group footprint (marketing + app must agree). */
  totalLocations: 12,
  /** Locations with live RADR pilot connections. */
  connectedLocations: 3,
} as const;

export const DEMO_LOCATIONS = {
  berlin: {
    id: "loc_berlin_mitte",
    name: "Soho",
    displayName: "Soho · New York",
    vertical: "restaurant" as const,
    city: "New York",
    country: "US",
  },
  canal: {
    id: "loc_canal_house",
    name: "Mercer House",
    displayName: "Mercer House · New York",
    vertical: "hotel" as const,
    city: "New York",
    country: "US",
  },
  chiado: {
    id: "loc_chiado_collective",
    name: "Chiado Collective",
    displayName: "Chiado Collective · Lisbon",
    vertical: "apartment" as const,
    city: "Lisbon",
    country: "PT",
  },
} as const;

export type DemoLocationId =
  (typeof DEMO_LOCATIONS)[keyof typeof DEMO_LOCATIONS]["id"];

/** Pilot locations connected to RADR. */
export const ALL_DEMO_LOCATION_IDS: DemoLocationId[] = [
  DEMO_LOCATIONS.berlin.id,
  DEMO_LOCATIONS.canal.id,
  DEMO_LOCATIONS.chiado.id,
];

export const AWAITING_CONNECTION_COUNT =
  DEMO_ORG.totalLocations - DEMO_ORG.connectedLocations;

export function connectedScopeLabel(org?: {
  connectedLocations: number;
  totalLocations: number;
}): string {
  const connected = org?.connectedLocations ?? DEMO_ORG.connectedLocations;
  const total = org?.totalLocations ?? DEMO_ORG.totalLocations;
  return `Connected locations · ${connected} / ${total}`;
}

/** Explicit pilot vs estate framing for product chrome. */
export function recoveryPilotScopeLabel(org?: {
  connectedLocations: number;
  totalLocations: number;
}): string {
  const connected = org?.connectedLocations ?? DEMO_ORG.connectedLocations;
  const total = org?.totalLocations ?? DEMO_ORG.totalLocations;
  return `Active org · ${connected} connected of ${total}`;
}

/** Map legacy location IDs onto the canonical set. */
export function normalizeLocationId(
  id: string,
): DemoLocationId | "loc_group" | string {
  if (id === "loc_lisbon_chiado" || id === "loc_chiado") {
    return DEMO_LOCATIONS.chiado.id;
  }
  if (id === "loc_ber" || id === "loc_berlin") {
    return DEMO_LOCATIONS.berlin.id;
  }
  return id;
}

import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";

/** Turn `loc_berlin_kreuzberg` → `West Hollywood · Los Angeles` when no catalog hit. */
export function humanizeLocationId(id: string): string {
  const raw = id.trim();
  if (!raw) return "Location";
  if (raw === "all") return "All locations";
  if (raw === "loc_group") return DEMO_ORG.name;
  if (raw.startsWith("region_")) {
    const code = raw.slice("region_".length).toUpperCase();
    return code ? `Region · ${code}` : "Region";
  }
  if (!raw.startsWith("loc_")) return raw;
  return raw
    .slice(4)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** User-facing location name. Never returns a raw `loc_*` id. */
export function locationDisplayName(id: string): string {
  const n = normalizeLocationId(id);
  for (const org of [NORTHSTAR_RESTAURANTS, NORTHSTAR_HOTELS]) {
    const hit = org.locations.find((l) => l.id === n);
    if (hit) return hit.displayName;
  }
  if (n === DEMO_LOCATIONS.berlin.id) {
    return DEMO_LOCATIONS.berlin.displayName ?? DEMO_LOCATIONS.berlin.name;
  }
  if (n === DEMO_LOCATIONS.canal.id) return DEMO_LOCATIONS.canal.displayName;
  if (n === DEMO_LOCATIONS.chiado.id) return DEMO_LOCATIONS.chiado.displayName;
  if (n === "loc_group") return DEMO_ORG.name;
  if (n === "all") return "All locations";
  return humanizeLocationId(String(n));
}
