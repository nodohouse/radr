import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
test.setTimeout(240000);
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
test("developer routes state availability and provide working on-page navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  for (const route of [
    "/developers",
    "/developers/quickstart",
    "/developers/api",
    "/developers/webhooks",
    "/developers/connectors",
    "/developers/mcp",
  ]) {
    const response = await page.goto(base + "/en" + route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".rx-dev-availability")).toContainText(
      "proposed interfaces",
    );
    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc.locator("a").first()).toBeVisible();
    const target = await toc.locator("a").first().getAttribute("href");
    await toc.locator("a").first().click();
    await expect(page).toHaveURL(
      new RegExp(target!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
    );
    await expect(page.locator(target!)).toBeVisible();
    await expect(
      page.locator(`.rx-dev-side a[href="/en${route}"]`),
    ).toHaveAttribute("aria-current", "page");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
  }
  expect(errors).toEqual([]);
});
test("catalog filters, clear action and provider guides reflect registry status", async ({
  page,
}) => {
  await page.goto(base + "/en/developers#integrations");
  const catalog = page.locator(".rx-dev-catalog");
  await catalog
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("available");
  await expect(catalog.locator(".rx-dev-card-link")).toHaveCount(2);
  await catalog.getByRole("searchbox").fill("Toast");
  await expect(catalog.locator(".rx-dev-card-link")).toHaveCount(0);
  await catalog
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await catalog.getByRole("searchbox").fill("Toast");
  await expect(catalog.locator(".rx-dev-card-link")).toHaveCount(1);
  await expect(catalog.locator(".rx-dev-status")).toContainText(
    "Partner access",
  );
  await catalog.locator(".rx-dev-card-link").click();
  await expect(page.locator("h1")).toHaveText("Toast");
  await expect(page.locator(".rx-dev-status")).toContainText("Partner access");
  await expect(page.locator(".rx-dev-provider-title img")).toHaveAttribute(
    "src",
    "/vendors/toast.svg",
  );
});
test("mobile developer drawer contains focus, closes with Escape and navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/en/developers");
  const menu = page.locator(".rx-dev-menu-btn");
  await menu.click();
  const dialog = page.getByRole("dialog", {
    name: "Developer documentation navigation",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".rx-dev-drawer-close")).toBeFocused();
  const focusable = dialog.locator('a[href], button:not([tabindex="-1"])');
  await focusable.last().focus();
  await page.keyboard.press("Tab");
  await expect(focusable.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menu).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  await menu.click();
  await dialog.getByRole("link", { name: "API", exact: true }).click();
  await expect(page).toHaveURL(/\/developers\/api$/);
  await expect(dialog).toBeHidden();
});
test("code copy works and clipboard denial gives truthful feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(base + "/en/developers/quickstart");
  const block = page.locator(".rx-dev-code").first();
  await block.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(
    block.getByRole("button", { name: "Copied", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "npx tsx scripts/demo-reference-ingestion.ts",
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error("Denied for test");
    };
  });
  await page
    .locator(".rx-dev-code")
    .nth(1)
    .getByRole("button", { name: "Copy", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Clipboard is unavailable",
  );
});
test("downloadable contracts are available and documented upload routes reject unauthenticated requests", async ({
  request,
  page,
}) => {
  for (const path of [
    "/developers/radr-v1-preview.yaml",
    "/developers/contracts-example.csv",
    "/developers/invoices-example.csv",
  ]) {
    const response = await request.get(base + path);
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeGreaterThan(50);
  }
  for (const path of ["/api/documents/upload", "/api/onboarding/upload"]) {
    const response = await request.post(base + path, { data: {} });
    expect(response.status()).toBe(401);
  }
  await page.goto(base + "/en/product/connections");
  await expect(
    page.getByRole("heading", {
      name: "Two concrete paths. Clear boundaries.",
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Get validated sample schemas" })
    .click();
  await expect(page).toHaveURL(/developers\/connectors#csv$/);
});
test("localized developer shells and long labels remain within the viewport", async ({
  page,
}) => {
  for (const locale of ["de", "fr", "es", "nl"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/" + locale + "/developers/quickstart");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".rx-dev-quick-code")).toContainText(
      "npx tsx scripts/demo-reference-ingestion.ts",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
  }
});
