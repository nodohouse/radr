/**
 * RADR click-everything QA — mandatory coherence suite.
 *
 * Asserts:
 * - every primary nav route renders
 * - exactly one active nav item
 * - vertical × persona × scope × period persist across routes
 * - dropdown surfaces are opaque / layered
 * - Restaurant ↔ Hotel persistence
 * - Service view deep links
 * - console / page errors
 *
 * Artifacts: tmp/radr-qa/
 */
import { test, expect, type Page, type Locator } from "playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ART = join(process.cwd(), "tmp/radr-qa");
mkdirSync(ART, { recursive: true });

const PRIMARY_ROUTES = [
  "/app",
  "/app/decisions",
  "/app/live",
  "/app/service",
  "/app/house",
  "/app/intelligence",
  "/app/memory",
  "/app/value",
  "/app/locations",
  "/app/connections",
  "/app/data-health",
  "/app/dashboards",
  "/app/settings",
] as const;

type Issue = {
  id: string;
  route: string;
  vertical: string;
  persona: string;
  scope: string;
  viewport: string;
  interaction: string;
  expected: string;
  actual: string;
  severity: "P0" | "P1" | "P2" | "P3";
  screenshot?: string;
  status: "open" | "fixed";
};

const issues: Issue[] = [];
let issueSeq = 0;

function note(partial: Omit<Issue, "id" | "status">) {
  issueSeq += 1;
  issues.push({
    id: `QA-${String(issueSeq).padStart(3, "0")}`,
    status: "open",
    ...partial,
  });
}

async function waitContextReady(page: Page) {
  await page.waitForSelector('[data-context-ready="true"]', {
    timeout: 20_000,
  });
}

async function gotoApp(page: Page, path: string) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  const errors: string[] = [];
  const onPageError = (e: Error) => errors.push(`pageerror: ${e.message}`);
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitContextReady(page);
  page.off("pageerror", onPageError);
  page.off("console", onConsole);
  return { status: res?.status() ?? 0, errors };
}

async function readContext(page: Page) {
  const roleBtn = page.locator(".rp-role-switch-btn").first();
  const scopeBtn = page
    .locator("button[aria-label^='Scope']")
    .or(page.locator(".rp-goh-scope"))
    .first();
  const periodBtn = page
    .locator("button[aria-label^='Period'], .rp-goh-ctrl-btn")
    .filter({ hasText: /Today|MTD|Live|WTD|YTD|Tonight/i })
    .first();
  const worldHotels = page
    .getByLabel("Operating world")
    .getByRole("radio", { name: "Hotels" });
  const hotelChecked = (await worldHotels.count())
    ? (await worldHotels.getAttribute("aria-checked")) === "true"
    : false;

  return {
    persona: ((await roleBtn.textContent()) ?? "").replace(/\s+/g, " ").trim(),
    scope: ((await scopeBtn.textContent()) ?? "").replace(/\s+/g, " ").trim(),
    period: ((await periodBtn.textContent()) ?? "").replace(/\s+/g, " ").trim(),
    vertical: hotelChecked ? "hotel" : "restaurant",
  };
}

async function activeNavCount(page: Page) {
  return page.locator('.rp-rail-link[aria-current="page"]').count();
}

async function activeNavLabel(page: Page) {
  const el = page.locator('.rp-rail-link[aria-current="page"]').first();
  if (!(await el.count())) return "";
  return ((await el.getAttribute("aria-label")) ?? (await el.textContent()) ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

async function assertOpaqueMenu(page: Page, menu: Locator, meta: {
  route: string;
  vertical: string;
  persona: string;
  scope: string;
  viewport: string;
  interaction: string;
}) {
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  if (!box || box.width < 40 || box.height < 20) {
    note({
      ...meta,
      expected: "Visible dropdown with readable size",
      actual: `box=${JSON.stringify(box)}`,
      severity: "P0",
    });
    return;
  }
  const styles = await menu.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      opacity: cs.opacity,
      z: cs.zIndex,
      filter: cs.backdropFilter || cs.webkitBackdropFilter,
    };
  });
  const rgba = styles.bg.match(/rgba?\(([^)]+)\)/);
  let opaque = false;
  if (rgba) {
    const parts = rgba[1]!.split(",").map((p) => p.trim());
    const a = parts.length === 4 ? Number(parts[3]) : 1;
    opaque = a >= 0.92;
  } else {
    opaque = styles.bg !== "transparent" && styles.bg !== "rgba(0, 0, 0, 0)";
  }
  if (!opaque || Number(styles.opacity) < 0.95) {
    const shot = join(
      ART,
      `dropdown-${meta.vertical}-${Date.now()}.png`,
    );
    await page.screenshot({ path: shot, fullPage: false });
    note({
      ...meta,
      expected: "Opaque floating surface (alpha ≥ 0.92)",
      actual: `bg=${styles.bg} opacity=${styles.opacity} backdrop=${styles.filter}`,
      severity: "P0",
      screenshot: shot,
    });
  }
}

