import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const width of [1512, 1920, 1024, 768, 390, 430]) {
  await page.setViewportSize({ width, height: 982 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  const section = page.locator(".dg-section");
  await section.scrollIntoViewIfNeeded();
  assert.equal(await section.getAttribute("data-motion"), "reduced");
  assert.equal(await section.locator(".dg-source").count(), 5);
  assert.equal(await section.locator(".dg-result").count(), 3);
  assert(await section.evaluate((el) => el.scrollWidth <= el.clientWidth));
  assert(
    await section
      .locator(".dg-outcome-values")
      .innerText()
      .then((s) => s.includes("Pending") && s.includes("$0")),
  );
  for (const el of await section
    .locator("h2,h3,h4,.dg-source,.dg-result")
    .all())
    assert(
      await el.evaluate((e) => e.scrollWidth <= e.clientWidth),
      `overflow at ${width}`,
    );
  const phase = await section.getAttribute("data-phase");
  await page.waitForTimeout(1700);
  assert.equal(await section.getAttribute("data-phase"), phase);
  if (width === 1512 || width === 390)
    await section.screenshot({
      path: `docs/visual-qa/decision-gap/${width === 390 ? "mobile" : "desktop"}.png`,
    });
  console.log(
    `${width}px: no overflow, all steps visible, reduced motion static`,
  );
}
await page.setViewportSize({ width: 1512, height: 982 });
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
const section = page.locator(".dg-section");
await section.scrollIntoViewIfNeeded();
await page.waitForFunction(
  () => document.querySelector(".dg-section")?.dataset.phase === "1",
  { timeout: 10000 },
);
await page.getByRole("button", { name: "Pause data flow animation" }).click();
const held = await section.getAttribute("data-phase");
await page.waitForTimeout(2200);
assert.equal(await section.getAttribute("data-phase"), held);
await page.getByRole("button", { name: "Replay data flow animation" }).click();
assert.equal(await section.getAttribute("data-phase"), "0");
await page.waitForFunction(
  () => document.querySelector(".dg-section")?.dataset.phase === "1",
  { timeout: 10000 },
);
assert.deepEqual(errors, []);
console.log(
  "Animation advances; pause holds; replay resets and resumes; no browser errors.",
);
await browser.close();
