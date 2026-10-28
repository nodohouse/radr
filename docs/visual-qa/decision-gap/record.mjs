import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
for (const [width, height] of [
  [1512, 982],
  [1920, 1080],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: "/tmp/radr-flow-video", size: { width, height } },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.locator(".dg-section").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".dg-section")?.dataset.running === "true",
  );
  await page.waitForTimeout(12500);
  await page
    .locator(".dg-section")
    .screenshot({ path: `docs/visual-qa/decision-gap/flow-${width}.png` });
  const video = page.video();
  await context.close();
  const path = await video.path();
  const result = spawnSync(
    "/usr/bin/ffmpeg",
    [
      "-y",
      "-sseof",
      "-12",
      "-i",
      path,
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      `docs/visual-qa/decision-gap/flow-${width}.mp4`,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr);
  fs.unlinkSync(path);
  console.log(`Recorded 12s at ${width}×${height}`);
}
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page
  .locator(".dg-section")
  .screenshot({ path: "docs/visual-qa/decision-gap/mobile.png" });
await page.setViewportSize({ width: 1512, height: 982 });
await page
  .locator(".dg-section")
  .screenshot({ path: "docs/visual-qa/decision-gap/desktop.png" });
await browser.close();
