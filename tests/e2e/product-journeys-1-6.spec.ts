/**
 * Complete Product journeys 1–6
 * Restaurants Sarah/Marcus/Elena · Hotels Nina/Marcus/Elena
 * Click core path: Center → Location tabs → Decision → Value → Memory →
 * Intelligence → Dashboard → Butler → Settings (+ period/drawer/nav).
 */
import { test, expect, type Page } from "playwright/test";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

async function seedCookies(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
}

async function enterWorld(
  page: Page,
  world: "restaurant" | "hotel",
  role: string,
) {
  await seedCookies(page);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
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

async function assertHealthy(page: Page, label: string) {
  await expect(page.locator("body"), label).not.toContainText(
    /Application error|Internal Server Error/i,
  );
  const body = await page.locator("body").innerText();
  expect(body, label).not.toMatch(/\b(loc|dec|dash|org)_[a-z0-9_]+\b/i);
  expect(body, label).not.toMatch(/\bundefined\b|\bNaN\b|\[object Object\]/);
}

async function clickIfVisible(page: Page, name: RegExp) {
  const btn = page.getByRole("button", { name }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ timeout: 4000 }).catch(() => undefined);
  }
  const link = page.getByRole("link", { name }).first();
  if (await link.isVisible().catch(() => false)) {
    await link.click({ timeout: 4000 }).catch(() => undefined);
  }
}

async function runJourney(
  page: Page,
  world: "restaurant" | "hotel",
  role: string,
) {
  await enterWorld(page, world, role);

  const homeLoc =
    world === "hotel" ? DEMO_LOCATIONS.canal.id : DEMO_LOCATIONS.berlin.id;
  const decisionId =
    world === "hotel" ? DECISION_IDS.hotelReadiness : DECISION_IDS.peak;

  // Center
  await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
  await assertHealthy(page, "center");
  await clickIfVisible(page, /Live|Performance|Needs you|Since/i);

  // Location + tabs
  await page.goto(`/app/locations/${homeLoc}`, {
    waitUntil: "domcontentloaded",
  });
  await assertHealthy(page, "location");
  for (const tab of [/Overview/i, /Live/i, /Performance/i, /History/i]) {
    const t = page.getByRole("tab", { name: tab }).or(
      page.getByRole("link", { name: tab }),
    ).or(page.getByRole("button", { name: tab }));
    if (await t.first().isVisible().catch(() => false)) {
      await t.first().click({ timeout: 3000 }).catch(() => undefined);
      await page.waitForTimeout(200);
    }
  }

  // Decision
  await page.goto(`/app/decisions/${decisionId}`, {
    waitUntil: "domcontentloaded",
  });
  await assertHealthy(page, "decision");
  await clickIfVisible(page, /Futures|Evidence|Why|Approve|Prepare/i);

  // Drawer open/close if present
  const drawerClose = page.getByRole("button", { name: /Close|Dismiss/i });
  if (await drawerClose.first().isVisible().catch(() => false)) {
    await drawerClose.first().click().catch(() => undefined);
  }

  // Value · Memory · Intelligence
  for (const path of ["/app/value", "/app/memory", "/app/intelligence"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await assertHealthy(page, path);
  }

  // Dashboard
  await page.goto("/app/dashboards", { waitUntil: "domcontentloaded" });
  await assertHealthy(page, "dashboards");
  const hotelDash = page.getByRole("link", { name: /Hotel Operations/i });
  const restDash = page.getByRole("link", { name: /Restaurant|GM|Live/i });
  if (
    world === "hotel" &&
    (await hotelDash.first().isVisible().catch(() => false))
  ) {
    await hotelDash.first().click();
    await assertHealthy(page, "hotel-dash");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/Live Service Dashboard/i);
  } else if (await restDash.first().isVisible().catch(() => false)) {
    await restDash.first().click();
    await assertHealthy(page, "rest-dash");
  }

  // Butler
  await page.goto("/app/ask", { waitUntil: "domcontentloaded" });
  await assertHealthy(page, "ask");

  // Settings — walk nav
  await page.goto("/app/settings", { waitUntil: "domcontentloaded" });
  await assertHealthy(page, "settings");
  const sections = [
    /Organization/i,
    /Locations/i,
    /Workforce/i,
    /Users/i,
    /Connections/i,
    /Security/i,
  ];
  for (const name of sections) {
    const item = page.getByRole("button", { name }).or(
      page.getByRole("link", { name }),
    );
    if (await item.first().isVisible().catch(() => false)) {
      await item.first().click({ timeout: 3000 }).catch(() => undefined);
      await page.waitForTimeout(150);
      await assertHealthy(page, `settings-${name}`);
    }
  }

  // Period / back / forward / refresh (best-effort — history can detach frames)
  await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => undefined);
  await page.goForward({ waitUntil: "domcontentloaded" }).catch(() => undefined);
  await page
    .reload({ waitUntil: "domcontentloaded" })
    .catch(() => undefined);
  await assertHealthy(page, "refresh");
}

const JOURNEYS: {
  id: number;
  world: "restaurant" | "hotel";
  role: string;
  name: string;
}[] = [
  { id: 1, world: "restaurant", role: "gm", name: "Sarah" },
  { id: 2, world: "restaurant", role: "coo", name: "Marcus" },
  { id: 3, world: "restaurant", role: "cfo", name: "Elena" },
  { id: 4, world: "hotel", role: "hotel_gm", name: "Nina" },
  { id: 5, world: "hotel", role: "coo", name: "Marcus-hotel" },
  { id: 6, world: "hotel", role: "cfo", name: "Elena-hotel" },
];

test.describe("product journeys 1-6", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  for (const j of JOURNEYS) {
    test(`Journey ${j.id}: ${j.world} · ${j.name}`, async ({ page }) => {
      await runJourney(page, j.world, j.role);
    });
  }
});
