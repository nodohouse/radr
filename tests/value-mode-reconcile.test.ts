import { describe, expect, it } from "vitest";
import { resetDecisionStore, getDecisionStoreSnapshot } from "@/lib/radr/decision/store";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { euroTraceForDecision } from "@/lib/radr/product/euroTrace";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("Verified Value mode reconcile", () => {
  it("by-class and by-location sums equal verifiedTotal for restaurant GM", () => {
    resetDecisionStore();
    const snap = getDecisionStoreSnapshot();
    const aggregate = deriveValueAggregate("gm", "restaurant");
    const verified = scopedDecisionsForDemo(
      Object.values(snap.records),
      "gm",
      "restaurant",
    ).filter(
      (r) =>
        r.verifiedValue &&
        (r.verifiedValue.amount ?? 0) > 0 &&
        (recordAttention(r) === "verified" ||
          recordAttention(r) === "learned"),
    );

    const byClass = new Map<string, number>();
    const byLocation = new Map<string, number>();
    for (const r of verified) {
      const c = customerDecisionClass(r);
      byClass.set(c, (byClass.get(c) ?? 0) + (r.verifiedValue?.amount ?? 0));
      const loc = locationDisplayName(r.locationId);
      byLocation.set(
        loc,
        (byLocation.get(loc) ?? 0) + (r.verifiedValue?.amount ?? 0),
      );
    }
    const classSum = [...byClass.values()].reduce((s, v) => s + v, 0);
    const locSum = [...byLocation.values()].reduce((s, v) => s + v, 0);
    expect(classSum).toBe(aggregate.verifiedTotal);
    expect(locSum).toBe(aggregate.verifiedTotal);
  });

  it("TRACE THIS EURO exists for sealed Peak · Supplier · and miss", () => {
    resetDecisionStore();
    const supplier = euroTraceForDecision(DECISION_IDS.supplier);
    expect(supplier?.kind).toBe("verified");
    expect(supplier?.chain.length).toBeGreaterThanOrEqual(4);

    const peak = euroTraceForDecision(DECISION_IDS.peak);
    // Peak may be active (not yet verified) — if sealed, must have chain
    if (peak) {
      expect(peak.chain.length).toBeGreaterThanOrEqual(3);
    }

    const miss = euroTraceForDecision(DECISION_IDS.created);
    expect(miss?.kind).toBe("miss");
    expect(miss?.verifiedEuro).toBe(0);
  });
});
