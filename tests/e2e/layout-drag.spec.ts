import {test,expect} from "playwright/test";

// Arrangement must work with native pointer events and no WebGL canvas.

test("existing furniture moves and persists without WebGL",async({page})=>{
  await page.goto("/app/live/plan?stay=1");
  const item=page.locator("[data-layout-item]").first();await expect(item).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  const id=await item.getAttribute("data-layout-item");const before=await item.getAttribute("transform");
  const box=await item.boundingBox();if(!box)throw new Error("Object is not visible");
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+75,box.y+box.height/2+35,{steps:12});await page.mouse.up();
  await expect(item).not.toHaveAttribute("transform",before!);
  const moved=await item.getAttribute("transform");await page.reload();
  await expect(page.locator(`[data-layout-item="${id}"]`)).toHaveAttribute("transform",moved!);
});

test("palette objects can be dragged directly onto the plan",async({page})=>{
  await page.goto("/app/live/plan?stay=1");const plan=page.getByTestId("floor-plan");await expect(plan).toBeVisible();
  const before=await page.locator("[data-layout-item]").count();const box=await plan.boundingBox();if(!box)throw new Error("Plan is not visible");
  await page.getByRole("button",{name:"Table for 4",exact:true}).dragTo(plan,{targetPosition:{x:box.width*.65,y:box.height*.55}});
  await expect(page.locator("[data-layout-item]")).toHaveCount(before+1);
  await page.getByRole("button",{name:"Undo",exact:true}).click();await expect(page.locator("[data-layout-item]")).toHaveCount(before);
});

test.describe("touch dragging",()=>{
  test.use({viewport:{width:1024,height:1000},hasTouch:true,isMobile:true});
  test("both furniture and palette objects respond to a finger drag",async({page,context})=>{
    await page.goto("/app/live/plan?stay=1");const item=page.locator("[data-layout-item]").first();await expect(item).toBeVisible();
    const client=await context.newCDPSession(page);
    const drag=async(x:number,y:number,toX:number,toY:number)=>{await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+(toX-x)*i/12,y:y+(toY-y)*i/12}]});await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});};
    const before=await item.getAttribute("transform");const object=await item.boundingBox();if(!object)throw new Error("Object is not visible");
    await drag(object.x+object.width/2,object.y+object.height/2,object.x+object.width/2+50,object.y+object.height/2+25);
    await expect(item).not.toHaveAttribute("transform",before!);
    const count=await page.locator("[data-layout-item]").count();const button=await page.getByRole("button",{name:"Table for 4",exact:true}).boundingBox();const plan=await page.getByTestId("floor-plan").boundingBox();if(!button||!plan)throw new Error("Palette or plan is not visible");
    await drag(button.x+button.width/2,button.y+button.height/2,plan.x+plan.width*.6,plan.y+plan.height*.6);
    await expect(page.locator("[data-layout-item]")).toHaveCount(count+1);
  });
});
