import { test, expect, type Page } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
const key = "radr.demo.invitation.v1";
const progress = (activeMs: number) => ({
  version: 1,
  activeMs,
  interacted: true,
  shown: false,
  dismissed: false,
  areas: ["control-center"],
});
async function openDemo(
  page: Page,
  world: string,
  saved?: ReturnType<typeof progress>,
) {
  await page.addInitScript(
    ({ world, saved, key }) => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({
          vertical: world,
          orgId:
            world === "hotel"
              ? "org_northstar_hotels"
              : "org_northstar_restaurants",
        }),
      );
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          defaultLocationId:
            world === "hotel" ? "loc_canal_house" : "loc_berlin_mitte",
          roleView: world === "hotel" ? "hotel_gm" : "gm",
          timeFormat: "24h",
        }),
      );
      localStorage.setItem(
        "radr.cookie-preferences.v1",
        JSON.stringify({
          version: 1,
          necessary: true,
          analytics: false,
          marketing: false,
          savedAt: new Date().toISOString(),
        }),
      );
      if (saved && !sessionStorage.getItem(key))
        sessionStorage.setItem(key, JSON.stringify(saved));
    },
    { world, saved, key },
  );
  await page.clock.install();
  await page.goto("/app?stay=1");
  await expect(page.locator(".rp-root[data-context-ready=true]")).toBeVisible();
  await page.getByRole("heading", { name: /Your operating brief/ }).waitFor();
  await page.getByRole("heading", { name: /Your operating brief/ }).click();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
}
for (const world of ["restaurant", "hotel"])
  test(`${world} opens without an immediate pricing prompt`, async ({
    page,
  }) => {
    await openDemo(page, world);
    const url = page.url();
    await expect(page.locator(".rp-demo-conversion")).toHaveCount(0);
    await expect(
      page.getByRole("complementary", { name: "Optional next step" }),
    ).toHaveCount(0);
    await page.clock.runFor(12000);
    await expect(page.getByRole("link", { name: /Explore plans/ })).toHaveCount(
      0,
    );
    expect(page.url()).toBe(url);
  });
for (const world of ["restaurant", "hotel"])
  test(`${world} gets one optional invitation after prior active exploration`, async ({
    page,
  }) => {
    if (world === "hotel")
      await page.setViewportSize({ width: 390, height: 844 });
    else await page.setViewportSize({ width: 1512, height: 1100 });
    await openDemo(page, world, progress(239000));
    const invitation = page.getByRole("complementary", {
      name: "Optional next step",
    });
    await expect(invitation).toHaveCount(0);
    const focus = await page.evaluate(
      () => document.activeElement?.tagName + ":" + document.activeElement?.id,
    );
    const url = page.url();
    await page.clock.runFor(6000);
    await expect(invitation).toHaveCount(0);
    await page.clock.runFor(4000);
    await expect(invitation).toBeVisible();
    expect(page.url()).toBe(url);
    expect(
      await page.evaluate(
        () =>
          document.activeElement?.tagName + ":" + document.activeElement?.id,
      ),
    ).toBe(focus);
    await expect(
      invitation.getByRole("link", { name: /Explore plans/ }),
    ).toHaveAttribute("href", `/pricing?from=demo&vertical=${world}#plans`);
    const box = (await invitation.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(
      page.viewportSize()!.height - 12,
    );
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    if (world === "hotel") {
      const tabs = page.locator(".rp-mobile-tabs");
      if (await tabs.count())
        expect(box.y + box.height).toBeLessThanOrEqual(
          (await tabs.boundingBox())!.y,
        );
    }
    await page.clock.resume();
    const axe = await new AxeBuilder({ page })
      .include(".rp-demo-invitation")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    await page.screenshot({
      path: test.info().outputPath(`${world}-optional-invitation.png`),
    });
    if (world === "restaurant") {
      await invitation.getByRole("link", { name: /Explore plans/ }).click();
      await expect(page).toHaveURL(/pricing\?from=demo&vertical=restaurant/);
      await page.goto("/app?stay=1");
    } else {
      await invitation
        .getByRole("button", { name: "Keep exploring", exact: true })
        .click();
      await expect(invitation).toHaveCount(0);
      await page.reload();
    }
    await expect(
      page.locator(".rp-root[data-context-ready=true]"),
    ).toBeVisible();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.clock.runFor(10000);
    await expect(invitation).toHaveCount(0);
    expect(
      await page.evaluate(
        (k) => JSON.parse(sessionStorage.getItem(k)!).shown,
        key,
      ),
    ).toBe(true);
  });
test("invitation waits while a visitor is searching or using a dialog", async ({
  page,
}) => {
  await openDemo(page, "restaurant", progress(240000));
  await page.clock.resume();
  await page
    .getByRole("button", { name: "Search anything", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Search workspace" }),
  ).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.clock.runFor(12000);
  await expect(page.locator(".rp-demo-invitation")).toHaveCount(0);
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await page.getByRole("heading", { name: /Your operating brief/ }).click();
  await page.clock.runFor(9000);
  await expect(page.locator(".rp-demo-invitation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".rp-demo-invitation")).toHaveCount(0);
});
test("time in a hidden tab does not advance the invitation", async ({
  page,
}) => {
  await openDemo(page, "restaurant", progress(230000));
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () =>
        (window as Window & { __demoHidden?: boolean }).__demoHidden
          ? "hidden"
          : "visible",
    });
    (window as Window & { __demoHidden?: boolean }).__demoHidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const before = await page.evaluate(
    (k) => JSON.parse(sessionStorage.getItem(k)!).activeMs,
    key,
  );
  await page.clock.runFor(30000);
  expect(
    await page.evaluate(
      (k) => JSON.parse(sessionStorage.getItem(k)!).activeMs,
      key,
    ),
  ).toBe(before);
  await expect(page.locator(".rp-demo-invitation")).toHaveCount(0);
  await page.evaluate(() => {
    (window as Window & { __demoHidden?: boolean }).__demoHidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(12000);
  await expect(page.locator(".rp-demo-invitation")).toBeVisible();
});
test("demo registration invites exploration rather than choosing a plan", async ({
  page,
}) => {
  await page.goto("/en/signup?intent=demo");
  await expect(page.locator(".ob-registration-steps li")).toHaveCount(2);
  await expect(page.locator(".ob-registration-steps")).not.toContainText(
    "Choose a plan",
  );
  await expect(page.locator(".ob-auth-sub")).toContainText("at your own pace");
});
