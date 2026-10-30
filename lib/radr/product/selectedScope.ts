import type { DecisionRecord } from "@/lib/radr/decision/record";
import { REGION_LOCATION_IDS } from "@/lib/radr/locationCatalog";
import { toCanonicalLocationId } from "./locationIds";

/** Apply the visible location selection after organization/persona permissions. */
export function recordsForLocationSelection(records: DecisionRecord[], scope: string, comparisonIds: string[] = []): DecisionRecord[] {
  if (comparisonIds.length < 2 && scope === "all") return records;
  const ids = comparisonIds.length >= 2 ? comparisonIds : scope.startsWith("region_") ? REGION_LOCATION_IDS[scope] ?? [] : [scope];
  const allowed = new Set(ids.map(toCanonicalLocationId));
  return records.filter(record => allowed.has(toCanonicalLocationId(record.locationId)));
}
