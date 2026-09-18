/**
 * Canonical demo data — single source of truth consistency.
 */

import { describe, expect, it } from "vitest";
import {
  CANON_TUNA,
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_CREATED,
  CANON_TABLE,
  CANON_BY_ID,
  canonChosen,
  canonRecommended,
  formatCanonVariance,
} from "@/lib/radr/decision/demo/canonical";
import { buildTunaDecisionRecord } from "@/lib/radr/decision/demos/tuna";
import { HERO_VERTICAL_SCENARIOS } from "@/components/marketing/data/homepageVerticalDemos";
import { proofForVerifiedEuro } from "@/lib/radr/decision/economics";
import { DEMO_WORLD } from "@/data/demo";

describe("Flagship restaurant D-1911", () => {
  it("is the demo-world restaurant Decision", () => {
    expect(DEMO_WORLD.restaurant.displayId).toBe("D-1911");
    expect(DEMO_WORLD.restaurant.id).toBe(CANON_PEAK.id);
  });

  it("has consistent peak-capacity economics", () => {
    expect(CANON_PEAK.displayId).toBe("D-1911");
    expect(CANON_PEAK.exposureEuro).toBe(620);
    expect(canonRecommended(CANON_PEAK).id).toBe("wait_12");
    expect(canonChosen(CANON_PEAK).expectedContributionEuro).toBe(620);
    expect(CANON_PEAK.expectedProtectedEuro).toBe(620);
    expect(CANON_PEAK.actualProtectedEuro).toBe(590);
    expect(CANON_PEAK.forecastVarianceEuro).toBe(-30);
    const seat = CANON_PEAK.scenarios.find((s) => s.id === "seat_now");
    expect(seat?.isNoAction).toBe(true);
    expect(seat?.expectedContributionEuro).toBe(0);
  });

  it("matches hero restaurant pre/after economics", () => {
    const pre = HERO_VERTICAL_SCENARIOS.restaurant.frames.pre.critical!;
    expect(pre.stakeValue).toBe(CANON_PEAK.exposureEuro);
    expect(pre.protectedAmount).toBe("€620");
    expect(pre.recommends.primary).toMatch(/Wait 12/i);
    expect(pre.recommends.primary).not.toMatch(/Truffle|rush 6/i);
    const after = HERO_VERTICAL_SCENARIOS.restaurant.frames.after.verified;
    expect(after.amount).toBe(CANON_PEAK.actualProtectedEuro);
  });

  it("CFO proof audits the flagship Decision", () => {
    const proof = proofForVerifiedEuro(CANON_PEAK.id);
    expect(proof?.displayId).toBe("D-1911");
    expect(proof?.predictedEuro).toBe(620);
    expect(proof?.actualEuro).toBe(590);
    expect(proof?.exposureEuro).toBe(620);
  });

  it("passes the under-the-RADR source test", () => {
    const blob = CANON_PEAK.evidence.map((e) => e.label).join(" ");
    expect(blob).toMatch(/Reservations|inbound/i);
    expect(blob).toMatch(/KDS|ticket/i);
    expect(blob).toMatch(/Kitchen/i);
    expect(blob).toMatch(/Delivery/i);
    expect(blob).toMatch(/Second-turn|turn/i);
  });
});

describe("Library D-1842 supplier / stock", () => {
  it("remains consistent in the demo library", () => {
    expect(CANON_TUNA.displayId).toBe("D-1842");
    expect(CANON_TUNA.exposureEuro).toBe(1840);
    expect(canonRecommended(CANON_TUNA).id).toBe("feature_swap");
    expect(CANON_TUNA.expectedProtectedEuro).toBe(1640);
    expect(CANON_TUNA.actualProtectedEuro).toBe(1590);
  });

  it("matches Decision Record demo economics", () => {
    const learned = buildTunaDecisionRecord("LEARNED");
    expect(learned.id).toBe(CANON_TUNA.id);
    expect(learned.verifiedValue?.amount).toBe(CANON_TUNA.actualProtectedEuro);
  });

  it("uses portion units consistently for shortfall", () => {
    expect(CANON_TUNA.problemLine).toMatch(/6 portions short/);
    expect(CANON_TUNA.problemLine).not.toMatch(/kg/i);
    const rush = CANON_TUNA.scenarios.find((s) => s.id === "supplier_first");
    expect(rush?.title).toBe("Rush 6 portions");
  });
});

