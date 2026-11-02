import {test,expect} from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("material pilot retains canonical Decision and passes contrast checks",async({page})=>{
 await page.goto("/app?stay=1");const priority=page.locator(".cc-priority");await expect(priority).toContainText("D-1911");await expect(priority).toContainText("$620");await expect(priority).toContainText("medium confidence");await expect(priority).not.toContainText("82%");await expect(priority.getByRole("link",{name:"Review decision",exact:true})).toHaveAttribute("href","/app/decisions/dec_peak_berlin");
 const results=await new AxeBuilder({page}).include('[data-testid="compact-control-center"]').withTags(["wcag2a","wcag2aa"]).analyze();expect(results.violations).toEqual([]);
});

test("4K composition centres and remains native vector UI",async({page})=>{
 await page.setViewportSize({width:3840,height:2160});await page.goto("/app?stay=1");const brief=await page.getByTestId("compact-control-center").boundingBox();expect(brief!.x+brief!.width/2).toBeCloseTo((3840+80)/2,0);expect(brief!.width).toBeLessThanOrEqual(1680);expect(await page.locator(".ep-graphs svg").count()).toBeGreaterThan(0);await expect(page.getByTestId("compact-control-center").locator("canvas")).toHaveCount(0);await expect(page.locator('.rs-brand img')).toHaveAttribute("src",/master-v4\.svg/);
});

test("material scope ends when leaving Control Center",async({page})=>{
 await page.goto("/app?stay=1");expect(await page.locator(".rp-root").evaluate(el=>getComputedStyle(el).getPropertyValue("--material-canvas").trim())).not.toBe("");await page.goto("/app/connections?stay=1");expect(await page.locator(".rp-root").evaluate(el=>getComputedStyle(el).getPropertyValue("--material-canvas").trim())).toBe("");await expect(page.locator(".simp-coverage")).toBeVisible();
});

test("reduced motion, zoom-sized reflow and phone width preserve actions",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.setViewportSize({width:756,height:491});await page.goto("/app?stay=1");expect(await page.locator(".cc-priority").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.getByRole("link",{name:"Review decision",exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole("link",{name:"Review decision",exact:true})).toBeVisible();await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
