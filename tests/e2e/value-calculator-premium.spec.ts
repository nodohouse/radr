import { expect, test, type Page } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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
function amount(text: string) {
  return Number(text.replace(/[^\d.-]/g, ""));
}
async function begin(page: Page, vertical = "restaurant") {
  await page.goto("/en/value-calculator");
  await page.getByRole("button", { name: "Build my Value Map" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Choose your operation",
  );
  await page
    .getByRole("button", {
      name:
        vertical === "hotel"
          ? "Hotel / hotel group"
          : "Restaurant / restaurant group",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Number of locations / properties", { exact: true })
    .selectOption("1");
  await page.getByLabel("Currency", { exact: true }).selectOption("EUR");
}
async function finish(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Labor cost %", { exact: true }).selectOption("25_29");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Build Value Map", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "three record-process questions",
  );
  await page
    .getByLabel("How many systems hold your data?", { exact: true })
    .selectOption("2_4");
  await page
    .getByLabel("How often do you reconcile?", { exact: true })
    .selectOption("weekly");
  await page
    .getByLabel("How much matching is manual?", { exact: true })
    .selectOption("medium");
  await page
    .getByRole("button", { name: "Build Value Map", exact: true })
    .click();
  await expect(page.locator(".vc-res-head")).toBeVisible();
}

test("an independent venue can enter exact EUR revenue, edit it and keep all categories", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("button", { name: "Enter an exact amount" }).click();
  await page.getByLabel("Exact annual revenue", { exact: true }).fill("-1");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "greater than zero",
  );
  await page.getByLabel("Exact annual revenue", { exact: true }).fill("625000");
  await finish(page);
  await expect(page.locator(".vc3-result-context")).toContainText(
    "€625,000 per year",
  );
  await expect(page.locator(".vc3-category-bars>button")).toHaveCount(8);
  const first = amount(await page.getByTestId("central-exposure").innerText());
  await page.getByRole("button", { name: "Edit inputs", exact: true }).click();
  await expect(
    page.getByLabel("Exact annual revenue", { exact: true }),
  ).toHaveValue("625000");
  await page
    .getByLabel("Exact annual revenue", { exact: true })
    .fill("1250000");
  await page
    .getByRole("button", { name: "Update results", exact: true })
    .click();
  expect(
    amount(await page.getByTestId("central-exposure").innerText()),
  ).toBeCloseTo(first * 2, -1);
  await page.goBack();
  await expect(
    page.getByLabel("Exact annual revenue", { exact: true }),
  ).toHaveValue("1250000");
});

test("missing revenue stays unquantified and never becomes a ten-million assumption", async ({
  page,
}) => {
  await begin(page, "hotel");
  await page
    .getByLabel("Annual revenue", { exact: true })
    .selectOption("unknown");
  await finish(page);
  await expect(page.getByTestId("exposure-range")).toHaveText(
    "Add revenue to see a range",
  );
  await expect(page.locator(".vc3-summary")).not.toContainText("10,000,000");
  await page.getByLabel("Your annual budget", { exact: true }).fill("2000");
  await expect(page.locator(".vc3-roi-results")).toHaveCount(0);
  await expect(page.locator(".vc3-category-bars>button")).toHaveCount(9);
});

test("all sample categories, horizons, capture and a negative-budget scenario stay coherent", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Mixed hospitality", exact: true })
    .click();
  await expect(page.locator(".vc3-category-bars>button")).toHaveCount(10);
  await expect(page.locator(".vc-res-head")).toContainText(
    "Illustrative mixed example",
  );
  const annual = amount(await page.getByTestId("central-exposure").innerText());
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  expect(
    amount(await page.getByTestId("central-exposure").innerText()),
  ).toBeCloseTo(annual / 12, 0);
  const slider = page.getByRole("slider", {
    name: "Modeled capture percentage",
  });
  await slider.fill("10");
  const low = amount(
    (await page.getByTestId("capture-range").innerText()).split("–")[1],
  );
  await slider.fill("30");
  expect(
    amount((await page.getByTestId("capture-range").innerText()).split("–")[1]),
  ).toBeCloseTo(low * 3, 0);
  expect(
    amount(await page.getByTestId("central-exposure").innerText()),
  ).toBeCloseTo(annual / 12, 0);
  await page
    .getByLabel("Your annual budget", { exact: true })
    .fill("1000000000");
  await expect(page.getByTestId("net-return")).toContainText("-");
  await expect(page.locator(".vc3-roi-results")).toContainText(
    "Illustrative annual ROI",
  );
  await page.getByLabel("Your annual budget", { exact: true }).fill("-12");
  await expect(
    page.getByLabel("Your annual budget", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".vc3-roi-results")).toHaveCount(0);
  await page
    .getByText("Adjust central rate assumptions", { exact: true })
    .click();
  const rateOrder = await page
    .locator(".vc3-rate-grid label")
    .evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-assumption-id")),
    );
  const rate = page.getByRole("slider", {
    name: "Labor central rate",
    exact: true,
  });
  await rate.focus();
  await rate.fill("5");
  expect(
    await page
      .locator(".vc3-rate-grid label")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("data-assumption-id")),
      ),
  ).toEqual(rateOrder);
  await expect(rate).toBeFocused();
  expect(
    amount(await page.getByTestId("central-exposure").innerText()),
  ).toBeGreaterThan(annual / 12);
  await page
    .getByRole("button", { name: "Reset category rates to defaults" })
    .click();
  expect(
    amount(await page.getByTestId("central-exposure").innerText()),
  ).toBeCloseTo(annual / 12, 0);
});

