/**
 * Collision QA — boundingClientRect intersections must be zero
 * on critical product surfaces × viewports.
 */
import { test, expect, type Page } from "playwright/test";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 },
  { name: "430", width: 430, height: 932 },
  { name: "390", width: 390, height: 844 },
] as const;

const CRITICAL_PATHS = [
  "/app?stay=1",
  "/app/service?stay=1",
  "/app/house?stay=1",
  "/app/settings?section=policies&policy=service_capacity&stay=1",
  "/app/decisions/dec_peak_berlin?stay=1",
  "/app/value?stay=1",
  "/app/locations?stay=1",
] as const;

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

async function countOverlaps(page: Page): Promise<number> {
  return page.evaluate(() => {
    // Top-level composition only — nested metric stacks are intentional.
    const selectors = [
      "[data-stage='command']",
      ".rp-cock-mod",
      ".rp-smap-head",
      ".rp-smap-toolbar",
      ".rp-smap-layout > *",
      ".rp-settings-nav",
      ".rp-settings-panel",
      ".rp-drec-econ-hero",
      ".rp-house-head",
    ];
    const nodes: HTMLElement[] = [];
    for (const sel of selectors) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 12 || r.height < 12) return;
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return;
        nodes.push(el);
      });
    }
    let hits = 0;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!.getBoundingClientRect();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!.getBoundingClientRect();
        if (nodes[i]!.contains(nodes[j]!) || nodes[j]!.contains(nodes[i]!)) {
          continue;
        }
        const overlapX = Math.max(
          0,
          Math.min(a.right, b.right) - Math.max(a.left, b.left),
        );
        const overlapY = Math.max(
          0,
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
        );
        if (overlapX > 12 && overlapY > 12) hits += 1;
      }
    }
    return hits;
  });
}

test.describe("Collision QA", () => {
  for (const vp of VIEWPORTS) {
    test(`no critical overlaps @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await enterRestaurant(page);
      for (const path of CRITICAL_PATHS) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(250);
        const hits = await countOverlaps(page);
        expect(hits, `overlaps on ${path} @ ${vp.name}`).toBe(0);
      }
    });
  }
});

test.describe("Settings policy deep-link from Decision", () => {
  test("D-1911 SERVICE CAPACITY opens Policies not Organization", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/decisions/dec_peak_berlin?stay=1", {
      waitUntil: "domcontentloaded",
    });
    await page.locator('a[href*="policy=service_capacity"]').first().click();
    await expect(page).toHaveURL(/section=policies/);
    await expect(page).toHaveURL(/policy=service_capacity/);
    await expect(
      page.getByRole("heading", { name: /Policies/i }),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="service_capacity"]'),
    ).toHaveAttribute("data-highlight", "true");
    await expect(
      page.getByRole("heading", { name: /^Organization$/i }),
    ).toHaveCount(0);
  });

  test("D-8204 SUPPLIER EMERGENCY opens exact policy", async ({ page }) => {
    await enterRestaurant(page);
    await page.goto("/app/decisions/dec_caster_sugar_berlin?stay=1", {
      waitUntil: "domcontentloaded",
    });
    await page
      .locator('a[href*="policy=supplier_emergency"]')
      .first()
      .click();
    await expect(page).toHaveURL(/policy=supplier_emergency/);
    await expect(
      page.locator('[data-policy-id="supplier_emergency"]'),
    ).toHaveAttribute("data-highlight", "true");
  });
});

test.describe("Command Stage", () => {
  test("CC shows editorial stage without duplicate NEED YOUR JUDGMENT band", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-stage="command"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /3 need your judgment/i }),
    ).toBeVisible();
    await expect(page.getByText(/146\s+evaluated/i)).toBeVisible();
    await expect(page.getByText(/141\s+cleared/i)).toBeVisible();
    await expect(page.getByText(/REVIEW NOW/i)).toBeVisible();
    // Old duplicate band label must be gone (Command Stage owns the headline).
    await expect(
      page.locator(".rp-handoff-count").getByText(/NEED YOUR JUDGMENT/i),
    ).toHaveCount(0);
  });
});
