import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const rows = [];
for (const width of [1512, 3840]) {
  const page = await browser.newPage({
    viewport: { width, height: width === 3840 ? 2160 : 982 },
  });
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  const measurement = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let previous = performance.now();
        const start = previous,
          frames = [];
        function tick(now) {
          frames.push(now - previous);
          previous = now;
          if (now - start < 10000) requestAnimationFrame(tick);
          else {
            frames.sort((a, b) => a - b);
            resolve({
              samples: frames.length,
              medianMs: frames[Math.floor(frames.length * 0.5)],
              p95Ms: frames[Math.floor(frames.length * 0.95)],
            });
          }
        }
        requestAnimationFrame(tick);
      }),
  );
  rows.push({ width, ...measurement });
  await page.close();
}
fs.writeFileSync(
  "docs/visual-qa/hero-cinematic/unrecorded-frame-check.json",
  JSON.stringify(rows, null, 2),
);
await browser.close();
