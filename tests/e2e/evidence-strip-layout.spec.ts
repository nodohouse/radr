import { test, expect } from "playwright/test";

// Open every route in a fresh page. Visiting Control Center first can mask a
// missing shared stylesheet because Next retains CSS from previous routes.
for (const vertical of ["restaurant", "hotel"] as const) {
  for (const width of [390, 820, 1512]) {
    test(`${vertical}: evidence strips on direct page loads at ${width}px`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 982 },
      });
      await context.addInitScript(
        ({ vertical }) => {
          sessionStorage.setItem(
            "radr.demoOrg.v1",
            JSON.stringify({ vertical }),
          );
          localStorage.setItem(
            "radr.cookie-preferences.v1",
            JSON.stringify({
              version: 1,
              necessary: true,
              analytics: false,
              marketing: false,
              savedAt: new Date().toISOString(),
            }),
          );
        },
        { vertical },
      );
      let checked = 0;
      try {
        for (const route of [
          "live",
          "decisions",
          "service",
          "house",
          "intelligence",
          "value",
          "memory",
        ]) {
          const page = await context.newPage();
          await page.goto(`/app/${route}?stay=1`);
          await page.locator("[data-context-ready=true]").waitFor();
          const strips = page.locator(".ws-source-quality:visible");
          for (let i = 0; i < (await strips.count()); i++) {
            const strip = strips.nth(i);
            await strip.scrollIntoViewIfNeeded();
            const geometry = await strip.evaluate((el) => {
              const box = el.getBoundingClientRect();
              const summary =
                el.querySelector<HTMLElement>(".ws-source-summary")!;
              const link = el.querySelector("a")!;
              const a = summary.getBoundingClientRect(),
                b = link.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(summary);
              const rects = [...range.getClientRects()].filter(
                (r) => r.width > 0,
              );
              const s = getComputedStyle(el);
              return {
                padding: [
                  s.paddingTop,
                  s.paddingRight,
                  s.paddingBottom,
                  s.paddingLeft,
                ].map(parseFloat),
                textInside: rects.every(
                  (r) =>
                    r.left >= box.left + 15 &&
                    r.right <= box.right - 15 &&
                    r.top >= box.top + 10 &&
                    r.bottom <= box.bottom - 10,
                ),
                linkInside:
                  b.left >= box.left + 15 &&
                  b.right <= box.right - 15 &&
                  b.top >= box.top + 10 &&
                  b.bottom <= box.bottom - 10,
                collides:
                  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
                overflow:
                  el.scrollWidth > el.clientWidth + 1 ||
                  el.scrollHeight > el.clientHeight + 1,
              };
            });
            expect(
              geometry.padding.every((p) => p >= 12),
              `${route}: padded on every side`,
            ).toBe(true);
            expect(
              geometry.textInside,
              `${route}: text stays inside safe gutters`,
            ).toBe(true);
            expect(
              geometry.linkInside,
              `${route}: evidence link stays inside safe gutters`,
            ).toBe(true);
            expect(
              geometry.collides,
              `${route}: summary and evidence link overlap`,
            ).toBe(false);
            expect(geometry.overflow, `${route}: strip content overflows`).toBe(
              false,
            );
            checked++;
            await strip.screenshot({
              path: test.info().outputPath(`${route}-strip.png`),
              animations: "disabled",
              timeout: 15000,
            });
          }
          await page.close();
        }
        expect(checked).toBeGreaterThanOrEqual(4);
      } finally {
        await context.close();
      }
    });
  }
}
