import { describe, expect, it } from "vitest";
import {
  DEMO_MENU_GRAPH,
  computeRevenueExposure,
  demoMenuAvailabilityRisk,
  isMenuAvailabilityEnabled,
  recomputeMenuAvailabilityRisk,
} from "@/lib/radr/menuAvailability";

describe("menu availability access", () => {
  it("enables illustrative risk in DEMO", () => {
    expect(isMenuAvailabilityEnabled("DEMO")).toBe(true);
  });
});

describe("exposure math", () => {
  it("keeps gross, expected loss, and contribution distinct", () => {
    const lines = [
      {
        menuItemId: "a",
        menuItemName: "A",
        expectedPortions: 10,
        portionsPossible: 2,
        shortfallPortions: 8,
        menuPrice: 100,
        contributionRate: 0.5,
        substituteRate: 0.5,
        substituteTicketRatio: 0.8,
      },
    ];
    const x = computeRevenueExposure(lines);
    // Gross = 8 × 100 = 800
    expect(x.grossRevenueAtRisk).toBe(800);
    // Retained = 8 × 100 × 0.5 × 0.8 = 320 → expected loss 480
    expect(x.expectedRevenueLoss).toBe(480);
    expect(x.contributionAtRisk).toBe(240);
    expect(x.expectedRevenueLoss).toBeLessThan(x.grossRevenueAtRisk);
    expect(x.contributionAtRisk).toBeLessThan(x.expectedRevenueLoss);
  });

  it("does not treat missing portions × price as expected loss when substitution exists", () => {
    const risk = recomputeMenuAvailabilityRisk({
      ...DEMO_MENU_GRAPH,
      runOutBy: "20:15",
      illustrative: true,
    });
    expect(risk.exposure.grossRevenueAtRisk).toBeGreaterThan(
      risk.exposure.expectedRevenueLoss,
    );
  });
});

describe("demo menu risk", () => {
  it("surfaces material bluefin risk with prepared options", () => {
    const risk = demoMenuAvailabilityRisk();
    expect(risk).not.toBeNull();
    expect(risk!.material).toBe(true);
    expect(risk!.portionsExpected).toBe(31);
    expect(risk!.portionsAvailable).toBeGreaterThanOrEqual(7);
    expect(risk!.portionsAvailable).toBeLessThan(risk!.portionsExpected);
    expect(risk!.exposure.contributionAtRisk).toBeGreaterThanOrEqual(250);
    expect(risk!.options.filter((o) => o.valueProtected > 0).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(risk!.options.every((o) => o.requiresApproval && !o.executableNow)).toBe(
      true,
    );
    expect(risk!.illustrative).toBe(true);
  });

  it("stays quiet when inventory covers demand", () => {
    const risk = recomputeMenuAvailabilityRisk({
      ...DEMO_MENU_GRAPH,
      inventory: { ...DEMO_MENU_GRAPH.inventory, onHand: 20 },
      runOutBy: null,
      illustrative: true,
    });
    expect(risk.material).toBe(false);
  });
});
