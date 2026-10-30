/** Ask reads the same live Decision record as the app; legacy replay is not current proof. */
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { recordAttention } from "@/lib/radr/product/roleScope";

export function table14DecisionTruth() {
  const record = getDecisionRecord(DECISION_IDS.tableRecover);
  const band = record ? recordAttention(record) : null;
  const verified = Boolean(record?.verifiedValue && (band === "verified" || band === "learned"));
  return {
    record,
    expected: record?.expectedContributionImpact ?? 0,
    observed: record?.actualContributionImpact ?? record?.outcomeDetail?.observedContributionEuro ?? null,
    verified: verified ? record?.verifiedValue?.amount ?? 0 : 0,
    isVerified: verified,
    status: record?.status ?? "DETECTED",
  };
}


import type { ButlerContext } from "./types";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { scopedDecisionsForDemo } from "@/lib/radr/product/roleScope";
import { recordsForLocationSelection } from "@/lib/radr/product/selectedScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { decisionSummary } from "@/lib/radr/product/decisionSummary";
import { getEstateEntity } from "@/lib/radr/demo/estateRegistry";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";

export function scopedButlerDecisionTruth(ctx: Pick<ButlerContext,"role"|"locationScope"|"organizationId">) {
  const role = ctx.role === "group_cfo" ? "cfo" : ctx.role === "regional_manager" ? "regional" : "gm";
  const vertical = ctx.organizationId === "org_northstar_hotels" ? "hotel" : getEstateEntity(toCanonicalLocationId(ctx.locationScope))?.vertical ?? "restaurant";
  const records = recordsForLocationSelection(scopedDecisionsForDemo(listDecisionRecords(),role,vertical),ctx.locationScope);
  return { records, summary:decisionSummary(records), value:deriveValueAggregate(role,vertical,records) };
}
