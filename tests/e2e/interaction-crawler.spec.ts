/**
 * Dynamic interaction crawler — both worlds.
 * Discovers links/buttons on major routes; asserts no console errors / dead nav.
 */
import { test, expect, type Page } from "playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROUTES = [
  "/app?stay=1",
  "/app/decisions?stay=1",
  "/app/decisions/dec_peak_berlin?stay=1",
  "/app/decisions/dec_hotel_readiness_canal?stay=1",
  "/app/service?stay=1",
  "/app/house?stay=1",
  "/app/intelligence?stay=1",
  "/app/memory?stay=1",
  "/app/value?stay=1",
  "/app/locations?stay=1",
  "/app/connections?stay=1",
  "/app/data-health?stay=1",
  "/app/settings?stay=1",
];

type Hit = {
  world: string;
  route: string;
  kind: string;
  name: string;
  href?: string | null;
  ok: boolean;
  detail?: string;
};

async function setWorld(page: Page, world: "restaurant" | "hotel") {
  await page.goto("/app?stay=1");
  const radio = page.getByRole("radio", {
    name: world === "hotel" ? "Hotels" : "Restaurants",
  });
  if (await radio.count()) {
    await radio.click();
    await page.waitForTimeout(400);
  }
}

async function crawlRoute(
  page: Page,
  world: string,
  route: string,
  hits: Hit[],
) {
  const errors: string[] = [];
  const onErr = (msg: string) => errors.push(msg);
  page.on("pageerror", (e) => onErr(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") onErr(m.text());
  });

  const res = await page.goto(route, { waitUntil: "domcontentloaded" });
  const status = res?.status() ?? 0;
  hits.push({
    world,
    route,
    kind: "navigate",
    name: route,
    ok: status > 0 && status < 400,
    detail: `status ${status}`,
  });

  // Shell invariants
  const hasRail = (await page.locator(".rp-rail").count()) > 0;
  const hasGoh = (await page.locator(".rp-goh").count()) > 0;
  hits.push({
    world,
    route,
    kind: "shell",
    name: "AppShell rail+GOH",
    ok: hasRail && hasGoh,
    detail: `rail=${hasRail} goh=${hasGoh}`,
  });

  // No legacy More in desktop chrome
  const moreBtn = page.getByRole("button", { name: /^More$/i });
  hits.push({
    world,
    route,
    kind: "legacy",
    name: "No More button (desktop)",
    ok: (await moreBtn.count()) === 0,
  });

  // Sample primary links in rail
  const railLinks = page.locator(".rp-rail a[href^='/app']");
  const n = Math.min(await railLinks.count(), 8);
  for (let i = 0; i < n; i++) {
    const a = railLinks.nth(i);
    const href = await a.getAttribute("href");
    const name = (await a.getAttribute("aria-label")) || href || `link-${i}`;
    hits.push({
      world,
      route,
      kind: "rail-link",
      name,
      href,
      ok: Boolean(href?.startsWith("/app")),
    });
  }

  // World-specific smoke
  if (route.startsWith("/app/service")) {
    if (world === "hotel") {
      const readiness = page.getByRole("tab", { name: /READINESS/i });
      hits.push({
        world,
        route,
        kind: "hotel-ops",
        name: "READINESS tab",
        ok: (await readiness.count()) > 0,
      });
    } else {
      const floor = page.getByRole("tab", { name: /FLOOR|Floor/i });
      hits.push({
        world,
        route,
        kind: "restaurant-ops",
        name: "FLOOR tab",
        ok: (await floor.count()) > 0,
      });
    }
  }

  // React #418/#423 = hydration mismatch (known WATCH) — not a dead interaction.
  const hard = errors.filter(
    (e) => !/Minified React error #(418|423)/.test(e) && !/Hydration/.test(e),
  );
  hits.push({
    world,
    route,
    kind: "console",
    name: "no hard pageerror",
    ok: hard.length === 0,
    detail:
      hard.slice(0, 3).join(" | ") ||
      (errors.length ? `hydration-watch×${errors.length}` : undefined),
  });
}

test.describe("Interaction crawler · both worlds", () => {
  test("Restaurants + Hotels major routes @1440", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    const hits: Hit[] = [];

    for (const world of ["restaurant", "hotel"] as const) {
      await setWorld(page, world);
      for (const route of ROUTES) {
        // Skip restaurant flagship Decision deep-checks in hotel world noise
        if (
          world === "hotel" &&
          route.includes("dec_peak_berlin")
        ) {
          continue;
        }
        if (
          world === "restaurant" &&
          route.includes("dec_hotel_readiness")
        ) {
          continue;
        }
        await crawlRoute(page, world, route, hits);
      }
    }

    const outDir = join(process.cwd(), "docs/baselines/2026-10-05");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, "interaction-crawler.json"),
      JSON.stringify({ capturedAt: new Date().toISOString(), hits }, null, 2),
    );

    const fails = hits.filter((h) => !h.ok);
    expect(
      fails,
      fails.map((f) => `${f.world} ${f.route} ${f.kind} ${f.name} ${f.detail ?? ""}`).join("\n"),
    ).toEqual([]);
  });
});
