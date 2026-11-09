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
async function fill(page: import("playwright/test").Page, world?: string) {
  await page.getByLabel("Full name", { exact: true }).fill("Jamie Morgan");
  await page
    .getByLabel("Work email", { exact: true })
    .fill("jamie@cedar-dining.co");
  await page.getByLabel("Company", { exact: true }).fill("Cedar Hospitality");
  await page.getByLabel("Your role", { exact: true }).selectOption("finance");
  await page
    .getByLabel("Number of locations", { exact: true })
    .selectOption("2-5");
  if (world)
    await page
      .getByLabel("Choose your demo", { exact: true })
      .selectOption(world);
  await page.getByLabel("Password", { exact: true }).fill("Cedar-preview-29!");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Cedar-preview-29!");
  await page.getByRole("checkbox", { name: /I agree/ }).check();
}
for (const width of [390, 820, 1512, 3840])
  test(`required registration and quality checks fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/en/signup?intent=demo");
    await expect(
      page.getByRole("heading", { name: "Register to explore RADR." }),
    ).toBeVisible();
    const next = page.getByRole("button", {
      name: "Continue to the demo preview",
    });
    await expect(next).toBeDisabled();
    await expect(page.locator("input[type=password]")).toHaveCount(2);
    await fill(page, "hotel");
    await expect(next).toBeEnabled();
    await page.getByLabel("Full name", { exact: true }).fill("qwerty");
    await page.getByLabel("Work email", { exact: true }).focus();
    await expect(next).toBeDisabled();
    await expect(page.locator("#reg-fullName-error")).toContainText(
      "not a placeholder",
    );
    await page.getByLabel("Full name", { exact: true }).fill("Jamie Morgan");
    await page
      .getByLabel("Work email", { exact: true })
      .fill("person@mailinator.com");
    await expect(next).toBeDisabled();
    await page
      .getByLabel("Work email", { exact: true })
      .fill("jamie@cedar-dining.co");
    await page.getByLabel("Company", { exact: true }).fill("   ");
    await expect(next).toBeDisabled();
    await page.getByLabel("Company", { exact: true }).fill("Cedar Hospitality");
    await page
      .getByLabel("Confirm password", { exact: true })
      .fill("Different-preview-29!");
    await expect(next).toBeDisabled();
    await page
      .getByLabel("Confirm password", { exact: true })
      .fill("Cedar-preview-29!");
    await page.getByRole("checkbox", { name: /I agree/ }).uncheck();
    await expect(next).toBeDisabled();
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await expect(next).toBeEnabled();
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
      path: test.info().outputPath(`registration-${width}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
for (const world of ["restaurant", "hotel"])
  test(`registration preview → ${world} demo → selected plan → setup`, async ({
    page,
    context,
  }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width: 1512, height: 1100 });
    await page.goto("/app/live?stay=1");
    await expect(page).toHaveURL(/signup/);
    await page.goto("/en/demo");
    await page
      .getByRole("button", {
        name: world === "hotel" ? "Hotel group" : "Restaurant group",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("Choose your demo", { exact: true }),
    ).toHaveValue(world);
    await fill(page);
    await expect(
      page.getByRole("button", { name: "Continue to the demo preview" }),
    ).toBeEnabled();
    const posted = page.waitForRequest(
      (r) => r.url().includes("/api/demo/access") && r.method() === "POST",
    );
    const response = page.waitForResponse(
      (r) =>
        r.url().includes("/api/demo/access") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Continue to the demo preview" })
      .click();
    const payload = (await posted).postDataJSON();
    expect(payload).toMatchObject({
      fullName: "Jamie Morgan",
      vertical: world,
      termsAccepted: true,
    });
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("confirmPassword");
    expect((await response).status()).toBe(200);
    await expect(page).toHaveURL(/\/app\?stay=1/, { timeout: 150000 });
    await expect(
      page.getByRole("button", {
        name:
          world === "hotel"
            ? "Workspace: Northstar Hotels"
            : "Workspace: Northstar Restaurants",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Optional next step" }),
    ).toHaveCount(0);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "radr_demo_access")?.httpOnly).toBe(
      true,
    );
    expect(cookies.some((c) => c.name.includes("session_token"))).toBe(false);
    const stored = await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    );
    expect(stored).not.toContain("jamie@cedar-dining.co");
    expect(stored).not.toContain("Cedar-preview-29!");
    if (world === "hotel")
      await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: test.info().outputPath(`${world}-demo-conversion.png`),
      fullPage: false,
    });
    if (world === "hotel")
      await page.setViewportSize({ width: 1512, height: 1100 });
    // Simulate a guest returning after active exploration; fresh arrivals see no upsell.
    await page.evaluate(() =>
      sessionStorage.setItem(
        "radr.demo.invitation.v1",
        JSON.stringify({
          version: 1,
          activeMs: 240000,
          interacted: true,
          shown: false,
          dismissed: false,
          areas: ["control-center", "live", "decisions"],
        }),
      ),
    );
    await page.reload();
    await expect(
      page.locator(".rp-root[data-context-ready=true]"),
    ).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.clock.runFor(10000);
    await expect(
      page.getByRole("complementary", { name: "Optional next step" }),
    ).toBeVisible();
    await page.clock.resume();
    await page.getByRole("link", { name: /Explore plans/ }).click();
    await expect(page).toHaveURL(
      new RegExp(`pricing\\?from=demo&vertical=${world}`),
    );
    for (const plan of ["start", "expand", "enterprise"]) {
      const name =
        plan === "start"
          ? "14-day free trial"
          : plan === "expand"
            ? "Expand"
            : "Enterprise";
      const card = page
        .locator(".rm-plan-card")
        .filter({ has: page.getByRole("heading", { name, exact: true }) });
      await expect(card.getByRole("link")).toHaveAttribute(
        "href",
        `/onboarding/preview?plan=${plan}&vertical=${world}`,
      );
    }
    const chosen = world === "hotel" ? "Expand" : "14-day free trial";
    await page
      .locator(".rm-plan-card")
      .filter({ has: page.getByRole("heading", { name: chosen, exact: true }) })
      .getByRole("link")
      .click();
    await expect(page).toHaveURL(/onboarding\/preview\?plan=/);
    await expect(
      page.getByRole("complementary", { name: "Selected plan" }),
    ).toContainText(chosen);
    await expect(
      page.getByRole("complementary", { name: "Selected plan" }),
    ).toContainText(
      "No account, free-trial period or paid subscription has started",
    );
    await expect(page.locator("input[type=password]")).toHaveCount(0);
  });
