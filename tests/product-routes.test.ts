import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("product navigation integrity", () => {
  it("app nav exposes core destinations + explore tools", () => {
    const nav = read("lib/product/appNav.ts");
    for (const href of [
      "/app",
      "/app/decisions",
      "/app/value",
      "/app/house",
      "/app/memory",
      "/app/intelligence",
      "/app/locations",
      "/app/connections",
      "/app/data-health",
      "/app/service",
    ]) {
      expect(nav).toContain(`href: "${href}"`);
    }
    expect(nav).toContain("Explore");
    expect(nav).not.toContain('href: "/app/m"');
    expect(nav).not.toContain('href: "/app/buy"');
    expect(nav).not.toContain('href: "/home"');

    const shell = read("components/product/ProductShell.tsx");
    expect(shell).toContain("AppSidebar");
    expect(shell).toContain("AskRadr");
    expect(shell).toMatch(/GlobalOperatingHeader|TopContextBar/);
  });

  it("next.config redirects legacy tree into /app", () => {
    const cfg = read("next.config.ts");
    expect(cfg).toContain('source: "/home"');
    expect(cfg).toContain('destination: "/app"');
    expect(cfg).toContain('source: "/cases"');
    expect(cfg).toContain('destination: "/app/findings"');
    expect(cfg).toContain('source: "/money"');
    expect(cfg).toContain('destination: "/app/value"');
    expect(cfg).toContain('source: "/sources"');
    expect(cfg).toContain('destination: "/app/data"');
  });

  it("legacy /home page redirects to /app", () => {
    const home = read("app/(app)/home/page.tsx");
    expect(home).toContain('redirect("/app")');
  });

  it("onboarding exit always goes to /app", () => {
    const onboarding = read("app/onboarding/page.tsx");
    expect(onboarding).toContain('redirect("/app?welcome=1")');
    expect(onboarding).not.toContain('redirect("/home")');
  });

  it("marketing homepage tells the category leadership story", () => {
    const hero = read("components/marketing/scenes/Hero.tsx");
    expect(hero).toContain("DecisionHeroVisual");
    expect(hero).toContain('useTranslations("homepage.hero")');
    expect(hero).toContain('t("ctaSecondary")');
    expect(hero).toContain('data-nav-theme="light"');
    expect(hero).toContain("rx-he-recover");
    expect(hero).toContain("rx-he-light");
    expect(hero).not.toContain("HeroIntelBoard");
    expect(hero).not.toContain("TerritorySelector");

    const page = read("app/[locale]/page.tsx");
    expect(page).toContain("HomepageSpine");
    expect(page).toContain("radr-home");
    expect(page).toContain("radr-editorial");
    expect(page).not.toContain("SectionProblem");
    expect(page).not.toContain("SectionMultiLocation");

    const spine = read("components/marketing/scenes/home/HomepageSpine.tsx");
    expect(spine).toContain("Hero");
    expect(spine).toContain("RecoveryStoryObject");
    expect(spine).toContain("ConnectionOriginSection");

    const origin = read(
      "components/marketing/kinetic/ConnectionOriginSection.tsx",
    );
    expect(origin).toContain("homepageFeatured");
    expect(origin).toContain("IntegrationInspector");
    expect(origin).toContain("View all");

    const recovery = read(
      "components/marketing/scenes/home/RecoveryStoryObject.tsx",
    );
    expect(recovery).toContain("DecisionTraceToggle");
    expect(recovery).toContain("TRACE_D4102");

    const group = read("lib/marketing/northstarGroup.ts");
    expect(group).toContain("Northstar Hospitality Group");
    expect(group).toContain("GROUP_NEEDS_YOU");
    expect(group).toContain("LIVE_D7023");
    expect(group).toContain("nyc-soho");
    expect(group).toContain("singapore-marina");
    expect(group).toContain("dubai-difc");
    expect(group).toContain("Group reporting · EUR");
    expect(group).toContain("REGION_FOOTPRINT");

    const nav = read("components/marketing/SiteNav.tsx");
    expect(nav).toContain("/pricing");
    expect(nav).toContain('useTranslations("navigation")');
    expect(nav).toContain("OperatingPulse");
  });
});
