import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 1512, height: 982 } });
for (const [route, selector, packet] of [
  ["how", ".mx-foundation-art", ".mx-data-packet"],
  ["solutions", ".mx-decision-flow", ".mx-data-packet"],
  ["company", ".mx-infinity", ".mx-infinity-packet"],
]) {
  await p.goto(`http://127.0.0.1:3000/${route}`, { waitUntil: "networkidle" });
  const scene = p.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await p.waitForFunction(
    (s) => document.querySelector(s)?.dataset.moving === "true",
    selector,
  );
  const offset = () =>
    scene
      .locator(packet)
      .first()
      .evaluate((e) => getComputedStyle(e).strokeDashoffset);
  const start = await offset();
  await p.waitForTimeout(450);
  assert.notEqual(await offset(), start);
  await scene.getByRole("button", { name: /Pause/ }).click();
  await p.waitForTimeout(100);
  const held = await offset();
  await p.waitForTimeout(450);
  assert.equal(await offset(), held);
  console.log(`${route}: visible SVG travel and pause verified`);
}
await b.close();
