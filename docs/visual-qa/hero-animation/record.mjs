// From /workspace/radr, with the app on port 3000:
// PLAYWRIGHT_BROWSERS_PATH=/workspace/radr-visual-tools/browsers NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/hero-animation/record.mjs
// Approved visual reference is a repository path only; never embed it.
import { createRequire } from "node:module";
import fs from "node:fs";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const load = createRequire(import.meta.url);
const { chromium } = load("playwright");
const root = "docs/visual-qa/hero-animation";
const baseline = JSON.parse(
  fs.readFileSync(`${root}/geometry-before.json`, "utf8"),
);
const results = {
  referencePath: "docs/visual-qa/current-1512x982.png",
  recordings: [],
  checks: [],
  errors: [],
};
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
async function geometry(page) {
  return page.evaluate(
    (selectors) =>
      Object.fromEntries(
        selectors.map((selector) => {
          const el = document.querySelector(selector),
            r = el.getBoundingClientRect();
          return [
            selector,
            {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              transform: getComputedStyle(el).transform,
            },
          ];
        }),
      ),
    Object.keys(baseline[1512]),
  );
}
function compare(actual, expected) {
  for (const selector of Object.keys(expected)) {
    for (const key of ["x", "y", "width", "height"])
      assert.ok(
        Math.abs(actual[selector][key] - expected[selector][key]) < 0.02,
        `${selector} ${key}: ${actual[selector][key]} vs ${expected[selector][key]}`,
      );
    assert.equal(actual[selector].transform, expected[selector].transform);
  }
}
async function fit(page) {
  return page.locator(".ht-view").evaluateAll((views) =>
    views
      .filter((view) => getComputedStyle(view).opacity === "1")
      .map((view) => ({
        height: view.clientHeight,
        contentHeight: view.scrollHeight,
        phase: view.className,
      })),
  );
}
try {
  for (const [width, height] of [
    [1512, 982],
    [1920, 1080],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
      recordVideo: { dir: `${root}/raw`, size: { width, height } },
    });
    const videoStarted = Date.now();
    const page = await context.newPage();
    page.on("pageerror", (error) => results.errors.push(error.message));
    await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: "nextjs-portal{display:none!important}",
    });
    await page.locator(".rh-device[data-motion=reduced]").waitFor();
    const original = await geometry(page);
    compare(original, baseline[width]);
    await page.evaluate(() => {
      window.heroCapture = {
        start: performance.now(),
        phases: [{ phase: "control", time: 0 }],
        frames: [],
        boxes: [],
        fits: [],
      };
      const state = window.heroCapture;
      let previous = performance.now();
      new MutationObserver(() => {
        const phase = document.querySelector(".ht-stage").dataset.phase;
        if (state.phases.at(-1).phase !== phase)
          state.phases.push({ phase, time: performance.now() - state.start });
      }).observe(document.querySelector(".ht-stage"), {
        attributes: true,
        attributeFilter: ["data-phase"],
      });
      function frame(now) {
        if (!window.heroCapture) return;
        state.frames.push(now - previous);
        previous = now;
        const r = document.querySelector(".rh-device").getBoundingClientRect();
        state.boxes.push([r.x, r.y, r.width, r.height]);
        for (const view of document.querySelectorAll(".ht-view")) {
          if (getComputedStyle(view).opacity === "1")
            state.fits.push({
              phase: document.querySelector(".ht-stage").dataset.phase,
              height: view.clientHeight,
              contentHeight: view.scrollHeight,
            });
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    const offset = (Date.now() - videoStarted) / 1000;
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const phase of ["control", "decision", "action", "value"]) {
      if (phase !== "control")
        await page.waitForFunction(
          (phase) =>
            document.querySelector(".ht-stage").dataset.phase === phase,
          phase,
        );
      await page.waitForTimeout(phase === "control" ? 450 : 550);
      const actual = await geometry(page);
      compare(actual, original);
      const fits = await fit(page);
      for (const sample of fits)
        assert.ok(
          sample.contentHeight <= sample.height + 1,
          `${width} ${phase} clipped: ${JSON.stringify(sample)}`,
        );
      await page.screenshot({ path: `${root}/${width}-${phase}.png` });
    }
    await page.waitForFunction(
      () => performance.now() - window.heroCapture.start >= 12000,
    );
    const capture = await page.evaluate(() => {
      const result = window.heroCapture;
      window.heroCapture = null;
      return result;
    });
    const phases = capture.phases.map((entry) => entry.phase);
    assert.deepEqual(phases.slice(0, 5), [
      "control",
      "decision",
      "action",
      "value",
      "control",
    ]);
    const decision = capture.phases.find((p) => p.phase === "decision");
    const action = capture.phases.find((p) => p.phase === "action");
    const value = capture.phases.find((p) => p.phase === "value");
    assert.ok(decision.time >= 1200 && decision.time < 1900);
    assert.ok(action.time >= 3300 && action.time < 4000);
    assert.ok(value.time >= 4300 && value.time < 5000);
    for (const box of capture.boxes) {
      for (let i = 0; i < 4; i++)
        assert.ok(
          Math.abs(box[i] - capture.boxes[0][i]) < 0.02,
          "Physical tablet moved",
        );
    }
    for (const sample of capture.fits)
      assert.ok(
        sample.contentHeight <= sample.height + 1,
        `${width} ${sample.phase} content clipped`,
      );
    const frames = capture.frames
      .filter((x) => x > 0 && x < 1000)
      .sort((a, b) => a - b);
    const frameSummary = {
      samples: frames.length,
      medianMs: frames[Math.floor(frames.length * 0.5)],
      p95Ms: frames[Math.floor(frames.length * 0.95)],
      over33ms: frames.filter((x) => x > 33.4).length,
    };
    const raw = await page.video().path();
    await context.close();
    const target = `${root}/hero-${width}x${height}.mp4`;
    const encode = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        String(offset),
        "-i",
        raw,
        "-t",
        "12",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        target,
      ],
      { encoding: "utf8" },
    );
    assert.equal(encode.status, 0, encode.stderr);
    const probe = spawnSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        target,
      ],
      { encoding: "utf8" },
    );
    assert.equal(probe.status, 0, probe.stderr);
    const duration = Number(probe.stdout.trim());
    assert.ok(
      Math.abs(duration - 12) < 0.15,
      "Recording duration differs from twelve seconds",
    );
    results.recordings.push({
      width,
      height,
      path: target,
      duration,
      geometry: "unchanged within 0.02 CSS px",
      phases: capture.phases,
      frameSummary,
    });
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  compare(await geometry(page), baseline[390]);
  await page.waitForTimeout(2200);
  assert.equal(
    await page.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  await page.screenshot({
    path: `${root}/reduced-motion-mobile.png`,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    window.mobilePhases = ["control"];
    new MutationObserver(() =>
      window.mobilePhases.push(
        document.querySelector(".ht-stage").dataset.phase,
      ),
    ).observe(document.querySelector(".ht-stage"), {
      attributes: true,
      attributeFilter: ["data-phase"],
    });
  });
  await page.waitForTimeout(8000);
  const mobilePhases = await page.evaluate(() => window.mobilePhases);
  assert.ok(mobilePhases.includes("decision"));
  assert.ok(mobilePhases.every((p) => p === "control" || p === "decision"));
  compare(await geometry(page), baseline[390]);
  results.checks.push({
    name: "Mobile sequence",
    phases: mobilePhases,
    geometry: "unchanged",
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(200);
  assert.equal(
    await page.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  const reducedViews = await page.locator(".ht-view").allTextContents();
  assert.ok(reducedViews.join(" ").includes("Good morning, Alex."));
  await page.waitForTimeout(2200);
  assert.equal(
    await page.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  results.checks.push({
    name: "Reduced motion",
    result: "Static readable Control Center; preference changes respected",
  });
  assert.deepEqual(results.errors, []);
  results.status = "passed";
  await page.close();
} catch (error) {
  results.status = "failed";
  results.failure = error.message;
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    `${root}/results.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: results.status,
      failure: results.failure,
      recordings: results.recordings.length,
    }),
  );
  await browser.close();
}
