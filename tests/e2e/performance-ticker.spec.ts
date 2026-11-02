import {test,expect} from "playwright/test";
import {aggregateTrend,locationTrend,trendEstate,trendScope} from "../../lib/product/performanceTrend";
import {DEMO_FX_TO_USD} from "../../lib/radr/demo/estateRegistry";

test("actuals stop at the snapshot and projections join actuals for every period",()=>{
 for(const vertical of ["restaurant","hotel"])for(const period of ["day","week","month"] as const){
  const entity=trendEstate(vertical)[0];const s=locationTrend(entity,period);
  expect(s.points[s.cutoff].actual).toBeCloseTo(s.actual);expect(s.points[s.cutoff].projection).toBeCloseTo(s.actual);
  expect(s.points.at(-1)!.forecast).toBeCloseTo(s.forecast);expect(s.points.at(-1)!.projection).toBeCloseTo(s.projected);
  expect(s.points.slice(s.cutoff+1).every(p=>p.actual===null)).toBeTruthy();expect(s.points.slice(0,s.cutoff).every(p=>p.projection===null)).toBeTruthy();
 }
 const entities=trendEstate("restaurant").slice(0,4);const total=aggregateTrend(entities,"week")!;
 expect(total.actual).toBeCloseTo(entities.reduce((sum,e)=>sum+locationTrend(e,"week").actual*DEMO_FX_TO_USD[e.currency],0));
 expect(total.delta).toBeCloseTo((total.actual/total.expected-1)*100);
 expect(trendScope("hotel","not-a-location",[])).toEqual([]);
 const pair=trendScope("restaurant","all",entities.slice(0,2).map(e=>e.id));expect(pair.map(e=>e.id)).toEqual(entities.slice(0,2).map(e=>e.id));
});

test("Control Center periods, comparison, location selection and timeline work",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await page.goto("/app?stay=1");await page.getByRole("button",{name:"Open revenue performance details",exact:true}).click();const panel=page.getByTestId("performance-ticker");await expect(panel).toBeVisible();
 const location=panel.getByLabel("Chart location");if(await location.locator('option[value="loc_berlin_mitte"]').count())await location.selectOption("loc_berlin_mitte");
 await expect(panel).toContainText("updates paused");await expect(panel).toContainText("Illustrative demo");
 await panel.getByRole("button",{name:"Week",exact:true}).click();await expect(panel).toContainText("Actual week to date");await panel.getByRole("button",{name:"Month",exact:true}).click();await expect(panel).toContainText("September 1–30");
 const slider=panel.getByRole("slider",{name:"Explore revenue timeline"});await slider.focus();await page.keyboard.press("End");await expect(panel.locator(".pt-chart-readout")).toContainText("Future estimate");await page.keyboard.press("Home");await expect(slider).toHaveAttribute("aria-valuetext",/Sep 1/);
 await panel.getByRole("button",{name:"Compare locations",exact:false}).click();await expect(panel).toContainText("100% = forecast pace");expect(await panel.locator("[data-peer-line]").count()).toBeGreaterThan(0);
 await panel.getByRole("button",{name:"Day",exact:true}).click();await expect(panel).toContainText("Actual today");
 await panel.scrollIntoViewIfNeeded();await page.mouse.move(1200,150);await panel.screenshot({path:"/workspace/work/qa/control-center-performance.png"});
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await panel.screenshot({path:"/workspace/work/qa/control-center-performance-mobile.png"});expect(errors).toEqual([]);
});

test("hotel Control Center receives the same period and location charts",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app?stay=1");await page.getByRole("button",{name:"Open revenue performance details",exact:true}).click();const panel=page.getByTestId("performance-ticker");await expect(panel).toBeVisible();await panel.getByRole("button",{name:"Week",exact:true}).click();await expect(panel).toContainText("Actual week to date");await panel.getByRole("button",{name:"Locations",exact:true}).click();await expect(panel.locator(".pt-location-tape")).not.toContainText("Soho");
 expect(await panel.locator("[data-peer-line]").count()).toBeGreaterThan(0);
});
