/**
 * Northstar Hospitality Group — single demo organization + location IDs.
 * Every Decision references these IDs. No NODO contamination.
 */

export const DEMO_ORG = {
  id: "org_northstar",
  name: "Northstar Hospitality Group",
  shortName: "Northstar",
} as const;

export const DEMO_LOCATIONS = {
  berlin: {
    id: "loc_berlin_mitte",
    name: "Berlin Mitte",
    vertical: "restaurant" as const,
    city: "Berlin",
    country: "DE",
  },
  canal: {
    id: "loc_canal_house",
    name: "Canal House",
    displayName: "Canal House · Amsterdam",
    vertical: "hotel" as const,
    city: "Amsterdam",
    country: "NL",
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

export const ALL_DEMO_LOCATION_IDS: DemoLocationId[] = [
  DEMO_LOCATIONS.berlin.id,
  DEMO_LOCATIONS.canal.id,
  DEMO_LOCATIONS.chiado.id,
];

/** Map legacy location IDs onto the canonical set. */
export function normalizeLocationId(id: string): DemoLocationId | "loc_group" | string {
  if (id === "loc_lisbon_chiado" || id === "loc_chiado") {
    return DEMO_LOCATIONS.chiado.id;
  }
  if (id === "loc_ber" || id === "loc_berlin") {
    return DEMO_LOCATIONS.berlin.id;
  }
  return id;
}

export function locationDisplayName(id: string): string {
  const n = normalizeLocationId(id);
  if (n === DEMO_LOCATIONS.berlin.id) return DEMO_LOCATIONS.berlin.name;
  if (n === DEMO_LOCATIONS.canal.id) return DEMO_LOCATIONS.canal.displayName;
  if (n === DEMO_LOCATIONS.chiado.id) return DEMO_LOCATIONS.chiado.displayName;
  if (n === "loc_group") return DEMO_ORG.name;
  return id;
}
