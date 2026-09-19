import { describe, expect, it } from "vitest";
import {
  composeBerlinActiveRevenue,
  materialRecoveries,
  neverAutoSocial,
  openRecoveries,
  rankGuestOpportunities,
  isNoShowEligible,
  noShowState,
  shouldRecommendSocial,
  prepareSocialEscalation,
  composeRecoveryPlan,
} from "@/lib/radr/activeRevenue";
import { classifyAskIntent } from "@/lib/ai/intents";
import { getTerm } from "@/lib/radr/terminology";

describe("Active Revenue Intelligence", () => {
  it("surfaces material recovery opportunities with waitlist strategy first", () => {
    const brief = composeBerlinActiveRevenue();
    const open = openRecoveries(brief);
    const material = materialRecoveries(brief);
    expect(open.length).toBeGreaterThanOrEqual(2);
    expect(material.length).toBeGreaterThanOrEqual(1);
    const top = material.find((r) => r.trigger === "CANCELLATION")!;
    expect(top.recommendedStrategy).toBe("WAITLIST");
    expect(top.waitlistMatches.length).toBeGreaterThanOrEqual(3);
    expect(top.requiresApproval).toBe(true);
    expect(top.status).not.toBe("EXPIRED");
    expect(top.plan.steps[0]?.strategy).toBe("WAITLIST");
  });

  it("keeps at most one guest opportunity per table", () => {
    const brief = composeBerlinActiveRevenue();
    const tables = brief.guestOpportunities.map((g) => g.tableId);
    expect(new Set(tables).size).toBe(tables.length);
  });

  it("never recommends when safety is not clear", () => {
    const ranked = rankGuestOpportunities([
      {
        id: "bad",
        guestId: null,
        guestLabel: null,
        reservationId: "r",
        tableId: "t1",
        tableLabel: "T1",
        locationId: "loc",
        serviceId: "svc",
        opportunityType: "PAIRING",
        suggestion: "Unsafe fish",
        reason: ["High margin"],
        recommendedTiming: "arrival",
        timingLabel: "Arrival",
        expectedIncrementalRevenue: 100,
        expectedIncrementalContribution: 80,
        confidence: "high",
        safetyClear: false,
        inventoryAvailable: true,
        status: "SUGGESTED",
      },
      {
        id: "good",
        guestId: null,
        guestLabel: null,
        reservationId: "r2",
        tableId: "t2",
        tableLabel: "T2",
        locationId: "loc",
        serviceId: "svc",
        opportunityType: "APERITIF",
        suggestion: "Aperitif",
        reason: ["Occasion"],
        recommendedTiming: "arrival",
        timingLabel: "Arrival",
        expectedIncrementalRevenue: 40,
        expectedIncrementalContribution: 20,
        confidence: "medium",
        safetyClear: true,
        inventoryAvailable: true,
        status: "SUGGESTED",
      },
    ]);
    expect(ranked.map((g) => g.id)).toEqual(["good"]);
  });

  it("does not auto-post social recoveries", () => {
    const brief = composeBerlinActiveRevenue();
    expect(neverAutoSocial(brief)).toBe(true);
    for (const r of brief.recoveries) {
      if (r.socialPreview) {
        expect(r.socialPreview.requiresApproval).toBe(true);
      }
    }
  });

  it("links verified recovery to observed POS value", () => {
    const brief = composeBerlinActiveRevenue();
    const verified = brief.recoveries.find((r) => r.status === "VERIFIED");
    expect(verified?.verifiedRecoveredValue).toBeGreaterThan(0);
    expect(verified?.verifiedRecoveredValue).toBe(
      verified?.replacementActualSpend,
    );
  });

  it("exposes terminology for recovery and guest opportunity", () => {
    expect(getTerm("recoveryOpportunity").term).toMatch(/recovery/i);
    expect(getTerm("guestOpportunity").shortDefinition.toLowerCase()).toContain(
      "relevant",
    );
    expect(getTerm("activeRevenue").shortDefinition.toLowerCase()).toContain(
      "verify",
    );
    expect(getTerm("activeRevenue").shortDefinition.toLowerCase()).toContain(
      "not a sales quota",
    );
  });

  it("classifies active revenue Ask intents", () => {
    expect(
      classifyAskIntent("What are tonight's best guest opportunities?").intent,
    ).toBe("ACTIVE_REVENUE");
    expect(classifyAskIntent("What should Table 18 be offered?").intent).toBe(
      "ACTIVE_REVENUE",
    );
    expect(
      classifyAskIntent("How much revenue did we recover this month?").intent,
    ).toBe("ACTIVE_REVENUE");
    expect(classifyAskIntent("Any no-shows?").intent).toBe("ACTIVE_REVENUE");
    expect(classifyAskIntent("Should we post this opening?").intent).toBe(
      "ACTIVE_REVENUE",
    );
    expect(
      classifyAskIntent(
        "How much revenue did social recovery generate this month?",
      ).intent,
    ).toBe("ACTIVE_REVENUE");
  });
});