test("exports an annual map locally and provides category evidence without a dialog", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().includes("/api/")) posts.push(r.url());
  });
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  const category = page
    .locator(".vc3-category-bars>button")
    .filter({ hasText: "Channel mix" });
  await category.click();
  await expect(page.locator(".vc3-category-detail")).toContainText(
    "direct and third-party bookings",
  );
  await page
    .getByText("Show this category’s calculation", { exact: true })
    .click();
  await expect(page.locator(".vc3-detail-formula[open]")).toContainText(
    "before adjustments",
  );
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await waiting;
  expect(download.suggestedFilename()).toBe("RADR-value-map.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  expect(text).toContain("Annual; all selected locations combined");
  expect(text).toContain("PMS; Channel manager; OTA; Rate / inventory");
  expect(text).toContain("Internal modeling assumptions");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(posts).toEqual([]);
});

for (const width of [390, 820, 1512, 3840])
  test(`calculator result fits and remains accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const kind of ["Global restaurant group", "Global hotel group"]) {
      await page.goto("/en/value-calculator");
      if (width === 1512 && kind === "Global restaurant group") {
        const axe = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
      }
      await page.getByRole("button", { name: kind, exact: true }).click();
      await expect(page.locator(".vc3-summary")).toBeVisible();
      await expect(page.locator(".vc3-summary-capture h2")).toHaveCSS(
        "color",
        "rgb(255, 255, 255)",
      );
      await expect(page.locator(".vc4-path--demo h3")).toHaveCSS(
        "color",
        "rgb(255, 255, 255)",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (kind === "Global hotel group" && [390, 1512].includes(width)) {
        const axe = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
      }
      await page.screenshot({
        path: test
          .info()
          .outputPath(`${kind.replaceAll(" ", "-")}-${width}.png`),
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });

for (const width of [390, 1512])
  test(`methodology is readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/value-calculator/methodology");
    await expect(
      page.getByRole("heading", { name: "A model you can inspect." }),
    ).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(10);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const axe = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      axe.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });

test("other operations require a subtype and preserve browser-back navigation", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page.getByRole("button", { name: "Build my Value Map" }).click();
  await page
    .getByRole("button", { name: "Other hospitality operation", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Choose your operation",
  );
  await page
    .getByLabel("Type of hospitality operation", { exact: true })
    .selectOption("bar");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Set the scale of your operation." }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByLabel("Type of hospitality operation", { exact: true }),
  ).toHaveValue("bar");
});

test("printing retains the displayed scenario and readable category rows", async ({
  page,
}) => {
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  const exposure = await page.getByTestId("exposure-range").innerText();
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await expect(page.locator(".rx-nav")).toBeHidden();
  await expect(page.locator(".vc3-category-bars>button")).toHaveCount(3);
  await expect(page.locator(".vc3-category-bars>button").first()).toBeVisible();
  await expect(page.getByTestId("exposure-range")).toHaveText(exposure);
  await expect(page.locator(".vc3-summary-main")).toContainText("per month");
});

test("regular-motion visitors can adjust capture with the keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global restaurant group", exact: true })
    .click();
  const slider = page.getByRole("slider", {
    name: "Modeled capture percentage",
  });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("21");
  await expect(page.locator(".vc3-summary-capture h2")).toContainText("21%");
  await page.getByText("How was this calculated?", { exact: true }).click();
  await expect(page.locator(".vc3-math-ledger")).toBeVisible();
});

test("phone category selection reveals its details below the fixed navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  await page
    .locator(".vc3-category-bars>button")
    .filter({ hasText: "Channel mix" })
    .click();
  const detail = page.locator(".vc3-category-detail");
  await expect(detail).toHaveAttribute("data-category", "channel_mix");
  await expect(
    detail.getByRole("heading", { name: "Channel mix", exact: true }),
  ).toBeFocused();
  const nav = (await page.locator(".rx-nav").boundingBox())!;
  const box = (await detail.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(nav.y + nav.height + 12);
  expect(box.y).toBeLessThan(200);
  await page.getByRole("button", { name: "Back to operating areas" }).click();
  await expect(
    page.getByRole("heading", { name: "Where the model points." }),
  ).toBeFocused();
});
