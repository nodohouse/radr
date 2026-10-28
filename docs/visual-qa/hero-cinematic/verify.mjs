import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import fs from "node:fs";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const root = "docs/visual-qa/hero-cinematic";
const baseline = JSON.parse(
  fs.readFileSync("docs/visual-qa/hero-animation/geometry-before.json", "utf8"),
);
const selectors = [
  ".rh-hero",
  ".rh-device",
  ".rh-dashboard",
  ".rh-copy",
  ".rh-backdrop",
];
const result = {
  referencePath: "docs/visual-qa/current-1512x982.png",
  recordings: [],
  checks: [],
  errors: [],
};
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const geometry = (p) =>
  p.evaluate(
    (selectors) =>
      Object.fromEntries(
        selectors.map((s) => {
          const e = document.querySelector(s),
            r = e.getBoundingClientRect();
          return [
            s,
            {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              transform: getComputedStyle(e).transform,
            },
          ];
        }),
      ),
    selectors,
  );
// Subsequent user-approved compact hero composition; retain historical baselines.
function approvedGeometry(width) {
  const approved = structuredClone(baseline[width]);
  const lift = width > 1024 ? 175 : 95;
  approved[".rh-copy"].y -= width > 1024 ? 164 : 70;
  approved[".rh-device"].y -= lift;
  approved[".rh-dashboard"].y -= lift;
  approved[".rh-hero"].height -= lift;
  approved[".rh-backdrop"].height -= lift;
  return approved;
}
function same(a, b) {
  for (const s of selectors) {
    for (const k of ["x", "y", "width", "height"])
      assert(Math.abs(a[s][k] - b[s][k]) < 0.02, `${s} ${k} changed`);
    assert.equal(a[s].transform, b[s].transform);
  }
}
async function ready(p) {
  p.on("pageerror", (e) => result.errors.push(e.message));
  await p.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.evaluate(() => document.fonts.ready);
}
try {
  for (const [width, height] of [
    [1512, 982],
    [1920, 1080],
    [3840, 2160],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
      recordVideo: { dir: "/tmp/radr-cinematic", size: { width, height } },
    });
    const p = await ctx.newPage();
    const videoStart = Date.now();
    await ready(p);
    const original = await geometry(p);
    if (baseline[width]) {
      same(original, approvedGeometry(width));
    }
    assert.equal(
      await p.locator(".ht-stage").getAttribute("data-phase"),
      "control",
    );
    assert.equal(
      await p.getByText("ILLUSTRATIVE DEMO", { exact: true }).count(),
      1,
    );
    assert.equal(
      await p.locator(".rh-device video,.rh-device canvas").count(),
      0,
    );
    await p.evaluate(() => {
      window.capture = {
        start: performance.now(),
        phases: [{ phase: "control", ms: 0 }],
        beats: [],
        frames: [],
        fits: [],
        boxes: [],
      };
      let previous = performance.now();
      new MutationObserver(() => {
        const c = window.capture;
        if (!c) return;
        const s = document.querySelector(".ht-stage");
        if (c.phases.at(-1).phase !== s.dataset.phase)
          c.phases.push({
            phase: s.dataset.phase,
            ms: performance.now() - c.start,
          });
        c.beats.push({ beat: s.dataset.beat, ms: performance.now() - c.start });
      }).observe(document.querySelector(".ht-stage"), { attributes: true });
      function frame(now) {
        const c = window.capture;
        if (!c) return;
        c.frames.push(now - previous);
        previous = now;
        const d = document.querySelector(".rh-device").getBoundingClientRect();
        c.boxes.push([d.x, d.y, d.width, d.height]);
        for (const e of document.querySelectorAll(".ht-view"))
          if (Number(getComputedStyle(e).opacity) > 0.99)
            c.fits.push({
              phase: document.querySelector(".ht-stage").dataset.phase,
              height: e.clientHeight,
              scroll: e.scrollHeight,
            });
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    const offset = (Date.now() - videoStart) / 1000;
    await p.emulateMedia({ reducedMotion: "no-preference" });
    for (const phase of ["control", "decision", "action", "value"]) {
      if (phase !== "control")
        await p.waitForFunction(
          (phase) =>
            document.querySelector(".ht-stage").dataset.phase === phase,
          phase,
        );
      await p.waitForTimeout(
        phase === "decision" ? 1150 : phase === "control" ? 650 : 650,
      );
      same(await geometry(p), original);
      if (phase === "value") {
        assert.match(
          await p.locator(".ht-value-cards").innerText(),
          /Expected\s+\$2,430/,
        );
        assert.match(
          await p.locator(".ht-value-cards").innerText(),
          /Observed\s+Pending/,
        );
        assert.match(
          await p.locator(".ht-value-cards").innerText(),
          /Verified\s+\$0/,
        );
      }
    }
    await p.waitForFunction(
      () => performance.now() - window.capture.start >= 15000,
    );
    const c = await p.evaluate(() => {
      const c = window.capture;
      window.capture = null;
      return c;
    });
    assert.deepEqual(
      c.phases.slice(0, 5).map((x) => x.phase),
      ["control", "decision", "action", "value", "control"],
    );
    for (const [phase, expected] of [
      ["decision", 2700],
      ["action", 4500],
      ["value", 5600],
    ]) {
      const ms = c.phases.find((x) => x.phase === phase).ms;
      assert(Math.abs(ms - expected) < 400, `${phase} at ${ms}`);
    }
    const firstMotion = c.beats.find((x) => x.beat === "1");
    assert(firstMotion.ms >= 400 && firstMotion.ms < 900);
    for (const fit of c.fits)
      assert(
        fit.scroll <= fit.height + 1,
        `${width}: ${JSON.stringify(fit)} clipped`,
      );
    for (const box of c.boxes)
      box.forEach((x, i) =>
        assert(Math.abs(x - c.boxes[0][i]) < 0.02, "Physical device moved"),
      );
    const frames = c.frames
      .filter((x) => x > 0 && x < 1000)
      .sort((a, b) => a - b);
    const raw = await p.video().path();
    await ctx.close();
    const target = `${root}/hero-${width}x${height}.mp4`;
    const encoded = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-ss",
        String(offset),
        "-i",
        raw,
        "-t",
        "15",
        "-an",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "fast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        target,
      ],
      { encoding: "utf8" },
    );
    assert.equal(encoded.status, 0, encoded.stderr);
    fs.unlinkSync(raw);
    result.recordings.push({
      width,
      height,
      path: target,
      phases: c.phases,
      firstMotionMs: firstMotion.ms,
      geometry: "unchanged within .02 CSS px",
      clipping: false,
      frames: {
        samples: frames.length,
        medianMs: frames[Math.floor(frames.length * 0.5)],
        p95Ms: frames[Math.floor(frames.length * 0.95)],
      },
    });
    console.log(
      `${width}×${height}: timing, geometry and clipping passed; recorded 15 seconds`,
    );
  }
  const p = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  await ready(p);
  await p.getByRole("button", { name: "Show Value demo" }).click();
  await p.waitForTimeout(600);
  await p.getByRole("button", { name: "Pause product demo" }).click();
  await p.waitForTimeout(1800);
  assert.equal(
    await p.locator(".ht-stage").getAttribute("data-phase"),
    "value",
  );
  await p.getByRole("button", { name: "Play product demo" }).click();
  await p.waitForTimeout(200);
  await p.evaluate(() => scrollTo({ top: 250, behavior: "instant" }));
  await p.waitForTimeout(250);
  assert.equal(
    await p.locator(".rh-device").getAttribute("data-playing"),
    "false",
  );
  await p.waitForTimeout(1500);
  assert.equal(
    await p.locator(".ht-stage").getAttribute("data-phase"),
    "value",
  );
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.waitForTimeout(250);
  assert.equal(
    await p.locator(".ht-stage").getAttribute("data-phase"),
    "value",
  );
  assert.equal(
    await p.locator(".rh-device").getAttribute("data-playing"),
    "true",
  );
  result.checks.push(
    "Scene controls, pause/play, scroll suspension and re-entry preserve current state",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.waitForTimeout(200);
  assert.equal(
    await p.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  await p.waitForTimeout(1800);
  assert.equal(
    await p.locator(".ht-stage").getAttribute("data-phase"),
    "control",
  );
  result.checks.push(
    "Reduced motion always shows complete static Control Center",
  );
  await p.setViewportSize({ width: 390, height: 844 });
  same(await geometry(p), approvedGeometry(390));
  await p.emulateMedia({ reducedMotion: "no-preference" });
  await p.getByRole("button", { name: "Show Control Center demo" }).click();
  const mobilePhases = new Set();
  for (let i = 0; i < 17; i++) {
    mobilePhases.add(await p.locator(".ht-stage").getAttribute("data-phase"));
    await p.waitForTimeout(500);
  }
  assert.deepEqual([...mobilePhases].sort(), ["control", "decision"]);
  await p.locator(".rh-device").screenshot({ path: `${root}/mobile.png` });
  result.checks.push(
    "Mobile uses only Control Center and Decision, with unchanged device geometry",
  );
  const retina = await browser.newPage({
    viewport: { width: 1512, height: 982 },
    deviceScaleFactor: 2,
  });
  await ready(retina);
  await retina.getByRole("button", { name: "Show Decision demo" }).click();
  await retina.waitForTimeout(1200);
  await retina.getByRole("button", { name: "Pause product demo" }).click();
  await retina
    .locator(".rh-device")
    .screenshot({ path: `${root}/retina-2x.png` });
  result.checks.push(
    "Native HTML/SVG interface reviewed at 2× device pixel ratio",
  );
  assert.deepEqual(result.errors, []);
  result.status = "passed";
} catch (e) {
  result.status = "failed";
  result.failure = e.message;
  process.exitCode = 1;
  console.error(e.message);
} finally {
  fs.writeFileSync(`${root}/results.json`, JSON.stringify(result, null, 2));
  await browser.close();
}
