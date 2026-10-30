/**
 * MoneyImpact + D-1842 incremental reconciliation.
 */
import { describe, expect, it } from "vitest";
import { CANON_TUNA } from "@/lib/radr/decision/demo/canonical";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import {
  incrementalVsNoActionEuro,
  exposureFromNoAction,
} from "@/lib/radr/decision/economics/moneyImpact";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("MoneyImpact convention", () => {
  it("incremental = selected − noAction under Peak convention", () => {
    expect(incrementalVsNoActionEuro(1640, 0)).toBe(1640);
    // Legacy negative no-action must not double-count exposure
    expect(incrementalVsNoActionEuro(1640, -1840)).toBe(1640);
  });

  it("D-1842 futures incremental is €1,640 not €3,480", () => {
    const bundle = futuresFromCanon(CANON_TUNA);
    expect(CANON_TUNA.id).toBe(DECISION_IDS.tuna);
    expect(CANON_TUNA.exposureEuro).toBe(1840);
    const baseline = CANON_TUNA.scenarios.find((s) => s.isNoAction)!;
    expect(baseline.expectedContributionEuro).toBe(0);
    const selected = CANON_TUNA.scenarios.find((s) => s.recommended)!;
    expect(selected.expectedContributionEuro).toBe(1640);
    expect(bundle.incrementalVsNoAction).toBe(1640);
    expect(bundle.incrementalVsNoAction).not.toBe(3480);
  });

  it("exposure is a separate MoneyImpact kind", () => {
    const exp = exposureFromNoAction(0, 1840);
    expect(exp?.kind).toBe("EXPOSURE");
    expect(exp?.amountEuro).toBe(-1840);
  });
});
