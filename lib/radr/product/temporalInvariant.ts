/**
 * Temporal invariant — observations must incorporate completed actions
 * for the same item + location. Never show an unresolved gap alongside
 * a verified restore for the same item.
 */

export type TemporalObservation = {
  itemKey: string;
  locationKey: string;
  at: string;
  kind: "gap" | "action_complete" | "verified_restore";
  unresolved?: boolean;
  sourceId: string;
};

export type TemporalViolation = {
  itemKey: string;
  locationKey: string;
  message: string;
  gapId?: string;
  verifiedId?: string;
};

function itemNormalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Stable key for item+location temporal checks. */
export function temporalItemLocationKey(
  item: string,
  location: string,
): { itemKey: string; locationKey: string } {
  return {
    itemKey: itemNormalize(item),
    locationKey: itemNormalize(location),
  };
}

/**
 * Returns violations when an unresolved gap coexists with a verified
 * restore for the same item+location (contradictory timeline).
 */
export function findTemporalContradictions(
  observations: TemporalObservation[],
): TemporalViolation[] {
  const byKey = new Map<
    string,
    { gaps: TemporalObservation[]; restores: TemporalObservation[] }
  >();

  for (const o of observations) {
    const key = `${o.itemKey}::${o.locationKey}`;
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = { gaps: [], restores: [] };
      byKey.set(key, bucket);
    }
    if (o.kind === "gap" && o.unresolved) bucket.gaps.push(o);
    if (o.kind === "verified_restore") bucket.restores.push(o);
  }

  const violations: TemporalViolation[] = [];
  for (const [key, { gaps, restores }] of byKey) {
    if (gaps.length === 0 || restores.length === 0) continue;
    const [itemKey, locationKey] = key.split("::") as [string, string];
    violations.push({
      itemKey,
      locationKey,
      message: `Unresolved gap and verified restore both present for ${itemKey} @ ${locationKey}`,
      gapId: gaps[0]?.sourceId,
      verifiedId: restores[0]?.sourceId,
    });
  }
  return violations;
}

/**
 * Latest observation for an item must not claim a gap if a later
 * completed action / verified restore already incorporated the fix.
 */
export function assertObservationFollowsActions(
  observations: TemporalObservation[],
): TemporalViolation[] {
  const sorted = [...observations].sort((a, b) => a.at.localeCompare(b.at));
  const lastComplete = new Map<string, TemporalObservation>();
  const violations: TemporalViolation[] = [];

  for (const o of sorted) {
    const key = `${o.itemKey}::${o.locationKey}`;
    if (o.kind === "action_complete" || o.kind === "verified_restore") {
      lastComplete.set(key, o);
      continue;
    }
    if (o.kind === "gap" && o.unresolved) {
      const done = lastComplete.get(key);
      if (done && done.at <= o.at) {
        violations.push({
          itemKey: o.itemKey,
          locationKey: o.locationKey,
          message: `Gap ${o.sourceId} ignores completed action ${done.sourceId} at ${done.at}`,
          gapId: o.sourceId,
          verifiedId: done.sourceId,
        });
      }
    }
  }
  return violations;
}
