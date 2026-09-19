import { describe, expect, it } from "vitest";
import { navBadgesForScope } from "@/lib/radr/navAttention";
import { attentionForScope, needsYouHeadline } from "@/lib/radr/roleAttention";

describe("navBadgesForScope", () => {
  it("never invents demo floor counts", () => {
    const badges = navBadgesForScope("loc_unknown_empty", "gm");
    expect(badges["/app"]).toBeUndefined();
    expect(badges["/app/findings"]).toBeUndefined();
    expect(badges["/app/locations"]).toBeUndefined();
  });

  it("only badges Today destinations that need action", () => {
    const badges = navBadgesForScope("loc_ber", "gm");
    expect(badges["/app/locations"]).toBeUndefined();
    expect(badges["/app/service"]).toBeUndefined();
    expect(badges["/app/forecast"]).toBeUndefined();
    expect(badges["/app/finance"]).toBeUndefined();
    if (badges["/app"]) {
      expect(badges["/app"].count).toBeGreaterThan(0);
      expect(badges["/app"].radar).toBeFalsy();
    }
  });

  it("matches attention SoT for the same role and scope", () => {
    const attn = attentionForScope("loc_ber", "gm");
    const badges = navBadgesForScope("loc_ber", "gm");
    if (attn.needsYou === 0) {
      expect(badges["/app"]).toBeUndefined();
      expect(badges["/app/findings"]).toBeUndefined();
    } else {
      expect(badges["/app"]?.count).toBe(attn.needsYou);
      expect(badges["/app/findings"]?.count).toBe(attn.needsYou);
    }
    if (attn.readyForApproval === 0) {
      expect(badges["/app/controls"]).toBeUndefined();
    } else {
      expect(badges["/app/controls"]?.count).toBe(attn.readyForApproval);
    }
  });
});

describe("needsYouHeadline", () => {
  it("is calm when empty", () => {
    expect(needsYouHeadline(0)).toBe("Nothing needs you.");
    expect(needsYouHeadline(2)).toBe("2 things need you.");
  });
});
