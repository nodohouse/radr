import { test, expect } from "playwright/test";
import { randomUUID } from "node:crypto";

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

async function setupBasics(page: import("playwright/test").Page, name: string) {
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Taylor Morgan");
  await page
    .getByRole("button", { name: "CFO / Finance", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Organization name", exact: true })
    .fill(name);
  await page.getByRole("button", { name: "Hotel group", exact: true }).click();
  await page.getByRole("button", { name: "2–5", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Location name", exact: true })
    .fill("Canal QA House");
  await page.getByLabel("City", { exact: true }).fill("Amsterdam");
  await page.getByLabel("Country", { exact: true }).selectOption("NL");
  await page
    .getByRole("button", { name: "Continue with this location", exact: true })
    .click();
}

test("login validates input and recovers from a network failure without trapping the user", async ({
  page,
}) => {
  await page.goto("/en/login");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeDisabled();
  expect(
    await page
      .locator("#email")
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing),
  ).toBeTruthy();
  await page.getByLabel("Work email", { exact: true }).fill("qa@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Local-test-password-2026");
  await page.getByRole("button", { name: "Show", exact: true }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.route("**/api/auth/sign-in/email", (route) =>
    route.abort("failed"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".ob-error[role=alert]")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
});

test("the public setup preview keeps drafts, supports back navigation and never creates a workspace", async ({
  page,
}) => {
  let writes = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/onboarding") && r.method() !== "GET") writes++;
  });
  await page.goto("/onboarding/preview");
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Draft Reviewer");
  await page
    .getByRole("button", { name: "CFO / Finance", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Organization name", exact: true })
    .fill("Draft Hotel");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Organization name", exact: true }),
  ).toHaveValue("Draft Hotel");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Full name", exact: true }),
  ).toHaveValue("Draft Reviewer");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(writes).toBe(0);
});

test("a real account creates a scoped workspace, uploads CSV evidence, reveals the first decision and signs in again", async ({
  page,
}) => {
  test.setTimeout(240000);
  const email = `entry-${randomUUID()}@example.test`,
    password = `QA-${randomUUID()}-aB9!`;
  await page.goto("/en/signup?intent=workspace");
  await page.getByLabel("Work email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await setupBasics(page, "RADR isolated QA");
  await expect(
    page.getByRole("heading", {
      name: "Where should RADR look first?",
      exact: true,
    }),
  ).toBeVisible();
  const snapshot = await (await page.request.get("/api/onboarding")).json();
  expect(snapshot.workspace.onboarding.fullName).toBe("Taylor Morgan");
  expect(snapshot.workspace.onboarding.industry).toBe("hotel_group");
  expect(snapshot.workspace.onboarding.roleLens).toBe("cfo");
  await page.getByRole("button", { name: /Supplier \/ AP/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: /Upload files/ }).click();
  await page.getByRole("button", { name: "Upload data", exact: true }).click();
  const contract =
    "supplier,sku,unit,contract_rate,currency\nQA Supplier,oil,L,6.80,EUR";
  const invoice =
    "supplier,invoice_id,sku,quantity,unit,unit_price,currency\nQA Supplier,QA-1,oil,420,L,7.45,EUR";
  await page
    .getByLabel("Contract CSV", { exact: true })
    .setInputFiles({
      name: "contract.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(contract),
    });
  await page
    .getByLabel("Invoice CSV", { exact: true })
    .setInputFiles({
      name: "invoice.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(invoice),
    });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Your files are ready for a quality check",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Find my first Decision", exact: true })
    .click();
  await expect(page.locator(".ob-title-money")).toContainText("273");
  await page.reload();
  await expect(page.locator(".ob-title-money")).toContainText("273");
  await page
    .getByText("Review the evidence behind this result", { exact: true })
    .click();
  await expect(page.locator(".ob-result-evidence")).toContainText(
    "EUR 6.80 / L",
  );
  await expect(page.locator(".ob-result-evidence")).toContainText("420 L");
  await page
    .getByRole("button", { name: "Open Control Center", exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\?welcome=1/, { timeout: 45000 });
  const completed = await (await page.request.get("/api/onboarding")).json();
  expect(completed.workspace.onboarding.step).toBe("done");
  await page.request.post("/api/auth/sign-out", {
    data: {},
    headers: { origin: new URL(page.url()).origin },
  });
  await page.goto("/en/login");
  await page.getByLabel("Work email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test("a rejected progress save stays on the current step with a retryable error", async ({
  page,
}) => {
  const email = `save-${randomUUID()}@example.test`;
  await page.goto("/en/signup?intent=workspace");
  await page.getByLabel("Work email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(`QA-${randomUUID()}-bC8!`);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await setupBasics(page, "Save recovery QA");
  await page.getByRole("button", { name: /Supplier \/ AP/ }).click();
  await page.route("**/api/onboarding", (route) =>
    route.request().method() === "PATCH"
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Progress could not be saved. Try again.",
          }),
        })
      : route.continue(),
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".ob-error[role=alert]")).toContainText(
    "Progress could not be saved",
  );
  await expect(
    page.getByRole("heading", {
      name: "Where should RADR look first?",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeEnabled();
});

test("recovery stays non-enumerating and reset validation does not send mismatched passwords", async ({
  page,
}) => {
  await page.goto("/en/forgot-password");
  await page.route("**/api/auth/request-password-reset", (route) =>
    route.abort("failed"),
  );
  await page
    .getByLabel("Work email", { exact: true })
    .fill("recovery@example.test");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await expect(page.locator(".ob-auth-confirm")).toContainText(
    "If password recovery is available",
  );
  await page.goto("/en/reset-password");
  await expect(
    page.getByRole("button", { name: "Update password", exact: true }),
  ).toBeDisabled();
  await page.goto("/en/reset-password?token=local-validation-only");
  await page
    .getByLabel("New password", { exact: true })
    .fill("Long-local-password-A");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Long-local-password-B");
  await expect(
    page.getByRole("button", { name: "Update password", exact: true }),
  ).toBeDisabled();
});
