import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

const surfaces = [
  "Control Center",
  "Live",
  "Decisions",
  "Operations",
  "Back of House",
  "Intelligence",
  "Value",
  "Memory",
  "Data Health",
  "Connections",
];
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

for (const width of [390, 820, 1512, 3840]) {
  test(`platform workspace at ${width}px has readable aligned controls and guest details`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 1100 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/en/product?surface=live#surfaces");
    const workspace = page.locator(".psw-workspace");
    await expect(page.locator(".ps-live-inspector")).toContainText(
      "Shellfish allergy",
    );
    await expect(page.locator(".ps-live-inspector")).toContainText(
      "Ready target 14:58",
    );
    await expect(page.locator(".ps-live-inspector")).toContainText("15:20");
    await expect(page.locator(".ps-live-inspector")).toContainText(
      "Birthday stay",
    );
    await expect(page.locator(".hw-root")).toHaveAttribute(
      "data-renderer",
      /webgl|isometric/,
    );
    await expect(page.locator(".ps-live-viewport")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await expect(page.locator(".hw-root")).not.toHaveAttribute(
      "data-camera",
      "",
    );
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const geometry = await workspace.evaluate((node) => {
      const head = node
        .querySelector(".psw-panel-head")!
        .getBoundingClientRect();
      const toolbar = node
        .querySelector(".ps-live-toolbar")!
        .getBoundingClientRect();
      const scene = node
        .querySelector(".ps-live-visual")!
        .getBoundingClientRect();
      const inspector = node
        .querySelector(".ps-live-inspector")!
        .getBoundingClientRect();
      const collide =
        scene.left < inspector.right &&
        scene.right > inspector.left &&
        scene.top < inspector.bottom &&
        scene.bottom > inspector.top;
      const clipped: string[] = [];
      for (const el of node.querySelectorAll<HTMLElement>(
        ".psw-panel-head > *, .ps-live-metrics > div, .ps-live-inspector > *, .ps-live-entities button",
      )) {
        if (el.scrollWidth > el.clientWidth + 2)
          clipped.push(el.textContent || el.tagName);
      }
      return { gap: toolbar.top - head.bottom, collide, clipped };
    });
    expect(geometry.gap).toBeGreaterThan(10);
    expect(geometry.collide).toBe(false);
    expect(geometry.clipped).toEqual([]);
    if (width <= 760) {
      await expect(page.getByLabel("Choose a product surface")).toBeVisible();
      await expect(page.locator(".psw-sidebar")).toBeHidden();
    } else
      await expect(page.locator('.psw-nav [aria-selected="true"]')).toHaveText(
        /Live/,
      );
    const top = await workspace.evaluate(
      (node) => node.getBoundingClientRect().top + scrollY - 105,
    );
    await page.evaluate((y) => scrollTo(0, y), top);
    await page.screenshot({
      path: test.info().outputPath(`workspace-${width}.png`),
    });
    expect(errors).toEqual([]);
  });
}

test("all ten views respond and keyboard navigation keeps focus and URL aligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en/product#surfaces");
  const tabs = page
    .getByRole("tablist", { name: "Explore the product surfaces" })
    .getByRole("tab");
  await expect(tabs).toHaveCount(10);
  for (const name of surfaces) {
    const tab = tabs.filter({ hasText: name });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#surface-preview")).toHaveAttribute(
      "aria-labelledby",
      (await tab.getAttribute("id"))!,
    );
    await expect(page.locator(".psw-panel-head > span")).toHaveText(name);
    if (name === "Control Center") {
      const size = await page.locator(".psw-screen").evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        stage: node.querySelector(".rsc-stage")!.getBoundingClientRect().width,
      }));
      expect(size.stage).toBeGreaterThan(size.width * 0.9);
      await expect(page.locator(".psw-screen .rsc-line")).toHaveCSS(
        "stroke-dashoffset",
        "0px",
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  await tabs.first().click();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: "Live", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/surface=live/);
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Connections", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await page.getByRole("tab", { name: "Data Health", exact: true }).click();
  await page.getByRole("button", { name: "Stale", exact: true }).click();
  await expect(page.locator(".rx30-health-readout")).toContainText("48%");
  await expect(page.locator(".rx30-health-readout")).toContainText(
    "High-risk action blocked",
  );
});

test("phone selection provides all ten surfaces without a crowded tab rail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/product#surfaces");
  const select = page.getByLabel("Choose a product surface");
  for (const name of surfaces) {
    await select.selectOption({ label: name });
    await expect(page.locator(".psw-panel-head > span")).toHaveText(name);
    await expect(page.locator("#surface-preview")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
});

