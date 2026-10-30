/**
 * Control Center 4.0 + Dashboard interaction audit (Playwright).
 *
 * PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
 *   npx playwright test tests/e2e/cc4-dashboard-audit.spec.ts --project=desktop-1440
 */
import { test, expect, type Page } from "playwright/test";

async function gotoApp(page: Page, path = "/app") {
  await page.context().addCookies([
    {
      name: "radr_e2e",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "radr_e2e",
      value: "1",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).not.toContainText("Application error");
  await page.evaluate(() => {
    try {
      localStorage.removeItem("radr.nav.defaultLanding.v1");
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          defaultLocationId: "loc_ber",
          roleView: "gm",
          timeFormat: "12h",
        }),
      );
      sessionStorage.setItem(
        "radr.scope.v1",
        JSON.stringify({
          locationScope: "loc_ber",
          period: "today",
          lens: "operate",
          serviceTime: "now",
          selectedFindingId: null,
        }),
      );
    } catch {
      /* ignore */
    }
  });
  await page.reload({ waitUntil: "domcontentloaded" });
}

test.describe("CC4 cockpit", () => {
  test("one-screen context + judgment CTA @ 1440", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    const greet = page.locator(".rp-cock-greet").first();
    await expect(greet).toBeVisible();
    await expect(greet).toHaveText(/Good morning/i);
    const judgment = page.locator(".rp-cock-judgment").first();
    await expect(judgment).toBeVisible();
    await expect(judgment).toHaveText(/need your judgment/i);
    await judgment.click();
    await expect(page).toHaveURL(/\/app\/decisions.*band=needs_you/);
  });

  test("Review N Decisions master CTA", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    const cta = page.locator(".rp-handoff-master").first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText(/Review \d+ Decision/i);
    await cta.click();
    await expect(page).toHaveURL(/\/app\/decisions/);
  });

  test("Live Focus deep-link + Back", async ({ page }) => {
    await gotoApp(page, "/app?stay=1&focus=live");
    await expect(page).toHaveURL(/focus=live/);
    await expect(page.locator(".rp-cc4-focus").first()).toBeVisible();
    await page.locator(".rp-cc4-focus-close").first().click();
    await expect(page).not.toHaveURL(/focus=/);
  });

  test("Performance Focus deep-link + Back", async ({ page }) => {
    await gotoApp(page, "/app?stay=1&focus=performance");
    await expect(page).toHaveURL(/focus=performance/);
    await expect(page.locator(".rp-cc4-focus").first()).toBeVisible();
    await page.locator(".rp-cc4-focus-close").first().click();
    await expect(page).not.toHaveURL(/focus=/);
  });

  test("no Overview/Live/Performance primary tabs", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveCount(0);
  });

  test("since last check + pulse interpretation", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    await expect(page.locator(".rp-cock-since").first()).toBeVisible();
    await expect(page.getByText(/NO ACTION|PROOF AVAILABLE|1 Decision/i).first()).toBeVisible();
  });

  test("calendar hover tooltip", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    const cell = page.locator(".rp-heat-cell").nth(11); // W38 Fri-ish
    await cell.hover();
    await expect(page.locator(".rp-heat-tip").first()).toBeVisible();
    await expect(page.locator(".rp-heat-tip").first()).toContainText(/Revenue|Contribution/);
  });

  test("heatmap hover across every cell updates tooltip", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    const cells = page.locator(".rp-heat-cell");
    const count = await cells.count();
    expect(count).toBe(28);
    let prev = "";
    for (let i = 0; i < count; i++) {
      await cells.nth(i).hover();
      const tip = page.locator(".rp-heat-tip").first();
      await expect(tip).toBeVisible();
      const text = await tip.innerText();
      expect(text.length).toBeGreaterThan(8);
      if (i > 0 && i % 7 !== 0) {
        expect(text).not.toBe(prev);
      }
      prev = text;
    }
  });

  test("DecisionPeek opens without reflow and closes cleanly", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/app?stay=1");
    const before = await page.evaluate(() => {
      const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: r.width, h: r.height, t: r.top, l: r.left };
    });
    await page.locator(".rp-cock-tl-dec").click();
    await expect(page.locator(".rp-peek-panel")).toBeVisible();
    const mid = await page.evaluate(() => {
      const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: r.width, h: r.height, t: r.top, l: r.left };
    });
    expect(mid).toEqual(before);
    await page.locator(".rp-peek-x").click();
    await expect(page.locator(".rp-peek-panel")).toHaveCount(0);
    await page.locator(".rp-cock-tl-dec").click();
    await expect(page.locator(".rp-peek-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".rp-peek-panel")).toHaveCount(0);
    await page.locator(".rp-cock-tl-dec").click();
    await page.locator(".rp-peek-scrim").click({ force: true });
    await expect(page.locator(".rp-peek-panel")).toHaveCount(0);
    const after = await page.evaluate(() => {
      const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
      if (!root) return null;
      const r = root.getBoundingClientRect();
      return { w: r.width, h: r.height, t: r.top, l: r.left };
    });
    expect(after).toEqual(before);
  });

  test("Menu Pulse links to Menu Intelligence", async ({ page }) => {
    await gotoApp(page, "/app?stay=1");
    await expect(page.locator(".rp-menupulse").first()).toBeVisible();
    await page.getByRole("link", { name: /Open Menu Intelligence/i }).click();
    await expect(page).toHaveURL(/\/app\/intelligence\/menu/);
    await expect(page.getByRole("tab", { name: /Best sellers/i })).toBeVisible();
    await page.getByRole("tab", { name: /Best operators/i }).click();
    await expect(page.locator(".rp-menu-action").first()).toBeVisible();
  });

  test("Menu rankings switch + basket capacity dims", async ({ page }) => {
    await gotoApp(page, "/app/intelligence/menu");
    const firstSeller = await page
      .locator(".rp-menu-rank-list strong")
      .first()
      .innerText();
    await page.getByRole("tab", { name: /Best contributors/i }).click();
    await expect(page.getByText(/Highest total contribution/i)).toBeVisible();
    const firstContrib = await page
      .locator(".rp-menu-rank-list strong")
      .first()
      .innerText();
    await page.getByRole("tab", { name: /Best operators/i }).click();
    await expect(
      page.getByText(/Highest contribution per constrained kitchen minute/i),
    ).toBeVisible();
    const firstOp = await page
      .locator(".rp-menu-rank-list strong")
      .first()
      .innerText();
    // At least one ranking order differs
    expect(
      firstSeller !== firstContrib ||
        firstContrib !== firstOp ||
        firstSeller !== firstOp,
    ).toBe(true);
    await expect(page.locator(".rp-menu-action").first()).toBeVisible();
    const pair = page.locator(".rp-menu-basket li").first();
    await pair.hover();
    await expect(pair.locator(".rp-menu-pair-dims")).toBeVisible();
    await expect(pair.getByText(/Inventory|Kitchen|Pressure/i).first()).toBeVisible();
  });

  test("Decision Room named stages + Futures primary", async ({ page }) => {
    await gotoApp(page, "/app/decisions/dec_peak_berlin");
    await expect(page.locator(".rp-drec-life-thin").first()).toBeVisible();
    await expect(page.locator(".rp-drec-life-thin").getByText("Recommendation")).toBeVisible();
    await expect(page.locator(".rp-drec-life-thin").getByText("Futures")).toBeVisible();
    await expect(page.locator(".rp-drec-life-thin").getByText("Memory")).toBeVisible();
    await expect(page.locator("#futures").first()).toBeVisible();
    await expect(page.locator(".rp-drec-matrix summary")).toContainText(
      /Exact option matrix/i,
    );
  });

  test("Year on RADR via Memory lens", async ({ page }) => {
    await gotoApp(page, "/app/memory");
    await page.getByRole("tab", { name: /Year on RADR/i }).click();
    await expect(page.locator(".rp-year").first()).toBeVisible();
    await expect(page.getByText(/Your year on RADR/i).first()).toBeVisible();
    await expect(page.getByText(/Verified Value/i).first()).toBeVisible();
  });

  test("cockpit modules stay within root bounds @ viewports", async ({
    page,
  }) => {
    const sizes = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
    ];
    for (const size of sizes) {
      await page.setViewportSize(size);
      await gotoApp(page, "/app?stay=1");
      const overflow = await page.evaluate(() => {
        const root = document.querySelector(".rp-cc4-root") as HTMLElement | null;
        if (!root) return { ok: false, reason: "no-root" };
        const rr = root.getBoundingClientRect();
        const mods = Array.from(
          root.querySelectorAll<HTMLElement>(".rp-cock-mod, .rp-cock-tl-labs li"),
        );
        for (const el of mods) {
          const r = el.getBoundingClientRect();
          if (r.right > rr.right + 2 || r.left < rr.left - 2) {
            return {
              ok: false,
              reason: el.className,
              left: r.left,
              right: r.right,
              rootL: rr.left,
              rootR: rr.right,
            };
          }
        }
        return { ok: true };
      });
      expect(overflow, JSON.stringify(overflow)).toMatchObject({ ok: true });
    }
  });
});

