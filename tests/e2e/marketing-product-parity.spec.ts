import { test, expect } from "playwright/test";

const base = process.env.PUBLIC_QA_BASE_URL ?? "http://127.0.0.1:3002";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "radr.cookie-preferences.v1",
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: false,
        marketing: false,
        savedAt: new Date().toISOString(),
      }),
    ),
  );
});

test("homepage compares the same D-1911 used in the product", async ({
  page,
}) => {
  await page.goto(`${base}/en`);
  await expect(page.locator(".rm-brief-status")).toContainText("D-1911");
  await page.getByRole("tab", { name: /Keep seating/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Baseline");
  await page.getByRole("tab", { name: /Pace 12 minutes/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("+$620");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Expected protected tonight",
  );
});

test("platform and solution deep links select the intended context", async ({
  page,
}) => {
  await page.goto(`${base}/en/product?surface=house`);
  await expect(
    page.getByRole("tab", { name: "Back of House", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".rx30-plat-canvas")).toContainText(
    "workflow preview",
  );
  await page.getByRole("tab", { name: "Connections", exact: true }).click();
  await expect(page).toHaveURL(/surface=connections/);
  await expect(page.locator(".rx30-plat-canvas")).toContainText(
    "Evidence before execution",
  );
  await page.goto(`${base}/en/solutions?leak=recon`);
  await expect(
    page.getByRole("tab", { name: "Reconciliation", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Cost variance", exact: true }).click();
  await expect(page).toHaveURL(/leak=cost/);
});

test("calculator reaches a modeled result and preserves the evidence distinction", async ({
  page,
}) => {
  await page.goto(`${base}/en/value-calculator`);
  await page
    .getByRole("button", { name: "Global restaurant group", exact: true })
    .click();
  await expect(page.locator(".vc-res")).toBeVisible();
  await expect(page.locator(".vc-res")).toContainText(
    "Not a guaranteed outcome",
  );
  await expect(page.getByRole("button", { name: /Edit inputs/ })).toBeVisible();
});

test("public navigation remains opaque and keyboard dismissible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto(`${base}/en`);
  for (const name of ["Platform", "Solutions", "Company"]) {
    await page
      .locator(".rx-nav-center")
      .getByRole("link", { name, exact: true })
      .focus();
    await expect(page.locator(".rx-nav-panel")).toBeVisible();
    await expect(page.locator(".rx-nav-panel")).toHaveCSS(
      "background-color",
      "rgb(245, 249, 252)",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator(".rx-nav-panel")).toBeHidden();
  }
});
