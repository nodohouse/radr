import { test, expect } from "playwright/test";
import { randomUUID } from "node:crypto";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
const key = "radr.cookie-preferences.v1";
async function reject(page: import("playwright/test").Page) {
  await page
    .getByRole("button", { name: "Reject optional", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

test("login and recovery cannot submit incomplete or malformed fields", async ({
  page,
}) => {
  await page.goto(base + "/en/login");
  await reject(page);
  const submit = page.getByRole("button", { name: "Sign in", exact: true });
  await expect(submit).toBeDisabled();
  await page.getByLabel("Work email", { exact: true }).fill("bad@");
  await page.getByLabel("Password", { exact: true }).fill("password");
  await expect(submit).toBeDisabled();
  await page
    .getByLabel("Work email", { exact: true })
    .fill("test@example.test");
  await expect(submit).toBeEnabled();
  await page.route("**/api/auth/sign-in/email", (r) => r.abort());
  await submit.click();
  await expect(page.locator(".ob-error")).toBeVisible();
  await expect(submit).toBeEnabled();
  await page.goto(base + "/en/forgot-password");
  await expect(page.locator("button[type=submit]")).toBeDisabled();
  await page.getByLabel("Work email", { exact: true }).fill("bad");
  await expect(page.locator("button[type=submit]")).toBeDisabled();
  await page.goto(base + "/en/reset-password?token=local-test");
  await page
    .getByLabel("New password", { exact: true })
    .fill("Valid local password");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Different password");
  await expect(page.locator("button[type=submit]")).toBeDisabled();
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Valid local password");
  await expect(page.locator("button[type=submit]")).toBeEnabled();
});

test("onboarding requires explicit choices and a complete reviewed location", async ({
  page,
}) => {
  await page.goto(base + "/onboarding/preview");
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("   ");
  const next = page.getByRole("button", { name: "Continue", exact: true });
  await expect(next).toBeDisabled();
  await page.getByLabel("Full name", { exact: true }).fill("Taylor Morgan");
  await expect(next).toBeDisabled();
  await page
    .getByRole("button", { name: "CFO / Finance", exact: true })
    .click();
  await next.click();
  await page.getByLabel("Organization name", { exact: true }).fill("Northstar");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Hotel group", exact: true }).click();
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "2–5", exact: true }).click();
  await next.click();
  await page.getByLabel("Location name", { exact: true }).fill("Canal House");
  const location = page.getByRole("button", {
    name: "Continue with this location",
    exact: true,
  });
  await expect(location).toBeDisabled();
  await page.getByLabel("City", { exact: true }).fill("Amsterdam");
  await expect(location).toBeDisabled();
  await page.getByLabel("Country", { exact: true }).selectOption("NL");
  await page.getByLabel("Location timezone", { exact: true }).fill("Not/AZone");
  await expect(location).toBeDisabled();
  await page
    .getByLabel("Location timezone", { exact: true })
    .fill("Europe/Amsterdam");
  await location.click();
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: /Supplier \/ AP/ }).click();
  await next.click();
  const evidenceAction = page.locator(".ob-main .ob-btn-primary");
  await expect(evidenceAction).toBeDisabled();
  await page.getByRole("button", { name: /Explore with demo data/ }).click();
  await expect(evidenceAction).toBeEnabled();
});

test("cookie choices persist, can be changed, and optional tracking starts denied", async ({
  page,
}) => {
  await page.goto(base + "/en");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull();
  await reject(page);
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "null").analytics,
      key,
    ),
  ).toBe(false);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", { name: /Analytics/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /Analytics/ }).check();
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "null").analytics,
      key,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await reject(page);
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "null").analytics,
      key,
    ),
  ).toBe(false);
});

test("server rejects malformed credentials and bypassed onboarding gates", async ({
  request,
}) => {
  for (const body of [null, { email: "bad", password: "" }]) {
    const result = await request.post(base + "/api/auth/sign-in/email", {
      data: body,
    });
    expect(result.status()).toBe(400);
  }
  const email = `logic-${randomUUID()}@example.test`;
  const signup = await request.post(base + "/api/auth/sign-up/email", {
    data: { name: "Logic QA", email, password: "Local testing password 2026" },
    headers: { origin: base },
  });
  expect(signup.ok()).toBeTruthy();
  const invalid = await request.post(base + "/api/onboarding", {
    data: {
      path: "first_value",
      organizationName: "Northstar",
      locationName: "Canal",
      country: "NL",
      currency: "EUR",
    },
    headers: { origin: base },
  });
  expect(invalid.status(), await invalid.text()).toBe(400);
  const created = await request.post(base + "/api/onboarding", {
    data: {
      path: "first_value",
      fullName: "Taylor Morgan",
      roleLens: "cfo",
      industry: "hotel_group",
      organizationName: "Logic " + randomUUID(),
      locationName: "Canal",
      locationCity: "Amsterdam",
      country: "NL",
      currency: "EUR",
      timezone: "Europe/Amsterdam",
      locationBand: "2-5",
    },
    headers: { origin: base },
  });
  expect(created.ok()).toBeTruthy();
  const skip = await request.patch(base + "/api/onboarding", {
    data: {
      step: "done",
      completedAt: new Date().toISOString(),
      firstDecision: { verified: true },
    },
    headers: { origin: base },
  });
  expect(skip.status()).toBe(400);
  const origin = await request.patch(base + "/api/onboarding", {
    data: { step: "done" },
    headers: { origin: "https://other.test" },
  });
  expect(origin.status()).toBe(403);
});
