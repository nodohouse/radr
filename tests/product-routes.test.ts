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
    expect(nav).toContain("Control Center");
    expect(nav).not.toContain('href: "/app/m"');
    expect(nav).not.toContain('href: "/app/buy"');
    expect(nav).not.toContain('href: "/home"');

    const shell = read("components/product/ProductShell.tsx");
    expect(shell).toContain("ReferenceNavigation");
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

  it("marketing homepage mounts the current decision story and research close", () => {
    const page = read("app/[locale]/page.tsx");
    expect(page).toContain("HomepageSpine");
    const spine = read("components/marketing/scenes/home/HomepageSpine.tsx");
    expect(spine).toContain("Homepage2030");
    const home = read("components/marketing/v2030/Homepage2030.tsx");
    for (const part of ["ScrollTabletShowcase", "PUBLIC_LOOP", "id=\"simulate\"", "ResearchDiscover", "HomePlaybookFeature"]) expect(home).toContain(part);
    expect(home).not.toContain("SectionMultiLocation");
    const nav = read("components/marketing/SiteNav.tsx");
    expect(nav).toContain("/pricing");
    expect(nav).toContain("/demo");
    expect(nav).toContain("FrozenRadrLogo");
  });
});