describe("Live Revenue Recovery", () => {
  it("uses configurable grace for no-show eligibility", () => {
    const brief = composeBerlinActiveRevenue();
    const grace = brief.config.noShow.gracePeriodMinutes;
    expect(grace).toBeGreaterThan(0);
    expect(isNoShowEligible(grace - 1, brief.config.noShow)).toBe(false);
    expect(isNoShowEligible(grace, brief.config.noShow)).toBe(true);
    expect(noShowState(8, brief.config.noShow)).toBe("LATE");
    expect(noShowState(grace, brief.config.noShow)).toBe("NO_SHOW_PENDING");
  });

  it("keeps cancellation and no-show as distinct triggers", () => {
    const brief = composeBerlinActiveRevenue();
    const cancel = brief.recoveries.find((r) => r.trigger === "CANCELLATION");
    const noshow = brief.recoveries.find((r) => r.trigger === "NO_SHOW");
    expect(cancel?.reservationState).toBe("CANCELLED");
    expect(noshow?.reservationState).toBe("NO_SHOW");
    expect(noshow?.minutesLate).toBe(brief.config.noShow.gracePeriodMinutes);
  });

  it("prepares social escalation without recommending social first", () => {
    const brief = composeBerlinActiveRevenue();
    const open = brief.recoveries.find((r) => r.id === "ari_cancel_t8")!;
    expect(shouldRecommendSocial(open)).toBe(false);
    expect(prepareSocialEscalation(open)).toBe(true);
    expect(open.plan.socialEscalation).toBe(true);
    expect(open.socialPreview?.channelId).toBe("instagram");
    expect(open.plan.steps.some((s) => s.strategy === "SOCIAL")).toBe(true);
  });

  it("holds for walk-ins when demand beats promotion", () => {
    const brief = composeBerlinActiveRevenue();
    const hold = brief.recoveries.find(
      (r) => r.recommendedStrategy === "WALK_IN_HOLD",
    )!;
    expect(hold.socialPreview).toBeNull();
    expect(hold.plan.steps[0]?.strategy).toBe("WALK_IN_HOLD");
  });

  it("exposes honest social provider capabilities and templates", () => {
    const brief = composeBerlinActiveRevenue();
    expect(brief.socialProviders.some((p) => p.id === "instagram")).toBe(true);
    expect(brief.socialProviders.find((p) => p.id === "x")?.connected).toBe(
      false,
    );
    expect(brief.templates.some((t) => t.favorite)).toBe(true);
    expect(brief.socialRoi.verifiedRecoveredRevenue).toBeGreaterThan(0);
    expect(brief.config.maxSocialPostsPerDay).toBeLessThanOrEqual(5);
  });

  it("composes a one-tap recovery plan", () => {
    const brief = composeBerlinActiveRevenue();
    const open = brief.recoveries.find((r) => r.id === "ari_cancel_t8")!;
    const plan = composeRecoveryPlan(open, {
      trigger: "CANCELLATION",
      socialPreview: open.socialPreview,
    });
    expect(plan.oneTapApprove).toBe(true);
    expect(plan.steps.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps inventory provider write flags honest", () => {
    const brief = composeBerlinActiveRevenue();
    for (const p of brief.inventoryProviders) {
      expect(p.canReleaseInventory).toBe(false);
      expect(typeof p.canOfferWaitlist).toBe("boolean");
    }
  });
});
