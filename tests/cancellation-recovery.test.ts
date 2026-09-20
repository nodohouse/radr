import { describe, expect, it, beforeEach } from "vitest";
import {
  buildCancellationRecoveryScenario,
  CANCELLATION_RECOVERY_ID,
  CANCELLATION_TIMELINE,
} from "@/lib/radr/scenarios/cancellationRecovery";
import {
  butlerTable14RecoveryAnswer,
  getCancellationRecoveryScenario,
  getVerifiedValueFromScenarios,
  resetCancellationRecoveryScenario,
  acceptCancellationRecoveryAction,
  seatCancellationRecovery,
  verifyCancellationRecovery,
} from "@/lib/radr/scenarios/store";
import { findingsForScope } from "@/lib/radr/findings";
import { resolveButlerQuery } from "@/lib/radr/butler/tools";
import { getRadrEnvironment, environmentChrome } from "@/lib/radr/env";

describe("cancellation recovery gold standard", () => {
  beforeEach(() => {
    resetCancellationRecoveryScenario("VERIFIED");
  });

  it("verifies €184 not €192", () => {
    const s = buildCancellationRecoveryScenario("VERIFIED");
    expect(s.potentialRecoverableMajor).toBe(192);
    expect(s.verification?.verifiedValue).toBe(184);
    expect(s.verification?.verifiedValue).toBeLessThan(
      s.potentialRecoverableMajor,
    );
    expect(s.timeline).toHaveLength(CANCELLATION_TIMELINE.length);
  });

  it("lifecycle: propose → accept → seat → verify", () => {
    resetCancellationRecoveryScenario("PROPOSED");
    expect(getCancellationRecoveryScenario().actionStatus).toBe("PROPOSED");
    acceptCancellationRecoveryAction();
    expect(getCancellationRecoveryScenario().actionStatus).toBe("ACCEPTED");
    seatCancellationRecovery();
    expect(getCancellationRecoveryScenario().actionStatus).toBe("COMPLETED");
    verifyCancellationRecovery();
    expect(getCancellationRecoveryScenario().actionStatus).toBe("VERIFIED");
    expect(getVerifiedValueFromScenarios().verified).toBe(184);
  });

  it("finding engine surfaces scenario finding for Berlin", () => {
    const findings = findingsForScope("loc_ber");
    const recovery = findings.find((f) => f.id === CANCELLATION_RECOVERY_ID);
    expect(recovery).toBeTruthy();
    expect(recovery!.financialImpact.primaryValue).toBe(184);
  });

  it("Butler Table 14 answer matches verified ledger", () => {
    const a = butlerTable14RecoveryAnswer();
    expect(a.answer).toContain("184");
    expect(a.answer.includes("192 verified")).toBe(false);
    const butler = resolveButlerQuery(
      "How much did we recover from the Table 14 cancellation?",
      {
        locationScope: "loc_ber",
        period: "today",
        role: "location_manager",
        allowedLocationIds: ["loc_ber"],
      },
    );
    expect(butler.answer).toContain("184");
    expect(
      butler.evidence.some(
        (e) =>
          e.value.includes(CANCELLATION_RECOVERY_ID) || e.label === "Finding",
      ),
    ).toBe(true);
  });
});

describe("environment separation", () => {
  it("defaults to DEMO chrome", () => {
    expect(getRadrEnvironment()).toBe("DEMO");
    expect(environmentChrome()).toContain("DEMO");
  });
});
