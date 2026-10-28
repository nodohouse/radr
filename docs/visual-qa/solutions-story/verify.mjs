import { chromium } from "/workspace/radr-visual-tools/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ reducedMotion: "reduce" });
const result = { layouts: [], motion: [], errors: [] };
page.on("pageerror", (e) => result.errors.push(e.message));
try {
  for (const width of [
    1920, 1512, 1440, 1366, 1101, 1100, 1024, 850, 768, 550, 430, 390, 320,
  ]) {
    await page.setViewportSize({ width, height: 982 });
    await page.goto("http://127.0.0.1:3000/solutions", {
      waitUntil: "networkidle",
    });
    assert.equal(await page.locator("h1").count(), 1);
    assert.match(await page.locator("h1").innerText(), /See the operation/);
    assert.equal(await page.locator(".sf-source").count(), 6);
    assert.equal(await page.locator(".sf-future").count(), 2);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `page overflow ${width}`,
    );
    for (const e of await page
      .locator(".sf-source>span,.sf-future,.sf-decision,.sf-outcome")
      .all()) {
      const fit = await e.evaluate((e) => ({
        w: e.clientWidth,
        sw: e.scrollWidth,
        h: e.clientHeight,
        sh: e.scrollHeight,
        text: e.textContent.slice(0, 45),
      }));
      assert(fit.sw <= fit.w + 1, `${width} width ${JSON.stringify(fit)}`);
      assert(fit.sh <= fit.h + 1, `${width} height ${JSON.stringify(fit)}`);
    }
    assert.equal(
      await page
        .locator(".sf-packet")
        .first()
        .evaluate((e) => getComputedStyle(e).display),
      "none",
    );
    const stage = await page.locator(".sf-hero").getAttribute("data-stage");
    await page.waitForTimeout(1900);
    assert.equal(
      await page.locator(".sf-hero").getAttribute("data-stage"),
      stage,
    );
    if ([1920, 1512, 390].includes(width))
      await page.locator(".sf-hero").screenshot({
        path: `docs/visual-qa/solutions-story/${width === 1512 ? "desktop" : width === 390 ? "mobile" : "wide"}.png`,
      });
    result.layouts.push({
      width,
      overflow: false,
      cardClipping: false,
      reducedMotion: "static",
    });
    console.log(`${width}px: layout, card fit and reduced motion passed`);
  }
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:3000/solutions", {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(
    () => document.querySelector(".sf-hero")?.dataset.moving === "true",
  );
  const offset = () =>
    page
      .locator(".sf-streams .sf-in-packet")
      .first()
      .evaluate((e) => getComputedStyle(e).strokeDashoffset);
  const start = await offset();
  await page.waitForTimeout(450);
  assert.notEqual(await offset(), start);
  const out = () =>
    page
      .locator(".sf-streams .sf-out-packet")
      .first()
      .evaluate((e) => getComputedStyle(e).strokeDashoffset);
  const before = await out();
  await page.waitForTimeout(450);
  assert.notEqual(await out(), before);
  await page.getByRole("button", { name: "Pause solutions animation" }).click();
  await page.waitForTimeout(100);
  const held = await offset();
  await page.waitForTimeout(500);
  assert.equal(await offset(), held);
  await page
    .getByRole("button", { name: "Replay solutions animation" })
    .click();
  assert.equal(await page.locator(".sf-hero").getAttribute("data-stage"), "0");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    ),
    "Replay solutions animation",
  );
  await page.waitForFunction(
    () => document.querySelector(".sf-hero")?.dataset.stage === "1",
  );
  await page.getByRole("button", { name: "Compare Model outcomes" }).click();
  assert.equal(await page.locator(".sf-hero").getAttribute("data-stage"), "2");
  assert.equal(
    await page.locator(".sf-hero").getAttribute("data-moving"),
    "false",
  );
  assert.match(
    await page.locator(".sf-outcome").innerText(),
    /Expected\s+\+\$620/,
  );
  assert.match(
    await page.locator(".sf-outcome").innerText(),
    /Observed\s+Pending/,
  );
  assert.match(await page.locator(".sf-outcome").innerText(), /Verified\s+\$0/);
  await page
    .getByRole("button", { name: "Play solutions animation", exact: true })
    .click();
  await page.evaluate(() =>
    document.querySelector("#tailored").scrollIntoView({ behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  assert.equal(
    await page.locator(".sf-hero").getAttribute("data-moving"),
    "false",
  );
  result.motion.push(
    "Incoming and outgoing SVG packets visibly travel",
    "Pause freezes exact packet positions",
    "Replay resets and preserves keyboard focus",
    "Stage exploration works",
    "Offscreen animation pauses",
    "Expected/observed/verified remain distinct",
  );
  assert.deepEqual(result.errors, []);
  result.status = "passed";
} catch (error) {
  result.status = "failed";
  result.failure = error.message;
  process.exitCode = 1;
  console.error(error.message);
} finally {
  fs.writeFileSync(
    "docs/visual-qa/solutions-story/results.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
}
