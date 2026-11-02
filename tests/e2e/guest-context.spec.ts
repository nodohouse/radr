import {test,expect} from "playwright/test";

test("restaurant keeps current and incoming needs separate in focused detail",async({page})=>{
 test.setTimeout(120000);
 await page.goto("/app/live?stay=1");await page.locator('[data-layout-item="t8"]').click();const alert=page.locator(".simp-critical-needs");await expect(alert).toContainText("20:15");await expect(alert).toContainText("due in 27 min");await expect(alert).toContainText("Sesame");await expect(alert).toContainText("Peanuts");
 await page.getByRole("tab",{name:"Notes",exact:true}).click();const current=page.getByRole("region",{name:"Current party notes",exact:true}),incoming=page.getByRole("region",{name:"Incoming party notes",exact:true});await expect(current).toContainText("Sesame");await expect(current).not.toContainText("Peanuts");await expect(incoming).toContainText("Peanuts");await expect(incoming).not.toContainText("Sesame");await page.getByRole("tab",{name:"Timeline",exact:true}).click();await expect(page.locator("#table-timeline")).toContainText("5 min estimated buffer");
 await page.keyboard.press("Escape");await page.locator('[data-layout-item="t6"]').click();await expect(alert).toContainText("No allergies reported");await page.keyboard.press("Escape");await page.locator('[data-layout-item="t1"]').click();await expect(alert).toContainText("Allergies not recorded");
});

test("hotel room shows incoming stay needs and chronological history",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app/live?stay=1&level=property&floor=3&room=310");
 const inspector=page.getByRole("complementary",{name:"Room 310",exact:true});await expect(inspector).toBeVisible();const brief=inspector.getByTestId("room-guest-brief");
 await expect(brief).toContainText("15:20 today · Michael Tan");await expect(brief).toContainText("Shellfish");await expect(brief).toContainText("feather-free bedding");await expect(brief).toContainText("Room not ready");
 await inspector.getByRole("tab",{name:"Guests",exact:true}).click();await expect(brief).toContainText("Shellfish");await expect(brief).toContainText("4th stay");await inspector.getByRole("tab",{name:"History",exact:true}).click();await expect(brief).toContainText("Checked out today 11:00");await expect(brief).toContainText("Next arrival scheduled");
 await page.screenshot({path:"/workspace/work/qa/hotel-guest-needs.png",fullPage:true});
 await page.goto("/app/live?stay=1&level=property&floor=3&room=311");const other=page.getByRole("complementary",{name:"Room 311",exact:true}).getByTestId("room-guest-brief");await expect(other).toContainText("not recorded");await expect(other).not.toContainText("Shellfish");
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:"/workspace/work/qa/hotel-guest-needs-mobile.png",fullPage:true});
});
