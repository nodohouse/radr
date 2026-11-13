import { test, expect } from "playwright/test";
const base = process.env.PUBLIC_QA_BASE_URL || "http://127.0.0.1:3002";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() =>
    localStorage.setItem(
      "radr.cookie-preferences.v1",
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: false,
        marketing: false,
        savedAt: new Date().toISOString(),
      }),
    ),
  );
});
test("evaluation brief requires choices, downloads useful evidence steps and never submits a lead", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && /\/api\//.test(request.url()))
      posts.push(request.url());
  });
  for (const [width, context, focus] of [
    [1512, "Restaurants", "supplier"],
    [390, "Hotels", "hotel"],
    [820, "Mixed hospitality group", "service"],
  ] as const) {
    await page.setViewportSize({ width, height: 982 });
    await page.goto(base + "/en/contact");
    await expect(
      page.getByRole("button", { name: "Prepare my brief →" }),
    ).toBeDisabled();
    await page
      .getByRole("combobox", { name: "Operating context", exact: true })
      .selectOption(context);
    await page
      .getByRole("combobox", { name: "Locations", exact: true })
      .selectOption("2–5");
    await expect(
      page.getByRole("button", { name: "Prepare my brief →" }),
    ).toBeDisabled();
    await page
      .getByRole("combobox", { name: "Your first priority", exact: true })
      .selectOption(focus);
    await page.getByRole("button", { name: "Prepare my brief →" }).click();
    const heading = page.getByRole("heading", {
      name: "Your evaluation brief",
      exact: true,
    });
    await expect(heading).toBeFocused();
    await expect(page.locator(".rm-evaluation-result")).toContainText(
      "Gather evidence.",
    );
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Save my evaluation brief ↓" })
      .click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("RADR-evaluation-brief.txt");
    const stream = await file.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const text = Buffer.concat(chunks).toString("utf8");
    expect(text).toContain(context);
    expect(text).toContain("Gather evidence");
    expect(text).toContain("not a submitted inquiry");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      page.locator('.rm-evaluation input[type="email"]'),
    ).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Your first priority", exact: true })
      .selectOption(focus === "supplier" ? "hotel" : "supplier");
    await expect(heading).toHaveCount(0);
  }
  expect(posts).toEqual([]);
});
test("primary navigation opens the public demo and calculator results offer an honest next step", async ({
  page,
}) => {
  await page.goto(base + "/en");
  await expect(page.locator(".rx-nav-right .rx-nav-cta")).toHaveAttribute(
    "href",
    "/en/demo",
  );
  await page.locator(".rx-nav-right .rx-nav-cta").click();
  await expect(page).toHaveURL(/\/en\/demo/);
  await page.goto(base + "/en/value-calculator");
  await page
    .getByRole("button", { name: "Global hotel group", exact: true })
    .click();
  await expect(page.locator(".vc-res-head")).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByRole("button", { name: /Email my Value Map/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Print / save Value Map", exact: true }),
  ).toBeVisible();
  await page
    .locator(".vc4-bridge")
    .getByRole("link", { name: "Explore the hotel demo" })
    .click();
  await expect(page).toHaveURL(/\/en\/signup\?intent=demo/);
  await expect(
    page.getByLabel("Choose your demo", { exact: true }),
  ).toHaveValue("hotel");
});
test("discovery endpoints expose coherent schema, sitemap and social imagery", async ({
  page,
  request,
}) => {
  await page.goto(base + "/en/radr-explained");
  await expect(page).toHaveTitle("RADR");
  const data = await page
    .locator('main script[type="application/ld+json"]')
    .textContent();
  const schema = JSON.parse(data!);
  expect(schema.mainEntity).toHaveLength(8);
  for (const item of schema.mainEntity) {
    await expect(
      page.getByRole("heading", { name: item.name, exact: true }),
    ).toBeVisible();
    expect(item.acceptedAnswer.text).toBeTruthy();
  }
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonical).toBe("https://radrup.com/en/radr-explained");
  const robots = await request.get(base + "/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(
    "Sitemap: https://radrup.com/sitemap.xml",
  );
  const sitemap = await request.get(base + "/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("/en/value-calculator");
  expect(xml).not.toContain("/en/login");
  const llms = await request.get(base + "/llms.txt");
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain("/en/radr-explained");
  const image = await request.get(base + "/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).length).toBeGreaterThan(10000);
});
