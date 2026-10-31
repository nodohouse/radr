import {test,expect} from "playwright/test";
import {guestSignals} from "../../lib/product/guestSignals";
import {hotelGuestNeeds} from "../../lib/product/hotelGuestNeeds";
import {hotelLivePropertyModel} from "../../lib/radr/product/hotelLive";

test("signals require records and hotel needs stay bound to the incoming booking",()=>{
 expect(guestSignals(undefined,"current")).toEqual([]);
 expect(guestSignals({allergies:null,dietary:[],requests:[],source:"unknown"},"current")).toEqual([]);
 const room=hotelLivePropertyModel().rooms.find(r=>r.id==="room_310")!;
 expect(guestSignals(hotelGuestNeeds(room),"incoming").map(s=>s.kind)).toEqual(["allergy","occasion","remark"]);
 expect(hotelGuestNeeds({...room,guestName:"Different guest"})).toBeUndefined();
 expect(hotelGuestNeeds({...room,state:"occupied"})).toBeUndefined();
 expect(hotelGuestNeeds({...room,arrivalAt:"17:00"})).toBeUndefined();
});

test("table markers are visible without selection and distinguish incoming notes",async({page})=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));await page.goto("/app/live?stay=1");const table=page.locator('[data-layout-item="t8"]');await expect(table.locator('[data-guest-signal="allergy"][data-scope="current"]')).toBeVisible();await expect(table.locator('[data-guest-signal="occasion"][data-scope="current"]')).toBeVisible();await expect(table.locator('[data-guest-signal="allergy"][data-scope="incoming"]')).toBeVisible();await expect(table).toHaveAttribute("aria-label",/Next booking:.*Peanuts/);await expect(table).toHaveAttribute("aria-label",/Birthday/);
 await expect(page.locator('[data-layout-item="t1"] [data-guest-signal]')).toHaveCount(0);
 await table.click();await page.mouse.move(1200,220);await page.locator(".rp-next-arrival summary").click();const needs=page.getByRole("region",{name:"Incoming party needs",exact:true});await expect(needs).toContainText("RES-2015-J");await expect(needs).toContainText("OpenTable sample · not connected");await expect(needs).toContainText("Birthday");
 expect(errors).toEqual([]);await page.screenshot({path:"/workspace/work/qa/table-booking-markers.png",fullPage:true});
});

test("hotel room carries allergy, occasion and note markers before opening",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app/live?stay=1&level=property&floor=3&room=311");const room=page.locator('.hl-tile').filter({hasText:"310"});await expect(room.locator('[data-guest-signal="allergy"]')).toBeVisible();await expect(room.locator('[data-guest-signal="occasion"]')).toBeVisible();await expect(room).toHaveAttribute("aria-label",/Next booking:.*Shellfish/);await expect(room).toHaveAttribute("title",/Birthday stay/);const numberBox=await room.locator(".hl-tile-num").boundingBox();const markerBox=await room.getByTestId("room-guest-signals").boundingBox();expect(numberBox&&markerBox&&numberBox.x+numberBox.width<=markerBox.x).toBeTruthy();
 await expect(page.locator('.hl-tile').filter({hasText:"311"}).locator('[data-guest-signal]')).toHaveCount(0);await room.click();await expect(page.getByTestId("room-guest-brief")).toContainText("STAY-310-TAN");await page.screenshot({path:"/workspace/work/qa/hotel-booking-markers.png",fullPage:true});
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
