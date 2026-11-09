import { test, expect } from "playwright/test";

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

for (const world of ["restaurant", "hotel"] as const) {
  test(`internal chooser opens ${world} and preserves unrelated preferences`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("radr.prefs.v1")) {
        localStorage.setItem(
          "radr.prefs.v1",
          JSON.stringify({ timeFormat: "24h" }),
        );
      }
    });
    await page.goto("/app/enter");
    await expect(
      page.getByRole("heading", { name: "Choose your operating world" }),
    ).toBeVisible();
    await expect(page.locator('[data-last="true"]')).toHaveCount(0);
    await page
      .getByRole("button", {
        name: world === "hotel" ? "Hotel group" : "Restaurant group",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/app\?stay=1/);
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
      page.getByRole("heading", { name: /Your operating brief/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem("radr.demoOrg.v1") || "{}")
            .vertical,
      ),
    ).toBe(world);
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("radr.prefs.v1") || "{}").timeFormat,
      ),
    ).toBe("24h");
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Your operating brief/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem("radr.demoOrg.v1") || "{}")
            .vertical,
      ),
    ).toBe(world);
  });

  test(`onboarding preview enters the matching ${world} demo without workspace writes`, async ({
    page,
  }) => {
    let writes = 0;
    page.on("request", (request) => {
      if (
        request.url().includes("/api/onboarding") &&
        request.method() !== "GET"
      )
        writes++;
    });
    await page.goto("/onboarding/preview");
    await page
      .getByRole("button", { name: "Get started", exact: true })
      .click();
    const next = page.getByRole("button", { name: "Continue", exact: true });
    await expect(next).toBeDisabled();
    await page.getByLabel("Full name", { exact: true }).fill("Taylor Morgan");
    await page
      .getByRole("button", { name: "CFO / Finance", exact: true })
      .click();
    await next.click();
    await page
      .getByLabel("Organization name", { exact: true })
      .fill("Example Hospitality");
    await page
      .getByRole("button", {
        name: world === "hotel" ? "Hotel group" : "Restaurant group",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "2–5", exact: true }).click();
    await next.click();
    await page
      .getByLabel("Location name", { exact: true })
      .fill("Example Venue");
    await page.getByLabel("City", { exact: true }).fill("Amsterdam");
    await page.getByLabel("Country", { exact: true }).selectOption("NL");
    await page
      .getByRole("button", { name: "Continue with this location", exact: true })
      .click();
    await page.getByRole("button", { name: /Supplier \/ AP/ }).click();
    await next.click();
    await page.getByRole("button", { name: /Explore with demo data/ }).click();
    await page.locator(".ob-main .ob-btn-primary").click();
    await expect(page).toHaveURL(/\/app\?stay=1/, { timeout: 30000 });
    await expect(
      page.getByRole("heading", { name: /Your operating brief/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem("radr.demoOrg.v1") || "{}")
            .vertical,
      ),
    ).toBe(world);
    expect(writes).toBe(0);
  });
}
