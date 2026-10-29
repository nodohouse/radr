import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const width of [1920, 1512, 1024]) {
  await page.setViewportSize({ width, height: 982 });
  for (const route of ["en", "solutions", "value-calculator"]) {
    await page.goto(`http://127.0.0.1:3000/${route}`, {
      waitUntil: "networkidle",
    });
    for (const name of ["Platform", "Solutions", "Company"]) {
      const trigger = page.getByRole("button", { name, exact: true });
      await trigger.click();
      assert.equal(await trigger.getAttribute("aria-expanded"), "true");
      const panel = page.locator("#rn-dropdown");
      await panel.waitFor({ state: "visible" });
      const b = await panel.boundingBox();
      assert(b.x >= 0 && b.x + b.width <= width);
      assert((await panel.getByRole("link").count()) >= 6);
      await page.keyboard.press("Escape");
      assert(await panel.isHidden());
      assert(await trigger.evaluate((e) => e === document.activeElement));
    }
    await page.getByRole("button", { name: "Platform", exact: true }).click();
    await page.getByRole("button", { name: "Solutions", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Platform", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await page.mouse.click(10, 500);
    assert(await page.locator("#rn-dropdown").isHidden());
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    console.log(width, route, "desktop dropdowns passed");
  }
}
for (const width of [900, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Menu", exact: false }).click();
  const panel = page.locator("#rn-dropdown");
  await panel.waitFor({ state: "visible" });
  await panel.locator("summary").filter({ hasText: "Solutions" }).click();
  const link = panel.getByRole("link", {
    name: "Procurement Put supplier costs in context",
  });
  await link.click();
  await page.waitForURL("**/solutions#procurement");
  assert(await panel.isHidden());
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  console.log(width, "mobile accordion and navigation passed");
}
await page.setViewportSize({ width: 1512, height: 982 });
await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
const trigger = page.getByRole("button", { name: "Platform", exact: true });
await trigger.focus();
await page.keyboard.press("Enter");
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
assert(await page.locator("#rn-dropdown").isVisible());
await page.locator("#rn-dropdown a").last().focus();
await page.keyboard.press("Tab");
assert(await page.locator("#rn-dropdown").isHidden());
assert.deepEqual(errors, []);
console.log("Keyboard, focus dismissal and browser errors passed");
await browser.close();
