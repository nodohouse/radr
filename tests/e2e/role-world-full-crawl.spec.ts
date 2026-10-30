/**
 * Full role × world crawl — Service / House / Settings / CC / History.
 * Extends product-matrix-smoke with the three depth surfaces.
 */
import { test, expect, type Page } from "playwright/test";

const ROUTES = [
  "/app",
  "/app/service",
  "/app/house",
  "/app/settings",
  "/app/decisions",
  "/app/locations",
  "/app/value",
  "/app/memory",
  "/app/connections",
  "/app/data-health",
] as const;

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
        JSON.stringify({ roleView: role, defaultLocationId: "all" }),
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

test.describe("Full role×world crawl", () => {
  for (const cell of MATRIX) {
    test(`${cell.name} · ${cell.world} · core routes`, async ({ page }) => {
      await enterWorld(page, cell.world, cell.role);
      for (const route of ROUTES) {
        await gotoApp(page, `${route}?stay=1`);
        await expect(page.locator("body")).not.toContainText("Application error");
        await expect(page.locator("body")).not.toContainText("Location not found");
        if (cell.world === "restaurant") {
          await expect(page.locator("body")).not.toContainText("Chiado Collective");
        }
        if (route === "/app/service") {
          if (cell.world === "restaurant") {
            await expect(page.getByRole("heading", { name: /Floor/i })).toBeVisible();
          } else {
            await expect(
              page.getByRole("heading", { name: /House readiness/i }),
            ).toBeVisible();
          }
        }
        if (route === "/app/house") {
          await expect(
            page.getByRole("heading", { name: /House standards/i }),
          ).toBeVisible();
        }
      }
    });
  }

  test("policy → handoff authority live", async ({ page }) => {
    await enterWorld(page, "restaurant", "gm");
    await page.evaluate(() => {
      localStorage.setItem(
        "radr.demoSettings.v1",
        JSON.stringify({
          orgName: "Northstar Restaurants",
          currency: "EUR",
          timezone: "Europe/Berlin",
          berlinClose: "23:00",
          mfaRequired: false,
          approvalGmMax: 100,
          autonomyScheduling: "prepare",
          notifyNeedsYouEmail: true,
          notifyApprovalEmail: true,
          notifyVerifiedInApp: true,
          quietHoursEnabled: true,
        }),
      );
    });
    await gotoApp(page, "/app?stay=1");
    await expect(page.locator("[data-policy]")).toContainText(/GM ≤ €100/i);
    await expect(page.locator(".rp-handoff-authority").first()).toBeVisible();
  });

  test("BOH phone capture simulation", async ({ page }) => {
    await enterWorld(page, "restaurant", "gm");
    await gotoApp(page, "/app/house?stay=1");
    await page.getByRole("button", { name: /^Voice$/i }).click();
    await expect(page.getByText(/Captured ·/i)).toBeVisible();
    await expect(page.locator(".rp-house-captures li").first()).toBeVisible();
  });

  test("Service Map replay scrubber", async ({ page }) => {
    await enterWorld(page, "restaurant", "gm");
    await gotoApp(page, "/app/service?stay=1");
    await page.getByRole("button", { name: /Replay service/i }).click();
    await expect(page.getByLabel(/Replay scrubber/i)).toBeVisible();
    await page.getByLabel(/Replay scrubber/i).fill("0");
    await expect(page.getByText(/Building/i).first()).toBeVisible();
  });
});
