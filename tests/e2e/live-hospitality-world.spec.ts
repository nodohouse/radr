import { test, expect } from "playwright/test";
for (const kind of ["restaurant", "hotel"] as const)
  for (const width of [390, 820, 1512, 3840]) {
    test(`${kind} 3D Live at ${width}px: camera, guest context and layout`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width,
        height: width === 3840 ? 2160 : 1100,
      });
      await page.addInitScript((kind) => {
        sessionStorage.setItem(
          "radr.demoOrg.v1",
          JSON.stringify({ vertical: kind }),
        );
        localStorage.setItem(
          "radr.cookie-preferences.v1",
          JSON.stringify({
            version: 1,
            necessary: true,
            analytics: false,
            marketing: false,
            savedAt: new Date().toISOString(),
          }),
        );
      }, kind);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/app/live?stay=1", { waitUntil: "domcontentloaded" });
      const world = page.locator(".hw-root");
      await expect(world).toHaveAttribute("data-renderer", "webgl", {
        timeout: 90000,
      });
      await expect(world).not.toHaveAttribute("data-camera", "", {
        timeout: 90000,
      });
      await expect(world.locator("canvas")).toBeVisible();
      await world.scrollIntoViewIfNeeded();
      const first = await world.getAttribute("data-camera");
      const box = await world.boundingBox();
      if (!box) throw Error("3D world not visible");
      await page.mouse.move(
        box.x + box.width * 0.48,
        box.y + box.height * 0.47,
      );
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width * 0.48 + 70,
        box.y + box.height * 0.47 + 30,
        { steps: 10 },
      );
      await page.mouse.up();
      await expect(world).not.toHaveAttribute("data-camera", first!);
      const rotated = await world.getAttribute("data-camera");
      await page.mouse.wheel(0, -140);
      await expect(world).not.toHaveAttribute("data-camera", rotated!);
      await world
        .getByRole("button", { name: "Reset spatial view", exact: true })
        .click();
      await expect(world).toHaveAttribute("data-camera", first!);
      await world
        .getByRole("button", { name: "View from above", exact: true })
        .click();
      await expect(world).not.toHaveAttribute("data-camera", first!);
      await world
        .getByRole("button", { name: "Reset spatial view", exact: true })
        .click();
      await expect
        .poll(() => world.locator(".hw-marker").count())
        .toBeGreaterThan(0);
      const primaryMarker = world.getByTestId(
        `spatial-entity-${kind === "hotel" ? "room_310" : "t8"}`,
      );
      for (const signal of ["allergy", "occasion", "remark"]) {
        await expect(
          primaryMarker.locator(`[data-guest-signal="${signal}"]`),
        ).toBeVisible();
      }
      await expect(world.locator(".hw-context")).toContainText("Birthday");
      const collisions = await world
        .locator(".hw-marker")
        .evaluateAll((items) => {
          const result: string[] = [];
          for (let i = 0; i < items.length; i++)
            for (let j = i + 1; j < items.length; j++) {
              const a = items[i].getBoundingClientRect(),
                b = items[j].getBoundingClientRect();
              if (
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
              )
                result.push(`${items[i].textContent}/${items[j].textContent}`);
            }
          return result;
        });
      expect(collisions).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (kind === "hotel") {
        const overlap = await page.evaluate(() => {
          const a = document
              .querySelector(".hl-map-card")!
              .getBoundingClientRect(),
            b = document.querySelector(".hl-wave")!.getBoundingClientRect();
          return a.bottom > b.top + 1;
        });
        expect(overlap).toBe(false);
      }
      await world.screenshot({
        path: test.info().outputPath(`${kind}-${width}.png`),
        timeout: 30000,
      });
      await world.locator(".hw-access-list summary").click();
      await world
        .locator(".hw-access-list")
        .getByRole("button", {
          name: kind === "hotel" ? /Room 310/ : /Table 8/,
        })
        .click();
      if (kind === "restaurant") {
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.locator(".simp-critical-needs")).toContainText(
          "Sesame",
        );
        await expect(page.locator(".simp-critical-needs")).toContainText(
          "Peanuts",
        );
        await page.getByRole("tab", { name: "Timeline", exact: true }).click();
        await expect(page.locator("#table-timeline")).toContainText("20:15");
        await page
          .getByRole("button", { name: "Close table details", exact: true })
          .click();
      } else {
        const inspector = page.getByRole("complementary", {
          name: "Room 310",
          exact: true,
        });
        await expect(inspector.getByTestId("room-guest-brief")).toContainText(
          "Shellfish",
        );
        await inspector
          .getByRole("tab", { name: "Guests", exact: true })
          .click();
      }
      expect(errors).toEqual([]);
    });
  }

test("Live retains an interactive isometric scene without WebGL", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2") return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  const page = await context.newPage();
  await page.goto("/app/live?stay=1");
  const world = page.locator(".hw-root");
  await expect(world).toHaveAttribute("data-renderer", "isometric");
  await expect(world.getByTestId("spatial-fallback")).toBeVisible();
  await world.getByTestId("spatial-entity-t8").click();
  await expect(page.locator(".simp-critical-needs")).toContainText("Sesame");
  await context.close();
});

for (const kind of ["restaurant", "hotel"] as const) {
  test(`${kind}: two-finger zoom and keyboard panning`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 1100 },
      hasTouch: true,
      isMobile: true,
    });
    await context.addInitScript(
      (kind) =>
        sessionStorage.setItem(
          "radr.demoOrg.v1",
          JSON.stringify({ vertical: kind }),
        ),
      kind,
    );
    const page = await context.newPage();
    await page.goto("/app/live?stay=1");
    const world = page.locator(".hw-root");
    await expect(world).not.toHaveAttribute("data-camera", "", {
      timeout: 90000,
    });
    await expect(world.locator("canvas")).toBeVisible();
    await world.scrollIntoViewIfNeeded();
    const initial = await world.getAttribute("data-camera");
    const box = await world.boundingBox();
    if (!box) throw Error("World missing");
    const cx = box.x + box.width * 0.5,
      cy = box.y + box.height * 0.48;
    const client = await context.newCDPSession(page);
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
          { x: cx - 35 - i * 6, y: cy },
          { x: cx + 35 + i * 6, y: cy },
        ],
      });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(world).not.toHaveAttribute("data-camera", initial!);
    await world
      .getByRole("button", { name: "Reset spatial view", exact: true })
      .click();
    await expect(world).toHaveAttribute("data-camera", initial!);
    const stage = world.getByRole("region");
    await stage.focus();
    await stage.press("ArrowRight");
    await expect(world).not.toHaveAttribute("data-camera", initial!);
    await stage.press("Home");
    await expect(world).toHaveAttribute("data-camera", initial!);
    await page.keyboard.down("Shift");
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 55, cy + 20, { steps: 8 });
    await page.mouse.up();
    await page.keyboard.up("Shift");
    await expect(world).not.toHaveAttribute("data-camera", initial!);
    await world
      .getByRole("button", { name: "Reset spatial view", exact: true })
      .click();
    await expect(world).toHaveAttribute("data-camera", initial!);
    await context.close();
  });
}