test("hotel and restaurant selections keep current and incoming guest requirements separate", async ({
  page,
}) => {
  await page.goto("/en/product?surface=live#surfaces");
  const inspector = page.locator(".ps-live-inspector");
  await expect(inspector).toContainText("Shellfish allergy");
  await expect(inspector).toContainText("Incoming guest");
  await expect(page.locator(".ps-live-viewport")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.getByRole("button", { name: "Hotel", exact: true }).click();
  await expect(page.locator(".ps-live-viewport")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page
    .getByRole("group", { name: "Rooms in focus" })
    .getByRole("button", { name: "Room 308", exact: true })
    .click();
  await expect(inspector.locator("header > span")).toHaveText("Room 308");
  await expect(inspector).toContainText("15:35");
  await expect(inspector).not.toContainText("Shellfish allergy");
  await page.getByRole("button", { name: "Restaurant", exact: true }).click();
  await expect(inspector.locator("header > span")).toHaveText("Table 8");
  await expect(inspector.locator(".ps-live-safety")).toContainText(
    "Sesame allergy",
  );
  await expect(inspector.locator(".ps-live-safety")).toContainText(
    "Current party",
  );
  await expect(inspector.locator(".ps-live-next")).toContainText(
    "Peanuts allergy",
  );
  await expect(inspector.locator(".ps-live-next")).toContainText("20:15");
  await page
    .getByRole("group", { name: "Tables in focus" })
    .getByRole("button", { name: "Table 6", exact: true })
    .click();
  await expect(inspector.locator("header > span")).toHaveText("Table 6");
  await expect(inspector).toContainText("$262 paid");
  await expect(
    page.getByRole("button", { name: "Floor plan", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Operational grid", exact: true }),
  ).toHaveCount(0);
});

test("the spatial view preserves page scrolling until activated and releases it with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.goto("/en/product?surface=live#surfaces");
  const viewport = page.locator(".ps-live-viewport");
  await expect(page.locator(".hw-root")).toHaveAttribute(
    "data-renderer",
    /webgl|isometric/,
  );
  await expect(viewport).toHaveAttribute("data-ready", "true");
  await viewport.scrollIntoViewIfNeeded();
  const bounds = (await viewport.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.55,
  );
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 180);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 30);
  await viewport.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Explore the space", exact: false })
    .click();
  await expect(viewport).toHaveAttribute("data-exploring", "true");
  await expect(page.locator(".ps-live-world")).not.toHaveAttribute("inert");
  const camera = await page.locator(".hw-root").getAttribute("data-camera");
  const activeBounds = (await viewport.boundingBox())!;
  await page.mouse.move(
    activeBounds.x + activeBounds.width * 0.7,
    activeBounds.y + activeBounds.height * 0.55,
  );
  await page.mouse.wheel(0, -180);
  await expect
    .poll(() => page.locator(".hw-root").getAttribute("data-camera"))
    .not.toBe(camera);
  await page.keyboard.press("Escape");
  await expect(viewport).toHaveAttribute("data-exploring", "false");
  await expect(
    page.getByRole("button", { name: "Explore the space", exact: false }),
  ).toBeFocused();
});

test("the hotel remains usable without WebGL", async ({ page }) => {
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
  await page.goto("/en/product?surface=live#surfaces");
  await expect(page.locator(".hw-root")).toHaveAttribute(
    "data-renderer",
    "isometric",
  );
  await page
    .getByRole("group", { name: "Rooms in focus" })
    .getByRole("button", { name: "Room 312", exact: true })
    .click();
  await expect(page.locator(".ps-live-inspector header > span")).toHaveText(
    "Room 312",
  );
  await page.screenshot({
    path: test.info().outputPath("spatial-fallback.png"),
  });
});

test("reduced motion preserves the tour and its guest data", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/product?surface=live#surfaces");
  await expect(page.locator(".ps-live-inspector")).toContainText(
    "Shellfish allergy",
  );
  await page.getByRole("tab", { name: "Value", exact: true }).click();
  await expect(page.locator(".rx30-verify-rail")).toContainText("$273");
  await expect(
    page.getByRole("button", { name: /pause animation|play animation/i }),
  ).toHaveCount(0);
});

test("workspace controls and guest context pass accessibility checks on desktop and phone", async ({
  page,
}) => {
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/en/product?surface=live#surfaces");
    await expect(page.locator(".ps-live-viewport")).toHaveAttribute(
      "data-ready",
      "true",
    );
    const results = await new AxeBuilder({ page })
      .include("#surfaces")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((issue) => ({
        id: issue.id,
        help: issue.help,
        nodes: issue.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  }
});
