import { describe, expect, it } from "vitest";
import { findingsForScope } from "@/lib/radr/findings";
import {
  attentionNowFindings,
  currentExposureFromFindings,
  verifiedFromFindings,
} from "@/lib/radr/valueSemantics";
import { getOperatingSnapshot } from "@/lib/radr/operatingSnapshot";
import { recoverLifecycleFromCanonical } from "@/lib/radr/recoverLedger";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import {
  BERLIN_TERRACE_WEATHER,
  berlinTerraceOpportunity,
  calculateTerraceWeatherOpportunity,
} from "@/lib/radr/weather/calc";
import { DEMO_AS_OF_ISO, DEMO_BUSINESS_DATE, isAfterDemoAsOf } from "@/lib/radr/demoClock";
import { orchestrateAskSync } from "@/lib/ai";
import { classifyAskIntent } from "@/lib/ai/intents";
import { buildLocationTonightPulse } from "@/lib/radr/servicePulse";

const ctx = {
  locationScope: "loc_ber",
  period: "today",
  role: "location_manager" as const,
  allowedLocationIds: ["loc_ber"],
};

describe("canonical demo ledger", () => {
  it("290 + 118 = 408 current exposure; verified 184 excluded", () => {
    const findings = findingsForScope("loc_ber");
    const attention = attentionNowFindings(findings);
    expect(attention).toHaveLength(2);
    expect(attention.every((f) => f.status !== "VERIFIED")).toBe(true);
    expect(attention.every((f) => f.status !== "RESOLVED")).toBe(true);
    expect(attention.some((f) => f.category === "weather_sensitive_demand")).toBe(
      false,
    );
    expect(currentExposureFromFindings(findings)).toBe(408);
    expect(verifiedFromFindings(findings)).toBe(184);
    expect(getVerifiedValueFromScenarios().verified).toBe(184);
  });

  it("cancellation potential 192 resolves to observed verified 184", () => {
    const cancel = getCancellationRecoveryScenario();
    expect(cancel.potentialRecoverableMajor).toBe(192);
    expect(cancel.pos.observedRevenueMajor).toBe(184);
    expect(cancel.verification?.verifiedValue).toBe(184);
  });

  it("Control Center snapshot totals reconcile with the ledger", () => {
    const snap = getOperatingSnapshot("loc_ber", "today");
    expect(snap.attention.atRiskEuro).toBe(408);
    expect(snap.attention.open).toBe(2);
  });

  it("recover totals reconcile", () => {
    const r = recoverLifecycleFromCanonical();
    expect(r.found).toBe(310);
    expect(r.stillRecoverable).toBe(118);
    expect(r.inAction).toBe(0);
    expect(r.verified).toBe(184);
  });

  it("weather opportunity is calculated from fixture inputs", () => {
    const opp = berlinTerraceOpportunity();
    expect(opp.additionalExpectedCovers).toBe(
      BERLIN_TERRACE_WEATHER.expectedDemandCovers -
        BERLIN_TERRACE_WEATHER.scheduledTerraceCapacity,
    );
    expect(opp.grossOpportunity).toBe(
      opp.additionalExpectedCovers * BERLIN_TERRACE_WEATHER.contributionPerCover,
    );
    expect(opp.grossOpportunity).toBe(420);
    expect(opp.netOpportunity).toBe(
      opp.grossOpportunity - BERLIN_TERRACE_WEATHER.fohCostToCapture,
    );
    expect(opp.netOpportunity).toBe(348);
    expect(opp.doNothingValue).toBe(
      (BERLIN_TERRACE_WEATHER.expectedDemandCovers -
        BERLIN_TERRACE_WEATHER.fohPlanCovers) *
        BERLIN_TERRACE_WEATHER.contributionPerCover,
    );
  });

  it("weather opportunity changes when covers or contribution change", () => {
    const base = berlinTerraceOpportunity();
    const moreCovers = calculateTerraceWeatherOpportunity({
      ...BERLIN_TERRACE_WEATHER,
      expectedDemandCovers: BERLIN_TERRACE_WEATHER.expectedDemandCovers + 2,
    });
    expect(moreCovers.grossOpportunity).toBe(base.grossOpportunity + 60);
    const higherContrib = calculateTerraceWeatherOpportunity({
      ...BERLIN_TERRACE_WEATHER,
      contributionPerCover: 40,
    });
    expect(higherContrib.grossOpportunity).toBe(
      base.additionalExpectedCovers * 40,
    );
  });

  it("weather finding is SELL for Berlin and not in urgent queue", () => {
    const findings = findingsForScope("loc_ber");
    const wx = findings.find((f) => f.category === "weather_sensitive_demand");
    expect(wx).toBeTruthy();
    expect(wx!.territory).toBe("SELL");
    expect(wx!.locationId).toBe("loc_ber");
    expect(wx!.financialImpact.primaryValue).toBe(420);
    expect(attentionNowFindings(findings).some((f) => f.id === wx!.id)).toBe(
      false,
    );
  });

  it("service pulse uses Table 14 verified outcome, not orphan at-risk euros", () => {
    const pulse = buildLocationTonightPulse();
    const econ = pulse.cancellationEconomics;
    expect(econ.mode).toBe("verified_outcome");
    expect(econ.currentlyAtRisk).toBe(0);
    expect(econ.verifiedValue).toBe(184);
    expect(econ.potentialRecovery).toBe(192);
    expect(econ.bookingValue).toBe(256);
  });

  it("demo clock: no finding timestamps in the future of as-of", () => {
    expect(DEMO_BUSINESS_DATE).toBe("2026-08-19");
    const findings = findingsForScope("loc_ber");
    for (const f of findings) {
      expect(isAfterDemoAsOf(f.createdAt)).toBe(false);
      expect(isAfterDemoAsOf(f.updatedAt)).toBe(false);
    }
    expect(isAfterDemoAsOf(DEMO_AS_OF_ISO)).toBe(false);
  });

  it("Ask RADR attention uses the same 408 as the UI", () => {
    const result = orchestrateAskSync("What needs my attention?", ctx);
    expect(result.response.impactEuro).toBe(408);
  });

  it("Ask RADR weather returns the same €420 gross as the fixture", () => {
    expect(classifyAskIntent("Will the weather affect us tomorrow?").intent).toBe(
      "WEATHER_CONTEXT",
    );
    const result = orchestrateAskSync(
      "Will the weather affect us tomorrow?",
      ctx,
    );
    expect(result.response.impactEuro).toBe(420);
    expect(result.response.answer).toMatch(/€420|420/);
    expect(result.response.answer).toMatch(/€348|348/);
  });

  it("Ask RADR distinguishes €192 potential from €184 verified", () => {
    const result = orchestrateAskSync(
      "Did we recover the Table 14 cancellation?",
      ctx,
    );
    expect(result.response.impactEuro).toBe(184);
    expect(result.response.answer).toMatch(/184/);
    expect(result.response.answer).not.toMatch(/Verified value is €192/);
  });
});
