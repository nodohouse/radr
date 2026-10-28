import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = { layouts: [], motion: [], errors };
for (const width of [1512, 1920, 1024, 768, 550, 390, 430, 320]) {
  await page.setViewportSize({ width, height: 982 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  const section = page.locator(".dg-section");
  await section.scrollIntoViewIfNeeded();
  assert.equal(await section.getAttribute("data-motion"), "reduced");
  assert.equal(await section.locator(".dg-source").count(), 5);
  assert.equal(await section.locator(".dg-result").count(), 5);
  assert(await section.evaluate((el) => el.scrollWidth <= el.clientWidth));
  for (const el of await section.locator("h2,.dg-source,.dg-result").all())
    assert(
      await el.evaluate((e) => e.scrollWidth <= e.clientWidth),
      `overflow at ${width}`,
    );
  assert.equal(
    await section
      .locator(".dg-packet")
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    "none",
  );
  results.layouts.push({
    width,
    overflow: false,
    reducedMotion: "static",
    sources: 5,
    results: 5,
  });
  console.log(`${width}px: readable flow, no overflow, reduced motion static`);
}
await page.setViewportSize({ width: 1512, height: 982 });
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
const section = page.locator(".dg-section");
await section.scrollIntoViewIfNeeded();
await page.waitForFunction(
  () => document.querySelector(".dg-section")?.dataset.running === "true",
);
const offset = () =>
  section
    .locator(".dg-streams-desktop .dg-packet-in")
    .first()
    .evaluate((e) => getComputedStyle(e).strokeDashoffset);
const a = await offset();
await page.waitForTimeout(500);
const b = await offset();
assert.notEqual(a, b);
const outgoing = () =>
  section
    .locator(".dg-streams-desktop .dg-packet-out")
    .first()
    .evaluate((e) => getComputedStyle(e).strokeDashoffset);
const c = await outgoing();
await page.waitForTimeout(500);
assert.notEqual(c, await outgoing());
await page.getByRole("button", { name: "Pause data flow animation" }).click();
await page.waitForTimeout(100);
const held = await offset();
await page.waitForTimeout(700);
assert.equal(await offset(), held);
await page.getByRole("button", { name: "Replay data flow animation" }).click();
await page.waitForTimeout(100);
const reset = await offset();
await page.waitForTimeout(500);
assert.notEqual(reset, await offset());
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(250);
assert.equal(await section.getAttribute("data-running"), "false");
results.motion.push(
  "Incoming packets visibly move",
  "Outgoing packets visibly move",
  "Pause freezes actual SVG position",
  "Replay restarts travel",
  "Offscreen flow pauses",
);
assert.deepEqual(errors, []);
fs.writeFileSync(
  "docs/visual-qa/decision-gap/results.json",
  JSON.stringify(results, null, 2),
);
console.log(results.motion.join("; "));
await browser.close();
