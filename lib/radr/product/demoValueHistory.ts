/**
 * Coherent demo value history for Control Center charts.
 * Derived from sealed verified Decisions — no Math.random.
 *
 * ILLUSTRATIVE DEMO HISTORY: prior MTD is the verified portfolio
 * excluding the most recent sealed recovery (D-4102 €273), so
 * "vs prior MTD" is deterministic and reconciles to the Decision ledger.
 */

import type { RoleView } from "@/lib/product/types";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";

export type VerifiedTrendPoint = {
  date: string;
  label: string;
  cumulative: number;
  stepAmount: number;
  decisionId: string | null;
  displayId: string | null;
  classLabel: string | null;
  locationLabel: string | null;
  note: string | null;
};

function verifiedStamp(r: {
  verifiedAt?: string;
  createdAt: string;
}): string {
  return (r.verifiedAt ?? r.createdAt).slice(0, 10);
}

/** Cumulative Verified Value over MTD from in-scope sealed Decisions. */
export function buildVerifiedValueTrend(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): VerifiedTrendPoint[] {
  const scoped = scopedDecisionsForDemo(listDecisionRecords(), role, vertical).filter(
    (r) =>
      r.verifiedValue &&
      (recordAttention(r) === "verified" || recordAttention(r) === "learned"),
  );

  const sorted = [...scoped].sort((a, b) =>
    verifiedStamp(a).localeCompare(verifiedStamp(b)),
  );

  const points: VerifiedTrendPoint[] = [];
  let cumulative = 0;

  // Opening baseline so the chart is not a single spike
  if (sorted.length > 0) {
    const first = verifiedStamp(sorted[0]!);
    points.push({
      date: first,
      label: "MTD open",
      cumulative: 0,
      stepAmount: 0,
      decisionId: null,
      displayId: null,
      classLabel: null,
      locationLabel: null,
      note: null,
    });
  }

  for (const r of sorted) {
    const amount = r.verifiedValue!.amount;
    cumulative += amount;
    const date = verifiedStamp(r);
    points.push({
      date,
      label: date.slice(5).replace("-", " · "),
      cumulative,
      stepAmount: amount,
      decisionId: r.id,
      displayId: displayDecisionId(r.id),
      classLabel: customerDecisionClass(r),
      locationLabel: locationDisplayName(r.locationId),
      note:
        r.verifiedValue!.kind === "recovered"
          ? "Recovered · evidence matched"
          : r.verifiedValue!.kind === "protected"
            ? "Protected · outcome sealed"
            : r.verifiedValue!.kind,
    });
  }

  return points;
}

/**
 * Prior MTD Verified = current verified total − D-4102 recovered €273
 * when that Decision is in scope. Deterministic comparison baseline.
 */
export function priorMtdVerifiedTotal(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): number {
  const agg = deriveValueAggregate(role, vertical);
  const supplierInScope = agg.decisionIdsVerified.includes(
    DECISION_IDS.supplier,
  );
  const supplierAmount = supplierInScope
    ? listDecisionRecords().find((r) => r.id === DECISION_IDS.supplier)
        ?.verifiedValue?.amount ?? 0
    : 0;
  return Math.max(0, agg.verifiedTotal - supplierAmount);
}
