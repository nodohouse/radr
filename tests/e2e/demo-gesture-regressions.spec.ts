import { test, expect } from "playwright/test";

for (const vertical of ["restaurant", "hotel"] as const) {
  test(`${vertical}: every Back of House view opens`, async ({ page }) => {
    await page.goto(`/app/enter?vertical=${vertical}&go=1`);
    await page.waitForURL("**/app?stay=1");
    await page.goto("/app/house?stay=1");
    const nav = page.getByRole("navigation", { name: "Back of house views" });
    const views = [
      "Overview",
      "Stock",
      "Prep & Line",
      "Deliveries",
      "Suppliers",
      "History",
      "Captures",
      "Waste",
    ];
    for (const name of views) {
      await nav.getByRole("button", { name, exact: true }).click();
      await expect(nav.getByRole("button", { name, exact: true })).toHaveClass(
        "is-active",
      );
      await expect(page.locator(".boh-root")).toBeVisible();
    }
  });
}

// Live camera and guest-detail regressions are covered by live-hospitality-world.spec.ts.
