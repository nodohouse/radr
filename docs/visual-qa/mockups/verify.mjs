// Run with the local app on port 3000 and external Playwright in NODE_PATH.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
const load = createRequire(import.meta.url);
const { chromium } = load("playwright");
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
const failedResponses = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400)
    failedResponses.push({ url: r.url(), status: r.status() });
});
const results = { layouts: [], interactions: [], errors, failedResponses };
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
async function ready() {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((img) => img.decode());
  }
  await page.evaluate(() => scrollTo(0, 0));
}
try {
  for (const route of routes) {
    for (const [width, height] of [
      [1512, 982],
      [390, 844],
      [768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      const r = await page.goto(`http://127.0.0.1:3000/${route}`, {
        waitUntil: "networkidle",
      });
      assert.equal(r.status(), 200, route);
      await ready();
      assert.equal(await page.locator("h1").count(), 1, route);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: [...document.images]
          .filter((i) => !i.naturalWidth)
          .map((i) => i.src),
        headerRight: document
          .querySelector(".rh-nav-demo")
          .getBoundingClientRect().right,
      }));
      assert.equal(layout.overflow, false, `${route} overflow at ${width}`);
      assert.deepEqual(layout.broken, []);
      assert.ok(layout.headerRight <= width, `${route} header clipped`);
      const footer = await page.locator(".mx-footer").innerText();
      assert.ok(footer.includes("Legal entity details to be confirmed."));
      assert.ok(footer.includes("Registered office"));
      assert.ok(footer.includes("To be added"));
      assert.ok(
        !/San Francisco|Delaware|Amsterdam|Netherlands|548 Market|RADR Inc|hello@radr|415 555|8383921|EIN\s*:/i.test(
          footer,
        ),
      );
      if (
        [
          "en",
          "how",
          "solutions",
          "value-calculator",
          "pricing",
          "company",
          "imprint",
        ].includes(route) &&
        width !== 768
      )
        await page.screenshot({
          path: `docs/visual-qa/mockups/${route}-${width === 1512 ? "desktop" : "mobile"}.png`,
          fullPage: true,
        });
      results.layouts.push({ route, width, ...layout });
      console.log(`${route} ${width}px: layout and legal checks passed`);
    }
  }
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto("http://127.0.0.1:3000/value-calculator", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", { name: /Hotel Group Multi-property/ })
    .click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByLabel("Number of locations", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByLabel("Annual revenue per location ($)", { exact: true })
    .fill("4000000");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByLabel("Annual labor costs per location ($)", { exact: true })
    .fill("1000000");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByLabel("Annual procurement spend per location ($)", { exact: true })
    .fill("800000");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByLabel("Delivery / other (%)", { exact: true }).fill("30");
  assert.equal(
    await page
      .getByRole("button", { name: "See my Value Map", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByLabel("Direct / on-site (%)", { exact: true }).fill("60");
  await page
    .getByRole("button", { name: "See my Value Map", exact: true })
    .click();
  assert.equal(
    await page.locator(".mx-result-center strong").innerText(),
    "$792K – $1.26M",
  );
  assert.match(
    await page.locator(".mx-model-badge").innerText(),
    /Based on your inputs/,
  );
  await page.locator(".mx-assumptions summary").click();
  assert.match(
    await page.locator(".mx-assumptions").innerText(),
    /not independently validated industry benchmarks/,
  );
  results.interactions.push(
    "Six-step calculator: operation, locations, annual inputs, channel mix validation, formula result, disclosure",
  );
  await page.goto("http://127.0.0.1:3000/solutions", {
    waitUntil: "networkidle",
  });
  await page
    .locator(".mx-operation-strip")
    .getByRole("button", { name: /Hotels Full-service/ })
    .click();
  assert.match(
    await page.locator(".mx-operation-detail").innerText(),
    /A clearer picture of every stay/,
  );
  await page
    .locator("#tailored")
    .getByRole("button", { name: "Restaurants", exact: true })
    .click();
  assert.match(
    await page.locator(".mx-operation-detail").innerText(),
    /From daily shifts/,
  );
  results.interactions.push(
    "Shared operation selector: strip and tailored panel stay in sync",
  );
  await page.goto("http://127.0.0.1:3000/how", { waitUntil: "networkidle" });
  await page.getByLabel("Filter operating locations").selectOption("Watch");
  assert.equal(await page.locator(".mx-operating-table tbody tr").count(), 2);
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  assert.match(
    await page.locator(".mx-insight-card").innerText(),
    /Prepare a focused menu review/,
  );
  results.interactions.push(
    "Operating table filter and native insight workflow",
  );
  await page.goto("http://127.0.0.1:3000/pricing", {
    waitUntil: "networkidle",
  });
  assert.match(await page.locator(".mx-pricing-cards").innerText(), /\$1,500/);
  assert.match(await page.locator(".mx-pricing-cards").innerText(), /\$3,500/);
  assert.ok(
    !/€199|Start free|RADR Free/.test(await page.locator("main").innerText()),
  );
  await page
    .locator("summary")
    .filter({ hasText: "Is there a minimum contract length?" })
    .click();
  assert.match(
    await page.locator("details[open]").innerText(),
    /billed annually/,
  );
  results.interactions.push("Confirmed pricing and working native FAQs");
  for (const route of ["en"]) {
    await page.goto(`http://127.0.0.1:3000/${route}`, {
      waitUntil: "networkidle",
    });
    const links = await page
      .locator('.mx-footer a[href*="#"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const href of new Set(links)) {
      const [path, hash] = href.split("#");
      await page.goto(`http://127.0.0.1:3000${path}`, {
        waitUntil: "networkidle",
      });
      assert.equal(await page.locator(`[id="${hash}"]`).count(), 1, href);
    }
  }
  results.interactions.push(
    "Expanded footer section links resolve to real anchors",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(failedResponses, []);
  results.status = "passed";
} catch (error) {
  results.status = "failed";
  results.failure = error.message;
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    "docs/visual-qa/mockups/results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: results.status,
      layouts: results.layouts.length,
      interactions: results.interactions.length,
      failure: results.failure,
    }),
  );
  await browser.close();
}
