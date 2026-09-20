import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("product navigation integrity", () => {
  it("ProductNav exposes Decide destinations + Explore drawer", () => {
    const nav = read("components/product/ProductNav.tsx");
    for (const href of [
      "/app",
      "/app/decisions",
      "/app/value",
      "/app/memory",
      "/app/service",
      "/app/intelligence/menu",
      "/app/intelligence/margin",
      "/app/locations",
      "/app/integrations",
      "/app/settings",
    ]) {
      expect(nav).toContain(`href: "${href}"`);
    }
    expect(nav).toContain("Explore");
    expect(nav).toContain("Ask RADR");
    expect(nav).not.toContain('href: "/app/m"');
    expect(nav).not.toContain('href: "/app/buy"');
    expect(nav).not.toContain('href: "/home"');
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
    expect(hero).toContain("RadrWordmark");
    expect(hero).toContain("HeroProductDemo");
    expect(hero).not.toContain("HeroIntelBoard");
    expect(hero).toContain('useTranslations("homepage.hero")');
    expect(hero).toContain('t("titleLine1")');
    expect(hero).toContain('t("promise")');
    expect(hero).toContain('t("ctaSecondary")');
    expect(hero).toContain('data-nav-theme="light"');
    expect(hero).toContain("rx-he-canvas");
    expect(hero).toContain("rx-he-light");
    expect(hero).not.toContain("rx-he-replay");
    expect(hero).not.toContain("rx-he-object");
    expect(hero).not.toContain("RadrHeroField");
    expect(hero).not.toContain("HeroInstrument");
    expect(hero).not.toContain("TerritorySelector");

    const page = read("app/[locale]/page.tsx");
    expect(page).toContain("Hero");
    expect(page).toContain("radr-home");
    expect(page).toContain("radr-editorial");
    expect(page).toContain("SectionProblem");
    expect(page).toContain("SectionWatchFlow");
    expect(page).toContain("SectionFindings");
    expect(page).toContain("SectionAction");
    expect(page).toContain("SectionValueFlow");
    expect(page).toContain("SectionClose");
    expect(page).not.toContain("SectionOperatingModel");
    expect(page).not.toContain("SectionRadrLoop");
    expect(page).not.toContain("SectionProof");
    expect(page).not.toContain("SectionAskCompact");
    expect(page).not.toContain("SectionProductStory");
    expect(page).not.toContain("SectionTerritories");
    expect(page).not.toContain("IndustryIntelligence");
    expect(page).not.toContain("SectionEvidence");
    expect(page).not.toContain("SectionFinishedWork");
    expect(page).not.toContain("SectionIntegrations");
    expect(page).not.toContain("SectionTrust");
    expect(page).not.toContain("SectionFinal");
    expect(page).not.toContain("SectionControlCenter");
    expect(page).not.toContain("SectionSees");
    expect(page).not.toContain("SectionVerify");
    expect(page).not.toContain("SectionMultiLocation");
    expect(page).not.toContain("SectionSignalValue");

    const nav = read("components/marketing/SiteNav.tsx");
    expect(nav).toContain("/pricing");
    expect(nav).toContain('useTranslations("navigation")');
    expect(nav).toContain("createPortal");
  });
});
