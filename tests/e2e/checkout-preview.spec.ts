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
async function fillCompany(page: Page) {
  await page.getByLabel("Your full name", { exact: true }).fill("Elena Nord");
  await page
    .getByLabel("Business email", { exact: true })
    .fill("elena@northstar-hospitality.com");
  await page
    .getByLabel("Legal business name", { exact: true })
    .fill("Northstar Hospitality GmbH");
  await page
    .getByLabel("Business registration or tax reference", { exact: true })
    .fill("HRB 45123");
  await page.getByLabel("Business country", { exact: true }).selectOption("DE");
  await page
    .getByLabel("Billing street address", { exact: true })
    .fill("Seestrasse 24");
  await page.getByLabel("City", { exact: true }).fill("Berlin");
  await page.getByLabel("Postal code", { exact: true }).fill("10115");
  await page
    .getByRole("checkbox", {
      name: "I am authorized to act for this business.",
    })
    .check();
}
async function checkLayout(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  const clipped = await page
    .locator(".ck-main, .ck-summary")
    .evaluateAll((panels) =>
      panels.flatMap((panel) =>
        [...panel.querySelectorAll("h2,h3,p,button,label,dt,dd,strong")]
          .filter(
            (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2,
          )
          .map((el) => ({
            text: el.textContent?.slice(0, 60),
            class: el.className,
          })),
      ),
    );
  expect(clipped).toEqual([]);
}
for (const [width, height] of [
  [390, 844],
  [820, 1180],
  [1512, 982],
  [3840, 2160],
]) {
  test(`checkout preview completes all review steps without collecting payment at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [],
      posts: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto(
      "/en/checkout?plan=expand&billing=annual&locations=3&vertical=hotel",
    );
    await expect(page.getByTestId("checkout-due")).toHaveText("€7,164");
    for (let step = 0; step < 4; step++) {
      await checkLayout(page);
      await page.screenshot({
        path: test.info().outputPath(`checkout-${width}-step-${step}.png`),
        fullPage: true,
      });
      if ([390, 1512].includes(width)) {
        const scan = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          scan.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
      }
      if (step === 0)
        await page
          .getByRole("button", { name: "Continue to company details" })
          .click();
      if (step === 1) {
        await expect(
          page.getByRole("button", { name: "Continue to account" }),
        ).toBeDisabled();
        await fillCompany(page);
        await expect(
          page.getByRole("button", { name: "Continue to account" }),
        ).toBeEnabled();
        await page.getByRole("button", { name: "Continue to account" }).click();
      }
      if (step === 2) {
        await page
          .getByRole("button", { name: "Sign in", exact: true })
          .click();
        await expect(
          page.getByLabel("Password", { exact: true }),
        ).toBeDisabled();
        await expect(page.getByLabel("Account email")).toHaveValue(
          "elena@northstar-hospitality.com",
        );
        await page
          .getByRole("button", { name: "Preview payment step" })
          .click();
      }
    }
    await expect(
      page.getByLabel("Card number", { exact: true }),
    ).toBeDisabled();
    await expect(page.locator(".ck-verification dd")).toHaveText([
      "Not verified",
      "Not verified",
      "Not connected",
    ]);
    await expect(
      page.getByLabel("Expiry date", { exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByLabel("Security code", { exact: true }),
    ).toBeDisabled();
    await page.locator(".ck-check input").check();
    await expect(
      page.getByRole("button", { name: "Complete purchase · not active" }),
    ).toBeDisabled();
    await expect(page.locator("main")).toContainText(
      "No order, invoice, account, payment or subscription will be created.",
    );
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    expect(page.url()).not.toContain("Elena");
    expect(page.url()).not.toContain("northstar");
    const storage = await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    );
    expect(storage).not.toMatch(/northstar|45123|Seestrasse/i);
    await page.reload();
    await page
      .getByRole("button", { name: "Continue to company details" })
      .click();
    await expect(
      page.getByLabel("Legal business name", { exact: true }),
    ).toHaveValue("");
  });
}
test("pricing billing choice carries the right amounts and hotel context into the basket", async ({
  page,
}) => {
  await page.goto("/en/pricing?from=demo&vertical=hotel");
  await page.getByRole("link", { name: "Pay monthly", exact: true }).click();
  await expect(page.locator(".rm-plan-price strong")).toHaveText([
    "€299",
    "From €478",
    "Contact sales",
  ]);
  await page
    .getByRole("link", { name: "Add Expand to basket", exact: true })
    .click();
  await expect(page).toHaveURL(
    /checkout\?plan=expand&billing=monthly&locations=2&vertical=hotel/,
  );
  await expect(page.getByRole("radio", { name: /^Pay monthly/ })).toBeChecked();
  await expect(page.getByTestId("checkout-due")).toHaveText("€478");
  await expect(
    page.getByRole("complementary", { name: "Order summary" }),
  ).toContainText("€5,736");
  await page.getByLabel("Locations", { exact: true }).selectOption("5");
  await expect(page.getByTestId("checkout-due")).toHaveText("€1,195");
  await page.getByRole("radio", { name: /^Pay yearly/ }).check();
  await expect(page.getByTestId("checkout-due")).toHaveText("€11,940");
  await expect(page.locator(".ck-savings")).toContainText("€2,400");
  await page.getByLabel("Plan", { exact: true }).selectOption("start");
  await expect(page.getByTestId("checkout-due")).toHaveText("€2,988");
  await expect(page.getByLabel("Locations", { exact: true })).toHaveValue("1");
  await page.reload();
  await expect(page.getByTestId("checkout-due")).toHaveText("€2,988");
});
test("incomplete or placeholder company information cannot advance", async ({
  page,
}) => {
  await page.goto("/en/checkout?plan=start&billing=annual&locations=1");
  await expect(page.getByRole("button", { name: /Payment/ })).toBeDisabled();
  await expect(page.locator("#ck-step-title")).toHaveText("Your basket.");
  await page
    .getByRole("button", { name: "Continue to company details" })
    .click();
  await fillCompany(page);
  const next = page.getByRole("button", { name: "Continue to account" });
  for (const value of ["", "test", "123456", "<script>"]) {
    await page.getByLabel("Legal business name", { exact: true }).fill(value);
    await expect(next).toBeDisabled();
  }
  await page
    .getByLabel("Legal business name", { exact: true })
    .fill("Northstar Hospitality GmbH");
  await page
    .getByLabel("Business email", { exact: true })
    .fill("hello@example.com");
  await expect(next).toBeDisabled();
  await page
    .getByLabel("Business email", { exact: true })
    .fill("elena@northstar-hospitality.com");
  await page.getByLabel("Postal code", { exact: true }).fill("Berlin");
  await expect(next).toBeDisabled();
  await page.getByLabel("Postal code", { exact: true }).fill("10115");
  await expect(next).toBeEnabled();
});
test("empty, removed and invalid baskets recover without inventing an order", async ({
  page,
}) => {
  await page.goto("/en/checkout?plan=start&billing=annual&locations=1&price=1");
  await expect(page.getByTestId("checkout-due")).toHaveText("€2,988");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your basket is empty." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your basket is empty." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Add Expand", exact: true }).click();
  await expect(page.getByTestId("checkout-due")).toHaveText("€4,776");
  for (const query of [
    "plan=unknown",
    "plan=expand&locations=1",
    "plan=start&billing=weekly",
  ]) {
    await page.goto(`/en/checkout?${query}`);
    await expect(
      page.getByRole("heading", { name: "Let’s check that selection." }),
    ).toBeVisible();
  }
  await page.goto("/en/checkout?plan=enterprise");
  await expect(page).toHaveURL(/contact\?plan=enterprise/);
});

test("every required company field and authority confirmation blocks advancement when removed", async ({
  page,
}) => {
  await page.goto("/en/checkout?plan=start&billing=annual&locations=1");
  await page
    .getByRole("button", { name: "Continue to company details" })
    .click();
  await fillCompany(page);
  const next = page.getByRole("button", { name: "Continue to account" });
  for (const [id, value] of [
    ["fullName", "Elena Nord"],
    ["email", "elena@northstar-hospitality.com"],
    ["company", "Northstar Hospitality GmbH"],
    ["registrationNumber", "HRB 45123"],
    ["address", "Seestrasse 24"],
    ["city", "Berlin"],
    ["postalCode", "10115"],
  ]) {
    const input = page.locator(`#ck-${id}`);
    await expect(input).toHaveAttribute("required", "");
    await input.fill(" ");
    await expect(next).toBeDisabled();
    await input.fill(value);
    await expect(next).toBeEnabled();
  }
  await page.locator("#ck-country").selectOption("");
  await expect(next).toBeDisabled();
  await page.locator("#ck-country").selectOption("DE");
  const authority = page.getByRole("checkbox", {
    name: "I am authorized to act for this business.",
  });
  await authority.uncheck();
  await expect(next).toBeDisabled();
  await authority.check();
  await expect(next).toBeEnabled();
  await expect(page.locator("#ck-vatId")).not.toHaveAttribute("required", "");
  for (const [id, junk, valid] of [
    ["company", "Test Company GmbH", "Northstar Hospitality GmbH"],
    ["email", "buyer@sub.mailinator.com", "elena@northstar-hospitality.com"],
    ["registrationNumber", "000000", "HRB 45123"],
    ["address", "https://fake.example", "Seestrasse 24"],
  ]) {
    await page.locator(`#ck-${id}`).fill(junk);
    await expect(next).toBeDisabled();
    await page.locator(`#ck-${id}`).fill(valid);
    await expect(next).toBeEnabled();
  }
  await next.click();
  await page.getByRole("button", { name: "Preview payment step" }).click();
  await page.locator(".ck-check input").check();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.locator("#ck-email").fill("changed@northstar-hospitality.com");
  await expect(page.locator(".ck-steps small")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue to account" }).click();
  await expect(page.getByLabel("Account email")).toHaveValue(
    "changed@northstar-hospitality.com",
  );
  await page.getByRole("button", { name: "Preview payment step" }).click();
  await expect(page.locator(".ck-check input")).not.toBeChecked();
});

test("removing disabled and required attributes cannot skip the preview checks", async ({
  page,
}) => {
  const errors: string[] = [],
    posts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/en/checkout?plan=start&billing=annual&locations=1");
  for (const index of [2, 3]) {
    const control = page.locator(".ck-steps button").nth(index);
    await control.evaluate(
      (node) => ((node as HTMLButtonElement).disabled = false),
    );
    await control.click();
    await expect(page.locator("#ck-step-title")).toHaveText("Your basket.");
  }
  await page
    .getByRole("button", { name: "Continue to company details" })
    .click();
  await page.locator(".ck-main form").evaluate((node) => {
    const form = node as HTMLFormElement;
    form.noValidate = true;
    form
      .querySelectorAll("[required]")
      .forEach((field) => field.removeAttribute("required"));
    (
      form.querySelector('button[type="submit"]') as HTMLButtonElement
    ).disabled = false;
  });
  await page.getByRole("button", { name: "Continue to account" }).click();
  await expect(page.locator("#ck-step-title")).toHaveText("Your company.");
  expect(posts).toEqual([]);
  expect(errors).toEqual([]);
});
