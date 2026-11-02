import {test, expect} from "playwright/test";

test("attention brief preserves scoped priorities and opens their canonical records", async ({page}) => {
  await page.goto("/app?stay=1");
  const trigger = page.getByRole("button", {name:"Open your 30-second attention brief", exact:true});
  await expect(trigger).toContainText("3 calls need you");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const brief = page.getByRole("dialog", {name:"Know what needs you.", exact:true});
  await expect(brief).toBeVisible();
  await expect(brief).toContainText("Soho · New York");
  await expect(brief.locator("ol>li")).toHaveCount(3);
  const first = brief.locator("ol>li").first();
  await expect(first).toContainText("$620");
  await expect(first).toContainText("medium confidence");
  await expect(first).toContainText("Tonight's dinner service");
  const href = await first.getByRole("link").getAttribute("href");
  expect(href).toBe(await page.getByRole("link", {name:"Review decision", exact:true}).getAttribute("href"));
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(brief).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await trigger.click();
  await first.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(href!));
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("hotel attention brief stays in hotel scope and remains usable on a phone", async ({page}) => {
  await page.addInitScript(() => sessionStorage.setItem("radr.demoOrg.v1", JSON.stringify({vertical:"hotel", orgId:"org_northstar_hotels"})));
  await page.setViewportSize({width:390,height:844});
  await page.goto("/app?stay=1");
  const trigger = page.getByRole("button", {name:"Open your 30-second attention brief", exact:true});
  await trigger.click();
  const brief = page.getByRole("dialog", {name:"Know what needs you.", exact:true});
  await expect(brief).toBeVisible();
  await expect(brief).not.toContainText("Peak capacity collision");
  expect(await brief.evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await brief.getByRole("button", {name:"Close attention brief", exact:true}).click();
  await expect(trigger).toBeFocused();
});
