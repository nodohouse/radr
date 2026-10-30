/**
 * Entity resolvers for deep links — derive vertical + scope from Decision /
 * location / dashboard, never invent Group/CFO defaults.
 */

import type { LocationScope } from "@/lib/product/demo/dashboard";
import type { RoleView } from "@/lib/product/types";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";
import {
  ensureDemoOrgForVertical,
  isLocationInVertical,
  orgForVertical,
  verticalForDecisionId,
  verticalForLocationId,
} from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import type { DecisionRecord } from "@/lib/radr/decision/record";

export type ResolvedEntityContext = {
  vertical: DemoVerticalFamily;
  scopeId: LocationScope;
  /** Suggested persona when current is invalid for vertical — optional. */
  suggestedRole?: RoleView;
  /** Canonical Decision Record id (aliases resolved). */
  decisionId: string;
};

export function resolveDecisionContext(
  decisionId: string,
  record?: DecisionRecord | null,
): ResolvedEntityContext | null {
  const canonicalId = resolveCanonicalDecisionId(decisionId);
  const rec = record ?? getDecisionRecord(canonicalId);
  const vertical =
    (rec?.vertical === "hotel" ? "hotel" : null) ??
    verticalForDecisionId(canonicalId);
  if (!vertical) return null;

  const org = orgForVertical(vertical);
  const loc =
    rec?.locationId && isLocationInVertical(rec.locationId, vertical)
      ? (rec.locationId as LocationScope)
      : ((org.locations[0]?.id ?? "all") as LocationScope);

  return {
    vertical,
    scopeId: loc,
    suggestedRole: vertical === "hotel" ? "hotel_gm" : "gm",
    decisionId: canonicalId,
  };
}

export function resolveLocationContext(
  locationId: string,
): ResolvedEntityContext | null {
  const vertical = verticalForLocationId(locationId);
  if (!vertical) return null;
  return {
    vertical,
    scopeId: locationId as LocationScope,
    suggestedRole: vertical === "hotel" ? "hotel_gm" : "gm",
    decisionId: "",
  };
}

/**
 * Apply resolved Decision context into demo org session + scope persistence.
 * Does not force persona (lens stays unless invalid for vertical).
 */
export function applyDecisionContextFromId(decisionId: string): void {
  if (typeof window === "undefined") return;
  const resolved = resolveDecisionContext(decisionId);
  if (!resolved) return;
  ensureDemoOrgForVertical(resolved.vertical, resolved.scopeId);
}
