import { describe, expect, it } from "vitest";
import { navBadgesForScope } from "@/lib/radr/navAttention";
import { needsYouCount } from "@/lib/radr/product/controlCenterMetrics";
import { needsYouHeadline } from "@/lib/radr/roleAttention";

describe("navBadgesForScope", () => {
  it("never invents demo floor counts for empty persona with no needs", () => {
    const badges = navBadgesForScope("loc_unknown_empty", "revenue_manager");
    // Revenue persona may still have scoped Decisions; only assert no invented keys
    expect(badges["/app/locations"]).toBeUndefined();
    expect(badges["/app/findings"]).toBeUndefined();
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

  it("matches Control Center Decision SoT for the same role", () => {
    const needs = needsYouCount("gm");
    const badges = navBadgesForScope("all", "gm");
    if (needs === 0) {
      expect(badges["/app"]).toBeUndefined();
    } else {
      expect(badges["/app"]?.count).toBe(needs);
      expect(badges["/app/decisions"]?.count).toBe(needs);
      expect(badges["/app"]?.label).toMatch(/signals? need your judgment/);
    }
  });

  it("scopes badges to location when not portfolio", () => {
    const mid = navBadgesForScope("loc_berlin_mitte", "gm");
    const kreuz = navBadgesForScope("loc_berlin_kreuzberg", "gm");
    expect(mid["/app"]?.count ?? 0).toBeGreaterThan(0);
    expect(kreuz["/app"]?.count ?? 0).toBe(0);
  });
});

describe("needsYouHeadline", () => {
  it("is calm when empty", () => {
    expect(needsYouHeadline(0)).toBe("Nothing needs you.");
    expect(needsYouHeadline(2)).toBe("2 things need you.");
  });
});
