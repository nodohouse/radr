import { test, expect, type Page } from "playwright/test";
const PEOPLE = [
  { name: "Alex", role: "gm", width: 1512, task: "brief" },
  { name: "Jordan", role: "cfo", width: 1440, task: "performance" },
  { name: "Morgan", role: "coo", width: 1280, task: "decisions" },
  { name: "Taylor", role: "owner", width: 1024, task: "intelligence" },
  { name: "Casey", role: "gm", width: 820, task: "live" },
  { name: "Riley", role: "gm", width: 768, task: "house" },
  { name: "Avery", role: "cfo", width: 430, task: "value" },
  { name: "Quinn", role: "gm", width: 390, task: "intake" },
  { name: "Cameron", role: "gm", width: 1920, task: "layout" },
  { name: "Robin", role: "owner", width: 3840, task: "settings" },
] as const;
const TASK_ROUTES: Record<string, string[]> = {
  brief: ["/app", "/app/data-health"],
  performance: ["/app", "/app/locations"],
  decisions: ["/app/decisions", "/app/memory"],
  intelligence: ["/app/intelligence", "/app/memory"],
  live: ["/app/live", "/app/service"],
  house: ["/app/house", "/app/service"],
  value: ["/app/value", "/app/decisions"],
  intake: ["/app/connections", "/app/connections/import"],
  layout: ["/app/live/plan", "/app/live"],
  settings: ["/app/settings", "/app/data-health"],
};
async function audit(page: Page, step: string) {
  const result = await page.evaluate(() => {
    const visible = (e: Element) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      return (
        r.width > 25 &&
        r.height > 8 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        !e.closest('[hidden],[aria-hidden="true"]')
      );
    };
    const clipped = [
      ...document.querySelectorAll(
        "main h1,main h2,main h3,main p,main summary,main button",
      ),
    ]
      .filter(visible)
      .filter((e) => {
        const s = getComputedStyle(e);
        return (
          ["hidden", "clip"].includes(s.overflowY) &&
          e.scrollHeight > e.clientHeight + 4 &&
          s.textOverflow !== "ellipsis" &&
          !/^[1-9]/.test(s.webkitLineClamp)
        );
      })
      .map((e) => ({
        tag: e.tagName,
        cls: e.className,
        text: e.textContent?.slice(0, 70),
      }));
    const collisions: string[] = [];
    for (const parent of document.querySelectorAll(
      "main header,main .ep-metrics,main .cc-priority,main .ws-focus,main .intake-section-top",
    )) {
      const els = [...parent.children]
        .filter(visible)
        .filter(
          (e) => !["absolute", "fixed"].includes(getComputedStyle(e).position),
        );
      for (let i = 0; i < els.length; i++)
        for (let j = i + 1; j < els.length; j++) {
          const a = els[i].getBoundingClientRect(),
            b = els[j].getBoundingClientRect();
          if (
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4
          )
            collisions.push(`${els[i].className} overlaps ${els[j].className}`);
        }
    }
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      clipped,
      collisions,
    };
  });
  await test.info().attach(`layout-${step}`, {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
  expect(result.overflow, `${step}: horizontal overflow`).toBeLessThanOrEqual(
    1,
  );
  expect(result.clipped, `${step}: clipped text`).toEqual([]);
  expect(result.collisions, `${step}: colliding modules`).toEqual([]);
}
async function explore(page: Page, path: string) {
  await page.goto(path + (path.includes("?") ? "&" : "?") + "stay=1", {
    waitUntil: "domcontentloaded",
  });
  await page.locator("h1").first().waitFor();
  await page.locator("[data-context-ready=true]").waitFor();
  await page.mouse.move(300, 300);
  await page.mouse.wheel(0, 650);
  await page.mouse.wheel(0, 1300);
  await page.mouse.wheel(0, -2400);
  const controls = page.locator(
    "main button:visible,main a:visible,main summary:visible",
  );
  for (let i = 0; i < Math.min(5, await controls.count()); i++) {
    const control = controls.nth(i);
    if (await control.isEnabled()) await control.hover({ timeout: 3000 });
  }
  await page.mouse.move(350, 80);
  await audit(page, path);
}
for (const world of ["restaurant", "hotel"] as const)
  for (const person of PEOPLE) {
    test(`${world} · ${person.name} · ${person.role} · ${person.width}px · ${person.task}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: person.width,
        height: person.width === 3840 ? 2160 : 982,
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(() =>
        localStorage.setItem(
          "radr.cookie-preferences.v1",
          JSON.stringify({
            version: 1,
            necessary: true,
            analytics: false,
            marketing: false,
            savedAt: new Date().toISOString(),
          }),
        ),
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/en/demo");
      await page
        .getByRole("button", {
          name: world === "hotel" ? "Hotel group" : "Restaurant group",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/app\?stay=1/);
      await page.locator("[data-context-ready=true]").waitFor();
      await page.evaluate(
        ({ world, role }) => {
          const loc =
            world === "hotel" ? "loc_canal_house" : "loc_berlin_mitte";
          localStorage.setItem(
            "radr.prefs.v1",
            JSON.stringify({
              roleView: world === "hotel" && role === "gm" ? "hotel_gm" : role,
              defaultLocationId: loc,
            }),
          );
          sessionStorage.setItem(
            "radr.scope.v1",
            JSON.stringify({
              locationScope: ["cfo", "coo", "owner"].includes(role)
                ? "all"
                : loc,
              period: "today",
              lens: "operate",
              serviceTime: "now",
            }),
          );
        },
        { world, role: person.role },
      );
      await page.reload();
      await page.locator("[data-context-ready=true]").waitFor();
      // Every simulated user opens the real navigation and follows a destination.
      if (person.width < 1100)
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
      else
        await page
          .getByRole("complementary", { name: "RADR workspace", exact: true })
          .hover();
      await page
        .getByRole("navigation", { name: "Primary", exact: true })
        .getByRole("link", { name: "Decisions", exact: true })
        .click();
      await expect(page).toHaveURL(/\/app\/decisions/);
      for (const route of TASK_ROUTES[person.task]) await explore(page, route);
      if (person.task === "brief" || person.task === "performance") {
        await explore(page, "/app");
        await page.locator(".ep-metrics>button").last().click();
        const dialog = page.getByRole("dialog", {
          name: "Performance detail",
          exact: true,
        });
        await expect(dialog).toBeVisible();
        for (const tab of ["Contribution", "Locations", "Revenue trend"])
          await dialog.getByRole("button", { name: tab, exact: true }).click();
        await dialog.locator(".dp-sensitivity summary").click();
        const slider = dialog.getByRole("slider", {
          name: "Remaining revenue variation",
          exact: true,
        });
        await slider.focus();
        await slider.press("End");
        await expect(slider).toHaveValue("30");
        await dialog
          .getByRole("button", {
            name: "Close performance details",
            exact: true,
          })
          .click();
        await expect(dialog).toBeHidden();
      } else if (person.task === "decisions") {
        await explore(page, "/app/decisions");
        await page
          .getByRole("button", { name: /All decisions/ })
          .first()
          .click();
        await page
          .getByRole("combobox", { name: "Order decisions", exact: true })
          .selectOption("evidence");
        const search = page.getByRole("textbox", {
          name: "Find a decision",
          exact: true,
        });
        await search.fill("no-match-fictional-user");
        await expect(
          page.getByText("No decisions in this view.", { exact: true }),
        ).toBeVisible();
        await search.fill("");
        await page.locator(".rd-record").first().click();
        await expect(page.getByTestId("decision-workbench")).toBeVisible();
        for (const name of ["Why", "Futures", "Action", "Verification"])
          await page
            .getByTestId("decision-workbench")
            .getByRole("button", { name, exact: true })
            .click();
      } else if (person.task === "intelligence") {
        await explore(page, "/app/intelligence");
        const desk = page.getByTestId("intelligence-desk");
        for (const name of ["BUY", "LABOR", "SELL", "RECOVER", "All lenses"])
          await desk
            .getByRole("button", { name, exact: false })
            .first()
            .click();
      } else if (person.task === "live") {
        if (world === "restaurant") {
          await explore(page, "/app/live");
          await page.locator('[data-layout-item="t8"]').click();
          await expect(page.locator(".simp-critical-needs")).toContainText(
            "Sesame",
          );
          for (const name of ["Notes", "Timeline"])
            await page.getByRole("tab", { name, exact: true }).click();
        } else {
          await explore(page, "/app/live?level=property&floor=3&room=310");
          const inspector = page.getByRole("complementary", {
            name: "Room 310",
            exact: true,
          });
          await expect(inspector.getByTestId("room-guest-brief")).toContainText(
            "Shellfish",
          );
          for (const name of ["Guests", "History"])
            await inspector.getByRole("tab", { name, exact: true }).click();
        }
      } else if (person.task === "house") {
        await explore(page, "/app/house");
        const nav = page.getByRole("navigation", {
          name: "Back of house views",
        });
        for (const name of ["Stock", "Deliveries", "Captures", "Waste"]) {
          await nav.getByRole("button", { name, exact: true }).click();
          await expect(
            nav.getByRole("button", { name, exact: true }),
          ).toHaveClass("is-active");
        }
      } else if (person.task === "value") {
        await explore(page, "/app/value");
        const ledger = page.getByTestId("outcome-ledger");
        await ledger
          .getByRole("button", { name: "All records", exact: true })
          .click();
        const search = ledger.getByRole("textbox", {
          name: "Search outcome records",
          exact: true,
        });
        await search.fill("no-match-fictional-user");
        await expect(ledger).toContainText("No outcome records");
        await search.fill("");
      } else if (person.task === "intake") {
        await explore(page, "/app/connections/import");
        await page
          .getByLabel("Dataset", { exact: true })
          .selectOption(world === "hotel" ? "rooms" : "invoices");
        await page
          .getByRole("button", { name: "Try example data", exact: true })
          .click();
        await expect(
          page.getByText("Structure checks passed", { exact: true }),
        ).toBeVisible();
      } else if (person.task === "layout") {
        await explore(page, "/app/live/plan");
        const item = page.locator("[data-layout-item]").first();
        await item.scrollIntoViewIfNeeded();
        const before = await item.getAttribute("transform"),
          box = await item.boundingBox();
        if (!box) throw Error("Furniture unavailable");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          box.x + box.width / 2 + 60,
          box.y + box.height / 2 + 35,
          { steps: 12 },
        );
        await page.mouse.up();
        await expect(item).not.toHaveAttribute("transform", before!);
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(item).toHaveAttribute("transform", before!);
      } else if (person.task === "settings") {
        await explore(page, "/app/settings");
        for (const id of [
          "context",
          "access",
          "policies",
          "notifications",
          "audit",
        ]) {
          const item = page.locator(`[data-settings-nav-item="${id}"]`);
          if (await item.count()) await item.click();
        }
      }
      await audit(page, "after-interactions");
      expect(errors).toEqual([]);
      await page.screenshot({
        path: test.info().outputPath(`${world}-${person.name}.png`),
        fullPage: true,
      });
    });
  }
