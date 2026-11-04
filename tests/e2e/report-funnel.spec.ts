import { test, expect } from "playwright/test";
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
test("journal publishes four articles with substantive content and report links", async ({
  page,
}) => {
  await page.goto(base + "/en/blog");
  await expect(
    page.getByRole("heading", {
      name: "Your bestseller could be slowing down the whole restaurant",
      exact: true,
    }),
  ).toBeVisible();
  for (const slug of [
    "the-hidden-cost-of-your-bestseller",
    "a-full-hotel-can-still-have-a-margin-problem",
    "the-forecast-gap-needs-a-decision",
    "a-supplier-credit-is-not-recovered-money",
  ]) {
    await page.goto(base + "/en/blog/" + slug);
    await expect(page.locator(".rx-res-body p, .rx-res-pull p")).toHaveCount(
      12,
    );
    await expect(page.locator(".rr-promo a")).toHaveAttribute(
      "href",
      /hospitality-decision-playbook/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
});
test("PDF is gated, fields are required, and delivered leads unlock a real download", async ({
  page,
  request,
}) => {
  expect((await request.get(base + "/api/reports/download")).status()).toBe(
    403,
  );
  await page.goto(base + "/en/resources/hospitality-decision-playbook");
  const submit = page.getByRole("button", {
    name: "Get the playbook →",
    exact: true,
  });
  await expect(submit).toBeDisabled();
  await page.getByLabel("Full name", { exact: true }).fill("Taylor Report QA");
  await page
    .getByLabel("Work email", { exact: true })
    .fill("report-qa@example.test");
  await page
    .getByRole("textbox", { name: "Company", exact: true })
    .fill("Example Hospitality");
  await page.getByLabel("Your role", { exact: true }).selectOption("finance");
  await page.getByLabel("Locations", { exact: true }).selectOption("2-5");
  await expect(submit).toBeEnabled();
  await expect(page.getByLabel(/Also send me/)).not.toBeChecked();
  await submit.click();
  await expect(
    page.getByRole("heading", { name: "Your playbook is ready." }),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download the playbook →", exact: true })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(
    "RADR-Hospitality-Decision-Playbook-2026.pdf",
  );
  const pdf = await page.request.get(base + "/api/reports/download");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.headers()["cache-control"]).toContain("no-store");
  const sink = await request.get("http://127.0.0.1:4100/status");
  const state = await sink.json();
  expect(state.last.followUpRequested).toBe(false);
  expect(state.last.interest).toBe("playbook-download");
  expect(state.last.marketingOptIn).toBe(false);
  expect(state.last.source).toBe("radr-report");
});
test("upstream failure does not issue a download grant", async ({
  request,
}) => {
  await request.get("http://127.0.0.1:4100/fail");
  try {
    const result = await request.post(base + "/api/reports/request", {
      headers: { origin: base },
      data: {
        fullName: "Failure QA",
        email: "failure@example.test",
        company: "Example Hotel",
        role: "owner",
        locations: "1",
        requestContact: true,
        marketingOptIn: false,
        website: "",
      },
    });
    expect(result.status()).toBe(502);
    expect(result.headers()["set-cookie"]).toBeUndefined();
    expect((await request.get(base + "/api/reports/download")).status()).toBe(
      403,
    );
  } finally {
    await request.get("http://127.0.0.1:4100/recover");
  }
});
test("mobile report page stays readable and navigation exposes journal and report", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/en/resources/hospitality-decision-playbook");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await expect(page.getByLabel("Work email", { exact: true })).toBeVisible();
  await page.locator(".rx-nav-menu").click();
  await page.locator(".rx-nav-acc-head button").last().click();
  await expect(
    page
      .locator(".rx-nav-drawer")
      .getByRole("link", { name: "Journal", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".rx-nav-drawer")
      .getByRole("link", { name: "The Decision Playbook", exact: true }),
  ).toBeVisible();
});

test("report information and form occupy separate columns throughout scrolling", async ({
  page,
}) => {
  for (const width of [1512, 1024]) {
    await page.setViewportSize({ width, height: 982 });
    await page.goto(base + "/en/resources/hospitality-decision-playbook");
    const form = page.locator("#request-report");
    await expect(
      form.getByRole("heading", { name: "Get the playbook." }),
    ).toBeVisible();
    for (const target of [
      ".rr-report-copy h1",
      ".rr-contents",
      ".rr-research-strip",
      ".rr-spreads",
    ]) {
      await page.locator(target).scrollIntoViewIfNeeded();
      const bounds = await page.evaluate((selector) => {
        const content = document
          .querySelector(selector)!
          .getBoundingClientRect();
        const form = document
          .querySelector("#request-report")!
          .getBoundingClientRect();
        return {
          contentRight: content.right,
          formLeft: form.left,
          overflow: document.documentElement.scrollWidth > innerWidth,
          position: getComputedStyle(document.querySelector("#request-report")!)
            .position,
        };
      }, target);
      expect(bounds.contentRight).toBeLessThan(bounds.formLeft);
      expect(bounds.overflow).toBe(false);
      expect(bounds.position).toBe("static");
    }
  }
});
