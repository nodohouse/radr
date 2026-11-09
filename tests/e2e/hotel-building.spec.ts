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
test("building generation validates counts, allocates rooms, and keeps guest records out of new rooms", async ({
  page,
}) => {
  await page.goto("/en/product?surface=live#surfaces");
  await page.getByRole("button", { name: "Generate your building" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Property name").fill("");
  await dialog
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  expect(
    await dialog
      .getByLabel("Property name")
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing),
  ).toBe(true);
  await dialog.getByLabel("Property name").fill("Sapphire House");
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
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".hb-head")).toContainText("Sapphire House");
  await expect(page.getByRole("button", { name: /^Enter floor/ })).toHaveCount(
    3,
  );
  await page
    .getByRole("button", { name: "Enter floor 1", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Rooms on selected floor" })
      .getByRole("button"),
  ).toHaveCount(4);
  await page
    .getByRole("group", { name: "Rooms on selected floor" })
    .getByRole("button")
    .first()
    .click();
  await expect(page.locator(".hb-room-details")).toContainText(
    "Awaiting operating data",
  );
  await expect(page.locator(".hb-room-details")).not.toContainText(
    /Michael Tan|Shellfish|Birthday|15:20/,
  );
  await page.getByLabel("Choose building floor").selectOption("3");
  await expect(
    page
      .getByRole("group", { name: "Rooms on selected floor" })
      .getByRole("button"),
  ).toHaveCount(3);
  await page
    .getByRole("button", { name: "Whole building", exact: true })
    .click();
  await expect(page.locator(".hb-root")).toHaveAttribute(
    "data-view",
    "exterior",
  );
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.locator(".hb-head")).toContainText("Mercer House");
});
test("3D exploration orbits and zooms only after activation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en/product?surface=live#surfaces");
  const scene = page.locator(".hb-scene");
  await expect(scene).toHaveAttribute("data-ready", "true");
  await expect(scene).toHaveAttribute("data-renderer", "webgl");
  await scene.scrollIntoViewIfNeeded();
  let bounds = (await scene.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.5,
  );
  const scroll = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 150);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(scroll + 30);
  await scene.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-active", "true");
  bounds = (await scene.boundingBox())!;
  const canvas = scene.locator("canvas");
  const before = await canvas.screenshot();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.55,
    bounds.y + bounds.height * 0.45,
    { steps: 12 },
  );
  await page.mouse.up();
  const after = await canvas.screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  const stableScroll = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -180);
  expect(await page.evaluate(() => scrollY)).toBe(stableScroll);
  await page.keyboard.press("Escape");
  await expect(scene).toHaveAttribute("data-active", "false");
  await expect(
    page.getByRole("button", { name: "Explore in 3D", exact: true }),
  ).toBeFocused();
});
test("floor room context and generator pass accessibility checks", async ({
  page,
}) => {
  await page.goto("/en/product?surface=live#surfaces");
  await page
    .getByRole("button", { name: "Enter floor 3", exact: true })
    .click();
  await expect(page.locator(".hb-room-details")).toContainText(
    "Shellfish allergy",
  );
  await expect(page.locator(".hw-root")).not.toHaveAttribute("data-camera", "");
  const floor = await new AxeBuilder({ page })
    .include(".hb-root")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    floor.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Generate your building" }).click();
  const form = await new AxeBuilder({ page })
    .include(".hb-dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    form.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
test("product property view drills into its operational floor and persists generated geometry locally", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "radr.demoOrg.v1",
      JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
    );
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        defaultLocationId: "loc_canal_house",
        roleView: "gm",
        timeFormat: "24h",
      }),
    );
  });
  await page.goto("/app/live?stay=1");
  await expect(page.locator(".hb-root")).toBeVisible({ timeout: 60000 });
  await page
    .getByRole("button", { name: "Enter floor 3", exact: true })
    .click();
  await expect(page.locator(".hl-map-head")).toContainText("FLOOR 3");
  await expect(page).toHaveURL(/floor=3/);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("view"))
    .toBe("floor");
  await page
    .getByLabel("Live modes")
    .getByRole("tab", { name: "Housekeeping", exact: true })
    .click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("mode"))
    .toBe("housekeeping");
  await expect(page.locator(".hl-map-head")).toContainText("Housekeeping load");
  await page
    .getByLabel("Live modes")
    .getByRole("tab", { name: "Rooms", exact: true })
    .click();

  await page
    .getByRole("button", { name: "Whole building", exact: false })
    .click();
  await page.getByRole("button", { name: "Generate your building" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Property name")
    .fill("Ocean Tower");
  await page.getByRole("dialog").getByLabel("Guest floors").fill("5");
  await page.getByRole("dialog").getByLabel("Total rooms").fill("70");
  await page
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  await expect(page.locator(".hb-saved")).toContainText("saved on this device");
  await expect(page.getByLabel("Live metrics")).toBeHidden();
  await page.reload();
  await expect(page.locator(".hb-head")).toContainText("Ocean Tower");
  await expect(page.getByRole("button", { name: /^Enter floor/ })).toHaveCount(
    5,
  );
  await page
    .getByRole("button", { name: "Enter floor 2", exact: true })
    .click();
  await expect(page.locator(".hb-root")).toHaveAttribute("data-view", "floor");
  await expect(
    page
      .getByRole("group", { name: "Rooms on selected floor" })
      .getByRole("button"),
  ).toHaveCount(14);
  await expect(page.locator(".hb-room-details")).not.toContainText("Shellfish");
});

test("clicking the exterior enters a floor without exposing every room at once", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en/product?surface=live#surfaces");
  await page
    .getByRole("button", { name: "Explore in 3D", exact: true })
    .click();
  const scene = page.locator(".hb-scene");
  const bounds = (await scene.boundingBox())!;
  await page.mouse.click(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.55,
  );
  await expect(page.locator(".hb-root")).toHaveAttribute("data-view", "floor");
  await expect(page.locator(".hb-floor-heading h4")).toContainText("Floor");
  await page
    .getByRole("button", { name: "Whole building", exact: true })
    .click();
  await expect(scene).toHaveAttribute("data-ready", "true");
});
test("a 24-floor property stays usable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/product?surface=live#surfaces");
  await page.getByRole("button", { name: "Generate your building" }).click();
  await page.getByLabel("Property name").fill("Ocean Heights");
  await page.getByLabel("Guest floors").fill("24");
  await page.getByLabel("Total rooms").fill("960");
  await page
    .getByRole("button", { name: "Generate building", exact: true })
    .click();
  await expect(page.locator(".hb-scene")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("button", { name: /^Enter floor/ })).toHaveCount(
    24,
  );
  await page
    .getByRole("button", { name: "Enter floor 24", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Rooms on selected floor" })
      .getByRole("button"),
  ).toHaveCount(40);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page
    .getByRole("group", { name: "Rooms on selected floor" })
    .getByRole("button")
    .last()
    .click();
  await expect(page.locator(".hb-room-details")).toContainText("ROOM 24-40");
  await page.screenshot({
    path: test.info().outputPath("tall-property-phone.png"),
  });
});
