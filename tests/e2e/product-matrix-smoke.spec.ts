/**
 * 2 worlds × 3 roles smoke — major routes load without world leak / not-found.
 */
import { test, expect, type Page } from "playwright/test";

const ROUTES = [
  "/app",
  "/app/decisions",
  "/app/value",
  "/app/locations",
  "/app/service",
  "/app/house",
  "/app/memory",
  "/app/intelligence",
  "/app/connections",
  "/app/data-health",
  "/app/settings",
  "/app/dashboards",
  "/app/ask",
];

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function enterWorld(
  page: Page,
  world: "restaurant" | "hotel",
  role: string,
) {
  await gotoApp(page, "/app/enter");
  await page
    .getByRole("button", {
      name: world === "hotel" ? /Hotel group/i : /Restaurant group/i,
    })
    .click();
  await expect(page).toHaveURL(/\/app/);
  await page.evaluate(
    ({ w, role }) => {
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
        JSON.stringify({
          roleView: role,
          defaultLocationId: "all",
        }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({ locationScope: "all" }),
      );
    },
    { w: world, role },
  );
}

const MATRIX: { world: "restaurant" | "hotel"; role: string; name: string }[] =
  [
    { world: "restaurant", role: "gm", name: "Sarah" },
    { world: "restaurant", role: "coo", name: "Marcus" },
    { world: "restaurant", role: "cfo", name: "Elena" },
    { world: "hotel", role: "hotel_gm", name: "Nina" },
    { world: "hotel", role: "coo", name: "Marcus-hotel" },
    { world: "hotel", role: "cfo", name: "Elena-hotel" },
  ];

test.describe("2x3 product smoke", () => {
  for (const cell of MATRIX) {
    test(`${cell.name} · ${cell.world} · major routes`, async ({ page }) => {
      await enterWorld(page, cell.world, cell.role);
      for (const route of ROUTES) {
        await gotoApp(page, route);
        await expect(page.locator("body")).not.toContainText("Location not found");
        await expect(page.locator("body")).not.toContainText("Application error");
        if (cell.world === "restaurant") {
          await expect(page.locator("body")).not.toContainText("Chiado Collective");
          if (route === "/app/data-health" || route === "/app/connections") {
            await expect(page.locator("body")).not.toContainText(/Mews/i);
          }
          if (route === "/app/settings") {
            await page.goto("/app/settings#locations", {
              waitUntil: "domcontentloaded",
            });
            await expect(page.locator("body")).not.toContainText("Chiado");
            await expect(page.locator(".rp-settings-loc-list")).not.toContainText(
              "Canal House",
            );
          }
        }
        if (cell.world === "hotel" && route === "/app/intelligence") {
          await expect(page.locator("body")).not.toContainText("Menu Pulse");
        }
        // Raw internal IDs must not appear as primary visible chrome
        const raw = await page.evaluate(() => {
          const text = document.body.innerText || "";
          const hits = text.match(/\b(loc_|dec_|dash_|org_)[a-z0-9_]+/gi) || [];
          return hits.filter(
            (h) =>
              !h.startsWith("loc_group") &&
              !document.querySelector(`[data-loc="${h}"]`),
          );
        });
        // Allow data-loc attributes only — visible text hits fail
        const visibleRaw = await page.evaluate(() => {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          const bad: string[] = [];
          let n: Node | null;
          while ((n = walker.nextNode())) {
            const t = n.textContent || "";
            const m = t.match(/\b(loc_|dec_|dash_)[a-z0-9_]+/gi);
            if (m) bad.push(...m);
          }
          return bad;
        });
        expect(visibleRaw, `raw IDs on ${route}`).toEqual([]);
        void raw;
      }
    });
  }
});
