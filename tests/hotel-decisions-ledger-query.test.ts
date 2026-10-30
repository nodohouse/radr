import { describe, expect, it } from "vitest";
import { getDecisionsWorkspace } from "@/lib/product/decisionsWorkspace";
import {
  impactEuro,
  matchesDriver,
  matchesProperty,
  matchesQuery,
  sortJudgment,
} from "@/lib/product/decisionsWorkspace/ledgerQuery";

describe("hotel decisions ledger query", () => {
  const hotel = getDecisionsWorkspace("hotels");

  it("parses property-scale euros without restaurant M/k confusion", () => {
    expect(impactEuro("+€1,840")).toBe(1840);
    expect(impactEuro("€12.4k")).toBe(12400);
    expect(impactEuro("+€620")).toBe(620);
  });

  it("search housekeeping returns housekeeping decisions", () => {
    const hits = hotel.judgment.filter((r) =>
      matchesQuery("housekeeping", {
        title: r.title,
        subtitle: r.subtitle,
        driver: r.driver,
        id: r.id,
        location: r.locationsShort,
      }),
    );
    expect(hits.some((h) => h.id === hotel.defaultDecisionId)).toBe(true);
  });

  it("Canal House property filter keeps flagship", () => {
    expect(
      matchesProperty("canal", hotel.judgment[0]!.locationsShort),
    ).toBe(true);
  });

  it("driver filter housekeeping matches D-H-9201 row", () => {
    const flagship = hotel.judgment.find((r) => r.id === hotel.defaultDecisionId)!;
    expect(
      matchesDriver("housekeeping", flagship.driverKind, flagship.driver),
    ).toBe(true);
    expect(matchesDriver("labor", flagship.driverKind, flagship.driver)).toBe(
      false,
    );
  });

  it("urgency sort puts 14:35 / Before 14:40 ahead of 15:00", () => {
    const sorted = sortJudgment(hotel.judgment, "urgency");
    expect(sorted[0]?.title).toMatch(/Reassign 2 housekeepers|Protect VIP/i);
    const deadlines = sorted.map((r) => r.deadline);
    expect(deadlines.indexOf("Before 14:40")).toBeLessThan(
      deadlines.indexOf("15:00"),
    );
  });
});
