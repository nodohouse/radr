import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const routes = [
  "en",
  "how",
  "solutions",
  "value-calculator",
  "pricing",
  "company",
  "contact",
  "imprint",
  "privacy",
  "terms",
  "security",
  "responsible-ai",
  "data-processing-agreement",
];
for (const route of routes) {
  await page.goto("http://127.0.0.1:3000/" + route, {
    waitUntil: "networkidle",
  });
  const platform = page.getByRole("button", { name: "Platform", exact: true });
  await platform.hover();
  await page.waitForTimeout(160);
  assert.equal(await platform.getAttribute("aria-expanded"), "true");
  const panel = page.locator("#rn-dropdown");
  assert(await panel.isVisible());
  await panel.locator(".rn-item").first().hover();
  await page.waitForTimeout(300);
  assert(await panel.isVisible());
  await page.getByRole("button", { name: "Solutions", exact: true }).hover();
  await page.waitForTimeout(160);
  assert.equal(await platform.getAttribute("aria-expanded"), "false");
  assert.equal(
    await page
      .getByRole("button", { name: "Solutions", exact: true })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Pricing", exact: true })
    .hover();
  assert(await panel.isHidden());
  await platform.hover();
  await page.waitForTimeout(160);
  await page.mouse.move(10, 700);
  await page.waitForTimeout(300);
  assert(await panel.isHidden());
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  console.log(
    route,
    "hover open, panel traversal, switching and dismissal passed",
  );
}
const touch = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mobile = await touch.newPage();
await mobile.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
await mobile.getByRole("button", { name: "Menu", exact: false }).tap();
assert(await mobile.locator("#rn-dropdown").isVisible());
await mobile.getByRole("button", { name: "Close", exact: false }).tap();
assert(await mobile.locator("#rn-dropdown").isHidden());
assert.deepEqual(errors, []);
await browser.close();
console.log("Touch interaction and zero browser errors passed");
