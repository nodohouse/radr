/**
 * Demo vertical / organization scope — canonical world isolation.
 * Every Decision and location belongs to one org. Queries scope by orgId.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
  type DemoOrgId,
  type DemoOrganization,
} from "@/lib/radr/demo/organizations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";

export const ORG_RESTAURANTS = NORTHSTAR_RESTAURANTS.id;
export const ORG_HOTELS = NORTHSTAR_HOTELS.id;

const RESTAURANT_LOCATION_IDS = new Set(
  NORTHSTAR_RESTAURANTS.locations.map((l) => l.id),
);
const HOTEL_LOCATION_IDS = new Set(
  NORTHSTAR_HOTELS.locations.map((l) => l.id),
);

/** Decisions that belong to Northstar Restaurants only. */
export const RESTAURANT_DECISION_IDS = new Set<string>([
  DECISION_IDS.peak,
  DECISION_IDS.tableRecover,
  DECISION_IDS.supplier,
  DECISION_IDS.tuna,
  DECISION_IDS.menuPeak,
  DECISION_IDS.socialDemand,
  DECISION_IDS.guestVoice,
  DECISION_IDS.marginCoke,
  DECISION_IDS.rain,
  DECISION_IDS.hiddenMenu,
  DECISION_IDS.labor,
  DECISION_IDS.created,
  DECISION_IDS.settlement,
  DECISION_IDS.supplierOpen,
  DECISION_IDS.bestsellerPeak,
  DECISION_IDS.tunaStructural,
  DECISION_IDS.casterSugar,
]);

/** Decisions that belong to Northstar Hotels only. */
export const HOTEL_DECISION_IDS_SET = new Set<string>([
  DECISION_IDS.hotelReadiness,
  DECISION_IDS.ota,
  HOTEL_DECISION_IDS.cancelRecover,
  HOTEL_DECISION_IDS.overbook,
  HOTEL_DECISION_IDS.upsell,
  HOTEL_DECISION_IDS.hkStaff,
  HOTEL_DECISION_IDS.groupDisplace,
  HOTEL_DECISION_IDS.maintenance,
  HOTEL_DECISION_IDS.breakfast,
  HOTEL_DECISION_IDS.rateDemand,
]);

/** Explicitly excluded from both first-class demos (legacy / apartment / mixed). */
export const MIXED_ONLY_DECISION_IDS = new Set<string>([
  DECISION_IDS.orphan,
  DECISION_IDS.playbook,
  DECISION_IDS.hiddenMix,
  DECISION_IDS.hiddenOrphanRule,
]);

export function orgIdForVertical(v: DemoVerticalFamily): DemoOrgId {
  return v === "hotel" ? ORG_HOTELS : ORG_RESTAURANTS;
}

export function verticalForOrgId(
  orgId: string | undefined | null,
): DemoVerticalFamily | null {
  if (orgId === ORG_HOTELS) return "hotel";
  if (orgId === ORG_RESTAURANTS || orgId === "org_northstar") return "restaurant";
  return null;
}

export function locationIdsForVertical(v: DemoVerticalFamily): Set<string> {
  return v === "hotel" ? HOTEL_LOCATION_IDS : RESTAURANT_LOCATION_IDS;
}

export function orgForVertical(v: DemoVerticalFamily): DemoOrganization {
  return v === "hotel" ? NORTHSTAR_HOTELS : NORTHSTAR_RESTAURANTS;
}

export function isLocationInVertical(
  locationId: string | undefined | null,
  v: DemoVerticalFamily,
): boolean {
  if (!locationId) return false;
  return locationIdsForVertical(v).has(locationId);
}

/** Infer vertical from a location id (deep links). */
export function verticalForLocationId(
  locationId: string | undefined | null,
): DemoVerticalFamily | null {
  if (!locationId) return null;
  if (HOTEL_LOCATION_IDS.has(locationId)) return "hotel";
  if (RESTAURANT_LOCATION_IDS.has(locationId)) return "restaurant";
  return null;
}

/** Infer vertical from a decision id (deep links). */
export function verticalForDecisionId(decisionId: string): DemoVerticalFamily | null {
  if (MIXED_ONLY_DECISION_IDS.has(decisionId)) return null;
  if (
    HOTEL_DECISION_IDS_SET.has(decisionId) ||
    decisionId.startsWith("dec_hotel_")
  ) {
    return "hotel";
  }
  if (RESTAURANT_DECISION_IDS.has(decisionId)) return "restaurant";
  return null;
}

export function decisionBelongsToVertical(
  decisionId: string,
  v: DemoVerticalFamily,
): boolean {
  if (MIXED_ONLY_DECISION_IDS.has(decisionId)) return false;
  if (v === "hotel") {
    return (
      HOTEL_DECISION_IDS_SET.has(decisionId) ||
      decisionId.startsWith("dec_hotel_")
    );
  }
  // Restaurant: allowlist only — never hotel / unknown hotel-prefixed
  if (HOTEL_DECISION_IDS_SET.has(decisionId)) return false;
  if (decisionId.startsWith("dec_hotel_")) return false;
  return RESTAURANT_DECISION_IDS.has(decisionId);
}

