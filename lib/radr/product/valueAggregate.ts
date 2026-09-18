/**
 * Derived Value aggregates — never hardcode headline euros.
 *
 * Inclusion rules (mutually exclusive bands — no double counting):
 * - ACTIVE EXPOSURE / OPPORTUNITY: needs_you · primaryMetric (what operators see)
 * - PENDING VERIFICATION: handling · expected impact only
 * - VERIFIED: verified / learned · verifiedValue amounts by kind
 *
 * exposedContribution on a record may differ (e.g. absorb-cost monthly exposure).
 * Active headline always follows the Decision's primary attention metric.
 */

import type { RoleView } from "@/lib/product/types";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  scopedDecisions,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import type { ValueKind } from "@/lib/radr/decision/core";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { primaryMetricOf } from "@/lib/radr/product/primaryMetric";

export type ValueAggregate = {
  activeExposure: number;
  activeOpportunity: number;
  /** Convenience: exposure + opportunity (still excludes pending + verified). */
  activeExposureOrOpportunity: number;
  pendingVerification: number;
  verifiedByKind: Record<Exclude<ValueKind, "exposed">, number>;
  verifiedTotal: number;
  decisionIdsActiveExposure: string[];
  decisionIdsActiveOpportunity: string[];
  decisionIdsPending: string[];
  decisionIdsVerified: string[];
};

function isOpportunity(r: DecisionRecord): boolean {
  const t = (r.decisionType ?? "").toUpperCase();
  return (
    t.includes("OPPORTUNITY") ||
    t.includes("CREATED") ||
    t.includes("UPSIDE")
  );
}

/** Euro amount that belongs in the active attention headline for this Decision. */
export function attentionEuro(r: DecisionRecord): number {
  return primaryMetricOf(r)?.value ?? r.exposedContribution ?? 0;
}

export function deriveValueAggregate(role: RoleView): ValueAggregate {
  const scoped = scopedDecisions(listDecisionRecords(), role);

  const needsYou = scoped.filter((r) => recordAttention(r) === "needs_you");
  const pending = scoped.filter((r) => recordAttention(r) === "handling");
  const verified = scoped.filter(
    (r) =>
      r.verifiedValue &&
      (recordAttention(r) === "verified" || recordAttention(r) === "learned"),
  );

  const exposureRecords = needsYou.filter((r) => !isOpportunity(r));
  const opportunityRecords = needsYou.filter((r) => isOpportunity(r));

  const activeExposure = exposureRecords.reduce(
    (s, r) => s + attentionEuro(r),
    0,
  );
  const activeOpportunity = opportunityRecords.reduce(
    (s, r) => s + attentionEuro(r),
    0,
  );

  const verifiedByKind: ValueAggregate["verifiedByKind"] = {
    protected: 0,
    recovered: 0,
    created: 0,
    avoided: 0,
  };
  for (const r of verified) {
    const k = r.verifiedValue!.kind;
    verifiedByKind[k] += r.verifiedValue!.amount;
  }

  return {
    activeExposure,
    activeOpportunity,
    activeExposureOrOpportunity: activeExposure + activeOpportunity,
    pendingVerification: pending.reduce(
      (s, r) => s + (r.expectedContributionImpact ?? 0),
      0,
    ),
    verifiedByKind,
    verifiedTotal: Object.values(verifiedByKind).reduce((a, b) => a + b, 0),
    decisionIdsActiveExposure: exposureRecords.map((r) => r.id),
    decisionIdsActiveOpportunity: opportunityRecords.map((r) => r.id),
    decisionIdsPending: pending.map((r) => r.id),
    decisionIdsVerified: verified.map((r) => r.id),
  };
}
