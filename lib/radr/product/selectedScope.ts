import type { DecisionRecord } from "@/lib/radr/decision/record";
import { REGION_LOCATION_IDS } from "@/lib/radr/locationCatalog";
import { toCanonicalLocationId } from "./locationIds";

/** A detailed venue snapshot must never be relabelled as another location. */
export function locationInSelection(locationId: string, scope: string, comparisonIds: string[] = []) {
  if (comparisonIds.length < 2 && scope === "all") return true;
  const ids = comparisonIds.length >= 2 ? comparisonIds
    : scope.startsWith("region_") ? REGION_LOCATION_IDS[scope] ?? [] : [scope];
  return ids.some(id => toCanonicalLocationId(id) === toCanonicalLocationId(locationId));
}

/** Apply the visible location selection after organization/persona permissions. */
export function recordsForLocationSelection(records: DecisionRecord[], scope: string, comparisonIds: string[] = []): DecisionRecord[] {
  if (comparisonIds.length < 2 && scope === "all") return records;
  const ids = comparisonIds.length >= 2 ? comparisonIds : scope.startsWith("region_") ? REGION_LOCATION_IDS[scope] ?? [] : [scope];
  const allowed = new Set(ids.map(toCanonicalLocationId));
  return records.filter(record => allowed.has(toCanonicalLocationId(record.locationId)));
}
