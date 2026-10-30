/**
 * Operating Memory engine — Overview + views + URL state.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/e2e/memory-engine.spec.ts --project=desktop-1512
 */
import { test, expect, type Page } from "playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "http://127.0.0.1:3111";

async function gotoMemory(page: Page, path = "/app/memory") {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: "restaurant",
        orgId: "org_northstar_restaurants",
      }),
    );
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({ roleView: "cfo", defaultLocationId: "all" }),
    );
    sessionStorage.setItem(
      "radr.scope.v1",
      JSON.stringify({ locationScope: "all" }),
    );
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-memory-engine='true']")).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Operating Memory Engine", () => {
  test("overview shows calibration 14.2% → 5.4%", async ({ page }) => {
    await gotoMemory(page);
    await expect(page.locator(".me-page-head h1")).toHaveText("Operating Memory");
    await expect(page.locator(".me-hero-metric")).toContainText("14.2%");
    await expect(page.locator(".me-hero-metric")).toContainText("5.4%");
    await expect(page.getByText(/62% improvement/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "What changed" })).toBeVisible();
    await expect(page.getByText(/Friday peak capacity/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent learnings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Operating DNA" })).toBeVisible();
  });

  test("period controls update URL", async ({ page }) => {
    await gotoMemory(page);
    await page.locator(".me-periods").getByRole("button", { name: "7D" }).click();
    await expect(page).toHaveURL(/period=7d/);
    await page.locator(".me-periods").getByRole("button", { name: "90D" }).click();
    await expect(page).toHaveURL(/period=90d/);
    await page.locator(".me-periods").getByRole("button", { name: "30D" }).click();
    await expect(page).not.toHaveURL(/period=/);
  });

  test("What changed opens evidence dialog", async ({ page }) => {
    await gotoMemory(page);
    await page.getByRole("button", { name: /Why · evidence · how it evolved/i }).click();
    const dialog = page.getByRole("dialog", {
      name: /Playbook evolution evidence/i,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("How it evolved", { exact: true })).toBeVisible();
  });

  test("Playbooks view + version history", async ({ page }) => {
    await gotoMemory(page, "/app/memory?view=playbooks&playbook=friday-peak-v4");
    await expect(page.locator("[data-memory-view='playbooks']")).toBeVisible();
    await expect(
      page.locator(".me-pb-detail h2"),
    ).toContainText(/Friday Peak Capacity/i);
    await expect(page.getByText(/Version history/i)).toBeVisible();
    await expect(page.getByText(/Guardrails/i)).toBeVisible();
  });

  test("Learnings catalog + miss provenance", async ({ page }) => {
    await gotoMemory(page, "/app/memory?view=learnings&learning=D-4410");
    await expect(page.locator("[data-memory-view='learnings']")).toBeVisible();
    await expect(
      page.getByText(/Honest miss|Weather-hold terrace/i).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Source Decision/i })).toBeVisible();
  });

  test("Operating DNA location scope", async ({ page }) => {
    await gotoMemory(page, "/app/memory?view=dna&dna=kitchen-load");
    await expect(page.locator("[data-memory-view='dna']")).toBeVisible();
    await expect(page.getByText(/Kitchen load threshold/i).first()).toBeVisible();
    await page
      .locator("[aria-label='DNA location scope']")
      .getByRole("button", { name: /^Soho · New York$/i })
      .click();
    await expect(page.getByText(/How confidence is derived/i)).toBeVisible();
  });

  test("Year on RADR timeline", async ({ page }) => {
    await gotoMemory(page, "/app/memory?view=year");
    await expect(page.locator("[data-memory-view='year']")).toBeVisible();
    await expect(page.getByText(/1,248|1248/).first()).toBeVisible();
    await expect(page.getByText(/Forecast error/i).first()).toBeVisible();
    await expect(
      page.getByText(/Peak V4 live|Friday peak model/i).first(),
    ).toBeVisible();
  });

  test("deep link refresh preserves view", async ({ page }) => {
    await gotoMemory(
      page,
      "/app/memory?view=playbooks&playbook=friday-peak-v4&period=90d",
    );
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/view=playbooks/);
    await expect(page).toHaveURL(/playbook=friday-peak-v4/);
    await expect(page.locator("[data-memory-view='playbooks']")).toBeVisible();
  });

  test("browser back from Playbooks to Overview", async ({ page }) => {
    await gotoMemory(page);
    await page
      .getByRole("navigation", { name: /Memory perspective/i })
      .getByRole("button", { name: /^Playbooks$/i })
      .click();
    await expect(page).toHaveURL(/view=playbooks/);
    await page.goBack();
    await expect(page.locator(".me-overview")).toBeVisible();
  });
});
