/**
 * Export each /mockups/* composition as a native 3840×2160 PNG.
 *
 * Usage:
 *   1. npm run build && npm run start   (or next start on a free port)
 *   2. MOCKUP_BASE=http://127.0.0.1:3020 npm run mockups:export
 *
 * Or with an already-running server:
 *   MOCKUP_BASE=http://127.0.0.1:3056 npm run mockups:export
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const W = 3840;
const H = 2160;

const SLUGS = [
  "control-center",
  "intelligence",
  "action",
  "closed-loop",
  "integrations",
  "hospitality",
];

const BASE = process.env.MOCKUP_BASE?.replace(/\/$/, "") || "http://127.0.0.1:3020";
const OUT = path.join(process.cwd(), "public", "mockup-exports");

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });

  for (const slug of SLUGS) {
    const url = `${BASE}/mockups/${slug}`;
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForSelector(`[data-mockup="${slug}"]`, { timeout: 60_000 });

    // Force canvas to 1:1 for capture (no browser scale-down)
    await page.evaluate(
      ({ w, h, slug: s }) => {
        const canvas = document.querySelector(`[data-mockup="${s}"]`);
        const stage = document.querySelector(".mk-stage");
        if (stage instanceof HTMLElement) {
          stage.style.width = `${w}px`;
          stage.style.height = `${h}px`;
          stage.style.overflow = "hidden";
        }
        if (canvas instanceof HTMLElement) {
          canvas.style.transform = "scale(1)";
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }
        document.documentElement.style.width = `${w}px`;
        document.documentElement.style.height = `${h}px`;
        document.body.style.width = `${w}px`;
        document.body.style.height = `${h}px`;
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
      },
      { w: W, h: H, slug },
    );

    await page.setViewportSize({ width: W, height: H });
    await page.waitForTimeout(400);

    const el = page.locator(`[data-mockup="${slug}"]`);
    const buf = await el.screenshot({
      type: "png",
      omitBackground: false,
      animations: "disabled",
    });

    const file = path.join(OUT, `radr-${slug}-${W}x${H}.png`);
    await writeFile(file, buf);
    console.log(`  wrote ${file} (${buf.byteLength} bytes)`);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
