import { describe, expect, it } from "vitest";
import { computeMenuCriticality } from "@/lib/radr/menuAvailability/criticality";
import {
  demoBluefinSourcingDecision,
  rankSourcingOptions,
} from "@/lib/radr/menuAvailability/sourcingDecision";
import { composeMenuDecisionBrief } from "@/lib/radr/preShift/menuDecisionBrief";

describe("menu criticality", () => {
  it("escalates signature + bestseller shortages to CRITICAL", () => {
    const c = computeMenuCriticality([
      {
        menuItemId: "mi_tataki",
        name: "Tuna Tataki",
        salesRank: 2,
        contributionRank: 1,
        unitsSoldLast8Weeks: 400,
        menuMixSharePct: 12.4,
        repeatGuestOrderPct: 18,
        signatureFlag: true,
        stapleFlag: true,
        substitutionRate: 0.22,
        expectedPortionsTonight: 18,
        revenueExposure: 680,
        contributionExposure: 420,
      },
      {
        menuItemId: "mi_nigiri",
        name: "Bluefin Nigiri",
        salesRank: 6,
        contributionRank: 5,
        unitsSoldLast8Weeks: 180,
        menuMixSharePct: 5.8,
        repeatGuestOrderPct: 9,
        signatureFlag: false,
        stapleFlag: false,
        substitutionRate: 0.18,
        expectedPortionsTonight: 9,
        revenueExposure: 340,
        contributionExposure: 210,
      },
    ]);
    expect(c.level).toBe("CRITICAL");
    expect(c.guestImpact).toBe("High");
    expect(c.reasons.some((r) => /signature|#2/i.test(r))).toBe(true);
  });

  it("keeps low-rank dishes at LOW", () => {
    const c = computeMenuCriticality([
      {
        menuItemId: "mi_x",
        name: "Bluefin Crispy Rice",
        salesRank: 18,
        contributionRank: 20,
        unitsSoldLast8Weeks: 12,
        menuMixSharePct: 0.4,
        repeatGuestOrderPct: 1,
        signatureFlag: false,
        stapleFlag: false,
        substitutionRate: 0.5,
        expectedPortionsTonight: 3,
        revenueExposure: 90,
        contributionExposure: 40,
      },
    ]);
    expect(c.level).toBe("LOW");
  });
});

describe("sourcing decision", () => {
  it("recommends the highest net expected value", () => {
    const ranked = rankSourcingOptions([
      {
        id: "a",
        title: "A",
        kind: "ALLOW_SELL_OUT",
        costPremium: 0,
        revenueProtected: 0,
        contributionProtected: 0,
        netExpectedValue: -200,
        detail: "",
      },
      {
        id: "b",
        title: "B",
        kind: "EMERGENCY_SOURCE",
        costPremium: 86,
        revenueProtected: 1180,
        contributionProtected: 644,
        netExpectedValue: 558,
        detail: "",
      },
    ]);
    expect(ranked[0]!.id).toBe("b");
    expect(ranked[0]!.recommended).toBe(true);
  });

  it("demo bluefin decision recommends emergency source", () => {
    const d = demoBluefinSourcingDecision({
      contributionAtRisk: 730,
      grossRevenueAtRisk: 1180,
      expectedRevenueLoss: 1180,
    });
    expect(d.recommendedId).toBe("src_emergency");
    expect(d.decideBy).toBe("17:15");
    expect(d.whyNow.length).toBeGreaterThan(2);
  });
});

describe("menu decision brief", () => {
  it("answers SO WHAT for bluefin", () => {
    const b = composeMenuDecisionBrief();
    expect(b).not.toBeNull();
    expect(b!.portionsExpected).toBe(31);
    expect(b!.portionsAvailable).toBe(9);
    expect(b!.contributionAtRisk).toBe(730);
    expect(b!.criticality.level).toBe("CRITICAL");
    expect(b!.soWhat).toMatch(/#2|sell out|contribution/i);
    expect(b!.sourcing.recommendedId).toBe("src_emergency");
  });
});
