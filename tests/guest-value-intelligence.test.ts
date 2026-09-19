import { describe, expect, it } from "vitest";
import {
  composeGuestTonightBrief,
  formatGuestTiers,
  guestValueAccessForRole,
  DEMO_GUEST_TONIGHT_AGG,
} from "@/lib/radr/guest";
import { classifyAskIntent } from "@/lib/ai/intents";
import { orchestrateAskSync } from "@/lib/ai/orchestrate";
import { composeMenuDecisionBrief } from "@/lib/radr/preShift/menuDecisionBrief";

const askCtx = {
  locationScope: "loc_ber",
  period: "today",
  role: "location_manager" as const,
  allowedLocationIds: "all" as const,
};

describe("guest value access", () => {
  it("hides named guests for CFO / finance", () => {
    expect(guestValueAccessForRole("cfo").aggregatesOnly).toBe(true);
    expect(guestValueAccessForRole("finance").canSeeNamedGuests).toBe(false);
    expect(guestValueAccessForRole("gm").canSeeNamedGuests).toBe(true);
    expect(guestValueAccessForRole("gm").canSeeServiceNotes).toBe(true);
  });
});

describe("guest tonight brief", () => {
  it("is material for Berlin demo fixtures", () => {
    const brief = composeGuestTonightBrief("gm");
    expect(brief.material).toBe(true);
    expect(brief.returningGuests).toBe(DEMO_GUEST_TONIGHT_AGG.returningGuests);
    expect(brief.expectedReturningRevenue).toBe(
      DEMO_GUEST_TONIGHT_AGG.expectedReturningRevenue,
    );
    expect(brief.spotlight?.length).toBeGreaterThan(0);
    expect(brief.spotlight?.[0]?.value.why.length).toBeGreaterThan(0);
    expect(formatGuestTiers(["HIGH_VALUE", "FREQUENT"])).toMatch(/High-value/);
  });

  it("strips names for CFO", () => {
    const brief = composeGuestTonightBrief("cfo");
    expect(brief.spotlight).toBeNull();
    expect(brief.attentionNotes).toBeNull();
    expect(brief.expectedReturningRevenue).toBe(3840);
  });
});

describe("menu × guest affinity", () => {
  it("links Bluefin shortage to booked returning affinity", () => {
    const menu = composeMenuDecisionBrief();
    expect(menu?.guestAffinity.bluefinGuestsTonight).toBe(3);
    expect(menu?.guestAffinity.affinityExpectedValue).toBe(680);
    expect(menu?.soWhat).toMatch(/returning guests historically order Bluefin/i);
  });
});

describe("Ask RADR guest value", () => {
  it("classifies guest questions", () => {
    expect(classifyAskIntent("Who's coming tonight?").intent).toBe(
      "GUEST_VALUE",
    );
    expect(
      classifyAskIntent("How much revenue comes from returning guests?")
        .intent,
    ).toBe("GUEST_VALUE");
    expect(
      classifyAskIntent("Which tonight's guests usually order Bluefin?")
        .intent,
    ).toBe("GUEST_VALUE");
  });

  it("returns structured returning revenue", () => {
    const result = orchestrateAskSync(
      "How much revenue comes from returning guests?",
      askCtx,
    );
    expect(result.response.toolUsed).toBe("get_guest_value");
    expect(result.response.responseKind).toBe("guest_value");
    expect(result.response.answer).toMatch(/3[,.\s]?840|3840/);
  });
});
