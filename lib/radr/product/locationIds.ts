/**
 * Map canonical DEMO_ORG location IDs ↔ legacy demo catalog IDs.
 * Control Center / Decisions use DEMO_ORG; Locations catalog used loc_ber etc.
 */

import { normalizeLocationId } from "@/lib/radr/product/demoOrg";

/** Canonical (Decision / pulse) → catalog (legacy dashboard). */
const CANON_TO_CATALOG: Record<string, string> = {
  loc_berlin_mitte: "loc_ber",
  loc_berlin_kreuzberg: "loc_ber_kreuz",
  // Estate DE restaurants — no exact catalog twin; map to closest DE factors.
  loc_hamburg_hafen: "loc_ber",
  loc_frankfurt_westend: "loc_ber_kreuz",
  loc_munich_altstadt: "loc_ber",
  loc_koln_ehrenfeld: "loc_ber_kreuz",
  loc_dusseldorf_medienhafen: "loc_ber",
  loc_stuttgart_mitte: "loc_ber_kreuz",
  loc_hk_central: "loc_sin",
  loc_sydney_surry: "loc_syd",
  loc_canal_house: "loc_ams_canal",
  loc_ams_harbour: "loc_ams",
  loc_schiphol_gate: "loc_ams",
  loc_lisbon_alfama: "loc_lis_residences",
  loc_berlin_mitte_hotel: "loc_ber",
  loc_paris_opera: "loc_par",
  loc_munich_airport: "loc_ams",
  loc_sydney_surry_hotel: "loc_syd",
  loc_cape_town_waterfront: "loc_dxb",
  loc_chiado_collective: "loc_lis_residences",
  loc_ber: "loc_ber",
  loc_ams: "loc_ams",
  loc_ams_canal: "loc_ams_canal",
  loc_lis_residences: "loc_lis_residences",
};

/** Catalog → canonical (for product store scope). */
const CATALOG_TO_CANON: Record<string, string> = {
  loc_ber: "loc_berlin_mitte",
  loc_ber_kreuz: "loc_berlin_kreuzberg",
  loc_ams_canal: "loc_canal_house",
  loc_lis_residences: "loc_chiado_collective",
};

export function toCatalogLocationId(id: string): string {
  const n = normalizeLocationId(id);
  return CANON_TO_CATALOG[n] ?? CANON_TO_CATALOG[id] ?? id;
}

export function toCanonicalLocationId(id: string): string {
  return CATALOG_TO_CANON[id] ?? normalizeLocationId(id);
}
