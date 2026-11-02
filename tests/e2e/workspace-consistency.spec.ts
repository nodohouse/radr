import {test, expect} from "playwright/test";

const routes = ["settings", "live", "decisions", "service", "house", "intelligence", "value", "memory", "data-health", "connections"];

test("the avatar opens matching settings and local preferences retain their save behavior", async ({page}) => {
  await page.goto("/app?stay=1");
  await page.getByRole("link", {name:"Account settings", exact:true}).click();
  await expect(page).toHaveURL(/\/app\/settings/);
  await expect(page.getByRole("heading", {name:"Your operation. Your guardrails.", exact:true})).toBeVisible();
  await expect(page.getByTestId("workspace-focus")).toContainText("Demo preferences are saved on this device");
  await page.getByTestId("org-name").fill("Northstar Review Workspace");
  await expect(page.locator(".se-save")).toHaveText("Saved · on this device");
  await page.reload();
  await expect(page.getByTestId("org-name")).toHaveValue("Northstar Review Workspace");
  await page.locator('[data-settings-nav-item="policies"]').click();
  await expect(page.locator('[data-settings-policies]')).toBeVisible();
  await page.locator('[data-settings-nav-item="autonomy"]').click();
  await expect(page.locator('[data-settings-autonomy]')).toBeVisible();
});

test("decision and intelligence focus follows the record currently being inspected", async ({page}) => {
  await page.goto("/app/decisions?stay=1");
  const focus = page.getByTestId("workspace-focus");
  expect(await focus.getByRole("link").getAttribute("href")).toBe(await page.locator(".rd-record").first().getAttribute("href"));
  await page.getByRole("button", {name:/Resolved/}).click();
  expect(await focus.getByRole("link").getAttribute("href")).toBe(await page.locator(".rd-record").first().getAttribute("href"));
  await page.getByRole("textbox", {name:"Find a decision", exact:true}).fill("no matching decision xyz");
  await expect(focus).not.toContainText("$620");
  await page.goto("/app/intelligence?stay=1");
  const queue = page.getByRole("region", {name:"Intelligence signals", exact:true});
  await queue.getByRole("button").nth(1).click();
  expect(await focus.getByRole("link").getAttribute("href")).toBe(await page.locator(".wb-signal-hero>a").getAttribute("href"));
});

for (const vertical of ["restaurant", "hotel"] as const) {
  test(`${vertical} sections share the material system without phone overflow`, async ({page}) => {
    if (vertical === "hotel") await page.addInitScript(() => sessionStorage.setItem("radr.demoOrg.v1", JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
    const errors:string[]=[]; page.on("pageerror", error => errors.push(error.message));
    for (const route of routes) {
      await page.setViewportSize({width:1512,height:982});
      await page.goto(`/app/${route}?stay=1`);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.getByTestId("workspace-focus")).toHaveCount(1);
      const style = await page.locator(".rp-root").evaluate(el => ({blue:getComputedStyle(el).getPropertyValue("--workspace-blue").trim(),green:getComputedStyle(el).getPropertyValue("--workspace-green").trim()}));
      expect(style).toEqual({blue:"#225da2",green:"#087653"});
      if(vertical === "hotel") await expect(page.getByTestId("workspace-focus")).not.toContainText("Soho · New York");
      await page.setViewportSize({width:390,height:844});
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${vertical} ${route} phone overflow`).toBeTruthy();
      if (vertical === "hotel" && route === "live") {
        expect((await page.locator(".hl-map-card").boundingBox())!.height).toBeGreaterThan(300);
        const right = await page.locator(".hl-kpis").evaluate(el => el.getBoundingClientRect().right);
        expect(right).toBeLessThanOrEqual(390);
      }
    }
    expect(errors).toEqual([]);
  });
}
