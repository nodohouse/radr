import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
const key = "radr.cookie-preferences.v1";
const rejected = {
  version: 1,
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: new Date().toISOString(),
};
test.setTimeout(180000);
test("trust library has working section links, truthful status and consistent page navigation", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, rejected }) => localStorage.setItem(key, JSON.stringify(rejected)),
    { key, rejected },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of ["security", "privacy", "cookies", "terms", "imprint"]) {
    const r = await page.goto(base + "/en/" + route);
    expect(r?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(
      page.locator(`.rt-page-nav a[href="/en/${route}"]`),
    ).toHaveAttribute("aria-current", "page");
    const links = page
      .getByRole("navigation", { name: "On this page" })
      .locator("a");
    expect(await links.count()).toBeGreaterThan(3);
    for (const link of await links.all()) {
      const href = await link.getAttribute("href");
      await expect(page.locator(href!)).toHaveCount(1);
    }
    await links.last().click();
    await expect(
      page.locator((await links.last().getAttribute("href"))!),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
  }
  await expect(page.locator("main")).toContainText(
    "not complete for a legal launch",
  );
  expect(errors).toEqual([]);
});
test("security differentiates code controls from unconfirmed assurance", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, rejected }) => localStorage.setItem(key, JSON.stringify(rejected)),
    { key, rejected },
  );
  await page.goto(base + "/en/security");
  await expect(page.locator("main")).toContainText(
    "currently allows inline scripts/styles",
  );
  await expect(page.locator("main")).toContainText("process-local");
  await expect(page.locator("main")).toContainText(
    "Password-recovery email delivery is not implemented",
  );
  await expect(page.locator("main")).toContainText("No SOC 2");
  await page.goto(base + "/de/privacy");
  await expect(page.locator(".rt-hero")).toContainText(
    "currently available in English",
  );
});
test("cookie settings disclose inventory, save choices, withdraw and keep unchanged choices on close", async ({
  page,
}) => {
  await page.goto(base + "/en/cookies");
  const d = page.getByRole("dialog");
  await expect(d).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
  await d
    .getByRole("button", { name: "Manage preferences", exact: true })
    .click();
  await expect(
    d.getByRole("checkbox", { name: /Analytics/ }),
  ).not.toBeChecked();
  await d
    .locator("summary")
    .filter({ hasText: "See cookies & storage details" })
    .click();
  await expect(
    d.locator("code").filter({ hasText: "radr_report_access" }),
  ).toBeVisible();
  await expect(d).toContainText("30 minutes");
  await d.getByRole("checkbox", { name: /Analytics/ }).check();
  await d
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect(d).toBeHidden();
  const footer = page.locator("footer");
  await footer
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await expect(d.getByRole("checkbox", { name: /Analytics/ })).toBeChecked();
  await d.getByRole("checkbox", { name: /Analytics/ }).uncheck();
  await page.keyboard.press("Escape");
  await expect(d).toBeHidden();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).analytics,
      key,
    ),
  ).toBe(true);
  await footer
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await d.getByRole("button", { name: "Reject optional", exact: true }).click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).analytics,
      key,
    ),
  ).toBe(false);
  await expect(
    footer.getByRole("button", { name: "Cookie settings", exact: true }),
  ).toBeFocused();
});
test("phone cookie center stays within the viewport and navigates out without retaining a modal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/en/privacy");
  const d = page.getByRole("dialog");
  await expect(d).toBeVisible();
  await d
    .getByRole("button", { name: "Manage preferences", exact: true })
    .click();
  await d.locator("summary").first().click();
  await expect(
    d.getByRole("button", { name: /^Close cookie preferences/ }),
  ).toBeInViewport();
  await expect(
    d.getByRole("button", { name: "Save preferences", exact: true }),
  ).toBeInViewport();
  const box = await d.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(391);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(845);
  await d.getByRole("link", { name: "Full storage inventory" }).click();
  await expect(page).toHaveURL(/\/en\/cookies/);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("h1")).toContainText("Cookies & storage");
});
test("expired choices ask again and blocked storage does not report a successful save", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          necessary: true,
          analytics: true,
          marketing: true,
          savedAt: "2020-01-01",
        }),
      );
      Storage.prototype.setItem = function () {
        throw new Error("Blocked for test");
      };
    },
    { key },
  );
  await page.goto(base + "/en/privacy");
  const d = page.getByRole("dialog");
  await expect(d).toBeVisible();
  await d.getByRole("button", { name: "Reject optional", exact: true }).click();
  await expect(d.getByRole("alert")).toContainText("could not save");
  await expect(d).toBeVisible();
  await d
    .getByRole("button", {
      name: "Continue without optional cookies",
      exact: true,
    })
    .click();
  await expect(d).toBeHidden();
});
