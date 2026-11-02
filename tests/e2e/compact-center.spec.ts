import {test,expect} from "playwright/test";

test("executive brief puts finance and next action first and keeps details off the page",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await page.goto("/app?stay=1");const brief=page.getByTestId("compact-control-center");await expect(brief).toBeVisible();
 await expect(page.getByTestId("executive-overview")).toContainText("$18,420");await expect(page.getByTestId("executive-overview")).toContainText("$7,190");await expect(page.getByTestId("performance-ticker")).toHaveCount(0);await expect(page.getByRole("link",{name:"Review decision",exact:true})).toBeVisible();
 const overview=await page.getByTestId("executive-overview").boundingBox();expect(overview!.y).toBeLessThan(400);const height=await brief.evaluate(el=>el.getBoundingClientRect().height);expect(height).toBeLessThan(1550);
 await page.mouse.move(1200,100);await page.screenshot({path:"/workspace/work/qa/compact-center-desktop.png",fullPage:true});
 const trigger=page.getByRole("button",{name:"Open revenue performance details",exact:true});await trigger.click();const modal=page.getByRole("dialog",{name:"Performance detail",exact:true});await expect(modal).toBeVisible();expect(await page.evaluate(()=>document.body.style.overflow)).toBe("hidden");await expect(modal.getByRole("slider")).toBeVisible();await expect(page.getByTestId("contribution-flow")).toHaveCount(0);
 await page.keyboard.press("Escape");await expect(modal).not.toBeVisible();await expect(trigger).toBeFocused();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe("hidden");
 await page.getByRole("button",{name:"Open contribution details",exact:true}).click();await expect(page.getByTestId("contribution-flow")).toBeVisible();await expect(modal.getByRole("slider")).toHaveCount(0);await modal.getByRole("button",{name:"Close performance details",exact:true}).click();
 await page.getByRole("button",{name:"Open location comparisons",exact:true}).click();await expect(modal.locator("[data-peer-line]")).not.toHaveCount(0);await modal.getByRole("button",{name:"Close performance details",exact:true}).click();
 await page.getByRole("button",{name:"Week",exact:true}).click();await trigger.click();await expect(modal).toContainText("Actual week to date");await modal.getByRole("button",{name:"Close performance details",exact:true}).click();await page.getByRole("button",{name:"Day",exact:true}).click();
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(await brief.evaluate(el=>el.getBoundingClientRect().height)).toBeLessThan(2600);await page.screenshot({path:"/workspace/work/qa/compact-center-mobile.png",fullPage:true});expect(errors).toEqual([]);
});

test("hotel executive brief is compact with department drill-down",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));await page.goto("/app?stay=1");await expect(page.getByTestId("executive-overview")).toContainText("$22,340");await expect(page.getByRole("heading",{name:"Arrival readiness",exact:true})).toBeVisible();await page.getByRole("button",{name:"Open contribution details",exact:true}).click();await expect(page.getByTestId("contribution-flow").getByRole("table")).toContainText("Rooms");await page.getByRole("button",{name:"Close performance details",exact:true}).click();await expect(page.getByTestId("performance-ticker")).toHaveCount(0);
});
