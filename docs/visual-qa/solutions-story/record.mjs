import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1512, height: 982 },
  reducedMotion: "reduce",
  recordVideo: {
    dir: "/tmp/radr-solutions-video",
    size: { width: 1512, height: 982 },
  },
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:3000/solutions", {
  waitUntil: "networkidle",
});
await page.evaluate(() => {
  window.solutionsStages = [{ stage: 0, ms: 0 }];
  const start = performance.now();
  new MutationObserver(() => {
    const stage = Number(document.querySelector(".sf-hero").dataset.stage);
    if (window.solutionsStages.at(-1).stage !== stage)
      window.solutionsStages.push({ stage, ms: performance.now() - start });
  }).observe(document.querySelector(".sf-hero"), {
    attributes: true,
    attributeFilter: ["data-stage"],
  });
});
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.waitForFunction(
  () => document.querySelector(".sf-hero")?.dataset.moving === "true",
);
await page.waitForTimeout(12500);
const stages = await page.evaluate(() => window.solutionsStages);
assert.deepEqual(
  stages.slice(0, 6).map((x) => x.stage),
  [0, 1, 2, 3, 4, 0],
);
fs.writeFileSync(
  "docs/visual-qa/solutions-story/timeline.json",
  JSON.stringify(stages, null, 2),
);
const video = page.video();
await context.close();
const path = await video.path();
const encoded = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-sseof",
    "-12",
    "-i",
    path,
    "-an",
    "-c:v",
    "libx264",
    "-threads",
    "2",
    "-preset",
    "fast",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "docs/visual-qa/solutions-story/solutions-1512.mp4",
  ],
  { encoding: "utf8" },
);
if (encoded.status !== 0) throw new Error(encoded.stderr);
fs.unlinkSync(path);
await browser.close();
console.log("Recorded 12-second Solutions demo.");
