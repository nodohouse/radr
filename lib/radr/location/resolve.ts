/**
 * Canonical location identity — every clickable location resolves here.
 * No handcrafted Berlin-only fixtures; every org location is first-class.
 */

import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
  type DemoLocationSeed,
  type DemoOrganization,
} from "@/lib/radr/demo/organizations";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";
import { normalizeLocationId } from "@/lib/radr/product/demoOrg";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

/** Legacy marketing / dataset IDs → living demo locations (archetype match). */
const LOCATION_ALIASES: Record<string, string> = {
  loc_ber: "loc_berlin_mitte",
  loc_berlin: "loc_berlin_mitte",
  loc_london_shoreditch: "loc_berlin_kreuzberg",
  loc_shoreditch: "loc_berlin_kreuzberg",
  loc_paris_marais: "loc_dusseldorf_medienhafen",
  loc_marais: "loc_dusseldorf_medienhafen",
  loc_ams_de_pijp: "loc_hamburg_hafen",
  loc_de_pijp: "loc_hamburg_hafen",
  loc_munich_maxvorstadt: "loc_munich_altstadt",
  loc_maxvorstadt: "loc_munich_altstadt",
  loc_copenhagen_norrebro: "loc_koln_ehrenfeld",
  loc_norrebro: "loc_koln_ehrenfeld",
  loc_lisbon_baixa: "loc_stuttgart_mitte",
  loc_baixa: "loc_stuttgart_mitte",
  loc_frankfurt: "loc_frankfurt_westend",
  loc_ams_canal: "loc_canal_house",
  loc_ams: "loc_canal_house",
};

export type ResolvedLocation = {
  id: string;
  seed: DemoLocationSeed;
  org: DemoOrganization;
  vertical: DemoVerticalFamily;
  /** True when URL used a legacy alias */
  aliasedFrom: string | null;
};

const ALL_ORGS = [NORTHSTAR_RESTAURANTS, NORTHSTAR_HOTELS] as const;

export function resolveLocationId(raw: string): string {
  const n = normalizeLocationId(raw.trim());
  const aliased = LOCATION_ALIASES[n] ?? LOCATION_ALIASES[raw];
  if (aliased) return aliased;
  return toCanonicalLocationId(n);
}

export function findLocationSeed(
  locationId: string,
): { seed: DemoLocationSeed; org: DemoOrganization } | null {
  const id = resolveLocationId(locationId);
  for (const org of ALL_ORGS) {
    const seed = org.locations.find((l) => l.id === id);
    if (seed) return { seed, org };
  }
  return null;
}

/** Never return null for an org location. Throws only for truly unknown ids. */
export function resolveLocation(raw: string): ResolvedLocation | null {
  const id = resolveLocationId(raw);
  const hit = findLocationSeed(id);
  if (!hit) return null;
  const vertical =
    hit.org.vertical === "hotel" ? "hotel" : ("restaurant" as const);
  const aliasedFrom =
    resolveLocationId(raw) !== normalizeLocationId(raw.trim()) ||
    LOCATION_ALIASES[raw] ||
    LOCATION_ALIASES[normalizeLocationId(raw)]
      ? raw
      : null;
  return {
    id: hit.seed.id,
    seed: hit.seed,
    org: hit.org,
    vertical,
    aliasedFrom:
      aliasedFrom && resolveLocationId(raw) !== normalizeLocationId(raw)
        ? raw
        : LOCATION_ALIASES[normalizeLocationId(raw)]
          ? normalizeLocationId(raw)
          : null,
  };
}

export function allCanonicalLocationIds(): string[] {
  return ALL_ORGS.flatMap((o) => o.locations.map((l) => l.id));
}

export function locationExists(raw: string): boolean {
  return resolveLocation(raw) != null;
}
