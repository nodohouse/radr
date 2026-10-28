// Run from /workspace/radr with the development or production server on port 3000:
// NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/capture.mjs
// Optional RADR_REFERENCE=/absolute/path/to/reference.png creates a 50% overlay.
import { createRequire } from "node:module";
import fs from "node:fs";
import assert from "node:assert/strict";
const load = createRequire(import.meta.url);
const { chromium } = load("playwright");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const errors = [];
const failures = [];
const results = {
  viewports: [],
  interactions: [],
  overlay: "Not run: original reference file unavailable",
};
const page = await browser.newPage({
  viewport: { width: 1512, height: 982 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) failures.push({ url: r.url(), status: r.status() });
});
async function ready() {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "nextjs-portal {display:none!important}" });
  // Scroll through the full page to load deferred photography before capturing.
  for (const selector of [
    ".rh-hero",
    ".rs-connect",
    ".rs-gap",
    ".rs-work",
    ".rs-hospitality",
    ".rs-value",
    ".rs-final",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }
  await page
    .locator("img")
    .evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
  await page.evaluate(() => window.scrollTo(0, 0));
}
try {
  for (const route of ["/", "/en"]) {
    const response = await page.goto(`http://127.0.0.1:3000${route}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator(".reference-page>section").count(), 7);
  }
  await ready();
  await page.screenshot({ path: "docs/visual-qa/current-1512x982.png" });
  await page.screenshot({
    path: "docs/visual-qa/full-page-1512.png",
    fullPage: true,
  });
  for (const [selector, name] of [
    [".rs-connect", "02-systems"],
    [".rs-gap", "03-decision-gap"],
    [".rs-work", "04-decision-preview"],
    [".rs-hospitality", "05-hospitality"],
    [".rs-value", "06-value-map"],
    [".rs-final", "07-final"],
  ]) {
    await page
      .locator(selector)
      .screenshot({ path: `docs/visual-qa/${name}.png` });
  }
  const stages = [
    ["State", "One connected operating state"],
    ["Futures", "See what could happen next"],
    ["Recommendation", "A clear next step"],
    ["Action", "Act with control"],
    ["Verification", "Close the loop"],
    ["Evidence", "Overcharge detected"],
  ];
  for (const [name, title] of stages) {
    await page.getByRole("button", { name, exact: true }).click();
    assert.equal(
      await page.getByRole("heading", { name: title, exact: true }).isVisible(),
      true,
    );
  }
  await page.getByRole("button", { name: "Take action", exact: true }).click();
  assert.equal(
    await page.getByRole("heading", { name: "Act with control" }).isVisible(),
    true,
  );
  await page
    .getByRole("button", { name: "See verification", exact: true })
    .click();
  assert.equal(
    await page.getByRole("heading", { name: "Close the loop" }).isVisible(),
    true,
  );
  results.interactions.push(
    "All six decision stages, action, and verification",
  );
  const hotel = page.locator(".rs-operation-card").filter({ hasText: "Hotel" });
  await hotel.click();
  assert.equal(await hotel.getAttribute("aria-pressed"), "true");
  assert.equal(
    await page
      .locator(".rs-operation-card")
      .filter({ hasText: "Restaurant" })
      .getAttribute("aria-pressed"),
    "false",
  );
  results.interactions.push("Restaurant/Hotel selection");
  await page.getByRole("button", { name: "Build my Value Map" }).click();
  assert.equal(await page.locator("dialog").isVisible(), true);
  await page.getByLabel("Monthly revenue ($)", { exact: true }).fill("500000");
  assert.equal(
    await page.locator(".rs-calculator-result strong").innerText(),
    "$12,800",
  );
  await page.getByLabel("Monthly revenue ($)", { exact: true }).fill("-1000");
  assert.equal(
    await page.getByLabel("Monthly revenue ($)", { exact: true }).inputValue(),
    "0",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").isVisible(), false);
  assert.equal(
    await page
      .getByRole("button", { name: "Build my Value Map" })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  results.interactions.push(
    "Value calculator calculation, negative input clamp, Escape close, and focus restoration",
  );
  await page
    .locator(".rh-header")
    .getByRole("link", { name: "Value Calculator" })
    .click();
  await page.waitForURL("**/value-calculator");
  assert.equal(new URL(page.url()).pathname, "/value-calculator");
  assert.equal(await page.locator("#calculator").isVisible(), true);
  results.interactions.push(
    "Value Calculator navigation reaches the dedicated scenario calculator",
  );
  for (const [width, height] of [
    [1512, 982],
    [1920, 1080],
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [768, 1024],
    [430, 932],
    [390, 844],
    [3840, 2160],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
    await ready();
    if (width <= 900) {
      await page.locator(".rh-mobile-menu summary").click();
      assert.equal(
        await page
          .locator(".rh-mobile-links")
          .getByRole("link", { name: "Company", exact: true })
          .isVisible(),
        true,
      );
      await page.locator(".rh-mobile-menu summary").click();
    }
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      sections: [...document.querySelectorAll(".reference-page>section")].map(
        (el) => ({
          className: el.className,
          height: el.getBoundingClientRect().height,
        }),
      ),
      imageFailures: [...document.images]
        .filter((img) => !img.complete || !img.naturalWidth)
        .map((img) => img.src),
    }));
    assert.equal(layout.overflow, false, `Horizontal overflow at ${width}`);
    assert.deepEqual(layout.imageFailures, [], `Broken image at ${width}`);
    assert.ok(layout.sections.every((s) => s.height > 0));
    if (width <= 1024) {
      const heroBounds = await page.evaluate(() => {
        const copy = document.querySelector(".rh-copy").getBoundingClientRect();
        const device = document
          .querySelector(".rh-device")
          .getBoundingClientRect();
        const demo = document
          .querySelector(".rh-nav-demo")
          .getBoundingClientRect();
        return {
          copyBottom: copy.bottom,
          deviceTop: device.top,
          deviceLeft: device.left,
          deviceRight: device.right,
          demoRight: demo.right,
        };
      });
      assert.ok(
        heroBounds.copyBottom < heroBounds.deviceTop,
        `Hero product overlaps copy at ${width}`,
      );
      assert.ok(
        heroBounds.deviceLeft >= 0 && heroBounds.deviceRight <= width,
        `Hero product clipped at ${width}`,
      );
      assert.ok(
        heroBounds.demoRight <= width,
        `Header CTA clipped at ${width}`,
      );
    }
    results.viewports.push({ width, height, ...layout });
    if (width === 390) {
      await page.screenshot({ path: "docs/visual-qa/current-390x844.png" });
      await page.screenshot({
        path: "docs/visual-qa/full-page-390.png",
        fullPage: true,
      });
    }
    if (width === 768)
      await page.screenshot({
        path: "docs/visual-qa/full-page-768.png",
        fullPage: true,
      });
    if (width === 3840)
      await page.screenshot({ path: "docs/visual-qa/current-3840x2160.png" });
  }
  if (process.env.RADR_REFERENCE) {
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
    await ready();
    const reference = fs.readFileSync(process.env.RADR_REFERENCE);
    fs.copyFileSync(process.env.RADR_REFERENCE, "docs/visual-qa/reference.png");
    await page.evaluate(
      (data) => {
        const image = document.createElement("img");
        image.src = data;
        Object.assign(image.style, {
          position: "absolute",
          inset: "0",
          width: "1512px",
          height: "auto",
          opacity: ".5",
          zIndex: "99999",
          pointerEvents: "none",
        });
        document.body.append(image);
      },
      "data:image/png;base64," + reference.toString("base64"),
    );
    await page.screenshot({
      path: "docs/visual-qa/overlay-1512.png",
      fullPage: true,
    });
    results.overlay = "Captured";
  }
  assert.deepEqual(errors, [], "Browser errors");
  assert.deepEqual(failures, [], "Failed HTTP responses");
  results.status = "passed";
} catch (error) {
  results.status = "failed";
  results.failure = error.message;
  process.exitCode = 1;
} finally {
  results.errors = errors;
  results.httpFailures = failures;
  fs.writeFileSync(
    "docs/visual-qa/results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: results.status,
      failure: results.failure,
      viewports: results.viewports.length,
      interactions: results.interactions.length,
    }),
  );
  await browser.close();
}
