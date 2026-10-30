/**
 * Capture CURRENT deployed product screenshots @ 1512×982 → visual/current/
 *
 * PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
 *   npx playwright test tests/e2e/visual-current-capture.spec.ts --project=desktop-1512
 */
import { test, type Page } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "visual/current");
const BASE = process.env.PRODUCT_QA_BASE_URL ?? "https://prep-ten-zeta.vercel.app";

type Shot = {
  id: string;
  path: string;
  role?: string;
  vertical?: "restaurant" | "hotel";
  location?: string;
  before?: (page: Page) => Promise<void>;
};

const SHOTS: Shot[] = [
  {
    id: "cc-gm-restaurant",
    path: "/app?stay=1",
    role: "gm",
    vertical: "restaurant",
    location: "loc_berlin_mitte",
  },
  {
    id: "cc-cfo-restaurant",
    path: "/app?stay=1",
    role: "cfo",
    vertical: "restaurant",
    location: "all",
  },
  {
    id: "live-estate-restaurant",
    path: "/app/live?stay=1",
    role: "cfo",
    vertical: "restaurant",
    location: "all",
    before: async (page) => {
      await page.getByRole("button", { name: /^Estate$/i }).click().catch(() => undefined);
      await page.waitForTimeout(500);
    },
  },
  {
    id: "live-venue-restaurant",
    path: "/app/live?stay=1",
    role: "gm",
    vertical: "restaurant",
    location: "loc_berlin_mitte",
    before: async (page) => {
      await page.getByRole("button", { name: /^Venue$/i }).click().catch(() => undefined);
      await page.waitForTimeout(500);
    },
  },
  {
    id: "decisions",
    path: "/app/decisions?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "operations",
    path: "/app/service?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "house",
    path: "/app/house?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "guests",
    path: "/app/guests?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "intelligence",
    path: "/app/intelligence?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "value",
    path: "/app/value?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "memory",
    path: "/app/memory?stay=1",
    role: "gm",
    vertical: "restaurant",
  },
  {
    id: "locations",
    path: "/app/locations?stay=1",
    role: "cfo",
    vertical: "restaurant",
    location: "all",
  },
  {
    id: "reports",
    path: "/app/reports?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "connections",
    path: "/app/connections?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "data-health",
    path: "/app/data-health?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "dashboards",
    path: "/app/dashboards?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "settings",
    path: "/app/settings?stay=1",
    role: "cfo",
    vertical: "restaurant",
  },
  {
    id: "cc-revenue-hotel",
    path: "/app?stay=1",
    role: "revenue_manager",
    vertical: "hotel",
    location: "loc_canal_house",
  },
  {
    id: "live-hotel-ops",
    path: "/app/live?stay=1",
    role: "hotel_gm",
    vertical: "hotel",
    location: "loc_canal_house",
  },
];

async function seedContext(page: Page, shot: Shot) {
  const domain = new URL(BASE).hostname;
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain, path: "/" },
  ]);

  const vertical = shot.vertical ?? "restaurant";
  const role = shot.role ?? "gm";
  const location =
    shot.location ??
    (vertical === "hotel" ? "loc_canal_house" : "loc_berlin_mitte");

  await page.goto(`${BASE}/app/enter`, { waitUntil: "domcontentloaded" });
  const worldLabel =
    vertical === "hotel" ? /Hotel group/i : /Restaurant group/i;
  const worldBtn = page.getByRole("button", { name: worldLabel });
  if (await worldBtn.isVisible().catch(() => false)) {
    await worldBtn.click();
    await page.waitForTimeout(400);
  }

  await page.evaluate(
    ({ role, vertical, location }) => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({
          vertical,
          orgId:
            vertical === "hotel"
              ? "org_northstar_hotels"
              : "org_northstar_restaurants",
        }),
      );
      sessionStorage.setItem("radr.demoEntered.v1", "1");
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          roleView: role,
          defaultLocationId: location === "all" ? "all" : location,
        }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({ locationScope: location }),
      );
      localStorage.setItem("radr.sidebar.pinned", "0");
    },
    { role, vertical, location },
  );
}

test.describe("visual/current baseline @1512", () => {
  test("capture matrix", async ({ page }) => {
    test.setTimeout(420_000);
    fs.mkdirSync(OUT, { recursive: true });
    await page.setViewportSize({ width: 1512, height: 982 });

    const manifest: { id: string; path: string; file: string }[] = [];

    for (const shot of SHOTS) {
      await seedContext(page, shot);
      await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" }).catch(async () => {
        await page.goto(`${BASE}${shot.path}`, { waitUntil: "domcontentloaded" });
      });
      await page.waitForTimeout(700);
      if (shot.before) await shot.before(page);
      const file = `${shot.id}.png`;
      await page.screenshot({
        path: path.join(OUT, file),
        fullPage: false,
      });
      manifest.push({ id: shot.id, path: shot.path, file });
    }

    fs.writeFileSync(
      path.join(OUT, "manifest.json"),
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          base: BASE,
          viewport: { width: 1512, height: 982 },
          shots: manifest,
        },
        null,
        2,
      ),
    );
  });
});
