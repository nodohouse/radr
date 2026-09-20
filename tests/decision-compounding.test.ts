/**
 * Compounding learning loop — OperatingMemory, knowledge, ingestion.
 */

import { describe, expect, it } from "vitest";
import {
  deriveKnowledgeLevel,
  knowledgeSummary,
  deriveIngestionLevel,
  berlinIngestionProfile,
  buildBerlinOperatingMemory,
  firstValueDecisionExample,
  buildTunaLearningUnit,
} from "@/lib/radr/decision/learning";

describe("Knowledge levels", () => {
  it("starts sparse and compounds to trusted", () => {
    expect(
      deriveKnowledgeLevel({
        verifiedDecisionCount: 0,
        decisionCount: 2,
        playbookCount: 0,
      }),
    ).toBe("STARTING");

    expect(
      deriveKnowledgeLevel({
        verifiedDecisionCount: 8,
        decisionCount: 12,
        playbookCount: 1,
      }),
    ).toBe("LEARNING");

    expect(
      deriveKnowledgeLevel({
        verifiedDecisionCount: 221,
        decisionCount: 284,
        playbookCount: 17,
        forecastErrorPct: 6.8,
        automationEligiblePlaybooks: 4,
      }),
    ).toBe("TRUSTED");

    expect(knowledgeSummary("TRUSTED")).toMatch(/automation/i);
  });
});

describe("Ingestion maturity", () => {
  it("does not require enterprise stack for first value", () => {
    const profile = berlinIngestionProfile();
    expect(profile.level).toBe("RICH_CONTEXT"); // weather connected
    expect(profile.sources.filter((s) => s.connected).length).toBeGreaterThan(0);
    expect(profile.firstValuePath).toMatch(/staffing/i);
    expect(profile.nextConnectAsk[0]).toMatch(/POS/i);

    const fileOnly = deriveIngestionLevel([
      {
        id: "csv",
        label: "CSV",
        level: "MANUAL_FILE",
        connected: true,
      },
    ]);
    expect(fileOnly).toBe("MANUAL_FILE");
  });
});

describe("OperatingMemory", () => {
  it("compounds location memory with playbook evolution", () => {
    const mem = buildBerlinOperatingMemory();
    expect(mem.stats.signalsProcessed).toBe(18420);
    expect(mem.stats.verifiedOutcomes).toBe(221);
    expect(mem.playbookEvolutions[0]!.v2.avgProtectedLiftPct).toBe(12);
    expect(mem.knowledge.level).toBe("TRUSTED");
    expect(mem.performance!.last30.verifiedValueEuro).toBeGreaterThan(
      mem.performance!.first30.verifiedValueEuro,
    );
    expect(mem.performance!.last30.forecastErrorPct).toBeLessThan(
      mem.performance!.first30.forecastErrorPct,
    );
  });

  it("first value is one useful decision from files", () => {
    const first = firstValueDecisionExample();
    expect(first.expectedProtectedEuro).toBe(186);
    expect(first.sources).toContain("Reservations");
    expect(first.nextConnects.length).toBe(3);
  });

  it("learning unit is location-first", () => {
    const unit = buildTunaLearningUnit();
    expect(unit.hierarchy).toBe("LOCATION");
    expect(unit.locationEvidence).toMatch(/Berlin Mitte/);
    expect(unit.playbookUpdate).toMatch(/v2/);
  });
});
