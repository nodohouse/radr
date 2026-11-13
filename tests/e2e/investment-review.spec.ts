import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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
for (const lens of ["buy", "labor", "sell", "recover"]) {
  test(`operator and investor can investigate the ${lens.toUpperCase()} lens`, async ({
    page,
  }) => {
    await page.goto(`/en/solutions/${lens}`);
    await expect(page.locator("main h1")).not.toContainText(
      "Every leak has a signal",
    );
    await expect(page.locator(".rx30-kicker").first()).toContainText(
      lens.toUpperCase(),
    );
    await expect(page.locator(".br-method-grid article")).toHaveCount(4);
    await expect(
      page.locator(".br-lens-grid a[aria-current=page]"),
    ).toHaveAttribute("href", `/en/solutions/${lens}`);
    await page
      .locator(".br-lens-hero")
      .getByRole("link", { name: "Explore the demo" })
      .click();
    await expect(page).toHaveURL(/\/en\/demo/);
    await expect(page.locator("main")).toContainText(/restaurant/i);
  });
}
test("a finance manager can check every problem class before opening a demo", async ({
  page,
}) => {
  await page.goto("/en/solutions#value-leaks");
  const notes = [];
  for (const tab of await page
    .getByRole("tablist", { name: "Explore economic problems" })
    .getByRole("tab")
    .all()) {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const copy = await page.locator(".br-field-notes dd").allTextContents();
    expect(copy).toHaveLength(3);
    notes.push(copy.join(" "));
  }
  expect(new Set(notes).size).toBe(5);
  await page.goto("/en/solutions#lenses");
  await expect(page.locator("#lenses")).toContainText(
    "Look across the operation",
  );
  await expect(page.locator('[id="lenses"]')).toHaveCount(1);
  const tab = page.getByRole("tablist").getByRole("tab").first();
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Reconciliation", exact: true }),
  ).toBeFocused();
});
test("a buyer matches location capacity without being quoted a price", async ({
  page,
}) => {
  await page.goto("/en/pricing");
  const input = page.getByLabel("Number of operating locations");
  for (const [count, copy] of [
    ["1", "Core fits 1 location"],
    ["5", "Expand fits 5 locations"],
    ["6", "Portfolio fits 6 locations"],
    ["20", "Portfolio fits 20 locations"],
    ["21", "above the standard packages"],
    ["0", "whole number"],
    ["1.5", "whole number"],
    ["abc", "whole number"],
  ]) {
    await input.fill(count);
    await expect(page.locator(".br-plan-fit-answer")).toContainText(copy);
  }
  await input.fill("3");
  await page.locator(".br-plan-fit-answer a").click();
  await expect(page).toHaveURL(/#plan-expand$/);
  const top = await page
    .locator("#plan-expand")
    .evaluate((el) => el.getBoundingClientRect().top);
  const bottom = await page
    .locator(".rx-nav")
    .evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(bottom);
  await expect(page.locator(".rm-plan-price strong")).toHaveText([
    "Pricing coming soon",
    "Pricing coming soon",
    "Pricing coming soon",
  ]);
});
test("a board reviewer can separate an expected result from completed-service proof", async ({
  page,
}) => {
  await page.goto("/en/product");
  await expect(page.locator(".br-platform-preview button")).toHaveCount(0);
  await expect(page.locator(".br-platform-preview a")).toHaveAttribute(
    "href",
    "/en/demo",
  );
  const previewContrast = await page
    .locator(".br-platform-preview")
    .evaluate((el) => {
      const luminance = (color: string) => {
        const rgb = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((v) => v / 255)
          .map((v) =>
            v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
          );
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      };
      const background = luminance(getComputedStyle(el).backgroundColor);
      return [...el.querySelectorAll("p,a")].map((node) => {
        const foreground = luminance(getComputedStyle(node).color);
        return (
          (Math.max(background, foreground) + 0.05) /
          (Math.min(background, foreground) + 0.05)
        );
      });
    });
  expect(previewContrast.every((ratio) => ratio >= 4.5)).toBe(true);
  await expect(page.locator(".br-checklist li")).toHaveCount(3);
  await page.locator(".rm-story-steps button").nth(3).click();
  await expect(page.locator(".rm-story-content")).toContainText("+$620");
  await expect(page.locator(".br-story-caption")).toContainText("Step 4 of 6");
  await page.locator(".rm-story-steps button").nth(5).click();
  await expect(page.locator(".rm-story-content")).toContainText(
    "separate completed-service",
  );
  await expect(page.locator(".rm-story-content")).toContainText("$590");
  await expect(
    page.locator("#surfaces button,#surfaces select,#surfaces canvas"),
  ).toHaveCount(0);
});
test("company provides a usable evaluation standard and keeps context separate from customers", async ({
  page,
}) => {
  await page.goto("/en/company");
  await expect(page.locator(".br-checklist li")).toHaveCount(4);
  await expect(page.locator("main")).not.toContainText("Founder, RADR");
  await expect(page.locator("main")).toContainText("Not customer footprint");
  await page.locator(".br-check-section a").click();
  await expect(page).toHaveURL(/\/value-calculator\/methodology/);
  await expect(page.locator("main")).toContainText("not a RADR price");
});
for (const width of [390, 1512]) {
  for (const lens of ["buy", "labor", "sell", "recover"]) {
    test(`${lens} guide remains accessible at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto(`/en/solutions/${lens}`);
      const scan = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
    });
  }
}

test("keyboard users can inspect and dismiss every desktop navigation panel", async ({
  page,
}) => {
  await page.goto("/en/product");
  await expect(page.locator(".rx-nav")).toHaveAttribute("data-ready", "true");
  for (const id of ["platform", "solutions", "company"]) {
    const trigger = page.locator(`#${id}-trigger`);
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const panel = page.locator(`#rx-nav-panel-${id}`);
    await expect(panel).toBeVisible();
    const geometry = await panel.evaluate((el) => {
      const b = el.getBoundingClientRect();
      const rects = [...el.querySelectorAll(".rx-np-item")].map((n) =>
        n.getBoundingClientRect(),
      );
      let overlap = false;
      for (let i = 0; i < rects.length; i++)
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i],
            c = rects[j];
          if (
            Math.min(a.right, c.right) - Math.max(a.left, c.left) > 3 &&
            Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 3
          )
            overlap = true;
        }
      return { left: b.left, right: b.right, width: innerWidth, overlap };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width);
    expect(geometry.overlap).toBe(false);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});
test("phone buyers can expand all navigation categories and reach the journal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/company");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const drawer = page.locator("#rx-drawer");
  await expect(drawer).toBeVisible();
  for (const name of ["Platform", "Solutions", "Company"]) {
    await drawer
      .getByRole("button", { name: `Expand ${name}`, exact: true })
      .click();
    await expect(
      drawer.getByRole("button", { name: `Collapse ${name}`, exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
  }
  await drawer.locator('a[href="/en/blog"]').click();
  await expect(page).toHaveURL(/\/en\/blog$/);
  await expect(page.locator("#rx-drawer")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
});
