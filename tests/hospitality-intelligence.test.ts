import { describe, expect, it } from "vitest";
import {
  composeHospitalityTonightBrief,
  hospitalityAccessForRole,
  menuLinesForAllergen,
  DEMO_ALLERGY_ALERTS,
} from "@/lib/radr/hospitality";
import { classifyAskIntent } from "@/lib/ai/intents";
import { orchestrateAskSync } from "@/lib/ai/orchestrate";

const askCtx = {
  locationScope: "loc_ber",
  period: "today",
  role: "location_manager" as const,
  allowedLocationIds: "all" as const,
};

describe("hospitality access", () => {
  it("hides allergy detail from finance / CFO", () => {
    expect(hospitalityAccessForRole("finance").canSeeAllergyDetail).toBe(false);
    expect(hospitalityAccessForRole("cfo").canSeeAllergyDetail).toBe(false);
    expect(hospitalityAccessForRole("gm").canSeeAllergyDetail).toBe(true);
  });
});

describe("hospitality brief", () => {
  it("flags kitchen-pending severe allergy as needs action", () => {
    const brief = composeHospitalityTonightBrief("gm");
    expect(brief.needsAction).toBe(true);
    expect(brief.topCritical?.allergen).toBe("shellfish");
    expect(brief.topCritical?.kitchenAcknowledged).toBe(false);
    expect(brief.birthdays).toBe(4);
  });

  it("keeps ambiguous nut note as clarification, not assumed allergy", () => {
    const ambig = DEMO_ALLERGY_ALERTS.find((a) => a.needsClarification);
    expect(ambig?.source.originalText).toBe("No nuts please");
    expect(ambig?.severityExplicit).toBeNull();
  });

  it("separates contains vs cross-contact in menu graph", () => {
    const lines = menuLinesForAllergen("peanut");
    expect(lines.some((l) => l.containment === "CONTAINS")).toBe(true);
    expect(lines.some((l) => l.containment === "POSSIBLE_CROSS_CONTACT")).toBe(
      true,
    );
    expect(
      lines.some((l) => l.containment === "NO_IDENTIFIED_INGREDIENT"),
    ).toBe(true);
    expect(lines.every((l) => !/safe/i.test(l.detail))).toBe(true);
  });

  it("strips allergy rows for CFO", () => {
    const brief = composeHospitalityTonightBrief("cfo");
    expect(brief.allergies).toBeNull();
    expect(brief.allergyAlerts).toBe(2);
  });
});

describe("Ask RADR hospitality", () => {
  it("classifies allergy questions", () => {
    expect(classifyAskIntent("Any allergies tonight?").intent).toBe(
      "HOSPITALITY_SAFETY",
    );
    expect(
      classifyAskIntent("What should the kitchen know before service?")
        .intent,
    ).toBe("HOSPITALITY_SAFETY");
    expect(
      classifyAskIntent("Does Table 12 have any dietary restrictions?")
        .intent,
    ).toBe("HOSPITALITY_SAFETY");
  });

  it("returns structured kitchen safety", () => {
    const result = orchestrateAskSync(
      "What should the kitchen know before service?",
      askCtx,
    );
    expect(result.response.toolUsed).toBe("get_hospitality");
    expect(result.response.responseKind).toBe("hospitality_safety");
    expect(result.response.answer).toMatch(/pending|ready/i);
  });
});