describe("Canonical hotel and apartment", () => {
  it("keeps OTA and orphan IDs stable with believable variance", () => {
    expect(CANON_OTA.displayId).toBe("D-2201");
    expect(CANON_OTA.property).toBe("Canal House · Amsterdam");
    expect(CANON_OTA.expectedProtectedEuro).toBe(3100);
    expect(CANON_OTA.actualProtectedEuro).toBe(2960);
    expect(CANON_OTA.verifiedKind).toBe("protected");
    expect(CANON_OTA.unitEconomics?.otaPath.expectedContribution).toBe(306);
    expect(CANON_OTA.unitEconomics?.directPath.expectedContribution).toBe(429);
    expect(CANON_ORPHAN.displayId).toBe("D-3104");
    expect(CANON_ORPHAN.property).toBe("Chiado Collective · Lisbon");
    expect(CANON_ORPHAN.property).not.toMatch(/Barcelona/i);
    expect(CANON_ORPHAN.actualProtectedEuro).toBe(118);
    expect(CANON_ORPHAN.observedContributionEuro).toBe(118);
    expect(CANON_ORPHAN.counterfactualContributionEuro).toBe(78);
    expect(CANON_ORPHAN.verifiedIncrementalEuro).toBe(40);
    expect(CANON_ORPHAN.recommendedRateEuro).toBe(148);
    expect(CANON_ORPHAN.expectedProtectedEuro).toBe(112);
    expect(CANON_ORPHAN.exposureEuro).toBe(164);
    expect(CANON_ORPHAN.verifiedKind).toBe("recovered");
  });

  it("registers D-4410 and D-6671 with labeled economics", () => {
    expect(CANON_CREATED.displayId).toBe("D-4410");
    expect(CANON_CREATED.actualProtectedEuro).toBe(620);
    expect(CANON_TABLE.displayId).toBe("D-6671");
    expect(CANON_TABLE.actualProtectedEuro).toBe(184);
    expect(CANON_BY_ID[CANON_PEAK.id]).toBe(CANON_PEAK);
  });

  it("keeps D-2201 evidence free of restaurant context", () => {
    const blob = CANON_OTA.evidence.map((e) => `${e.label} ${e.value}`).join(" ");
    expect(blob).not.toMatch(/Tataki|Chef|covers/i);
    expect(blob).toMatch(/occupancy/i);
  });
});

describe("Economic metric labels", () => {
  it("labels orphan as net contribution / verified recovered", async () => {
    const {
      expectedMetricLabel,
      observedMetricLabel,
      verifiedMetricLabel,
      verifiedEuro,
      scenarioMetricCaption,
    } = await import("@/lib/radr/decision/demo/canonical");
    expect(expectedMetricLabel(CANON_ORPHAN)).toBe("Expected net contribution");
    expect(observedMetricLabel(CANON_ORPHAN)).toBe("Observed net contribution");
    expect(verifiedMetricLabel(CANON_ORPHAN)).toBe("Verified recovered value");
    expect(verifiedEuro(CANON_ORPHAN)).toBe(40);
    expect(expectedMetricLabel(CANON_OTA)).toBe("Expected protected");
    expect(verifiedMetricLabel(CANON_OTA)).toBe("Verified protected");
    const release = CANON_OTA.scenarios.find((s) => s.id === "do_nothing")!;
    expect(scenarioMetricCaption(release)).toBe(
      "Incremental contribution vs baseline",
    );
  });
});
