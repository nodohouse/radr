import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("product navigation integrity", () => {
  it("AppNav exposes the five primary destinations", () => {
    const nav = read("components/AppNav.tsx");
    for (const href of ["/home", "/cases", "/money", "/controls", "/sources"]) {
      expect(nav).toContain(`href: "${href}"`);
    }
    expect(nav).not.toContain('href: "/scan"');
  });

  it("middleware protects money, controls, and sources", () => {
    const mw = read("middleware.ts");
    expect(mw).toContain('"/money"');
    expect(mw).toContain('"/controls"');
    expect(mw).toContain('"/sources"');
  });

  it("legacy /scan redirects to /sources", () => {
    const scan = read("app/(app)/scan/page.tsx");
    expect(scan).toContain('redirect("/sources")');
  });

  it("money page does not invent verified value numbers", () => {
    const money = read("app/(app)/money/page.tsx");
    expect(money).toContain("No verified value yet.");
    expect(money).not.toMatch(/€\d/);
  });

  it("marketing homepage is one coherent demo story", () => {
    const page = read("app/page.tsx");
    expect(page).toContain('className="radr"');
    expect(page).toContain("HeroProduct");
    expect(page).toContain("SectionCoverage");
    expect(page).toContain("SectionOutcome");
    expect(page).toContain("SectionPricingTeaser");
    expect(page).not.toContain("SectionVerifiedValue");
    expect(page).not.toContain("SectionScenarios");
    expect(page).not.toContain("SectionFindings");
    expect(page).not.toContain("SectionMission");

    const demo = read("components/marketing/data/demo.ts");
    expect(demo).toContain("176_740");
    expect(demo).toContain("18_620");
    expect(demo).toContain("4_280");
    expect(demo).toContain("11_840");
    expect(demo).toContain("142_000");
    expect(demo).not.toContain("4_284_620");

    const hero = read("components/marketing/scenes/HeroProduct.tsx");
    expect(hero).toContain("useLiveScan");
    expect(hero).toContain("MissionTypewriter");
    expect(hero).toContain("Identified exposure");

    const live = read("components/marketing/data/liveScan.ts");
    expect(live).toContain("172_460");
    expect(live).toContain("4_280");
    expect(live).toContain("METER_TARGETS");
    expect(live).toContain("You wouldn't chase");

    const nav = read("components/marketing/SiteNav.tsx");
    expect(nav).toContain("/pricing");
    expect(nav).toContain("/how");
    expect(nav).toContain("/solutions");
    expect(nav).toContain("/company");

    expect(read("app/how/page.tsx")).toContain("HowPage");
    expect(read("app/solutions/page.tsx")).toContain("SolutionsPage");
    expect(read("app/company/page.tsx")).toContain("CompanyPage");
    expect(read("app/security/page.tsx")).toContain("Built for sensitive");
    expect(read("app/imprint/page.tsx")).toContain("Imprint");

    const mark = read("components/marketing/RadrWordmark.tsx");
    expect(mark).toContain('viewBox="0 0 152 44"');
    expect(mark).toContain("M52.5 10.55");
  });
});
