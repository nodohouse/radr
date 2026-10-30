/**
 * Global header operating strip — visible + interactive on Control Center.
 * Run: PRODUCT_QA_BASE_URL=http://127.0.0.1:3030 npx playwright test tests/e2e/global-operating-header.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PRODUCT_QA_BASE_URL ?? "https://prep-ten-zeta.vercel.app";

test.describe("GlobalOperatingHeader", () => {
  test("strip visible on CC and Decisions with reconciled counts", async ({
    page,
  }) => {
    await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
    const header = page.locator('[data-header="operating"]');
    await expect(header).toBeVisible();
    await expect(page.getByLabel(/Signals requiring judgment/i)).toBeVisible();
    await expect(page.getByLabel(/146 evaluated|evaluated/i).first()).toBeVisible();
    await expect(page.getByLabel(/Verified value/i)).toBeVisible();

    await page.getByLabel(/Signals requiring judgment/i).click();
    await expect(page.getByText(/Needs your judgment/i)).toBeVisible();
    await expect(page.getByText("D-1911").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await page.goto(`${BASE}/app/decisions`, { waitUntil: "networkidle" });
    await expect(page.locator('[data-header="operating"]')).toBeVisible();
    await expect(page.getByLabel(/Signals requiring judgment/i)).toBeVisible();
  });
});
