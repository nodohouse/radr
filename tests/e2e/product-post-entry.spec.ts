import { expect, test, type BrowserContext, type Page } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

type World = "hotel" | "restaurant";
let grant: Awaited<ReturnType<BrowserContext["cookies"]>>;
test.beforeAll(async ({ playwright, baseURL }) => {
  const client = await playwright.request.newContext({ baseURL });
  const response = await client.post("/api/demo/access", {
    headers: { origin: baseURL! },
    data: { fullName: "Elena Nord", email: "review@northstar-hospitality.com",
      company: "Northstar Hospitality GmbH", role: "owner", locations: "2-5",
      vertical: "hotel", termsAccepted: true, website: "" },
  });
  expect(response.status()).toBe(200);
  grant = (await client.storageState()).cookies;
  await client.dispose();
});
test.beforeEach(async ({ page, context }) => {
  await context.addCookies(grant);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("radr.cookie-preferences.v1",
    JSON.stringify({ version: 1, necessary: true, analytics: false, marketing: false, savedAt: new Date().toISOString() })));
});
async function enter(page: Page, world: World) {
  await page.goto(`/app/enter?vertical=${world}&go=1`);
  await expect(page).toHaveURL(/\/app\?stay=1$/);
  await expect(page.locator('.rp-root[data-context-ready="true"]')).toBeVisible();
  await expect(page.locator(".rp-goh")).toHaveAttribute("data-vertical", world);
}
async function role(page: Page, world: World, value: "gm" | "cfo" | "coo") {
  if (value === "gm") return;
  await page.locator(".rp-role-switch-btn").click();
  await page.getByRole("option").filter({ hasText: value === "cfo" ? "Elena" : world === "hotel" ? "Maya" : "Marcus" }).getByRole("button").click();
}
async function healthy(page: Page) {
  await expect(page.locator("main")).not.toContainText(/\bundefined\b|\bNaN\b|\[object Object\]|Application error/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
}
async function accessible(page: Page, selector = "main") {
  const scan = await new AxeBuilder({ page }).include(selector).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
}
const primary = ["Control Center", "Decisions", "Operations", "Back of House", "Intelligence", "Value", "Memory", "Data Health", "Connections"];

for (const world of ["hotel", "restaurant"] as const) {
  for (const perspective of ["gm", "cfo", "coo"] as const) {
    test(`${world} ${perspective}: every main destination and account settings retain context`, async ({ page }) => {
      test.setTimeout(180000);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await enter(page, world); await role(page, world, perspective);
      for (const name of primary) {
        const link = page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name, exact: true });
        await link.click(); await page.mouse.move(1200, 70);
        await expect(link).toHaveAttribute("aria-current", "page");
        await expect(page.locator(".rp-goh")).toHaveAttribute("data-vertical", world);
        await healthy(page);
      }
      await page.getByRole("link", { name: "Account settings", exact: true }).click();
      await expect(page.getByTestId("org-name")).toHaveValue(world === "hotel" ? "Northstar Hotels" : "Northstar Restaurants");
      await healthy(page); expect(errors).toEqual([]);
    });
  }
  test(`${world}: decision filters, intelligence analysis, value and memory remain usable`, async ({ page }) => {
    test.setTimeout(180000); await enter(page, world);
    await page.goto("/app/decisions");
    for (const band of await page.locator(".rd-bands button").all()) {
      await band.click(); await expect(band).toHaveAttribute("aria-pressed", "true");
      const count = Number((await band.innerText()).match(/\d+$/)?.[0]);
      await expect(page.locator(".rd-record")).toHaveCount(count); await healthy(page);
    }
    await page.getByRole("textbox", { name: "Find a decision" }).fill("no-such-operating-signal");
    await expect(page.locator(".rd-empty")).toBeVisible();
    await page.getByRole("button", { name: "Show all decisions", exact: true }).click();
    expect(await page.locator(".rd-record").count()).toBeGreaterThan(0);
    await page.getByRole("combobox", { name: "Order decisions" }).selectOption("title");
    const titles = await page.locator(".rd-record h2").allTextContents();
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    await page.goto("/app/intelligence");
    for (const lens of await page.locator('[aria-label="Economic lens"] button').all()) {
      await lens.click(); await expect(lens).toHaveAttribute("aria-pressed", "true"); await healthy(page);
    }
    await page.locator('[aria-label="Economic lens"] button').first().click();
    for (const tab of await page.locator('[aria-label="Decision analysis view"] button').all()) {
      await tab.click(); await expect(tab).toHaveAttribute("aria-pressed", "true");
      expect((await page.locator(".wb-analysis-body").innerText()).trim().length).toBeGreaterThan(20);
    }
    await page.goto("/app/value");
    for (const button of await page.getByTestId("outcome-ledger").locator(".wb-lenses button").all()) {
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "true"); await healthy(page);
    }
    await page.getByRole("textbox", { name: "Search outcome records" }).fill("no-such-outcome");
    await expect(page.getByTestId("outcome-ledger")).toContainText("No outcome records match");
    await page.goto("/app/memory");
    for (const button of await page.getByTestId("memory-evidence").locator(".wb-lenses button").all()) {
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "true"); await healthy(page);
    }
    await page.getByRole("textbox", { name: "Search learning evidence" }).fill("no-such-learning");
    await expect(page.getByTestId("memory-evidence")).toContainText("No learnings match");
    await accessible(page);
  });
  test(`${world}: performance dialogs, comparison labels and dismissal work`, async ({ page }) => {
    test.setTimeout(120000); await enter(page, world);
    for (const label of ["Week", "Month", "Day"]) {
      const button = page.locator('.ep-overview > header').getByRole("button", { name: label, exact: true });
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "true");
    }
    await page.getByRole("button", { name: "Open revenue performance details", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Performance detail", exact: true });
    await expect(dialog).toBeVisible();
    for (const label of ["Contribution", "Locations", "Revenue trend"]) {
      const button = dialog.getByRole("button", { name: label, exact: true });
      await button.click(); await expect(button).toHaveAttribute("aria-pressed", "true");
    }
    await dialog.getByRole("button", { name: "Locations", exact: true }).click();
    const line = dialog.locator('[data-series-id][role="button"]').first();
    const location = (await line.getAttribute("aria-label"))!.replace(/^Inspect /, "");
    await line.focus(); await expect(dialog.locator(".pt-line-tooltip")).toContainText(location);
    await dialog.getByRole("slider", { name: "Explore revenue timeline" }).fill("3");
    await healthy(page); await accessible(page, '.ep-dialog[open]');
    await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.getByRole("button", { name: "Open your 30-second attention brief", exact: true }).click();
    await expect(page.locator(".cc-attention-dialog")).toBeVisible();
    await page.keyboard.press("Escape"); await expect(page.locator(".cc-attention-dialog")).not.toBeVisible();
  });
  test(`${world}: workspace search reaches every section with the keyboard`, async ({ page }) => {
    await enter(page, world);
    const trigger = page.getByRole("button", { name: "Search anything", exact: true });
    await trigger.click(); const dialog = page.getByRole("dialog", { name: "Search workspace", exact: true });
    const input = dialog.getByRole("textbox"); await expect(input).toBeFocused();
    for (const label of ["Back of House", "Connections", "Locations", "Dashboards", "Settings", "Floor plan editor"]) {
      await input.fill(`  ${label}  `);
      await expect(dialog.locator(".rs-search-results a").first()).toContainText(label);
    }
    await input.fill("Back of House"); await page.keyboard.press("ArrowDown");
    await expect(dialog.locator(".rs-search-results a").first()).toBeFocused();
    await page.keyboard.press("Enter"); await expect(page).toHaveURL(/\/app\/house$/);
    await trigger.click(); await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
  });
  test(`${world}: all settings sections, operator pause and invitation notices work`, async ({ page }) => {
    test.setTimeout(120000); await enter(page, world); await page.goto("/app/settings");
    for (const item of await page.locator("[data-settings-nav-item]").all()) {
      const id = await item.getAttribute("data-settings-nav-item");
      await item.click(); await expect(page).toHaveURL(new RegExp(`section=${id}`));
      await expect(page.locator(`.se-root [data-settings-${id}]`)).toBeVisible(); await healthy(page);
    }
    await page.locator('[data-settings-nav-item="autonomy"]').click();
    await page.getByTestId("pause-operator").click();
    const inputs = page.locator(".se-detail select");
    for (const input of await inputs.all()) await expect(input).toHaveValue("observe");
    await page.reload(); for (const input of await inputs.all()) await expect(input).toHaveValue("observe");
    await page.locator('[data-settings-nav-item="access"]').click();
    await page.getByTestId("invite-user").click();
    await expect(page.getByRole("status").filter({ hasText: "Invitations are not connected" })).toBeVisible();
    await accessible(page);
    await page.locator('[data-settings-nav-item="organization"]').click();
    const docs = page.getByRole("link", { name: "View documentation" });
    expect((await page.request.get((await docs.getAttribute("href"))!)).status()).toBe(200);
  });
  test(`${world}: phone navigation contains focus and all sections fit`, async ({ page }) => {
    test.setTimeout(180000); await page.setViewportSize({ width: 390, height: 844 }); await enter(page, world);
    for (const label of primary) {
      const trigger = page.getByRole("button", { name: "Open navigation", exact: true }); await trigger.click();
      const dialog = page.getByRole("dialog", { name: "RADR workspace", exact: true });
      await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
      const links = dialog.locator('a[href],button'); await links.last().focus(); await page.keyboard.press("Tab");
      await expect(links.first()).toBeFocused();
      await dialog.getByRole("link", { name: label, exact: true }).click();
      await expect(dialog).not.toBeVisible(); await healthy(page);
    }
    const trigger = page.getByRole("button", { name: "Open navigation", exact: true }); await trigger.click();
    await accessible(page, '.rs-navigation[role="dialog"]'); await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    expect(await page.locator(".rp-main-v2").evaluate(el => el.inert)).toBe(false);
  });
  test(`${world}: another location never inherits the flagship operating snapshot`, async ({ page }) => {
    test.setTimeout(120000); await enter(page, world); await role(page, world, "cfo");
    await page.getByRole("button", { name: /^Scope ·/ }).click();
    const picker = page.getByRole("dialog", { name: "Switch location", exact: true });
    await picker.getByRole("textbox", { name: "Search locations" }).fill("London");
    await picker.locator(".rp-locsw-row").first().click();
    for (const path of ["/app/house", "/app/service", "/app/live", ...(world === "restaurant" ? ["/app/guests"] : [])]) {
      await page.goto(path); await expect(page.getByTestId("scoped-snapshot-empty")).toBeVisible();
      await expect(page.locator(".boh-root,.hb-scene,.hw-root")).toHaveCount(0); await healthy(page);
    }
    await page.goto("/app/house"); await page.getByTestId("scoped-snapshot-empty").getByRole("button").click();
    await expect(page.locator(".boh-root")).toBeVisible(); await expect(page.getByTestId("scoped-snapshot-empty")).toHaveCount(0);
    for (const tab of await page.getByRole("navigation", { name: "Back of house views" }).getByRole("button").all()) {
      await tab.click(); await expect(tab).toHaveClass(/is-active/); await healthy(page);
    }
  });
  test(`${world}: source health explains gaps without inventing a connection`, async ({ page }) => {
    await enter(page, world); await page.goto("/app/data-health");
    if (world === "hotel") {
      await expect(page.getByTestId("data-health-premium")).toContainText("Unmeasured");
      await expect(page.getByTestId("data-health-premium")).not.toContainText("Deliverect");
      for (const name of ["Quality checks", "Improve readiness", "Decision evidence"]) {
        await page.getByRole("button", { name, exact: true }).click(); await healthy(page);
      }
    } else {
      await page.getByRole("region", { name: "Priority source improvements", exact: true }).getByRole("button", { name: /Xero/ }).click();
      const inspector = page.getByRole("region", { name: "Xero evidence quality", exact: true });
      await expect(inspector).toContainText("Verified when");
      for (const name of ["Evidence quality", "Decision impact"]) {
        await inspector.getByRole("button", { name, exact: true }).click(); await healthy(page);
      }
    }
    await accessible(page);
  });
  test(`${world}: Ask RADR produces a scoped demo answer and closes cleanly`, async ({ page }) => {
    test.setTimeout(120000); await enter(page, world);
    await page.getByRole("button", { name: "Ask RADR", exact: true }).click();
    const dialog = page.locator('.rp-ask[role="dialog"]'); await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox", { name: "Ask about your operation", exact: true })
      .fill(world === "hotel" ? "Which rooms have allergy requests?" : "Why is the kitchen under pressure tonight?");
    await dialog.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(dialog.locator(".rp-ask-headline").first()).toBeVisible({ timeout: 45000 });
    await expect(dialog).not.toContainText(/Ask RADR unavailable|couldn't complete that request/);
    if (world === "hotel") await expect(dialog).toContainText(/shellfish/i);
    await accessible(page, '.rp-ask[role="dialog"]');
    await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
  test(`${world}: older Ask links use the same scoped workspace dialog`, async ({ page }) => {
    await enter(page, world); await page.goto("/app/ask");
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator(".rp-goh")).toHaveAttribute("data-vertical", world);
    await expect(page.locator('.rp-ask[role="dialog"]')).toBeVisible();
    await expect(page.locator(".rp-ask-page")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator('.rp-ask[role="dialog"]')).not.toBeVisible();
  });
  test(`${world}: forecast links open scoped decision Futures`, async ({ page }) => {
    await enter(page, world); await page.goto("/app/forecast");
    await expect(page).toHaveURL(/\/app\/intelligence\?analysis=futures$/);
    await expect(page.locator(".rp-goh")).toHaveAttribute("data-vertical", world);
    await expect(page.getByTestId("decision-workbench").getByRole("button", { name: "Futures", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main")).not.toContainText("Expected covers"); await healthy(page);
  });
  test(`${world}: reviewing and approving a prepared demo plan updates the handling queue`, async ({ page }) => {
    await enter(page, world);
    const id = world === "hotel" ? "dec_ota_canal" : "dec_peak_berlin";
    await page.goto(`/app/decisions/${id}`);
    await page.getByRole("button", { name: "Verification", exact: true }).click();
    const trail = page.getByRole("link", { name: /Inspect (supporting evidence|verification trail)/ });
    const target = await trail.getAttribute("href");
    await trail.click();
    if (target?.endsWith("#evidence")) await expect(page.locator(".rp-drec-evidence")).toBeVisible();
    else await expect(page.locator("#verify")).toBeVisible();
    await page.goto(`/app/decisions/${id}`);
    await page.getByRole("link", { name: "Review prepared action", exact: true }).click();
    await expect(page).toHaveURL(/layout=detail/);
    await healthy(page); await accessible(page);
    const writes: string[] = [];
    page.on("request", request => { if (request.method() === "POST") writes.push(request.url()); });
    await page.getByRole("button", { name: "Approve prepared plan", exact: true }).click();
    await expect(page.locator(".rp-drec-foot .rp-cc-life")).toContainText("Approved");
    await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Decisions", exact: true }).click();
    await page.getByRole("button", { name: /^In motion/ }).click();
    await expect(page.locator(`.rd-record[href="/app/decisions/${id}"]`)).toBeVisible();
    expect(writes).toEqual([]);
  });
}

test("hotel guest links show room and stay context instead of restaurant table profiles", async ({ page }) => {
  await enter(page, "hotel"); await page.goto("/app/guests");
  await expect(page).toHaveURL(/\/app\/live\?/);
  const destination = new URL(page.url());
  expect(destination.searchParams.get("mode")).toBe("guests");
  expect(destination.searchParams.get("view")).toBe("floor");
  expect(destination.searchParams.get("floor")).toBe("3");
  await expect(page.locator(".hl-map-head")).toContainText("FLOOR 3");
  await expect(page.getByRole("heading", { name: "Room 310", exact: true })).toBeVisible();
  await expect(page.locator(".gi-root")).toHaveCount(0);
  await healthy(page);
});

test("settings edited immediately before a world switch stay in their source world", async ({ page }) => {
  await enter(page, "restaurant"); await page.goto("/app/settings");
  await page.getByTestId("org-name").fill("Restaurant custom organization");
  await page.getByTestId("industry-hotels").click();
  await expect(page.getByTestId("org-name")).toHaveValue("Northstar Hotels");
  await page.getByTestId("org-name").fill("Hotel custom organization");
  await page.getByTestId("industry-restaurants").click();
  await expect(page.getByTestId("org-name")).toHaveValue("Restaurant custom organization");
  await page.reload(); await expect(page.getByTestId("org-name")).toHaveValue("Restaurant custom organization");
  await page.getByTestId("industry-hotels").click();
  await expect(page.getByTestId("org-name")).toHaveValue("Hotel custom organization");
});
test("hotel dashboard and decision agree on today's arrivals", async ({ page }) => {
  await enter(page, "hotel");
  await expect(page.locator(".cc-priority")).toContainText("42 arrivals today");
  await expect(page.locator(".cc-readiness")).toContainText(/Arrivals today\s*42/);
  await page.locator(".cc-priority").getByRole("link", { name: "Review decision", exact: true }).click();
  await expect(page.locator("main")).not.toContainText("12 arrivals"); await healthy(page);
});
test("restoring a hotel workspace never shows default restaurant figures while scripts load", async ({ page }) => {
  await enter(page, "hotel");
  let release!: () => void; const blocked = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/_next/static/**/*.js", async route => { await blocked; await route.continue(); });
  await page.goto("/app?stay=1", { waitUntil: "commit" });
  try {
    await expect(page.getByRole("status", { name: "Opening your workspace" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/Soho|18,420|Peak capacity collision/);
  } finally { release(); }
  await expect(page.locator(".rp-goh")).toHaveAttribute("data-vertical", "hotel");
  await expect(page.locator("main h1")).toContainText("Nina");
});