async function selectPersona(page: Page, name: RegExp | string) {
  const btn = page.locator(".rp-role-switch-btn").first();
  await btn.click();
  const menu = page.locator(".rp-role-switch-menu").first();
  await assertOpaqueMenu(page, menu, {
    route: page.url(),
    vertical: "?",
    persona: "?",
    scope: "?",
    viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
    interaction: "open persona dropdown",
  });
  const option = menu.getByRole("button", { name });
  await option.first().click();
  await waitContextReady(page);
  await page.waitForTimeout(150);
}

async function setWorld(page: Page, world: "restaurant" | "hotel") {
  const group = page.getByLabel("Operating world");
  const radio = group.getByRole("radio", {
    name: world === "hotel" ? "Hotels" : "Restaurants",
  });
  if (await radio.count()) {
    await radio.click();
    await waitContextReady(page);
    await page.waitForTimeout(200);
  }
}

test.describe("RADR click-everything coherence", () => {
  test.afterAll(() => {
    writeFileSync(join(ART, "issues.json"), JSON.stringify(issues, null, 2));
  });

  test("restaurants · discover personas · crawl all primary routes", async ({
    page,
  }, testInfo) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");

    // Discover personas from the live menu (firstName is in <strong>)
    await page.locator(".rp-role-switch-btn").first().click();
    const menu = page.locator(".rp-role-switch-menu").first();
    await expect(menu).toBeVisible();
    const firstNames = await menu.locator("button strong").allTextContents();
    const labels = await menu.locator("button").allTextContents();
    await page.keyboard.press("Escape");
    const personas = firstNames
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    expect(personas.length).toBeGreaterThanOrEqual(3);
    writeFileSync(
      join(ART, "restaurant-personas.json"),
      JSON.stringify({ firstNames: personas, labels }, null, 2),
    );

    for (const firstName of personas) {
      await gotoApp(page, "/app");
      await setWorld(page, "restaurant");
      await selectPersona(page, new RegExp(`^${firstName}\\b`, "i"));
      const baseline = await readContext(page);
      await page.screenshot({
        path: join(
          ART,
          `cc-restaurant-${baseline.persona.replace(/[^a-z0-9]+/gi, "_")}.png`,
        ),
      });

      const navOrderFirst: string[] = [];
      for (const route of PRIMARY_ROUTES) {
        const { status, errors } = await gotoApp(page, route);
        if (status >= 400) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "navigate",
            expected: "HTTP < 400",
            actual: `status ${status}`,
            severity: "P0",
          });
        }
        for (const err of errors) {
          if (/favicon|Download the React DevTools/i.test(err)) continue;
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "console/pageerror",
            expected: "no errors",
            actual: err.slice(0, 300),
            severity: "P1",
          });
        }

        const actives = await activeNavCount(page);
        if (actives !== 1) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "active nav",
            expected: "exactly 1 aria-current=page",
            actual: `count=${actives} label=${await activeNavLabel(page)}`,
            severity: "P0",
          });
        }

        const ctx = await readContext(page);
        if (ctx.persona !== baseline.persona) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "persona persistence",
            expected: baseline.persona,
            actual: ctx.persona,
            severity: "P0",
          });
        }
        if (ctx.vertical !== "restaurant") {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "vertical persistence",
            expected: "restaurant",
            actual: ctx.vertical,
            severity: "P0",
          });
        }
        // Scope must not silently flip Group ↔ single location across routes
        const baseGroup = /all locations/i.test(baseline.scope);
        const nowGroup = /all locations/i.test(ctx.scope);
        if (baseGroup !== nowGroup) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "scope persistence",
            expected: baseline.scope,
            actual: ctx.scope,
            severity: "P0",
          });
        }

        const order = await page
          .locator(".rp-rail-nav .rp-rail-link")
          .evaluateAll((els) =>
            els.map((e) => e.getAttribute("aria-label") ?? e.textContent ?? ""),
          );
        if (!navOrderFirst.length) navOrderFirst.push(...order);
        else if (JSON.stringify(order) !== JSON.stringify(navOrderFirst)) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "nav order",
            expected: navOrderFirst.join(" | "),
            actual: order.join(" | "),
            severity: "P1",
          });
        }

        // Overflow
        const overflowX = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 2,
        );
        if (overflowX) {
          note({
            route,
            vertical: "restaurant",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "layout",
            expected: "no horizontal overflow",
            actual: "document scrollWidth > innerWidth",
            severity: "P1",
          });
        }
      }
    }

    // Fail the test if any P0 issues found in this run
    const p0 = issues.filter((i) => i.severity === "P0");
    expect
      .soft(p0, `P0 issues:\n${JSON.stringify(p0, null, 2)}`)
      .toHaveLength(0);
    testInfo.annotations.push({
      type: "qa-issues",
      description: `${issues.length} issues logged → tmp/radr-qa/issues.json`,
    });
  });

  test("hotels · discover personas · crawl primary routes", async ({ page }) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "hotel");
    await page.locator(".rp-role-switch-btn").first().click();
    const menu = page.locator(".rp-role-switch-menu").first();
    await expect(menu).toBeVisible();
    const firstNames = await menu.locator("button strong").allTextContents();
    await page.keyboard.press("Escape");
    const personas = firstNames
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    writeFileSync(join(ART, "hotel-personas.json"), JSON.stringify(personas, null, 2));

    for (const firstName of personas.slice(0, 4)) {
      await gotoApp(page, "/app");
      await setWorld(page, "hotel");
      await selectPersona(page, new RegExp(`^${firstName}\\b`, "i"));
      const baseline = await readContext(page);
      await page.screenshot({
        path: join(
          ART,
          `cc-hotel-${baseline.persona.replace(/[^a-z0-9]+/gi, "_")}.png`,
        ),
      });
      for (const route of PRIMARY_ROUTES) {
        await gotoApp(page, route);
        const ctx = await readContext(page);
        if (ctx.vertical !== "hotel") {
          note({
            route,
            vertical: "hotel",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "vertical persistence",
            expected: "hotel",
            actual: ctx.vertical,
            severity: "P0",
          });
        }
        if (ctx.persona !== baseline.persona) {
          note({
            route,
            vertical: "hotel",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "persona persistence",
            expected: baseline.persona,
            actual: ctx.persona,
            severity: "P0",
          });
        }
        expect(await activeNavCount(page)).toBe(1);
      }
    }
  });

  test("service deep links Floor / Timeline / Recovery", async ({ page }) => {
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    for (const view of ["floor", "timeline", "recovery"] as const) {
      await gotoApp(page, `/app/service?view=${view}`);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const url = page.url();
      expect(url).toContain(`view=${view}`);
      // Selected tab / heading should reflect view when present
      const body = await page.locator("body").innerText();
      if (view === "floor" && !/Floor|Service/i.test(body)) {
        note({
          route: `/app/service?view=${view}`,
          vertical: "restaurant",
          persona: "?",
          scope: "?",
          viewport: "default",
          interaction: "deep link refresh",
          expected: "Floor content visible",
          actual: "Floor markers missing from body text",
          severity: "P1",
        });
      }
      await page.screenshot({
        path: join(ART, `service-${view}.png`),
      });
    }
  });

  test("restaurant ↔ hotel toggle persists across navigation", async ({
    page,
  }) => {
    await gotoApp(page, "/app");
    await setWorld(page, "hotel");
    let ctx = await readContext(page);
    expect(ctx.vertical).toBe("hotel");
    await gotoApp(page, "/app/decisions");
    ctx = await readContext(page);
    expect(ctx.vertical).toBe("hotel");
    await gotoApp(page, "/app/locations");
    ctx = await readContext(page);
    expect(ctx.vertical).toBe("hotel");
    await setWorld(page, "restaurant");
    await gotoApp(page, "/app/intelligence");
    ctx = await readContext(page);
    expect(ctx.vertical).toBe("restaurant");
  });

  test("top-bar dropdowns: period + persona opaque + escape", async ({
    page,
  }) => {
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");

    // Persona
    await page.locator(".rp-role-switch-btn").first().click();
    const personaMenu = page.locator(".rp-role-switch-menu").first();
    await assertOpaqueMenu(page, personaMenu, {
      route: "/app",
      vertical: "restaurant",
      persona: "open",
      scope: "?",
      viewport: "default",
      interaction: "persona menu",
    });
    await page.screenshot({ path: join(ART, "dropdown-persona.png") });
    await page.keyboard.press("Escape");
    await expect(personaMenu).toBeHidden();

    // Period if present
    const periodBtn = page
      .locator("button")
      .filter({ hasText: /^(Period\s*)?(Today|MTD|Live|WTD|YTD)/i })
      .first();
    if (await periodBtn.count()) {
      await periodBtn.click();
      const periodMenu = page
        .locator(".rp-ctx-period-menu, [role='listbox']")
        .first();
      if (await periodMenu.isVisible()) {
        await assertOpaqueMenu(page, periodMenu, {
          route: "/app",
          vertical: "restaurant",
          persona: "?",
          scope: "?",
          viewport: "default",
          interaction: "period menu",
        });
        await page.screenshot({ path: join(ART, "dropdown-period.png") });
        await page.keyboard.press("Escape");
      }
    }
  });

  test("hotels · all personas · crawl primary routes", async ({ page }) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "hotel");
    await page.locator(".rp-role-switch-btn").first().click();
    const menu = page.locator(".rp-role-switch-menu").first();
    await expect(menu).toBeVisible();
    const firstNames = (
      await menu.locator("button strong").allTextContents()
    ).map((t) => t.replace(/\s+/g, " ").trim()).filter(Boolean);
    await page.keyboard.press("Escape");

    for (const firstName of firstNames) {
      await gotoApp(page, "/app");
      await setWorld(page, "hotel");
      await selectPersona(page, new RegExp(`^${firstName}\\b`, "i"));
      const baseline = await readContext(page);
      for (const route of PRIMARY_ROUTES) {
        const { status, errors } = await gotoApp(page, route);
        if (status >= 400) {
          note({
            route,
            vertical: "hotel",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "navigate",
            expected: "HTTP < 400",
            actual: `status ${status}`,
            severity: "P0",
          });
        }
        for (const err of errors) {
          if (/favicon|Download the React DevTools/i.test(err)) continue;
          note({
            route,
            vertical: "hotel",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "console/pageerror",
            expected: "no errors",
            actual: err.slice(0, 300),
            severity: "P1",
          });
        }
        const ctx = await readContext(page);
        if (ctx.vertical !== "hotel" || ctx.persona !== baseline.persona) {
          note({
            route,
            vertical: "hotel",
            persona: baseline.persona,
            scope: baseline.scope,
            viewport: vp,
            interaction: "context persistence",
            expected: `hotel · ${baseline.persona}`,
            actual: `${ctx.vertical} · ${ctx.persona}`,
            severity: "P0",
          });
        }
        expect(await activeNavCount(page)).toBe(1);
      }
    }
    const p0 = issues.filter((i) => i.severity === "P0");
    expect.soft(p0).toHaveLength(0);
  });

  test("decisions · open every ledger Decision + context persists", async ({
    page,
  }) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    await selectPersona(page, /^Elena\b/i);
    const baseline = await readContext(page);

    await gotoApp(page, "/app/decisions");
    const links = page.locator('a[href^="/app/decisions/"]');
    const hrefs = [
      ...new Set(
        (await links.evaluateAll((els) =>
          els
            .map((e) => (e as HTMLAnchorElement).getAttribute("href") || "")
            .filter((h) => /^\/app\/decisions\/[^/?#]+$/.test(h)),
        )).slice(0, 24),
      ),
    ];
    writeFileSync(join(ART, "decision-links.json"), JSON.stringify(hrefs, null, 2));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const { status, errors } = await gotoApp(page, href);
      if (status >= 400) {
        note({
          route: href,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "open decision",
          expected: "HTTP < 400",
          actual: `status ${status}`,
          severity: "P0",
        });
      }
      for (const err of errors) {
        if (/favicon|Download the React DevTools/i.test(err)) continue;
        note({
          route: href,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "console/pageerror",
          expected: "no errors",
          actual: err.slice(0, 300),
          severity: "P1",
        });
      }
      const ctx = await readContext(page);
      if (ctx.persona !== baseline.persona) {
        note({
          route: href,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "persona persistence from decision",
          expected: baseline.persona,
          actual: ctx.persona,
          severity: "P0",
        });
      }
      // Parent nav should mark Decisions active
      const nav = await activeNavLabel(page);
      if (!/decision/i.test(nav)) {
        note({
          route: href,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "active nav parent",
          expected: "Decisions aria-current",
          actual: nav || "(none)",
          severity: "P1",
        });
      }
    }

    // Flagship deep links from multiple entry assumptions
    for (const id of ["dec_peak_berlin", "dec_menu_peak_berlin", "dec_supplier_berlin"]) {
      await gotoApp(page, `/app/decisions/${id}`);
      const ctx = await readContext(page);
      if (ctx.persona !== baseline.persona) {
        note({
          route: `/app/decisions/${id}`,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "flagship deep link persona",
          expected: baseline.persona,
          actual: ctx.persona,
          severity: "P0",
        });
      }
    }

    expect.soft(issues.filter((i) => i.severity === "P0")).toHaveLength(0);
  });

  test("locations · open every row + retain persona", async ({ page }) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    await selectPersona(page, /^Elena\b/i);
    const baseline = await readContext(page);
    await gotoApp(page, "/app/locations");
    const hrefs = [
      ...new Set(
        await page
          .locator('a[href^="/app/locations/"]')
          .evaluateAll((els) =>
            els
              .map((e) => (e as HTMLAnchorElement).getAttribute("href") || "")
              .filter((h) => /^\/app\/locations\/[^/?#]+$/.test(h)),
          ),
      ),
    ].slice(0, 12);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      await gotoApp(page, href);
      const ctx = await readContext(page);
      if (ctx.persona !== baseline.persona) {
        note({
          route: href,
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "location deep link persona",
          expected: baseline.persona,
          actual: ctx.persona,
          severity: "P0",
        });
      }
      await page.screenshot({
        path: join(
          ART,
          `location-${href.split("/").pop()}.png`,
        ),
      });
    }
    expect.soft(issues.filter((i) => i.severity === "P0")).toHaveLength(0);
  });

  test("Ask RADR · open close Escape Cmd+K layer", async ({ page }) => {
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    const askBtn = page.getByRole("button", { name: /Ask RADR/i }).first();
    await expect(askBtn).toBeVisible();
    await askBtn.click();
    const dialog = page.locator('.rp-ask-panel').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: join(ART, "ask-radr-open.png") });
    // Opaque check on the panel surface (not the transparent backdrop wrapper)
    if (await dialog.count()) {
      const bg = await dialog.evaluate((el) => getComputedStyle(el).backgroundColor);
      const rgba = bg.match(/rgba?\(([^)]+)\)/);
      if (rgba) {
        const parts = rgba[1]!.split(",").map((p) => p.trim());
        const a = parts.length === 4 ? Number(parts[3]) : 1;
        if (a < 0.85) {
          note({
            route: "/app",
            vertical: "restaurant",
            persona: "?",
            scope: "?",
            viewport: "default",
            interaction: "Ask RADR surface",
            expected: "opaque panel",
            actual: `bg=${bg}`,
            severity: "P1",
          });
        }
      }
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // Re-open via shortcut
    await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
  });

  test("settings · every section + single persona control", async ({ page }) => {
    const vp = `${page.viewportSize()?.width}x${page.viewportSize()?.height}`;
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    await selectPersona(page, /^Nora\b/i);
    const baseline = await readContext(page);
    await gotoApp(page, "/app/settings");
    const sections = page.locator(
      '.rp-settings-nav a, .rp-settings-nav button, [data-settings-nav] button, .rp-settings-side button',
    );
    const count = await sections.count();
    const max = Math.min(count, 12);
    for (let i = 0; i < max; i++) {
      const el = sections.nth(i);
      if (!(await el.isVisible())) continue;
      await el.click();
      await page.waitForTimeout(200);
      const ctx = await readContext(page);
      if (ctx.persona !== baseline.persona) {
        note({
          route: page.url(),
          vertical: "restaurant",
          persona: baseline.persona,
          scope: baseline.scope,
          viewport: vp,
          interaction: "settings section click",
          expected: baseline.persona,
          actual: ctx.persona,
          severity: "P0",
        });
      }
    }
    // Demo persona control should exist once in demo tools
    const demoGroups = page.getByRole("group", { name: /Demo persona/i });
    const n = await demoGroups.count();
    if (n > 1) {
      note({
        route: "/app/settings",
        vertical: "restaurant",
        persona: baseline.persona,
        scope: baseline.scope,
        viewport: vp,
        interaction: "settings persona controls",
        expected: "exactly 1 Demo persona group",
        actual: `count=${n}`,
        severity: "P1",
      });
    }
    await page.screenshot({ path: join(ART, "settings.png") });
    expect.soft(issues.filter((i) => i.severity === "P0")).toHaveLength(0);
  });

  test("tables · sort headers where present", async ({ page }) => {
    await gotoApp(page, "/app");
    await setWorld(page, "restaurant");
    await selectPersona(page, /^Elena\b/i);
    await gotoApp(page, "/app/locations");
    const sortBtns = page.locator(
      '.rp-loc-sort button, th[aria-sort], button[data-sort], [role="columnheader"] button',
    );
    const n = await sortBtns.count();
    for (let i = 0; i < Math.min(n, 8); i++) {
      const btn = sortBtns.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(120);
      }
    }
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    if (overflowX) {
      note({
        route: "/app/locations",
        vertical: "restaurant",
        persona: "CFO",
        scope: "?",
        viewport: "default",
        interaction: "table layout",
        expected: "no horizontal overflow",
        actual: "overflow",
        severity: "P1",
      });
    }
  });

  test("service · tab click updates URL and selected tab", async ({ page }) => {
    await gotoApp(page, "/app/service?view=floor");
    await waitContextReady(page);
    for (const view of ["timeline", "recovery", "floor"] as const) {
      const tab = page.getByRole("tab", {
        name: new RegExp(`^${view}$`, "i"),
      });
      if (await tab.count()) {
        await tab.click();
        await page.waitForTimeout(250);
        expect(page.url()).toContain(`view=${view}`);
        await expect(tab).toHaveAttribute("aria-selected", "true");
      }
    }
    await page.goBack();
    await page.waitForTimeout(300);
    await page.goForward();
    await page.waitForTimeout(300);
  });

  test("dashboards · templates open without crash", async ({ page }) => {
    await gotoApp(page, "/app/dashboards");
    const openers = page.getByRole("link", { name: /Open|template|Duplicate/i }).or(
      page.getByRole("button", { name: /Open|Duplicate|Create/i }),
    );
    const n = await openers.count();
    for (let i = 0; i < Math.min(n, 6); i++) {
      const el = openers.nth(i);
      if (!(await el.isVisible())) continue;
      await el.click();
      await page.waitForTimeout(350);
      await waitContextReady(page).catch(() => undefined);
      // Return if left dashboards
      if (!page.url().includes("/app/dashboards")) {
        await gotoApp(page, "/app/dashboards");
      }
    }
    await page.screenshot({ path: join(ART, "dashboards.png") });
  });
});
