/**
 * Canonical Needs Judgment selector — single source for Center, Ledger, badges, Butler.
 */

import type { RoleView } from "@/lib/product/types";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type NeedsJudgmentQuery = {
  role: RoleView;
  vertical: DemoVerticalFamily;
  /** Optional location filter (GM / location deep link). */
  locationId?: string | null;
};

export function selectNeedsJudgment(
  q: NeedsJudgmentQuery,
): DecisionRecord[] {
  let scoped = scopedDecisionsForDemo(
    listDecisionRecords(),
    q.role,
    q.vertical,
  );
  if (q.locationId && q.locationId !== "all") {
    scoped = scoped.filter(
      (r) =>
        r.locationId === q.locationId ||
        r.locationId === "loc_ber" /* legacy */,
    );
  }
  return scoped.filter((r) => recordAttention(r) === "needs_you");
}

export function selectNeedsJudgmentCount(q: NeedsJudgmentQuery): number {
  return selectNeedsJudgment(q).length;
}