test.describe("Decision Ledger bands", () => {
  test("Needs judgment band visible", async ({ page }) => {
    await gotoApp(page, "/app/decisions?band=needs_you");
    await expect(
      page.locator(".rp-ledger-section[data-band='needs_you'] h2").first(),
    ).toBeVisible();
  });
});

test.describe("Dashboard system", () => {
  test("library → new → builder: add, configure, save, reload", async ({ page }) => {
    await gotoApp(page, "/app/dashboards");
    await expect(
      page.locator("[data-dashboards-engine] h1, .rp-dash-lib-head h1").first(),
    ).toBeVisible();

    await page.getByTestId("create-dashboard").click();
    await expect(page).toHaveURL(/\/app\/dashboards\/new/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Dashboard name").fill("Friday Dinner QA");
    await page.getByTestId("create-and-customize").click();
    await expect(page).toHaveURL(/\/app\/dashboards\/dash_[^/]+\/edit/, {
      timeout: 15_000,
    });
    const builder = page.getByTestId("dashboard-builder");
    await expect(builder).toBeVisible();
    await expect(page.locator(".rp-dbx-status")).toHaveAttribute(
      "data-status",
      "saved",
    );

    // Add from the library (KPIs is open by default).
    await page.getByRole("button", { name: "Add Money flow" }).click();
    await expect(page.locator("[data-wid]")).toHaveCount(1);
    await expect(page.getByTestId("widget-properties")).toBeVisible();

    // Configure: width stepper + preset.
    await page.getByRole("button", { name: "Increase Width" }).click();
    await expect(page.getByTestId("prop-w")).toHaveText("7");
    await page.getByRole("button", { name: "XL", exact: true }).click();
    await expect(page.getByTestId("prop-w")).toHaveText("12");

    // Undo / redo.
    await page.getByTestId("builder-undo").click();
    await expect(page.getByTestId("prop-w")).toHaveText("7");
    await page.getByTestId("builder-redo").click();
    await expect(page.getByTestId("prop-w")).toHaveText("12");

    // Preview hides edit chrome.
    await page.getByTestId("builder-preview").click();
    await expect(page.locator(".rp-dbx-handle")).toHaveCount(0);
    await expect(page.locator(".rp-dgrid-item")).toHaveCount(1);
    await page.getByTestId("builder-preview").click();

    await page.getByTestId("builder-save").click();
    await expect(page.locator(".rp-dbx-status")).toHaveAttribute(
      "data-status",
      "saved",
      { timeout: 5_000 },
    );

    // Reload keeps the layout.
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-wid]")).toHaveCount(1);
    await page.locator("[data-wid]").first().click({ position: { x: 40, y: 40 } });
    await expect(page.getByTestId("prop-w")).toHaveText("12");

    // Open dashboard via more menu → view mode, then pin.
    await page.getByTestId("builder-more").click();
    await page.getByTestId("builder-done").click();
    await expect(page).not.toHaveURL(/\/edit/);
    await page.getByRole("button", { name: /Pin to navigation|Pinned/i }).click();
    await expect(page.getByRole("button", { name: /Pinned/i })).toBeVisible();
  });

  test("legacy ?edit=1 redirects to the builder route", async ({ page }) => {
    await gotoApp(page, "/app/dashboards");
    await page.goto("/app/dashboards/dash_gm?edit=1", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/app\/dashboards\/dash_gm\/edit/, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("dashboard-builder")).toBeVisible();
  });

  test("dashboard edit mode via seed", async ({ page }) => {
    await gotoApp(page, "/app/dashboards");
    const id = await page.evaluate(() => {
      const key = "radr.dashboards.v1.org_northstar_restaurants";
      const dash = {
        id: `dash_qa_${Date.now().toString(36)}`,
        name: "QA Seed",
        description: "Seeded for audit",
        visibility: "PRIVATE",
        roleTemplate: null,
        widgets: [
          {
            id: "w1",
            intelligenceModuleId: "live_service",
            x: 0,
            y: 0,
            w: 8,
            h: 2,
            size: "L",
          },
        ],
        pinned: false,
        pinOrder: 99,
        updatedAt: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([dash, ...prev]));
      return dash.id;
    });
    await page.goto(`/app/dashboards/${id}/edit`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("builder-canvas")).toBeVisible();
    await expect(page.getByLabel("Search widgets")).toBeVisible();
    await expect(page.locator(".rp-dash-widget").first()).toBeVisible();
  });

  test("settings navigation preferences", async ({ page }) => {
    await gotoApp(page, "/app/settings#preferences");
    await page.locator('[data-settings-id="preferences"]').click();
    await expect(page.locator(".rp-settings-nav-dash")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByLabel(/Default start page/i)).toBeVisible();
  });

  test("settings categories are clickable", async ({ page }) => {
    await gotoApp(page, "/app/settings");
    const ids = [
      "organization",
      "locations",
      "context",
      "forecasting",
      "workforce",
      "policies",
      "autonomy",
      "attention",
      "notifications",
      "users",
      "preferences",
      "security",
    ];
    for (const id of ids) {
      await page.locator(`[data-settings-id="${id}"]`).click();
      await expect(page.locator(".rp-settings-panel")).toBeVisible();
      await expect(page.locator("#settings-panel-title")).not.toHaveText("");
    }
  });
});
