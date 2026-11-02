import {test,expect} from "playwright/test";
import {revenueBridge} from "../../lib/product/revenueBridge";
import {trendEstate} from "../../lib/product/performanceTrend";

test("both attribution dimensions reconcile revenue, costs and contribution",()=>{
 for(const vertical of ["restaurant","hotel"])for(const period of ["day","week","month"] as const)for(const entities of [trendEstate(vertical).slice(0,1),trendEstate(vertical).slice(0,4)]){
  const b=revenueBridge(entities,period)!;expect(b.revenue-b.cost).toBeCloseTo(b.contribution);expect(b.costs.reduce((s,c)=>s+c.amount,0)).toBeCloseTo(b.cost);
  for(const rows of [b.products,b.channels]){expect(rows.reduce((s,r)=>s+r.revenue,0)).toBeCloseTo(b.revenue);expect(rows.reduce((s,r)=>s+r.cost,0)).toBeCloseTo(b.cost);expect(rows.reduce((s,r)=>s+r.contribution,0)).toBeCloseTo(b.contribution);}
 }
 const entities=trendEstate("restaurant").slice(0,1);const b=revenueBridge(entities,"day")!;expect(b.revenue).toBeCloseTo(18420);expect(b.cost).toBeCloseTo(11230);expect(b.contribution).toBeCloseTo(7190);expect(revenueBridge(entities,"day",.5)!.contribution).toBeCloseTo(3595);expect(revenueBridge(entities,"day",0)!.cost).toBe(0);
});

test("money flow follows timeline and switches product/channel attribution",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await page.goto("/app?stay=1");const flow=page.getByTestId("contribution-flow");await expect(flow).toBeVisible();await expect(flow.getByTestId("flow-revenue")).toHaveText("+$18,420");await expect(flow.getByTestId("flow-cost")).toHaveText("−$11,230");await expect(flow.getByTestId("flow-contribution")).toHaveText("$7,190");
 expect(await flow.getByTestId("flow-cost").evaluate(el=>getComputedStyle(el).color)).toBe("rgb(195, 61, 71)");
 await flow.getByRole("button",{name:"Sales channels",exact:true}).click();await expect(flow.getByRole("table")).toContainText("Uber Eats");await expect(flow.getByRole("table")).toContainText("Direct delivery / pickup");await flow.getByRole("button",{name:"Uber Eats",exact:true}).click();await expect(flow).toContainText("platform commissions are assigned");
 await flow.getByRole("button",{name:"Food & drinks",exact:true}).click();await expect(flow.getByRole("table")).toContainText("Food");await expect(flow.getByRole("table")).toContainText("Drinks");await expect(flow.getByRole("table")).not.toContainText("Uber Eats");
 await flow.locator("summary").click();await expect(flow).toContainText("Channel fees");await expect(flow).toContainText("Labor accrued");
 const slider=page.getByRole("slider",{name:"Explore revenue timeline"});await slider.focus();await page.keyboard.press("Home");await expect(flow.getByTestId("flow-revenue")).toHaveText("+$0");await expect(flow).not.toContainText("NaN");await page.keyboard.press("End");await expect(flow.getByTestId("flow-revenue")).toHaveText("+$18,420");await expect(flow).toContainText("Snapshot 19:48");
 await page.getByRole("button",{name:"Week",exact:true}).click();await expect(flow).toContainText("Week to date");await expect(flow.getByTestId("flow-revenue")).not.toHaveText("+$18,420");
 await flow.scrollIntoViewIfNeeded();await flow.screenshot({path:"/workspace/work/qa/contribution-flow.png"});await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await flow.screenshot({path:"/workspace/work/qa/contribution-flow-mobile.png"});expect(errors).toEqual([]);
});

test("hotel contribution bridge includes department and channel costs",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app?stay=1");const flow=page.getByTestId("contribution-flow");await expect(flow).toContainText("includes rooms, food & drinks, upgrades and spa");await expect(flow.getByTestId("flow-revenue")).toHaveText("+$22,340");await expect(flow.getByRole("table")).toContainText("Rooms");await flow.getByRole("button",{name:"Sales channels",exact:true}).click();await expect(flow.getByRole("table")).toContainText("Booking.com");await expect(flow.getByRole("table")).toContainText("Expedia");
});
