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

test("hotel live supports wheel, pan, reset, keyboard, pinch and room selection", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/app/enter?vertical=hotel&go=1");
  await page.waitForURL("**/app?stay=1");
  await page.goto("/app/live?stay=1&level=property&floor=3&room=310");
  const plan = page.locator(".hl-plan");
  const stage = page.locator(".hl-plan-stage");
  await expect(stage).toBeVisible();
  await plan.scrollIntoViewIfNeeded();
  const box = await plan.boundingBox();
  if (!box) throw new Error("Hotel plan is missing");
  const transform = () =>
    stage.evaluate((el) => getComputedStyle(el).transform);
  const original = await transform();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
  await page.mouse.wheel(0, -150);
  await expect.poll(transform).not.toBe(original);
  await plan.focus();
  await plan.press("Home");
  await expect.poll(transform).toBe(original);
  await page.mouse.move(box.x + 18, box.y + 18);
  await page.mouse.down();
  await page.mouse.move(box.x + 90, box.y + 60, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(() => plan.evaluate((el) => el.style.getPropertyValue("--hl-pan-x")))
    .not.toBe("0px");
  await plan.focus();
  await plan.press("Home");
  await expect.poll(transform).toBe(original);
  await plan.press("ArrowRight");
  await expect
    .poll(() => plan.evaluate((el) => el.style.getPropertyValue("--hl-pan-x")))
    .toBe("-40px");
  await plan.press("Home");
  const client = await context.newCDPSession(page);
  const cx = box.x + box.width * 0.5,
    cy = box.y + box.height * 0.5;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: cx - 35, y: cy },
      { x: cx + 35, y: cy },
    ],
  });
  for (let i = 1; i <= 8; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: cx - 35 - i * 5, y: cy },
        { x: cx + 35 + i * 5, y: cy },
      ],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(transform).not.toBe(original);
  await plan.focus();
  await plan.press("Home");
  await expect.poll(transform).toBe(original);
  await page.waitForTimeout(350); // Drag click suppression expires before deliberate selection.
  await page
    .getByRole("button", { name: /Room 311/ })
    .first()
    .click();
  await expect(
    page.getByRole("complementary", { name: "Room 311", exact: true }),
  ).toBeVisible();
});

test("restaurant live supports scroll zoom, pan and guest context", async ({
  page,
}) => {
  await page.goto("/app/enter?vertical=restaurant&go=1");
  await page.waitForURL("**/app?stay=1");
  await page.goto("/app/live?stay=1");
  const plan = page.getByTestId("floor-plan");
  await expect(plan).toBeVisible();
  await plan.scrollIntoViewIfNeeded();
  const original = await plan.getAttribute("viewBox");
  const box = await plan.boundingBox();
  if (!box) throw new Error("Restaurant floor is missing");
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4);
  await page.mouse.wheel(0, -140);
  await expect(plan).not.toHaveAttribute("viewBox", original!);
  const zoomed = await plan.getAttribute("viewBox");
  await page.mouse.move(box.x + 12, box.y + 12);
  await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 45, { steps: 10 });
  await page.mouse.up();
  await expect(plan).not.toHaveAttribute("viewBox", zoomed!);
  await page
    .locator(".rp-live-gesture-stage")
    .dblclick({ position: { x: 15, y: 15 } });
  await expect(plan).toHaveAttribute("viewBox", original!);
  await page.waitForTimeout(350);
  await page.locator('[data-layout-item="t8"]').click();
  const alerts = page.locator(".simp-critical-needs");
  await expect(alerts).toContainText("Sesame");
  await expect(alerts).toContainText("Peanuts");
  const remarks = alerts.locator("small");
  for (let i = 0; i < (await remarks.count()); i++) {
    await expect(remarks.nth(i)).toHaveCSS("display", "block");
  }
});
