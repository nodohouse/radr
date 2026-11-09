import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
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
async function fill(page: import("playwright/test").Page) {
  await page.getByLabel("Full name", { exact: true }).fill("Jamie Example");
  await page
    .getByLabel("Work email", { exact: true })
    .fill("jamie@example.com");
  await page.getByLabel("Company", { exact: true }).fill("Example Hospitality");
  await page.getByLabel("Your role", { exact: true }).selectOption("finance");
  await page
    .getByLabel("Number of locations", { exact: true })
    .selectOption("2-5");
}
for (const width of [390, 820, 1512, 3840])
  test(`two clear paths and a legible introduction at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/en/signup?intent=demo");
    await expect(
      page.getByRole("heading", { name: "Get inside RADR." }),
    ).toBeVisible();
    await expect(page.locator("input[type=password]")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Enter the demo" }),
    ).toBeDisabled();
    await expect(
      page.locator(".ob-entry-options [aria-current=page]"),
    ).toContainText("Explore the demo");
    await fill(page);
    await expect(
      page.getByRole("button", { name: "Enter the demo" }),
    ).toBeDisabled();
    await page
      .getByLabel("Choose your demo", { exact: true })
      .selectOption("hotel");
    await expect(
      page.getByRole("button", { name: "Enter the demo" }),
    ).toBeEnabled();
    await page.getByLabel("Company", { exact: true }).fill("  ");
    await expect(
      page.getByRole("button", { name: "Enter the demo" }),
    ).toBeDisabled();
    await page
      .getByLabel("Company", { exact: true })
      .fill("Example Hospitality");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const overlap = await page.locator(".ob-demo-fields").evaluate((n) => {
      const boxes = [...n.children].map((x) => x.getBoundingClientRect());
      return boxes.some((a, i) =>
        boxes.some(
          (b, j) =>
            i !== j &&
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top,
        ),
      );
    });
    expect(overlap).toBe(false);
    await page.screenshot({
      path: test.info().outputPath(`demo-entry-${width}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
for (const world of ["restaurant", "hotel"])
  test(`a new visitor enters the ${world} demo without an account or transmitting contact details`, async ({
    page,
    context,
  }) => {
    await page.goto("/app/live?stay=1");
    await expect(page).toHaveURL(/signup/);
    await page.goto("/en/demo");
    await page
      .getByRole("button", {
        name: world === "hotel" ? "Hotel group" : "Restaurant group",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/signup\?intent=demo/);
    await expect(
      page.getByLabel("Choose your demo", { exact: true }),
    ).toHaveValue(world);
    await fill(page);
    await expect(
      page.getByRole("button", { name: "Enter the demo" }),
    ).toBeEnabled();
    const response = page.waitForResponse(
      (r) =>
        r.url().includes("/api/demo/access") && r.request().method() === "POST",
    );
    const post = page.waitForRequest(
      (r) => r.url().includes("/api/demo/access") && r.method() === "POST",
    );
    await page.getByRole("button", { name: "Enter the demo" }).click();
    expect((await post).postDataJSON()).toEqual({ vertical: world });
    expect((await response).status()).toBe(200);
    await expect(page).toHaveURL(/\/app\?stay=1/, { timeout: 120000 });
    await expect(
      page.getByRole("button", {
        name:
          world === "hotel"
            ? "Workspace: Northstar Hotels"
            : "Workspace: Northstar Restaurants",
        exact: true,
      }),
    ).toBeVisible();
    const cookies = await context.cookies();
    const grant = cookies.find((c) => c.name === "radr_demo_access");
    expect(grant?.httpOnly).toBe(true);
    expect(cookies.some((c) => c.name.includes("session_token"))).toBe(false);
    const stored = await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    );
    expect(stored).not.toContain("jamie@example.com");
    expect(stored).not.toContain("Jamie Example");
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/login/);
  });
test("workspace registration remains a separate account flow", async ({
  page,
}) => {
  await page.goto("/en/signup?intent=demo");
  await page
    .locator(".ob-entry-options")
    .getByRole("link", { name: /Create an account/ })
    .click();
  await expect(page).toHaveURL(/intent=workspace/);
  await expect(page.locator("input[type=password]")).toHaveCount(1);
  await expect(
    page.locator(".ob-entry-options [aria-current=page]"),
  ).toContainText("Create an account");
  await expect(page.locator(".ob-demo-form")).toHaveCount(0);
  await page
    .locator(".ob-entry-options")
    .getByRole("link", { name: /Explore the demo/ })
    .click();
  await expect(page.locator("input[type=password]")).toHaveCount(0);
});
test("the showcase cycles continuously and reduced motion stays still", async ({
  page,
}) => {
  await page.goto("/en/signup?intent=demo");
  const stage = page.locator(".ob-capture-decision");
  await expect(stage).toHaveAttribute("data-scene", "0");
  await expect(stage).toHaveAttribute("data-scene", "1", { timeout: 8000 });
  await expect(stage).toHaveAttribute("data-scene", "2", { timeout: 8000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(stage).toHaveAttribute("data-scene", "0");
  await page.waitForTimeout(4500);
  await expect(stage).toHaveAttribute("data-scene", "0");
});
test("entry passes accessibility checks on desktop and phone", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/signup?intent=demo");
    const r = await new AxeBuilder({ page })
      .include(".ob-auth-layout")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      r.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
