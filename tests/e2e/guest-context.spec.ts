import {test,expect} from "playwright/test";

test("restaurant separates current allergies from incoming needs and shows turnover",async({page})=>{
 await page.goto("/app/live?stay=1");
 const next=page.getByRole("region",{name:"Next reservation",exact:true});
 await expect(next).toContainText("20:15");await expect(next).toContainText("due in 27 min");await expect(next).toContainText("5 min estimated buffer");
 await page.locator(".rp-guest-disclosure summary").click();const current=page.getByRole("region",{name:"Current party needs",exact:true});await expect(current).toContainText("Sesame");await expect(current).not.toContainText("Peanuts");
 await next.locator("summary").click();const incoming=page.getByRole("region",{name:"Incoming party needs",exact:true});await expect(incoming).toContainText("Peanuts");await expect(incoming).toContainText("acknowledgement pending");await expect(incoming).not.toContainText("Sesame");
 await page.locator('[data-layout-item="t6"]').click();await page.mouse.move(1200,220);await expect(current).toContainText("None reported");
 await page.locator('[data-layout-item="t1"]').click();await page.mouse.move(1200,220);await expect(current).toContainText("Not recorded");await expect(next).toContainText("unavailable");await expect(current).not.toContainText("Sesame");
 await page.locator('[data-layout-item="t8"]').click();await page.mouse.move(1200,220);await page.screenshot({path:"/workspace/work/qa/restaurant-guest-needs.png",fullPage:true});
});

test("hotel room shows incoming stay needs and chronological history",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app/live?stay=1&level=property&floor=3&room=310");
 const inspector=page.getByRole("complementary",{name:"Room 310",exact:true});await expect(inspector).toBeVisible();const brief=inspector.getByTestId("room-guest-brief");
 await expect(brief).toContainText("15:20 today · Michael Tan");await expect(brief).toContainText("Shellfish");await expect(brief).toContainText("Feather-free bedding");await expect(brief).toContainText("Room not ready");await expect(brief).toContainText("4th stay");
 await inspector.getByRole("tab",{name:"Guests",exact:true}).click();await expect(brief).toContainText("Shellfish");await inspector.getByRole("tab",{name:"History",exact:true}).click();await expect(brief).toContainText("Checked out today 11:00");await expect(brief).toContainText("Next arrival scheduled");
 await page.screenshot({path:"/workspace/work/qa/hotel-guest-needs.png",fullPage:true});
 await page.goto("/app/live?stay=1&level=property&floor=3&room=311");const other=page.getByRole("complementary",{name:"Room 311",exact:true}).getByTestId("room-guest-brief");await expect(other).toContainText("Not recorded");await expect(other).not.toContainText("Shellfish");
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:"/workspace/work/qa/hotel-guest-needs-mobile.png",fullPage:true});
});
