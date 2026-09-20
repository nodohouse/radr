import { describe, expect, it } from "vitest";
import {
  buildVerification,
  conservativeVerifiedValue,
  parseFinding,
  proposeActionFromFinding,
  reservationSchema,
  waitlistEntrySchema,
} from "@/lib/radr/domain";
import {
  findingsForScope,
  priorityFindingToFinding,
} from "@/lib/radr/findings";
import { BERLIN_PRIORITY_FINDINGS } from "@/lib/radr/priorityFindings";

describe("canonical domain schemas", () => {
  it("parses a finding from PriorityFinding adapter", () => {
    const finding = priorityFindingToFinding(BERLIN_PRIORITY_FINDINGS[0]!);
    const parsed = parseFinding(finding);
    expect(parsed.id).toBe("pf_labor_peak");
    expect(parsed.territory).toBe("LABOR");
    expect(parsed.urgency).toBe("ACT_NOW");
    expect(parsed.status).toBe("OPEN");
    expect(parsed.organizationId).toBe("org_northstar");
    expect(parsed.dedupeKey).toContain("loc_ber:LABOR:peak_service_capacity");
    expect(parsed.summary.length).toBeGreaterThan(0);
    expect(parsed.explanation.length).toBeGreaterThan(0);
    expect(parsed.drivers.length).toBeGreaterThan(0);
    expect(parsed.evidence.length).toBeGreaterThan(0);
    expect(parsed.financialImpact.currency).toBe("EUR");
  });

  it("exposes findings for Overview scope via findingsForScope", () => {
    const findings = findingsForScope("loc_ber");
    expect(findings.length).toBeGreaterThanOrEqual(2);
    expect(findings[0]!.priorityScore).toBeGreaterThanOrEqual(
      findings[findings.length - 1]!.priorityScore,
    );
  });

  it("builds a proposed action from finding recommendation", () => {
    const finding = priorityFindingToFinding(BERLIN_PRIORITY_FINDINGS[0]!);
    const action = proposeActionFromFinding({
      id: "act_test",
      findingId: finding.id,
      organizationId: finding.organizationId,
      locationId: finding.locationId,
      title: finding.recommendation.title,
      description: finding.recommendation.description,
      expectedCost: finding.recommendation.expectedCost,
      expectedNetBenefit: finding.recommendation.expectedNetBenefit,
      createdBy: "user_demo",
    });
    expect(action.status).toBe("PROPOSED");
    expect(action.findingId).toBe(finding.id);
    expect(action.executionCapability).toBe("DRAFT_ONLY");
    expect(action.preparedSummary).toBeTruthy();
  });

  it("verifies conservatively (never above observed)", () => {
    expect(conservativeVerifiedValue(166, 148)).toBe(148);
    expect(conservativeVerifiedValue(100, 120)).toBe(100);
    const v = buildVerification({
      id: "ver_1",
      organizationId: "org_northstar",
      locationId: "loc_ber",
      findingId: "pf_recover_late",
      expectedValue: 184,
      observedValue: 148,
      currency: "EUR",
      attribution: "RADR_RECOMMENDED",
      method: "Waitlist seated + POS close",
    });
    expect(v.verifiedValue).toBe(148);
  });

  it("validates reservation without guest PII fields", () => {
    const r = reservationSchema.parse({
      id: "res_1",
      organizationId: "org_northstar",
      locationId: "loc_ber",
      externalId: "ext_1",
      provider: "demo_reservations",
      serviceTime: "2026-08-24T20:00:00+02:00",
      partySize: 4,
      status: "cancelled",
      createdAt: "2026-08-24T10:00:00+02:00",
      updatedAt: "2026-08-24T18:00:00+02:00",
      cancelledAt: "2026-08-24T18:00:00+02:00",
      groupBooking: false,
    });
    expect(r).not.toHaveProperty("guestName");
    expect(r.partySize).toBe(4);
  });

  it("validates waitlist entry for recovery matching", () => {
    const w = waitlistEntrySchema.parse({
      id: "wl_1",
      organizationId: "org_northstar",
      locationId: "loc_ber",
      externalId: "wl_ext_1",
      requestedServiceTime: "2026-08-24T20:00:00+02:00",
      partySize: 3,
      status: "waiting",
      createdAt: "2026-08-24T18:30:00+02:00",
      updatedAt: "2026-08-24T18:30:00+02:00",
      expectedValue: 192,
      convertProbability: 0.7,
    });
    expect(w.partySize).toBe(3);
    expect(w.expectedValue).toBe(192);
  });
});
