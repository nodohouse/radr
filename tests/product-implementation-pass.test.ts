import { describe, expect, it, beforeEach } from "vitest";
import {
  assertActionTransition,
  canAdvanceEconomicState,
  canTransitionAction,
} from "@/lib/radr/actions/transitions";
import {
  createActionFromFinding,
  transitionActionSafe,
  verifyOutcome,
  __resetActionMemory,
} from "@/lib/radr/actions/service";
import { proposeActionFromFinding } from "@/lib/radr/domain";
import { findingsForScope } from "@/lib/radr/findings";
import {
  assertCanonicalLedger,
  CANONICAL_EVENTS,
  canonicalUnresolvedExposure,
} from "@/lib/radr/canonicalDemo";
import {
  RADR_CAPABILITIES,
  capabilityById,
} from "@/lib/radr/capabilityStatus";
import {
  seedDemoVerifiedWork,
  verifiedWorkSummary,
  __resetVerifiedWorkMemory,
} from "@/lib/radr/verifiedWork";
import { demoBerlinDinnerPeriod } from "@/lib/radr/domain/servicePeriod";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations/registry";
import { orchestrateAskSync } from "@/lib/ai";

const ctx = {
  locationScope: "loc_ber",
  period: "today",
  role: "location_manager" as const,
  allowedLocationIds: ["loc_ber"],
};

describe("action state machine", () => {
  beforeEach(() => {
    __resetActionMemory();
  });

  it("allows PROPOSED → ACCEPTED → IN_PROGRESS → COMPLETED with MANUAL mode", () => {
    const labor = findingsForScope("loc_ber").find((f) => f.territory === "LABOR")!;
    createActionFromFinding(labor, "op", "act_sm_1");
    expect(canTransitionAction("PROPOSED", "ACCEPTED")).toBe(true);
    expect(canTransitionAction("PROPOSED", "COMPLETED")).toBe(false);

    const accepted = transitionActionSafe("act_sm_1", "ACCEPTED");
    expect(accepted.ok).toBe(true);

    const started = transitionActionSafe("act_sm_1", "IN_PROGRESS");
    expect(started.ok).toBe(true);

    const done = transitionActionSafe("act_sm_1", "COMPLETED");
    expect(done.ok).toBe(true);
  });

  it("blocks COMPLETED when capability is NONE and mode is UNSUPPORTED", () => {
    const action = proposeActionFromFinding({
      id: "act_blocked",
      findingId: "f1",
      organizationId: "org_northstar",
      locationId: "loc_ber",
      title: "Blocked",
      description: "No connector",
      createdBy: "op",
      executionCapability: "NONE",
      executionMode: "UNSUPPORTED",
    });
    const gate = assertActionTransition(
      { ...action, status: "IN_PROGRESS" },
      "COMPLETED",
    );
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.code).toBe("EXECUTION_UNSUPPORTED");
  });

  it("blocks execution in Shadow Mode", () => {
    const action = proposeActionFromFinding({
      id: "act_shadow",
      findingId: "f1",
      organizationId: "org_northstar",
      locationId: "loc_ber",
      title: "Shadow",
      description: "Observe only",
      createdBy: "op",
      executionCapability: "SUPPORTED",
      executionMode: "CONNECTOR_WITH_APPROVAL",
      shadowMode: true,
    });
    const gate = assertActionTransition(
      { ...action, status: "ACCEPTED" },
      "IN_PROGRESS",
    );
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.code).toBe("SHADOW_MODE");
  });

  it("rejects DETECTED → VERIFIED economic skip", () => {
    expect(canAdvanceEconomicState("IDENTIFIED", "VERIFIED")).toBe(false);
    expect(canAdvanceEconomicState("ACTIONED", "OBSERVED")).toBe(true);
    expect(canAdvanceEconomicState("OBSERVED", "VERIFIED")).toBe(true);
  });

  it("refuses ESTIMATED strength as Verified Value", () => {
    const labor = findingsForScope("loc_ber").find((f) => f.territory === "LABOR")!;
    expect(() =>
      verifyOutcome({
        id: "ver_est",
        finding: labor,
        expectedValue: 290,
        observedValue: 290,
        attribution: "UNCERTAIN",
        strength: "ESTIMATED",
        method: "model only",
      }),
    ).toThrow(/ESTIMATED/);
  });
});

describe("canonical fixture integrity", () => {
  it("derives 408 exposure and keeps 184 verified separate", () => {
    expect(canonicalUnresolvedExposure()).toBe(408);
    expect(CANONICAL_EVENTS.cancellationObservedVerified).toBe(184);
    expect(CANONICAL_EVENTS.cancellationPotential).toBe(192);
    const ledger = assertCanonicalLedger();
    expect(ledger.exposure).toBe(408);
    expect(ledger.verified).toBe(184);
    expect(ledger.sellNet).toBe(348);
  });

  it("capability registry stays honest", () => {
    expect(capabilityById("document_upload")?.status).toBe("IMPLEMENTED");
    expect(capabilityById("cancellation_recovery")?.status).toBe("DEMO");
    expect(capabilityById("connectors_commercial")?.status).toBe("PLANNED");
    expect(RADR_CAPABILITIES.length).toBeGreaterThan(8);
  });

  it("demo reservations connector does not claim write", () => {
    const demo = INTEGRATION_PROVIDERS.find(
      (p) => p.id === "radr-demo-reservations",
    );
    expect(demo?.supportsWriteActions).toBe(false);
  });

  it("service period foundation parses", () => {
    const sp = demoBerlinDinnerPeriod();
    expect(sp.type).toBe("DINNER");
    expect(sp.expectedCovers).toBe(184);
    expect(sp.organizationId).toBe("org_northstar");
  });

  it("verified work seeds without inventing hours", () => {
    __resetVerifiedWorkMemory();
    seedDemoVerifiedWork();
    const summary = verifiedWorkSummary("org_northstar");
    expect(summary.byType.CANCELLATION_MATCHED).toBe(1);
    expect(summary.byType.SUPPLIER_CLAIM_PREPARED).toBe(1);
    expect(summary.totalEvents).toBeGreaterThanOrEqual(4);
  });
});

describe("Ask RADR grounded answers (product pass)", () => {
  it("What should I fix first? returns highest-priority open finding", () => {
    const result = orchestrateAskSync("What should I fix first?", ctx);
    expect(result.response.impactEuro).toBeGreaterThanOrEqual(118);
    expect(result.response.answer.length).toBeGreaterThan(20);
  });

  it("How much is currently exposed? → 408", () => {
    const result = orchestrateAskSync("How much is currently exposed?", ctx);
    expect(result.response.impactEuro).toBe(408);
  });

  it("How much Verified Value? → 184", () => {
    const result = orchestrateAskSync("How much Verified Value do we have?", ctx);
    expect(result.response.impactEuro).toBe(184);
  });

  it("Did we recover €192? must not say yes as verified", () => {
    const result = orchestrateAskSync("Did we recover €192?", ctx);
    const answer = result.response.answer.toLowerCase();
    expect(answer).toMatch(/192|potential|184/);
    expect(answer).not.toMatch(/verified value is €192|recovered €192/);
  });

  it("Why is the supplier invoice wrong? returns variance evidence", () => {
    const result = orchestrateAskSync(
      "Why is this supplier invoice wrong?",
      ctx,
    );
    expect(result.response.answer).toMatch(/118|invoice|contract/i);
  });
});
