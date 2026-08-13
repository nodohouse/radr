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

  it("marketing homepage is RADR product experience", () => {
    const page = read("app/page.tsx");
    expect(page).toContain('className="radr"');
    expect(page).toContain("HeroRadar");
    expect(page).toContain("SectionVerifiedValue");
    expect(page).toContain("SectionTerritories");
    expect(page).toContain("SectionPricingTeaser");
    expect(page).not.toContain("SectionMission");
    const hero = read("components/marketing/scenes/HeroRadar.tsx");
    expect(hero).toContain("Nothing off");
    expect(hero).toContain("Radar");
    expect(hero).toContain("RadrWordmark");
    expect(hero).toContain("Typewriter");
    expect(hero).toContain("176,740");
    const tw = read("components/marketing/Typewriter.tsx");
    expect(tw).toContain("losing");
    expect(tw).toContain("loop");
    const nav = read("components/marketing/SiteNav.tsx");
    expect(nav).toContain("/pricing");
    const css = read("app/radr.css");
    expect(css).toContain("#00ff66");
    expect(css).toContain("#7cffb2");
    expect(read("components/marketing/DeltaOutline.tsx")).toContain(
      "strokeLinejoin",
    );
    expect(read("components/marketing/DeltaOutline.tsx")).toContain(
      'fill="none"',
    );
  });
});
