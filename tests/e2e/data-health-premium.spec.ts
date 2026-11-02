import {test,expect} from "playwright/test";
import {buildDataHealthOverview} from "../../lib/radr/product/dataHealthProofEngine";
import {sourceImprovement} from "../../lib/product/dataHealthActions";

test("quality explanation reconciles with source scores and prioritizes actual gaps",()=>{
 const model=buildDataHealthOverview();for(const source of model.sources){const plan=sourceImprovement(source);expect(plan.calculatedScore).toBe(source.evidenceConfidence);expect(plan.gaps.every(g=>g.score<95)).toBeTruthy();for(const gap of plan.gaps){expect(gap.fix.length).toBeGreaterThan(15);expect(gap.verify.length).toBeGreaterThan(15);}}
 const xero=model.sources.find(s=>s.id==="xero")!;expect(sourceImprovement(xero).gaps[0].id).toBe("freshness");expect(sourceImprovement(xero).owner).toContain("Finance");
});

test("source logos, scores, remediation, filters and direct links work",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await page.goto("/app/data-health?stay=1");const screen=page.getByTestId("data-health-premium");await expect(screen).toContainText("78");const sources=page.getByRole("region",{name:"Source connections",exact:true});
 await expect(sources.locator('img[src="/vendors/xero.svg"]')).toBeVisible();expect(await sources.locator('img[src="/vendors/xero.svg"]').evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBeTruthy();
 await page.getByRole("region",{name:"Priority source improvements",exact:true}).getByRole("button",{name:/Xero/}).click();const inspector=page.getByRole("region",{name:"Xero evidence quality",exact:true});await expect(inspector).toContainText("Verified when");await expect(inspector).toContainText("2h freshness SLA");await expect(inspector.getByRole("link",{name:"Open connection settings"})).toHaveAttribute("href","/app/connections?system=xero");await expect(page).toHaveURL(/source=xero/);
 await inspector.getByRole("button",{name:"Evidence quality",exact:true}).click();await expect(inspector).toContainText("35% weight");await expect(inspector).toContainText("42");await inspector.getByRole("button",{name:"Decision impact",exact:true}).click();await expect(inspector).toContainText("Contract vs invoice");await expect(inspector.getByRole("link").first()).toHaveAttribute("href",/\/app\/decisions\//);
 await sources.getByRole("combobox",{name:"Filter source health"}).selectOption("healthy");await expect(sources.locator(".hp-source-list>button")).toHaveCount(3);await sources.getByRole("textbox",{name:"Search evidence sources"}).fill("Lightspeed");await expect(sources.locator(".hp-source-list>button")).toHaveCount(1);await sources.locator(".hp-source-list>button").click();await expect(page.getByRole("region",{name:"Lightspeed evidence quality",exact:true})).toBeVisible();
 await page.goto("/app/data-health?stay=1&layout=detail&source=deliverect&tab=fix");await expect(page.getByTestId("data-health-premium")).toBeVisible();await expect(page.getByRole("region",{name:"Deliverect evidence quality",exact:true})).toContainText("Confirm Uber Eats and Deliveroo");
 await page.mouse.move(1200,120);await page.screenshot({path:"/workspace/work/qa/data-health-premium.png",fullPage:true});await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:"/workspace/work/qa/data-health-premium-mobile.png",fullPage:true});expect(errors).toEqual([]);
});

test("hotel health and connections never inherit restaurant source scores",async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem("radr.demoOrg.v1",JSON.stringify({vertical:"hotel",orgId:"org_northstar_hotels"})));
 await page.goto("/app/data-health?stay=1&source=xero");const screen=page.getByTestId("data-health-premium");await expect(screen).toContainText("Unmeasured");await expect(screen).not.toContainText("78/100");await expect(screen.locator('img[src="/vendors/mews.svg"]')).toBeVisible();await expect(screen).not.toContainText("Deliverect");await screen.locator(".hp-hotel-catalog details").first().locator("summary").click();await expect(screen).toContainText("Run an initial import");
 await page.goto("/app/connections?stay=1");await expect(page.getByRole("heading",{name:"Connect the hotel evidence that matters.",exact:true})).toBeVisible();await expect(page.locator(".hp-hotel-catalog")).not.toContainText("Lightspeed");await expect(page.locator(".hp-hotel-catalog")).toContainText("Mews");await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
