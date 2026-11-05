import { test, expect, type Page } from "playwright/test";

// Fictional task-based personas, exercised by automation. This is not human user research.
test.setTimeout(240_000);
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
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
async function visit(page: Page, path: string) {
  const response = await page.goto(base + path);
  expect(response?.status(), path).toBeLessThan(400);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    `Horizontal overflow: ${path}`,
  ).toBe(false);
}
async function capture(page: Page, name: string) {
  await test
    .info()
    .attach(name, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
}

test("01 Maya, restaurant owner: understand the story and enter a demo without signup", async ({
  page,
}) => {
  await visit(page, "/en");
  await expect(page.locator(".rm-hero-copy")).toContainText(
    "synthetic operating data",
  );
  await page.getByRole("link", { name: "Explore the product" }).click();
  await expect(page).toHaveURL(/\/en\/demo$/);
  await page.getByRole("tab", { name: "Restaurant", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Restaurant", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("main")).toContainText("D-1911");
  await capture(page, "restaurant-demo");
});
test("02 Leo, hotel GM on tablet: compare hospitality contexts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await visit(page, "/en/industries");
  await visit(page, "/en/demo");
  for (const name of ["Hotel", "Aparthotel", "Restaurant"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
  }
  await capture(page, "tablet-demo");
});
test("03 Priya, CFO: pricing qualifies scope and sends product exploration to the public demo", async ({
  page,
}) => {
  await visit(page, "/en/pricing");
  await expect(page.locator("main")).toContainText(
    "commercial connectors and autonomous execution are planned",
  );
  await page
    .getByRole("link", { name: "Explore the demo", exact: false })
    .click();
  await expect(page).toHaveURL(/\/demo$/);
  await visit(page, "/en/value-calculator");
  await page.getByRole("button", { name: "Build my Value Map" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What do you operate?" }),
  ).toBeVisible();
  await expect(page.locator(".vc2-hint")).toHaveText("Choose one to continue.");
  await visit(page, "/en/value-calculator");
  await page
    .getByRole("button", { name: "Global restaurant group", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Here is what may be worth investigating in your operation.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText("Verified Value");
  await capture(page, "value-calculator");
});
test("04 Noah, group operator: every platform menu link resolves", async ({
  page,
}) => {
  await visit(page, "/en");
  await page.locator("#platform-trigger").hover();
  await expect(
    page.locator('.rx-nav-panel[data-menu="platform"]'),
  ).toBeVisible();
  const hrefs = await page
    .locator(".rx-nav-panel .rx-np-item")
    .evaluateAll((nodes) => [
      ...new Set(nodes.map((n) => n.getAttribute("href")!)),
    ]);
  expect(hrefs.length).toBeGreaterThan(10);
  for (const href of hrefs) {
    await visit(page, href);
  }
});
test("05 Elena, IT lead: planned autonomy is explicit and connection status is inspectable", async ({
  page,
}) => {
  await visit(page, "/en/security");
  const tabs = page
    .getByRole("tablist", { name: "Autonomy ladder" })
    .getByRole("tab");
  for (const index of [4, 5]) {
    await tabs.nth(index).click();
    await expect(page.locator(".rx30-autonomy-detail")).toContainText(
      "Planned capability",
    );
  }
  await visit(page, "/en/developers");
  await visit(page, "/en/product/connections");
  await capture(page, "connection-status");
});
test("06 Sam, chef on mobile: navigate to back of house without clipped controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, "/en");
  await page.locator(".rx-nav-menu").click();
  const drawer = page.getByRole("dialog");
  await drawer
    .getByRole("button", { name: "Expand Platform", exact: true })
    .click();
  await drawer.locator('a[href*="surface=house"]').click();
  await expect(page).toHaveURL(/surface=house/);
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await capture(page, "mobile-back-of-house");
});
test("07 Ava, finance analyst: journal and playbook remain readable and download stays gated", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, "/en/blog");
  await page
    .locator('main a[href*="/blog/the-hidden-cost-of-your-bestseller"]')
    .first()
    .click();
  await expect(page.locator(".rx-res-body")).toBeVisible();
  await page.locator(".rr-promo a").click();
  await expect(page).toHaveURL(/hospitality-decision-playbook/);
  await expect(
    page.getByRole("button", { name: "Get the playbook →", exact: true }),
  ).toBeDisabled();
  expect((await request.get(base + "/api/reports/download")).status()).toBe(
    403,
  );
  await capture(page, "mobile-report-gate");
});
test("08 Oliver, keyboard buyer: navigation restores focus and contact availability is honest", async ({
  page,
}) => {
  await visit(page, "/en");
  const trigger = page.locator("#company-trigger");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".rx-nav-panel .rx-np-item").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await visit(page, "/en/contact?intent=sales");
  const submit = page.locator('main button[type="submit"]');
  if (await submit.isDisabled()) {
    await expect(page.getByRole("status")).toContainText(
      "cannot send an inquiry yet",
    );
    await page
      .getByRole("link", { name: "Explore the public demo instead" })
      .click();
    await expect(page).toHaveURL(/\/demo$/);
  } else {
    // Native validation without sending a real inquiry.
    expect(
      await page
        .locator(".rx-contact-form")
        .evaluate((n) => (n as HTMLFormElement).checkValidity()),
    ).toBe(false);
  }
});
test("09 Isabelle, reduced-motion visitor: stationary tablet, readable controls, no collisions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit(page, "/en");
  const sample = () =>
    page
      .locator(".rm-hero-product")
      .evaluate((n) => ({
        transform: getComputedStyle(n).transform,
        bottom: n.getBoundingClientRect().bottom + scrollY,
        loop:
          document.querySelector(".rm-loop")!.getBoundingClientRect().top +
          scrollY,
      }));
  const before = await sample();
  await page.evaluate(() => scrollTo(0, 400));
  expect((await sample()).transform).toBe("none");
  expect(before.transform).toBe("none");
  expect(before.bottom).toBeLessThan(before.loop);
  await page.getByRole("tab", { name: "Keep seating" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Baseline");
  await page.getByRole("tab", { name: "Pace 12 minutes" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("+$620");
});
test("10 Felix, German visitor: natural forward/back scrolling and footer routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1130, height: 700 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visit(page, "/de");
  const frames: { y: number; height: number; transform: string }[] = [];
  for (const y of [0, 200, 450, 850, 200, 0]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(600);
    frames.push(
      await page.evaluate(() => ({
        y: scrollY,
        height: document.documentElement.scrollHeight,
        transform: getComputedStyle(document.querySelector(".rm-hero-product")!)
          .transform,
      })),
    );
  }
  expect(new Set(frames.map((f) => f.height)).size).toBe(1);
  expect(frames.map((f) => Math.round(f.y))).toEqual([
    0, 200, 450, 850, 200, 0,
  ]);
  expect(frames[0].transform).not.toBe(frames[2].transform);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await capture(page, "german-footer");
  const hrefs = await page
    .locator(".rx-footer a[href]")
    .evaluateAll((nodes) => [
      ...new Set(
        nodes
          .map((n) => n.getAttribute("href")!)
          .filter((h) => h.startsWith("/") && !h.includes("#")),
      ),
    ]);
  for (const href of hrefs) await visit(page, href);
});
