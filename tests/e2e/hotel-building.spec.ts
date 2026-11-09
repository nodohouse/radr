import { test, expect } from "playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: "loc_canal_house",
        roleView: "hotel_gm",
        timeFormat: "24h",
      }),
    );
  });
});
test("landscaped product building still supports orbit, floor entry and guest context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/app/live?stay=1&view=building");
  const scene = page.locator(".hb-scene");
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-renderer", "webgl");
  await scene.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("landscaped-hotel.png"),
  });
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  const before = await scene.locator("canvas").screenshot();
  const box = (await scene.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.45, {
    steps: 10,
  });
  await page.mouse.up();
  expect(
    Buffer.compare(before, await scene.locator("canvas").screenshot()),
  ).not.toBe(0);
  await page.keyboard.press("Escape");
  await expect(scene).toHaveAttribute("data-active", "false");
  await page
    .getByRole("button", { name: "Enter floor 3", exact: true })
    .click();
  await expect(page.locator(".hl-map-head")).toContainText("FLOOR 3");
  await expect(
    page.getByRole("heading", { name: "Room 310", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("tablist", { name: "Room details" })
    .getByRole("tab", { name: "Guests", exact: true })
    .click();
  await expect(page.getByTestId("room-guest-brief")).toContainText(
    "Shellfish allergy",
  );
});
test("product generator validates inputs and persists geometry without inheriting guests", async ({
  page,
}) => {
  await page.goto("/app/live?stay=1&view=building");
  await page.getByRole("button", { name: "Generate your building" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Property name").fill("");
  await dialog
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Property name").fill("Ocean House");
  await dialog.getByLabel("Guest floors").fill("3");
  await dialog.getByLabel("Total rooms").fill("2");
  await dialog
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  expect(
    await dialog
      .getByLabel("Total rooms")
      .evaluate((el: HTMLInputElement) => el.validity.customError),
  ).toBe(true);
  await dialog.getByLabel("Total rooms").fill("10");
  await dialog
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  await expect(page.getByLabel("Live metrics")).toBeHidden();
  await page.reload();
  await expect(page.locator(".hb-head")).toContainText("Ocean House");
  await page
    .getByRole("button", { name: "Enter floor 1", exact: true })
    .click();
  const rooms = page.getByRole("group", { name: "Rooms on selected floor" });
  await expect(rooms.getByRole("button")).toHaveCount(4);
  await rooms.getByRole("button").first().click();
  await expect(page.locator(".hb-room-details")).toContainText(
    "Awaiting operating data",
  );
  await expect(page.locator(".hb-room-details")).not.toContainText(
    /Michael Tan|Shellfish|Birthday/,
  );
});
test("hotel elevation fallback includes scenery and keeps floors accessible", async ({
  page,
}) => {
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
  await page.goto("/app/live?stay=1&view=building");
  await expect(page.locator(".hb-scene")).toHaveAttribute(
    "data-renderer",
    "elevation",
  );
  await expect(page.locator(".hb-elevation ellipse")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Enter floor 3", exact: true })
    .click();
  await expect(page.locator(".hw-root")).toHaveAttribute(
    "data-renderer",
    "isometric",
  );
});
