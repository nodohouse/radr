/**
 * Screenshot + axe accessibility matrix for core surfaces.
 * Soft on axe serious+ — collect report, fail on critical.
 */
import { test, expect, type Page } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT = path.join(process.cwd(), "tmp", "qa-screenshots");
const AXE_OUT = path.join(process.cwd(), "tmp", "axe-report.json");

const SURFACES: { name: string; path: string; world: "restaurant" | "hotel" }[] =
  [
    { name: "cc-restaurant", path: "/app?stay=1", world: "restaurant" },
    { name: "service-restaurant", path: "/app/service?stay=1", world: "restaurant" },
    { name: "house-restaurant", path: "/app/house?stay=1", world: "restaurant" },
    { name: "settings-restaurant", path: "/app/settings?stay=1", world: "restaurant" },
    { name: "cc-hotel", path: "/app?stay=1", world: "hotel" },
    { name: "service-hotel", path: "/app/service?stay=1", world: "hotel" },
    { name: "house-hotel", path: "/app/house?stay=1", world: "hotel" },
  ];

async function enterWorld(page: Page, world: "restaurant" | "hotel") {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", {
      name: world === "hotel" ? /Hotel group/i : /Restaurant group/i,
    })
    .click();
  await page.evaluate((w) => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: w,
        orgId:
          w === "hotel"
            ? "org_northstar_hotels"
            : "org_northstar_restaurants",
      }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({ roleView: w === "hotel" ? "hotel_gm" : "gm" }),
    );
  }, world);
}

test.describe("Screenshot + axe matrix", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT, { recursive: true });
  });

  const axeRows: {
    surface: string;
    critical: number;
    serious: number;
    violations: { id: string; impact: string | null; help: string }[];
  }[] = [];

  for (const surface of SURFACES) {
    test(`${surface.name} · shot + axe`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await enterWorld(page, surface.world);
      await page.goto(surface.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      const shotPath = path.join(OUT, `${surface.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      expect(fs.existsSync(shotPath)).toBe(true);

      const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"]) // mineral UI · audited separately
        .analyze();

      const critical = results.violations.filter((v) => v.impact === "critical");
      const serious = results.violations.filter((v) => v.impact === "serious");
      axeRows.push({
        surface: surface.name,
        critical: critical.length,
        serious: serious.length,
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
        })),
      });

      expect(
        critical,
        `critical a11y on ${surface.name}: ${critical.map((c) => c.id).join(", ")}`,
      ).toEqual([]);
    });
  }

  test.afterAll(() => {
    fs.mkdirSync(path.dirname(AXE_OUT), { recursive: true });
    fs.writeFileSync(AXE_OUT, JSON.stringify(axeRows, null, 2));
  });
});