function normalizeOrgId(orgId: string | undefined): string | undefined {
  if (!orgId) return undefined;
  // Legacy mixed org maps to restaurants for restaurant decisions only
  if (orgId === "org_northstar") return ORG_RESTAURANTS;
  return orgId;
}

export function filterRecordsByVertical(
  records: DecisionRecord[],
  v: DemoVerticalFamily,
): DecisionRecord[] {
  const wantOrg = orgIdForVertical(v);
  return records.filter((r) => {
    if (!decisionBelongsToVertical(r.id, v)) return false;

    const org = normalizeOrgId(r.organizationId);
    if (org && org !== wantOrg) {
      // Hotel records must carry hotels org; restaurant must not be hotels
      if (v === "hotel" && org === ORG_RESTAURANTS) return false;
      if (v === "restaurant" && org === ORG_HOTELS) return false;
    }

    if (r.locationId && !isLocationInVertical(r.locationId, v)) {
      if (v === "restaurant" && HOTEL_LOCATION_IDS.has(r.locationId)) {
        return false;
      }
      if (v === "hotel" && RESTAURANT_LOCATION_IDS.has(r.locationId)) {
        return false;
      }
    }
    return true;
  });
}

export function filterLocationIdsByVertical(
  ids: string[],
  v: DemoVerticalFamily,
): string[] {
  const allowed = locationIdsForVertical(v);
  return ids.filter((id) => allowed.has(id));
}

/**
 * Ensure demo session matches the entity being viewed (deep link).
 *
 * Rules:
 * - Never rewrite persona just because the user opened a location/Decision.
 * - Updating local working scope (location) is allowed.
 * - Cross-vertical deep links may switch org; persona is left intact for
 *   ProductProvider / DemoOrgSwitcher mapping — do not force GM here.
 */
export function ensureDemoOrgForVertical(
  v: DemoVerticalFamily,
  preferredLocationId?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("radr.demoOrg.v1");
    const parsed = raw ? (JSON.parse(raw) as { vertical?: string }) : null;
    const org = orgForVertical(v);
    const allowed = new Set(org.locations.map((l) => l.id));
    const prefer =
      preferredLocationId && allowed.has(preferredLocationId)
        ? preferredLocationId
        : null;
    const already = parsed?.vertical === v;

    if (already && !prefer) return;

    const payload = { vertical: v, orgId: org.id };
    if (!already) {
      sessionStorage.setItem("radr.demoOrg.v1", JSON.stringify(payload));
    }

    // Scope may follow the deep-linked entity — persona must not.
    if (prefer) {
      try {
        const prefsRaw = localStorage.getItem("radr.prefs.v1");
        const prefs = prefsRaw
          ? (JSON.parse(prefsRaw) as Record<string, unknown>)
          : {};
        // Preserve roleView. Only remember this location as a soft home default
        // when the user was already on a single-location default — never when
        // they were in Group (defaultLocationId === "all").
        const nextPrefs: Record<string, unknown> = { ...prefs };
        if (prefs.defaultLocationId !== "all") {
          nextPrefs.defaultLocationId = prefer;
        }
        localStorage.setItem("radr.prefs.v1", JSON.stringify(nextPrefs));

        const scopeRaw = sessionStorage.getItem("radr.scope.v1");
        const scope = scopeRaw
          ? (JSON.parse(scopeRaw) as Record<string, unknown>)
          : {};
        sessionStorage.setItem(
          "radr.scope.v1",
          JSON.stringify({ ...scope, locationScope: prefer }),
        );
      } catch {
        /* ignore */
      }
    } else if (!already) {
      // Vertical changed without a preferred location — keep Group if prefs say so.
      try {
        const prefsRaw = localStorage.getItem("radr.prefs.v1");
        const prefs = prefsRaw
          ? (JSON.parse(prefsRaw) as Record<string, unknown>)
          : {};
        const home =
          prefs.defaultLocationId === "all"
            ? "all"
            : (org.locations[0]?.id ?? "all");
        const scopeRaw = sessionStorage.getItem("radr.scope.v1");
        const scope = scopeRaw
          ? (JSON.parse(scopeRaw) as Record<string, unknown>)
          : {};
        if (home !== "all") {
          sessionStorage.setItem(
            "radr.scope.v1",
            JSON.stringify({ ...scope, locationScope: home }),
          );
        }
      } catch {
        /* ignore */
      }
    }

    if (!already) {
      window.dispatchEvent(
        new CustomEvent("radr-demo-org", { detail: payload }),
      );
    }
  } catch {
    /* ignore */
  }
}
