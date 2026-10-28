// Run with NODE_PATH pointing to the external Playwright installation.
import { createRequire } from "node:module";
import fs from "node:fs";
import assert from "node:assert/strict";
const load = createRequire(import.meta.url);
const { chromium } = load("playwright");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
const errors = [];
const responses = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) responses.push({ url: r.url(), status: r.status() });
});
const results = { pages: [], interactions: [], errors, responses };
const routes = [
  "how",
  "solutions",
  "value-calculator",
  "pricing",
  "company",
  "contact",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "security",
  "privacy",
  "terms",
  "imprint",
];
async function ready() {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el) => el.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
try {
  for (const route of routes) {
    for (const [width, height] of [
      [1512, 982],
      [390, 844],
      [768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      const response = await page.goto(`http://127.0.0.1:3000/${route}`, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, route);
      await ready();
      assert.equal(await page.locator("h1").count(), 1, route);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images]
          .filter((img) => !img.complete || !img.naturalWidth)
          .map((img) => img.src),
        navRight: document.querySelector(".rh-nav-demo").getBoundingClientRect()
          .right,
      }));
      assert.equal(metrics.overflow, false, `${route} overflow at ${width}`);
      assert.deepEqual(metrics.brokenImages, [], route);
      assert.ok(
        metrics.navRight <= width,
        `${route} header clipped at ${width}`,
      );
      if (width === 390) {
        await page.locator(".rh-mobile-menu summary").click();
        await page
          .locator(".rh-mobile-links")
          .getByRole("link", { name: "Company", exact: true })
          .click();
        await page.waitForURL("**/company");
        assert.equal(
          await page.locator(".rh-mobile-menu").getAttribute("open"),
          null,
        );
        await page.goto(`http://127.0.0.1:3000/${route}`, {
          waitUntil: "networkidle",
        });
        await ready();
      }
      if (width !== 768)
        await page.screenshot({
          path: `docs/visual-qa/${route}-${width === 1512 ? "desktop" : "mobile"}.png`,
          fullPage: true,
        });
      results.pages.push({ route, width, ...metrics });
    }
  }
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto("http://127.0.0.1:3000/solutions", {
    waitUntil: "networkidle",
  });
  for (const [name, title] of [
    ["Labor", "How you staff."],
    ["Sell", "How you monetize."],
    ["Recover", "What you’re owed."],
    ["Buy", "What you spend."],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    assert.equal(
      await page.getByRole("heading", { name: title, exact: true }).isVisible(),
      true,
    );
  }
  results.interactions.push("Solutions: all four operating areas");
  await page.goto("http://127.0.0.1:3000/value-calculator", {
    waitUntil: "networkidle",
  });
  await page
    .getByLabel("Monthly procurement spend per location (€)", { exact: true })
    .fill("100000");
  await page.getByLabel("Locations", { exact: true }).fill("3");
  assert.equal(
    await page.locator(".rp-output-orbit strong").innerText(),
    "€6,000",
  );
  await page.getByRole("button", { name: "Annual", exact: true }).click();
  assert.equal(
    await page.locator(".rp-output-orbit strong").innerText(),
    "€72,000",
  );
  await page.getByRole("button", { name: "Revenue", exact: true }).click();
  assert.equal(
    await page
      .getByLabel("Monthly revenue per location (€)", { exact: true })
      .isVisible(),
    true,
  );
  await page
    .getByLabel("Monthly revenue per location (€)", { exact: true })
    .fill("-1");
  assert.equal(await page.locator(".rp-output-orbit strong").innerText(), "€0");
  await page.getByLabel("Locations", { exact: true }).fill("0");
  assert.equal(
    await page.getByLabel("Locations", { exact: true }).inputValue(),
    "1",
  );
  results.interactions.push(
    "Calculator: categories, arithmetic, monthly/annual periods and lower bounds",
  );
  await page.goto("http://127.0.0.1:3000/pricing", {
    waitUntil: "networkidle",
  });
  const faq = page.locator(".rp-faq details").first();
  await faq.locator("summary").click();
  assert.equal(await faq.getAttribute("open"), "");
  assert.match(await faq.innerText(), /No credit card required/);
  await faq.locator("summary").click();
  assert.equal(await faq.getAttribute("open"), null);
  results.interactions.push("Pricing: native FAQ expands and collapses");
  await page.goto("http://127.0.0.1:3000/contact", {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Work email", { exact: true }).fill("not-an-email");
  await page.getByRole("button", { name: /Request a walkthrough/ }).click();
  await page.locator(".rx-contact-form [role=alert]").waitFor();
  assert.match(
    await page.locator(".rx-contact-form [role=alert]").innerText(),
    /check your email and company/,
  );
  results.interactions.push(
    "Contact: invalid input rejected before any delivery",
  );
  await page.goto("http://127.0.0.1:3000/login", { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  assert.equal(await page.locator("#password").getAttribute("type"), "text");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  assert.equal(
    await page.locator("#password").getAttribute("type"),
    "password",
  );
  results.interactions.push("Sign in: password visibility control");
  assert.deepEqual(errors, [], "Browser errors");
  assert.deepEqual(responses, [], "Failed responses");
  results.status = "passed";
} catch (error) {
  results.status = "failed";
  results.failure = error.message;
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    "docs/visual-qa/navigation-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: results.status,
      pages: results.pages.length,
      interactions: results.interactions.length,
      failure: results.failure,
    }),
  );
  await browser.close();
}
