import {test,expect} from "playwright/test";

test("live floor pans and zooms without moving tables",async({page})=>{
  await page.goto("/app/live?stay=1");
  const plan=page.getByTestId("floor-plan");await expect(plan).toBeVisible();
  await expect(page.getByTestId("restaurant-floor-material")).toBeVisible();
  const item=plan.locator("[data-layout-item]").first();const transform=await item.getAttribute("transform");
  const initial=await plan.getAttribute("viewBox");const box=await item.boundingBox();if(!box)throw new Error("Table missing");
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+30,{steps:10});await page.mouse.up();
  await expect(plan).not.toHaveAttribute("viewBox",initial!);await expect(item).toHaveAttribute("transform",transform!);
  const panned=await plan.getAttribute("viewBox");await page.mouse.wheel(0,-160);await expect(plan).not.toHaveAttribute("viewBox",panned!);
  await plan.dblclick({position:{x:30,y:30}});await expect(plan).toHaveAttribute("viewBox",initial!);
  await item.click();await expect(item).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"Terrace",exact:true}).click();await expect(plan).toHaveAttribute("aria-label",/Terrace/);
  await page.screenshot({path:"/workspace/work/qa/live-wood-desktop.png",fullPage:true});
});

test.describe("touch live navigation",()=>{
 test.use({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
 test("finger pan and pinch change the viewport only",async({page,context})=>{
  await page.goto("/app/live?stay=1");const plan=page.getByTestId("floor-plan");await expect(plan).toBeVisible();await plan.scrollIntoViewIfNeeded();
  const item=plan.locator("[data-layout-item]").first();const transform=await item.getAttribute("transform");const before=await plan.getAttribute("viewBox");
  const box=await plan.boundingBox();if(!box)throw new Error("Floor missing");const x=box.x+box.width/2,y=box.y+box.height/2;const client=await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+40,y:y+20}]});await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect(plan).not.toHaveAttribute("viewBox",before!);const panned=await plan.getAttribute("viewBox");
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{id:1,x:x-30,y},{id:2,x:x+30,y}]});await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{id:1,x:x-60,y},{id:2,x:x+60,y}]});await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect(plan).not.toHaveAttribute("viewBox",panned!);await expect(item).toHaveAttribute("transform",transform!);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:"/workspace/work/qa/live-wood-mobile.png",fullPage:true});
 });
});


test("table intelligence previews, pins and distinguishes missing records",async({page})=>{
 await page.goto("/app/live?stay=1");const panel=page.getByTestId("table-service-details");
 await expect(panel).toContainText("Returning guests");await expect(panel).toContainText("$236");await expect(panel).toContainText("Steak frites");await expect(panel).toContainText("Jordan party");await expect(panel).toContainText("Taylor party");
 const six=page.locator('[data-layout-item="t6"]');await six.hover();await expect(panel).toContainText("First recorded visit");await six.click();await page.mouse.move(1200,220);await expect(panel).toContainText("$262");await expect(panel).toContainText("Sam party");
 await page.locator('[data-layout-item="t1"]').click();await page.mouse.move(1200,220);await expect(panel).toContainText("Guest history unavailable");await expect(panel).not.toContainText("Morgan party");
 await page.locator('[data-layout-item="t8"]').click();await page.mouse.move(1200,220);
 const font=await page.locator('[data-layout-item="t8"] text').evaluate(el=>getComputedStyle(el).fontSize);expect(parseFloat(font)).toBeLessThan(1);
 await page.getByRole("tab",{name:"Table timeline",exact:true}).click();await expect(panel.getByText("Jordan party",{exact:false})).toBeVisible();await expect(panel.getByText("Taylor party",{exact:false})).toBeVisible();await page.getByRole("tab",{name:"Guests & orders",exact:true}).click();await expect(panel.getByText("2 × Steak frites",{exact:true})).toBeVisible();
 await page.screenshot({path:"/workspace/work/qa/live-table-intelligence-desktop.png",fullPage:true});
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:"/workspace/work/qa/live-table-intelligence-mobile.png",fullPage:true});
});
