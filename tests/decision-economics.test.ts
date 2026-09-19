/**
 * Business-critical economics — clock, attribution, sources.
 */

import { describe, expect, it } from "vitest";
import {
  tableCancellationClock,
  tunaEconomicClock,
  economicPriorityScore,
  attributeValue,
  demoValueUnderRadr,
  proofForVerifiedEuro,
  FSR_PRETAX_2024,
  illustrativeOnePoint,
} from "@/lib/radr/decision/economics";

describe("Economic clock", () => {
  it("decays table recovery to zero by service", () => {
    const clock = tableCancellationClock();
    expect(clock.decay[0]!.valueEuro).toBe(184);
    expect(clock.decay[clock.decay.length - 1]!.valueEuro).toBe(0);
  });

  it("tuna deteriorates after decide-by", () => {
    const clock = tunaEconomicClock();
    expect(clock.decideBy).toBe("17:15");
    expect(clock.deterioratesAfter).toBe("17:30");
    expect(clock.nowValueEuro).toBe(1840);
  });
});

describe("Priority score", () => {
  it("ranks higher value+urgency above low materiality", () => {
    const hot = economicPriorityScore({
      valueEuro: 1840,
      urgency01: 1,
      probability01: 0.82,
      reversibility: "moderate",
    });
    const cold = economicPriorityScore({
      valueEuro: 40,
      urgency01: 0.2,
      probability01: 0.4,
      reversibility: "easy",
    });
    expect(hot).toBeGreaterThan(cold);
  });

  it("safety override wins", () => {
    const safe = economicPriorityScore({
      valueEuro: 10,
      urgency01: 0.1,
      probability01: 0.1,
      reversibility: "hard",
      safetyOverride: true,
    });
    expect(safe).toBeGreaterThan(1e8);
  });
});

describe("Value attribution", () => {
  it("does not double-count same decision+kind", () => {
    const { verifiedEuro, byKind } = attributeValue([
      {
        id: "a",
        decisionId: "dec_x",
        kind: "recovered",
        amountEuro: 184,
        label: "Recovered",
        verified: true,
      },
      {
        id: "b",
        decisionId: "dec_x",
        kind: "recovered",
        amountEuro: 184,
        label: "Duplicate exposure claim",
        verified: true,
      },
      {
        id: "c",
        decisionId: "dec_y",
        kind: "protected",
        amountEuro: 1590,
        label: "Protected",
        verified: true,
      },
      {
        id: "d",
        decisionId: "dec_z",
        kind: "protected",
        amountEuro: 900,
        label: "Not verified",
        verified: false,
      },
    ]);
    expect(verifiedEuro).toBe(1774);
    expect(byKind.recovered).toBe(184);
    expect(byKind.protected).toBe(1590);
  });

  it("demo Value under RADR separates identified and verified", () => {
    const v = demoValueUnderRadr();
    expect(v.demo).toBe(true);
    expect(v.identifiedEuro).toBeGreaterThan(v.verifiedEuro);
    expect(v.actionableEuro).toBeLessThanOrEqual(v.identifiedEuro);
    expect(
      v.byKind.recovered +
        v.byKind.protected +
        v.byKind.created +
        v.byKind.avoided,
    ).toBe(v.verifiedEuro);
  });

  it("proof links euro to Decision Trace", () => {
    const p = proofForVerifiedEuro("dec_tuna_berlin");
    expect(p?.displayId).toBe("D-1842");
    expect(p?.actualEuro).toBe(1590);
    expect(p?.predictedEuro).toBe(1640);
    expect(p?.exposureEuro).toBe(1840);
  });
});

describe("Sourced industry evidence", () => {
  it("carries source metadata", () => {
    expect(FSR_PRETAX_2024.value).toBe("2.8%");
    expect(FSR_PRETAX_2024.region).toBe("United States");
    expect(FSR_PRETAX_2024.footnote).toMatch(/Not a global/);
  });

  it("labels illustrative economics", () => {
    const i = illustrativeOnePoint();
    expect(i.onePointEuro).toBe(100_000);
    expect(i.disclaimer).toMatch(/Illustrative/);
  });
});
