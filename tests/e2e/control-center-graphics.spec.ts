import {test,expect} from "playwright/test";

test("graphics use the selected period and preserve recorded versus modeled meaning",async({page})=>{
 await page.goto("/app?stay=1");const chart=page.locator(".cc-revenue-graphic");await expect(chart).toHaveAttribute("aria-label",/\$18,420 recorded/);await expect(page.locator(".cc-mix-legend")).toContainText("Food");await expect(page.locator(".cc-mix-legend")).toContainText("Drinks");await expect(page.locator(".cc-peer-list")).toContainText("-");
 await expect(page.locator('.cc-readiness-instrument').filter({hasText:"Occupancy"}).locator(".cc-instrument-progress")).toHaveAttribute("stroke-dasharray","78 100");await expect(page.locator('.cc-readiness-instrument').filter({hasText:"Kitchen load"}).locator(".cc-instrument-progress")).toHaveAttribute("stroke-dasharray","92 100");
 const daily=await chart.locator(".cc-actual-line").getAttribute("d");await page.getByRole("button",{name:"Week",exact:true}).click();await expect(chart.locator(".cc-actual-line")).not.toHaveAttribute("d",daily!);await expect(chart).toContainText("Thu 24");await page.getByRole("button",{name:"Month",exact:true}).click();await expect(chart).toContainText("Sep 30");expect(await chart.locator(".cc-projection-line").getAttribute("d")).not.toContain("NaN");
});

test("phone graphics can be reached horizontally without widening the page",async({page})=>{
 await page.setViewportSize({width:390,height:900});await page.goto("/app?stay=1");const gallery=page.getByRole("region",{name:"Performance graphics",exact:true});await expect(gallery).toBeVisible();await page.getByRole("button",{name:"Open location comparisons",exact:true}).focus();expect(await gallery.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.keyboard.press("Enter");await expect(page.getByRole("dialog",{name:"Performance detail",exact:true})).toBeVisible();
});
