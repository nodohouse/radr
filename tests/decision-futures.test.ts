/**
 * RADR Futures + homepage Decision loop.
 */

import { describe, expect, it } from "vitest";
import {
  buildRainFutures,
  pickRecommended,
  rankScenarios,
  scoreScenario,
  RAIN_FUTURES_ACTUAL,
} from "@/lib/radr/decision/futures";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { buildTunaDecisionRecord } from "@/lib/radr/decision/demos/tuna";

describe("Futures ranking", () => {
  it("recommends risk-adjusted D over pure max when risk differs", () => {
    const bundle = buildRainFutures();
    expect(bundle.recommendedScenarioId).toBe("fut_rain_d");
    const d = bundle.scenarios.find((s) => s.id === "fut_rain_d")!;
    const a = bundle.scenarios.find((s) => s.id === "fut_rain_a")!;
    expect(d.expectedContribution).toBeGreaterThan(a.expectedContribution);
    expect(d.operationalRisk).toBe("low");
    expect(bundle.incrementalVsNoAction).toBe(373);
  });

  it("can prefer safer lower EV under high risk aversion", () => {
    const scenarios = [
      {
        id: "high",
        decisionId: "x",
        label: "High EV high risk",
        actionSet: [],
        assumptions: [],
        probability: 0.4,
        expectedContribution: 6000,
        expectedGuestImpact: "medium" as const,
        expectedCapacityImpact: "high" as const,
        operationalRisk: "high" as const,
        downside: 4200,
        upside: 6500,
        confidence: 60,
        constraintViolations: [],
      },
      {
        id: "safe",
        decisionId: "x",
        label: "Safer",
        actionSet: [],
        assumptions: [],
        probability: 0.5,
        expectedContribution: 5870,
        expectedGuestImpact: "low" as const,
        expectedCapacityImpact: "low" as const,
        operationalRisk: "low" as const,
        downside: 5520,
        upside: 6100,
        confidence: 80,
        constraintViolations: [],
      },
    ];
    const pick = pickRecommended(scenarios, {
      primary: "balanced",
      riskAversion: "high",
    });
    expect(pick.id).toBe("safe");
  });

  it("blocks illegal scenarios", () => {
    const blocked = {
      id: "bad",
      decisionId: "x",
      label: "Blocked",
      actionSet: [],
      assumptions: [],
      probability: 1,
      expectedContribution: 99999,
      expectedGuestImpact: "none" as const,
      expectedCapacityImpact: "none" as const,
      operationalRisk: "low" as const,
      downside: 99999,
      upside: 99999,
      confidence: 99,
      constraintViolations: [
        {
          constraintId: "allergy",
          label: "Allergy safety",
          severity: "block" as const,
        },
      ],
    };
    const ok = {
      ...blocked,
      id: "ok",
      expectedContribution: 100,
      constraintViolations: [],
    };
    const ranked = rankScenarios([blocked, ok], {
      primary: "balanced",
      riskAversion: "medium",
    });
    expect(ranked[0]!.id).toBe("ok");
    expect(scoreScenario(blocked, { primary: "balanced", riskAversion: "medium" })).toBeLessThan(
      -1e11,
    );
  });

  it("stores actual vs simulated for learning", () => {
    expect(RAIN_FUTURES_ACTUAL.errorPct).toBe(0.8);
    expect(RAIN_FUTURES_ACTUAL.dnaUpdates.length).toBeGreaterThan(0);
  });
});

describe("Homepage Decision identity", () => {
  it("maps tuna to D-1842 and peak to D-1911", () => {
    expect(displayDecisionId(DECISION_IDS.tuna)).toBe("D-1842");
    expect(displayDecisionId(DECISION_IDS.peak)).toBe("D-1911");
    expect(displayDecisionId(DECISION_IDS.rain)).toBe("D-1908");
  });

  it("tuna loop has trace ledger through learn", () => {
    const learned = buildTunaDecisionRecord("LEARNED");
    expect(learned.ledger.some((e) => e.kind === "verify")).toBe(true);
    expect(learned.ledger.some((e) => e.kind === "learn")).toBe(true);
    expect(learned.verifiedValue?.amount).toBe(1590);
    expect(learned.playbookImpact).toBeTruthy();
  });
});