test("public plan choice is retained through required workspace registration", async ({
  page,
}) => {
  await page.goto("/en/pricing");
  await page
    .locator(".rm-plan-card")
    .filter({
      has: page.getByRole("heading", { name: "Enterprise", exact: true }),
    })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/signup\?intent=workspace&plan=enterprise/);
  await expect(page.locator(".ob-registration-plan")).toContainText(
    "Enterprise",
  );
  await fill(page, "hotel");
  const response = page.waitForResponse(
    (r) =>
      r.url().includes("/api/demo/access") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Continue to setup preview" }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(
    /onboarding\/preview\?plan=enterprise&vertical=hotel/,
  );
  await expect(
    page.getByRole("complementary", { name: "Selected plan" }),
  ).toContainText("Enterprise");
});
test("registration accessibility and terms links preserve the current form", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/signup?intent=demo");
    await expect(page.locator(".ob-registration-form")).toHaveAttribute(
      "data-ready",
      "true",
    );
    const result = await new AxeBuilder({ page })
      .include(".ob-auth-layout")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await expect(
    page
      .locator(".ob-registration-terms")
      .getByRole("link", { name: "Terms", exact: true }),
  ).toHaveAttribute("target", "_blank");
});

test("unselected plan stays unselected until the visitor chooses", async ({
  page,
}) => {
  await page.goto("/en/signup?intent=workspace");
  await expect(page.locator(".ob-registration-plan")).toHaveCount(0);
  await fill(page, "hotel");
  await page
    .getByRole("button", { name: "Continue to plan selection", exact: true })
    .click();
  await expect(page).toHaveURL(/pricing\?from=demo&vertical=hotel/);
  await expect(page.locator(".rm-plan-card")).toHaveCount(3);
});
