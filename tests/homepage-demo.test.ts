import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_DEMO,
  assertHomepageDemoMath,
  formatHomepageUsd,
  homepageWeatherOpportunity,
} from "@/components/marketing/data/homepageDemo";

describe("homepage marketing demo fixture", () => {
  it("keeps unresolved exposure reconciled and excludes verified", () => {
    expect(() => assertHomepageDemoMath()).not.toThrow();
    const { labor, buy, total } = HOMEPAGE_DEMO.exposure;
    expect(labor + buy).toBe(total);
    expect(total).toBe(408);
    expect(HOMEPAGE_DEMO.verified.amount).toBe(184);
    expect(labor + buy + HOMEPAGE_DEMO.verified.amount).not.toBe(total);
  });

  it("derives weather opportunity from covers × contribution", () => {
    const opp = homepageWeatherOpportunity();
    const w = HOMEPAGE_DEMO.findings.sell.weather;
    expect(opp.gross).toBe(w.incrementalCovers * w.contributionPerCover);
    expect(opp.gross).toBe(420);
    expect(opp.net).toBe(348);
    expect(opp.doNothingValue).toBe(300);
  });

  it("uses USD presentation for New York fiction", () => {
    expect(formatHomepageUsd(408)).toBe("$408");
    expect(HOMEPAGE_DEMO.findings.labor.moneyLabel).toContain("$290");
    expect(HOMEPAGE_DEMO.findings.recover.moneyLabel).toContain("$184");
    expect(HOMEPAGE_DEMO.findings.buy.moneyLabel).toContain("$118");
    expect(HOMEPAGE_DEMO.findings.sell.moneyLabel).toContain("$420");
  });

  it("uses one coherent Halcyon New York world", () => {
    expect(HOMEPAGE_DEMO.org.chromeRight).toBe(
      "Halcyon Hospitality Group · New York",
    );
    expect(HOMEPAGE_DEMO.locations.labor.label).toBe("Halcyon House · SoHo");
    expect(HOMEPAGE_DEMO.locations.recover.label).toBe(
      "Canal Street · Tribeca",
    );
    expect(HOMEPAGE_DEMO.locations.buy.label).toBe(
      "Orchard · Lower East Side",
    );
    const blob = JSON.stringify(HOMEPAGE_DEMO);
    expect(blob).not.toMatch(/Northstar|Berlin|Amsterdam|€/);
    expect(blob).not.toMatch(/DEMO DATA|SIMULATED|Mercer Hospitality/);
    expect(blob).not.toMatch(/592/);
  });

  it("includes prepared work examples without claiming execution", () => {
    expect(HOMEPAGE_DEMO.prepared.buy.status).toBe("Approval required");
    expect(HOMEPAGE_DEMO.prepared.labor.laborCost).toBe(72);
    expect(HOMEPAGE_DEMO.prepared.labor.valueProtected).toBe(290);
    expect(HOMEPAGE_DEMO.prepared.recover.status).toBe("Verified");
    expect(HOMEPAGE_DEMO.sinceLastCheck.verifiedAmount).toBe(184);
    const blob = JSON.stringify(HOMEPAGE_DEMO.prepared);
    expect(blob).not.toMatch(/sent to supplier|auto-executed|autonomous/i);
  });

  it("defines bidirectional operating maps per industry", () => {
    const industries = ["restaurants", "hotels", "bars", "groups"] as const;
    for (const id of industries) {
      const map = HOMEPAGE_DEMO.operatingMaps[id];
      expect(map.systems.length).toBeGreaterThanOrEqual(5);
      expect(map.signals.length).toBeGreaterThanOrEqual(5);
      expect(map.outcomes.length).toBe(5);
      expect(map.systems.every((s) => s.status !== ("live" as string))).toBe(
        true,
      );
    }
    expect(HOMEPAGE_DEMO.capabilities).toHaveLength(5);
    expect(HOMEPAGE_DEMO.operatingMaps.restaurants.story.gross).toContain(
      "$420",
    );
    expect(
      HOMEPAGE_DEMO.operatingMaps.restaurants.story.verified,
    ).not.toContain("$184");
  });
});
