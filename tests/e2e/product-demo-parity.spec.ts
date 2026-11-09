import { test, expect } from "playwright/test";

async function seedRestaurant(page: import("playwright/test").Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({
        vertical: "restaurant",
        orgId: "org_northstar_restaurants",
      }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: "loc_berlin_mitte",
        roleView: "gm",
        timeFormat: "24h",
      }),
    );
  });
}
for (const world of ["hotel", "restaurant"])
  test(`${world} demo enters the current interactive product Live page`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 1100 });
    await page.goto(`/app/enter?vertical=${world}&go=1`);
    await expect(page).toHaveURL(/\/app\?stay=1/);
    await expect(
      page.getByRole("heading", { name: /Your operating brief/ }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "Live", exact: true })
      .click();
    await expect(page).toHaveURL(/\/app\/live/);
    if (world === "hotel") {
      await expect(page.locator(".hb-scene")).toHaveAttribute(
        "data-ready",
        "true",
      );
      await expect(page.locator(".hb-scene")).toHaveAttribute(
        "data-renderer",
        "webgl",
      );
      await expect(
        page.getByRole("button", { name: "Generate your building" }),
      ).toBeVisible();
      await expect(page.locator(".rp-operation-preview")).toHaveCount(0);
    } else {
      await expect(
        page.locator(".rp-operation-preview.is-live-plan"),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Tonight at a glance.",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".hw-root")).toHaveAttribute(
        "data-renderer",
        "webgl",
      );
      await page.locator(".hw-root").scrollIntoViewIfNeeded();
      await expect(page.locator(".hw-root")).not.toHaveAttribute(
        "data-camera",
        "",
        { timeout: 60000 },
      );
      await expect(page.getByTestId("ls-venue-canvas")).toHaveCount(0);
    }
    await expect(page.locator(".ps-teaser-frame")).toHaveCount(0);
    await page.screenshot({
      path: test.info().outputPath(`${world}-live-product.png`),
    });
  });
test("restaurant floor retains current and incoming guest context, orders and timeline", async ({
  page,
}) => {
  await seedRestaurant(page);
  await page.goto("/app/live?stay=1");
  await page.locator(".hw-root").scrollIntoViewIfNeeded();
  await expect(page.locator(".hw-root")).not.toHaveAttribute(
    "data-camera",
    "",
    { timeout: 60000 },
  );
  await page.getByTestId("spatial-entity-t8").click();
  const panel = page.getByTestId("table-service-details");
  await expect(panel).toContainText("Returning guests");
  await expect(panel).toContainText("Sesame allergy");
  await expect(panel).toContainText("Incoming allergy: Peanuts");
  await expect(panel).toContainText("20:15");
  await expect(panel).toContainText("$236");
  await page.getByRole("tab", { name: "Order", exact: true }).click();
  await page.getByText("View itemized order", { exact: true }).click();
  await expect(panel).toContainText("Steak frites");
  await page.getByRole("tab", { name: "Timeline", exact: true }).click();
  await expect(panel).toContainText("Mains waiting");
  await expect(panel).toContainText("Jordan party");
  await page.getByRole("button", { name: "Close table details" }).click();
  await expect(page.locator(".simp-live-dialog")).not.toBeVisible();
});
test("operating overview deep links and kitchen simulation remain available", async ({
  page,
}) => {
  await seedRestaurant(page);
  await page.goto("/app/live?stay=1&level=venue&zone=kitchen&station=hot");
  await expect(page.getByTestId("ls-venue-canvas")).toBeVisible();
  await expect(page.getByTestId("ls-inspector")).toContainText("42/hr");
  await page.getByTestId("ls-insp-close").click();
  await expect(page.getByTestId("ls-inspector")).toContainText("Kitchen");
  await page.getByTestId("ls-preview-impact").click();
  await expect(page.getByText("SIMULATED").first()).toBeVisible();
  await page.goto("/app/live?stay=1");
  await expect(
    page.locator(".rp-operation-preview.is-live-plan"),
  ).toBeVisible();
  await expect(page.locator(".hw-root")).toBeVisible();
});
test("restaurant 3D camera remains interactive and the phone drawer fits", async ({
  page,
}) => {
  await seedRestaurant(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/live?stay=1&view=service");
  const world = page.locator(".hw-root");
  await world.scrollIntoViewIfNeeded();
  await expect(world).not.toHaveAttribute("data-camera", "", {
    timeout: 60000,
  });
  await world.scrollIntoViewIfNeeded();
  const old = await world.getAttribute("data-camera");
  const box = (await world.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.55);
  await page.mouse.wheel(0, -140);
  await expect.poll(() => world.getAttribute("data-camera")).not.toBe(old);
  await page.getByTestId("spatial-entity-t8").click();
  await expect(page.getByTestId("table-service-details")).toContainText(
    "Sesame allergy",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    (await page.locator(".simp-live-dialog").boundingBox())!.width,
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: test.info().outputPath("restaurant-phone-guest-context.png"),
  });
});
test("restaurant floor falls back gracefully when WebGL is unavailable", async ({
  page,
}) => {
  await seedRestaurant(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (
        this: HTMLCanvasElement,
        type: string,
        options?: unknown,
      ) {
        return type.includes("webgl")
          ? null
          : Reflect.apply(original, this, [type, options]);
      },
    });
  });
  await page.goto("/app/live?stay=1");
  await expect(page.locator(".hw-root")).toHaveAttribute(
    "data-renderer",
    "isometric",
  );
  await page.getByTestId("spatial-entity-t8").click();
  await expect(page.getByTestId("table-service-details")).toContainText(
    "20:15",
  );
});
