import { expect, test } from "playwright/test";
import path from "node:path";

test.describe("Hotel Live PASS 2 — Daylight Rooms", () => {
  test("Canal House Floor 3 · Room 310 @ 1512×982", async ({ page }) => {
    test.setTimeout(90_000);

    await page.addInitScript(() => {
      sessionStorage.setItem(
        "radr.demoOrg.v1",
        JSON.stringify({ vertical: "hotel", orgId: "org_northstar_hotels" }),
      );
      localStorage.setItem(
        "radr.prefs.v1",
        JSON.stringify({
          defaultLocationId: "loc_canal_house",
          roleView: "gm",
          timeFormat: "24h",
        }),
      );
    });

    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto("/app/live", { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-page=hotel-live]")).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByRole("heading", { name: /Mercer House · New York/i }),
    ).toBeVisible();
    await expect(page.getByText("89%").first()).toBeVisible();
    await expect(page.getByText("31 / 42").first()).toBeVisible();
    await expect(page.getByText("€1,840").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Room 310" })).toBeVisible();
    await expect(page.getByText("Michael Tan")).toBeVisible();
    const wave = page.getByText("Arrival wave");
    await expect(wave).toBeVisible();
    await expect(wave).toBeInViewport();
    await expect(page.getByRole("button", { name: "Prioritize Room" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reassign Staff" })).toBeVisible();
    await expect(page.locator(".hl-tile").first()).toBeVisible();
    await expect(page.locator(".hl-sim-bar")).toHaveCount(0);

    // Every Floor 3 room tile must sit fully inside the plan box
    const clipped = await page.evaluate(() => {
      const plan = document.querySelector(".hl-plan");
      if (!plan) return ["no-plan"];
      const pr = plan.getBoundingClientRect();
      return [...document.querySelectorAll(".hl-tile")]
        .filter((t) => {
          const r = t.getBoundingClientRect();
          return (
            r.bottom > pr.bottom + 2 ||
            r.top < pr.top - 2 ||
            r.right > pr.right + 2 ||
            r.left < pr.left - 2
          );
        })
        .map((t) => (t as HTMLElement).innerText.trim().split("\n")[0]);
    });
    expect(clipped).toEqual([]);

    // Outer cards share the same left/right edges (map+inspector stack ↔ wave)
    const edges = await page.evaluate(() => {
      const box = (sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { l: Math.round(r.left), r: Math.round(r.right) };
      };
      return {
        body: box(".hl-body"),
        wave: box(".hl-wave"),
        map: box(".hl-map-card"),
        insp: box(".hl-inspector"),
      };
    });
    expect(edges.body?.l).toBe(edges.wave?.l);
    expect(edges.body?.r).toBe(edges.wave?.r);
    expect(edges.map?.l).toBe(edges.wave?.l);
    expect(edges.insp?.r).toBe(edges.wave?.r);

    await page.screenshot({
      path: path.join("tmp", "hotel-live-pass2-1512x982.png"),
      fullPage: false,
    });
  });
});
