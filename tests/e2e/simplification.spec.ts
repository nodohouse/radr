import {test,expect} from "playwright/test";

test("Back of House separates current risk, capture evidence and historical outcomes",async({page})=>{
 await page.goto("/app/house?stay=1");await expect(page.getByRole("region",{name:"Today's readiness"})).toBeVisible();await expect(page.locator(".boh-capture-intro")).toHaveCount(0);await expect(page.locator("table")).toHaveCount(0);await expect(page.getByRole("link",{name:"Review D-8204"})).toHaveAttribute("href","/app/decisions/dec_caster_sugar_berlin");await expect(page.locator(".simp-house-decision")).toContainText("New York");await expect(page.locator(".simp-house-decision")).not.toContainText("Berlin");
 await page.getByRole("button",{name:"History",exact:true}).click();await expect(page.getByRole("region",{name:"Historical verified outcomes"})).toContainText("Historical");await expect(page.locator(".simp-house-decision")).toHaveCount(0);await expect(page.locator(".simp-history")).not.toContainText("€");
 await page.getByRole("button",{name:"Stock",exact:true}).click();await expect(page.locator("table")).toBeVisible();await page.getByRole("button",{name:"Suppliers",exact:true}).click();await expect(page.getByRole("region",{name:"Supplier contacts"})).toContainText("Fictional demo contact");await page.getByRole("button",{name:"Captures",exact:true}).click();await expect(page).toHaveURL(/view=captures/);
});

test("Connections exposes gaps and keeps catalog search behind browse",async({page})=>{
 await page.goto("/app/connections?stay=1");const coverage=page.getByRole("region",{name:"Operating source coverage"});await expect(coverage).toContainText("Labor");await expect(coverage).toContainText("Missing");await expect(page.locator(".ce-catalog")).toHaveCount(0);await expect(page.locator(".simp-source-attention")).toContainText("Xero · Stale");await expect(page.locator(".simp-source-attention")).toContainText("Deliverect · Degraded");
 await page.getByRole("button",{name:"Browse integrations",exact:true}).click();await expect(page.getByRole("searchbox",{name:"Search connections"})).toBeVisible();await page.getByRole("searchbox",{name:"Search connections"}).fill("Deputy");await expect(page.locator(".ce-catalog")).toContainText("Deputy");await page.getByRole("button",{name:"Coverage overview",exact:true}).click();await expect(coverage).toBeVisible();
});

test("focused table tabs support keyboard and restore focus on dismissal",async({page})=>{
 await page.goto("/app/live?stay=1");const table=page.locator('[data-layout-item="t8"]');await table.focus();await page.keyboard.press("Enter");const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();await page.getByRole("tab",{name:"Guest",exact:true}).focus();await page.keyboard.press("ArrowRight");await expect(page.getByRole("tab",{name:"Order",exact:true})).toBeFocused();await expect(page.locator("#table-order")).toBeVisible();await page.keyboard.press("End");await expect(page.getByRole("tab",{name:"Notes",exact:true})).toBeFocused();await page.keyboard.press("Escape");await expect(dialog).not.toBeVisible();await expect(table).toBeFocused();
});
