/**
 * P0 invariants — needs_you count, world isolation, no raw IDs in display helpers.
 */
import { describe, expect, it } from "vitest";
import { selectNeedsJudgmentCount } from "@/lib/radr/product/selectNeedsJudgment";
import { needsYouCount } from "@/lib/radr/product/controlCenterMetrics";
import { navBadgesForScope } from "@/lib/radr/navAttention";
import { scopedDecisionsForDemo, recordAttention } from "@/lib/radr/product/roleScope";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { dataHealthRowsForRole } from "@/lib/radr/product/dataHealthCanonical";
import { getLocationExposure } from "@/lib/radr/intelligence/opsModules";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";

describe("selectNeedsJudgment SSOT", () => {
  it("Center count ≡ Ledger needs_you for restaurant COO", () => {
    const q = { role: "coo" as const, vertical: "restaurant" as const };
    const fromSelector = selectNeedsJudgmentCount(q);
    const fromLedger = scopedDecisionsForDemo(
      listDecisionRecords(),
      "coo",
      "restaurant",
    ).filter((r) => recordAttention(r) === "needs_you").length;
    expect(fromSelector).toBe(fromLedger);
    expect(needsYouCount("coo", "restaurant")).toBe(fromLedger);
    const badge = navBadgesForScope("all", "coo", "restaurant")["/app"];
    if (fromLedger > 0) {
      expect(badge?.count).toBe(fromLedger);
    } else {
      expect(badge).toBeUndefined();
    }
  });

  it("hotel world needs_you never includes restaurant peak", () => {
    const hotel = scopedDecisionsForDemo(
      listDecisionRecords(),
      "coo",
      "hotel",
    ).filter((r) => recordAttention(r) === "needs_you");
    expect(hotel.some((r) => r.id === "dec_peak_berlin")).toBe(false);
  });
});

describe("world isolation P0", () => {
  it("restaurant Data Health never includes Mews", () => {
    const rows = dataHealthRowsForRole("coo", "restaurant");
    expect(rows.some((r) => /mews/i.test(r.name))).toBe(false);
    expect(
      rows.every((r) => r.locationIds.every((id) => !id.includes("canal"))),
    ).toBe(true);
  });

  it("location_exposure restaurant copy has no Canal or Chiado", () => {
    const report = getLocationExposure("restaurant");
    expect(report.comparisonValue).not.toMatch(/Canal|Chiado/i);
    expect(report.comparisonValue).toMatch(/Berlin|Hamburg|Kreuzberg|Frankfurt|München|Köln|Düsseldorf|Stuttgart/i);
  });
});

describe("raw ID display prohibition", () => {
  it("locationDisplayName never returns loc_ prefix for org locations", () => {
    for (const loc of NORTHSTAR_RESTAURANTS.locations) {
      const name = locationDisplayName(loc.id);
      expect(name).not.toMatch(/^loc_/);
      expect(name.length).toBeGreaterThan(2);
    }
  });

  it("locationDisplayName humanizes unknown loc_ ids", () => {
    expect(locationDisplayName("loc_berlin_kreuzberg")).toBe("Berlin Kreuzberg");
    expect(locationDisplayName("loc_totally_unknown_venue")).toBe(
      "Totally Unknown Venue",
    );
    expect(locationDisplayName("loc_totally_unknown_venue")).not.toMatch(
      /^loc_/,
    );
  });

  it("displayDecisionId never returns dec_ for peak", () => {
    const d = displayDecisionId("dec_peak_berlin");
    expect(d).not.toMatch(/^dec_/);
    expect(d).toMatch(/^D-/);
  });
});
