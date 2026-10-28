import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const result = { pages: [], loops: [], errors: [] };
page.on("pageerror", (e) => result.errors.push(e.message));
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
  "login",
  "signup",
  "forgot-password",
  "reset-password",
];
async function visit(route) {
  const r = await page.goto(`http://127.0.0.1:3000/${route}`, {
    waitUntil: "networkidle",
  });
  assert.equal(r.status(), 200);
}
async function moving(selector, packet, attribute) {
  const scene = page.locator(selector);
  await scene.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    ({ selector, attribute }) =>
      document.querySelector(selector)?.getAttribute(attribute) === "true",
    { selector, attribute },
  );
  await scene.hover();
  const offset = () =>
    scene
      .locator(packet)
      .first()
      .evaluate((e) => getComputedStyle(e).strokeDashoffset);
  const a = await offset();
  await page.waitForTimeout(450);
  assert.notEqual(await offset(), a);
  result.loops.push(`${selector}: visible movement continues while hovered`);
}
try {
  for (const width of [1512, 390]) {
    await page.setViewportSize({ width, height: 982 });
    for (const route of routes) {
      await visit(route);
      assert.equal(
        await page
          .getByRole("button", {
            name: /pause|replay|play .*animation|show .* demo/i,
          })
          .count(),
        0,
        `${route} playback control`,
      );
      assert.equal(
        await page
          .locator(
            ".sf-stages button,.ht-demo-controls button,.dg-controls button,.mx-motion-toggle",
          )
          .count(),
        0,
      );
      result.pages.push({ route, width, playbackControls: 0 });
    }
    console.log(
      `${width}px: all ${routes.length} public pages have no playback controls`,
    );
  }
  await page.setViewportSize({ width: 1512, height: 982 });
  await visit("en");
  await page.evaluate(() => {
    window.heroLoop = ["control"];
    new MutationObserver(() => {
      const phase = document.querySelector(".ht-stage").dataset.phase;
      if (window.heroLoop.at(-1) !== phase) window.heroLoop.push(phase);
    }).observe(document.querySelector(".ht-stage"), {
      attributes: true,
      attributeFilter: ["data-phase"],
    });
    scrollTo({ top: 100, behavior: "instant" });
  });
  await page.locator(".rh-device").hover();
  assert.equal(
    await page.locator(".rh-device").getAttribute("data-playing"),
    "true",
  );
  await page.waitForTimeout(12500);
  const phases = await page.evaluate(() => window.heroLoop);
  assert.deepEqual(phases.slice(0, 5), [
    "control",
    "decision",
    "action",
    "value",
    "control",
  ]);
  assert(phases.filter((x) => x === "decision").length >= 2);
  result.loops.push({ hero: phases, continuesWhileScrolledAndHovered: true });
  await moving(
    ".dg-section",
    ".dg-streams-desktop .dg-packet-in",
    "data-running",
  );
  for (const [route, selector, packet] of [
    ["how", ".mx-foundation-art", ".mx-data-packet"],
    ["solutions", ".mx-decision-flow", ".mx-data-packet"],
    ["company", ".mx-infinity", ".mx-infinity-packet"],
  ]) {
    await visit(route);
    await moving(selector, packet, "data-moving");
  }
  await visit("solutions");
  await page.evaluate(() => {
    window.solutionLoop = [
      Number(document.querySelector(".sf-hero").dataset.stage),
    ];
    new MutationObserver(() => {
      const stage = Number(document.querySelector(".sf-hero").dataset.stage);
      if (window.solutionLoop.at(-1) !== stage) window.solutionLoop.push(stage);
    }).observe(document.querySelector(".sf-hero"), {
      attributes: true,
      attributeFilter: ["data-stage"],
    });
  });
  await page.getByText("Compare", { exact: true }).first().click();
  assert.equal(
    await page.locator(".sf-hero").getAttribute("data-moving"),
    "true",
  );
  await page.waitForTimeout(11000);
  const stages = await page.evaluate(() => window.solutionLoop);
  assert.deepEqual(stages.slice(0, 6), [0, 1, 2, 3, 4, 0]);
  result.loops.push({ solutions: stages, stageLabelsDoNotStopAutoplay: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit("en");
  await page.waitForTimeout(1800);
  assert.equal(
    await page.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  await page.locator(".dg-section").scrollIntoViewIfNeeded();
  assert.equal(
    await page
      .locator(".dg-packet")
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    "none",
  );
  await visit("solutions");
  assert.equal(
    await page
      .locator(".sf-packet")
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    "none",
  );
  result.reducedMotion = "respected";
  assert.deepEqual(result.errors, []);
  result.status = "passed";
  console.log(
    "All autoplay loops, hover/scroll behavior and reduced motion checks passed",
  );
} catch (e) {
  result.status = "failed";
  result.failure = e.message;
  process.exitCode = 1;
  console.error(e.message);
} finally {
  fs.writeFileSync(
    "docs/visual-qa/continuous-motion/results.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
}
