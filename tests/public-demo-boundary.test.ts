import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  demoSignupHref,
  safeDemoNext,
} from "@/lib/marketing/demoAccess";

const root = process.cwd();
function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("public ↔ demo access boundary", () => {
  it("safeDemoNext only allows product destinations", () => {
    expect(safeDemoNext("/app")).toBe("/app");
    expect(safeDemoNext("/app/decisions/x")).toBe("/app/decisions/x");
    expect(safeDemoNext("/onboarding")).toBe("/onboarding");
    expect(safeDemoNext("https://evil.example")).toBe("/app/enter");
    expect(safeDemoNext("//evil")).toBe("/app/enter");
    expect(safeDemoNext("/en/pricing")).toBe("/app/enter");
  });

  it("demoSignupHref always routes through signup", () => {
    expect(demoSignupHref()).toContain("/signup?");
    expect(demoSignupHref()).toContain("intent=demo");
    expect(demoSignupHref()).toContain("next=");
    expect(demoSignupHref("/app")).not.toMatch(/^\/app/);
  });

  it("middleware always protects /app (not DEMO-gated)", () => {
    const mw = read("middleware.ts");
    expect(mw).toContain("isAppPath");
    expect(mw).not.toContain("appRequiresAuth");
    expect(mw).toContain('intent", "demo"');
    expect(mw).toContain("X-Robots-Tag");
  });

  it("hero Decision visual is not an /app link", () => {
    const hero = read(
      "components/marketing/scenes/home/DecisionHeroVisual.tsx",
    );
    expect(hero).not.toMatch(/href=\{?[`'"]\/app/);
    expect(hero).toContain("Compare Futures");
    expect(hero).toContain("CTAS.compareFuturesHref");
    expect(hero).toMatch(/className="rx-dh-decision"/);
    expect(hero).not.toMatch(/<Link[\s\S]*className="rx-dh-decision"/);
  });

  it("marketing CTAs do not deep-link /app", () => {
    const files = [
      "components/marketing/scenes/Hero.tsx",
      "components/marketing/SiteNav.tsx",
      "lib/marketing/brand.ts",
      "components/marketing/pages/ControlCenterChapter.tsx",
      "components/marketing/scenes/home/RestaurantsHotelsSection.tsx",
      "components/marketing/scenes/home/GovernanceButlerStrip.tsx",
      "components/marketing/scenes/home/DecisionObjectFilm.tsx",
      "components/marketing/scenes/home/ControlCenterHeroMock.tsx",
      "app/[locale]/product/ask/page.tsx",
      "app/[locale]/product/forecast/page.tsx",
    ];
    for (const f of files) {
      const src = read(f);
      expect(src, f).not.toMatch(/href=["'`]\/app(\/|\?|"|'|`)/);
      expect(src, f).not.toMatch(/href=\{["'`]\/app/);
    }
  });
});
