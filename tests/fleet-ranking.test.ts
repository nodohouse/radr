import { describe, expect, it } from "vitest";
import {
  composeFleetBrief,
  isFleetRole,
  rankFleetRows,
  defaultFleetSort,
} from "@/lib/radr/fleet";

describe("fleet ranking", () => {
  it("is available to upper management only", () => {
    expect(isFleetRole("cfo")).toBe(true);
    expect(isFleetRole("coo")).toBe(true);
    expect(isFleetRole("regional")).toBe(true);
    expect(isFleetRole("owner")).toBe(true);
    expect(isFleetRole("finance")).toBe(true);
    expect(isFleetRole("gm")).toBe(false);
    expect(isFleetRole("head_chef")).toBe(false);
    expect(isFleetRole("host")).toBe(false);
  });

  it("ranks contribution high-to-low for CFO default", () => {
    expect(defaultFleetSort("cfo")).toBe("contribution");
    const brief = composeFleetBrief("cfo");
    const ranked = rankFleetRows(brief.rows, "contribution");
    expect(ranked[0]!.contribution).toBeGreaterThanOrEqual(
      ranked[1]!.contribution,
    );
    expect(brief.bestId).toBe(ranked[0]!.id);
  });

  it("surfaces needs-you locations for COO attention sort", () => {
    expect(defaultFleetSort("coo")).toBe("attention");
    const brief = composeFleetBrief("coo");
    expect(brief.needsYouCount).toBeGreaterThan(0);
    const ranked = rankFleetRows(brief.rows, "attention");
    expect(ranked[0]!.needsYou).toBeGreaterThan(0);
  });

  it("scopes regional to area locations", () => {
    const group = composeFleetBrief("cfo");
    const area = composeFleetBrief("regional");
    expect(area.locationCount).toBeLessThan(group.locationCount);
    expect(area.scopeLabel.toLowerCase()).toMatch(/area|europe/);
  });

  it("explains why the leader leads and what to copy", () => {
    const brief = composeFleetBrief("cfo");
    const leader = rankFleetRows(brief.rows, "contribution")[0]!;
    expect(leader.why.length).toBeGreaterThan(10);
    expect(leader.drivers.length).toBeGreaterThan(0);
    expect(brief.leaderWhy).toMatch(leader.name);
    expect(brief.successCriteria.length).toBeGreaterThan(0);
    expect(brief.successCriteria[0]!.practice.length).toBeGreaterThan(0);
    expect(brief.successCriteria[0]!.evidenceFrom.length).toBeGreaterThan(0);
  });
});
