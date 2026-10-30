/**
 * Promotion closeout QA — BOH sugar · Service Map · Settings · economics.
 */
import { test, expect, type Page } from "playwright/test";
import {
  clickSettingsNav,
  gotoSettings,
} from "./helpers/settings";

async function enterRestaurant(page: Page) {
  await page.context().addCookies([
    { name: "radr_e2e", value: "1", domain: "127.0.0.1", path: "/" },
    { name: "radr_e2e", value: "1", domain: "localhost", path: "/" },
  ]);
  await page.goto("/app/enter", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Restaurant group/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => undefined);
}

/** Expand caster sugar gap and wait for Futures. */
async function expandCasterSugar(page: Page) {
  const row = page.locator('[data-gap-id="gap_sugar_berlin"]');
  await expect(row).toBeVisible();
  for (let i = 0; i < 3; i++) {
    if ((await row.getAttribute("data-open")) === "true") break;
    await row.getByRole("button").click();
    await page.waitForTimeout(150);
  }
  await expect(row).toHaveAttribute("data-open", "true");
  await expect(
    row.locator(".rp-house-futures strong", { hasText: /^Emergency top-up$/ }),
  ).toBeVisible();
}

test.describe("Promotion closeout", () => {
  test("BOH D-8204 sugar · futures deep-link · historical verified · approve", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/house?stay=1", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /House standards/i }),
    ).toBeVisible();
    await expandCasterSugar(page);
    const review = page.getByRole("link", {
      name: /Review \/ approve Decision/i,
    });
    await expect(review).toHaveAttribute(
      "href",
      "/app/decisions/dec_caster_sugar_berlin",
    );
    await expect(page.getByText(/HISTORICAL VERIFIED OUTCOME/i)).toBeVisible();
    await expect(page.getByText(/Emergency sugar transfer/i)).toHaveCount(0);

    await review.click();
    await expect(page).toHaveURL(/\/app\/decisions\/dec_caster_sugar_berlin/);
    await expect(page.getByText(/D-8204/i).first()).toBeVisible();

    const policy = page.getByRole("link", {
      name: /SUPPLIER EMERGENCY ORDER/i,
    });
    await expect(policy).toHaveAttribute("href", /policy=supplier_emergency/);
    await policy.click();
    await expect(page).toHaveURL(/section=policies/);
    await expect(page).toHaveURL(/policy=supplier_emergency/);
    await expect(
      page.getByRole("heading", { name: /Policies/i }),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="supplier_emergency"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="supplier_emergency"]'),
    ).toHaveAttribute("data-highlight", "true");

    await page.goto("/app/decisions/dec_caster_sugar_berlin?stay=1", {
      waitUntil: "domcontentloaded",
    });
    const approve = page.getByRole("button", { name: /Approve/i }).first();
    if (await approve.isVisible()) {
      await approve.click();
      await page.goto("/app/house?stay=1", { waitUntil: "domcontentloaded" });
      await expandCasterSugar(page);
      await expect(
        page.getByText(/RADR handling|Verifying|Verified/i).first(),
      ).toBeVisible();
    }
  });

  test("Service Map · times · modes · tables · D-1911 · replay", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await page.goto("/app/service?stay=1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Floor/i })).toBeVisible();
    await expect(page.getByText(/empty table ≠ free/i)).toBeVisible();
    await page.getByRole("tab", { name: "NOW" }).click();
    await page.getByRole("tab", { name: "Occupancy" }).click();
    await page.getByRole("tab", { name: "Revenue" }).click();
    await page.getByRole("tab", { name: "Pressure" }).click();
    await page.getByRole("tab", { name: "Turns" }).click();
    await page.getByRole("tab", { name: "Pressure" }).click();
    await expect(page.getByText(/current|projected/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Table 6/i }).click();
    await expect(page.getByText(/38 inbound covers in 22m/i)).toBeVisible();
    await expect(page.getByText(/WAIT 12 MIN/i)).toBeVisible();
    await expect(
      page.getByText(/incremental vs seat-now/i).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /D-1911/i })).toBeVisible();
    const replay = page.getByRole("button", { name: /Replay/i });
    if (await replay.isVisible()) {
      await replay.click();
    }

    await page.getByRole("link", { name: /D-1911/i }).click();
    await expect(page).toHaveURL(/dec_peak_berlin/);
    const svcPolicy = page.getByRole("link", { name: /^SERVICE CAPACITY$/i });
    await expect(svcPolicy).toHaveAttribute("href", /policy=service_capacity/);
    await svcPolicy.click();
    await expect(page).toHaveURL(/section=policies/);
    await expect(page).toHaveURL(/policy=service_capacity/);
    await expect(
      page.locator('[data-policy-id="service_capacity"]'),
    ).toHaveAttribute("data-highlight", "true");
    await expect(page.getByText(/APPROVAL REQUIRED/i).first()).toBeVisible();
  });

  test("Settings · every nav · policies · users · autonomy persist", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await gotoSettings(page, "/app/settings?stay=1");

    const sectionIds = [
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
      "connections",
      "data-health",
      "preferences",
      "security",
    ];
    for (const id of sectionIds) {
      await clickSettingsNav(page, id);
      await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    }

    await clickSettingsNav(page, "locations");
    await expect(page.getByText(/Soho · New York/i).first()).toBeVisible();
    await expect(page.getByText(/Europe\/Berlin/i).first()).toBeVisible();
    await expect(page.getByText(/11:30–23:00/i).first()).toBeVisible();

    await clickSettingsNav(page, "policies");
    await expect(
      page.locator('[data-policy-id="service_capacity"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="supplier_emergency"]'),
    ).toBeVisible();
    await expect(page.locator('[data-policy-id="menu_price"]')).toBeVisible();
    await expect(
      page.locator('[data-policy-id="delivery_throttle"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="labor_rebalance"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="housekeeping_reassign"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="hotel_channel_hold"]'),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-policy-id="service_capacity"]')
        .getByText(/APPROVAL REQUIRED/i),
    ).toBeVisible();

    // Deep-link audit — Decision policy refs land on the matching card
    await gotoSettings(
      page,
      "/app/settings?section=policies&policy=labor_rebalance&stay=1",
    );
    await expect(
      page.locator('[data-policy-id="labor_rebalance"][data-highlight="true"]'),
    ).toBeVisible({ timeout: 8_000 });
    await gotoSettings(
      page,
      "/app/settings?section=policies&policy=housekeeping_reassign&stay=1",
    );
    await expect(
      page.locator(
        '[data-policy-id="housekeeping_reassign"][data-highlight="true"]',
      ),
    ).toBeVisible({ timeout: 8_000 });
    await gotoSettings(
      page,
      "/app/settings?section=policies&policy=service_capacity&stay=1",
    );
    await expect(
      page.locator('[data-policy-id="service_capacity"][data-highlight="true"]'),
    ).toBeVisible({ timeout: 8_000 });

    const gmMax = page.locator('input[type="number"]').first();
    await gmMax.fill("300");
    await page.getByRole("button", { name: /^Save$/i }).click();
    await expect(page.getByText(/Saved/i)).toBeVisible();
    await gotoSettings(page, "/app/settings?section=policies&stay=1");
    await expect(page.locator('input[type="number"]').first()).toHaveValue(
      "300",
    );

    await clickSettingsNav(page, "attention");
    await expect(
      page.getByText(/~3 Decisions need judgment/i),
    ).toBeVisible();

    await clickSettingsNav(page, "users");
    await expect(page.getByText(/Sarah Klein/i)).toBeVisible();
    await expect(page.getByText(/Marcus Chen/i)).toBeVisible();
    await expect(page.getByText(/Elena Voss/i)).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "GM Soho · New York" }),
    ).toBeVisible();

    await clickSettingsNav(page, "autonomy");
    await expect(
      page.locator("[data-autonomy-label='observe']"),
    ).toHaveText("OBSERVE");
    await expect(
      page.locator("[data-autonomy-label='auto_act']"),
    ).toHaveText("AUTO-ACT");
    const firstSelect = page
      .locator(".rp-settings-autonomy-ladder select")
      .first();
    await firstSelect.selectOption("recommend");
    await gotoSettings(page, "/app/settings?section=autonomy&stay=1");
    await expect(
      page.locator(".rp-settings-autonomy-ladder select").first(),
    ).toHaveValue("recommend");
  });

  test("Settings policy deep-link query opens exact policy", async ({
    page,
  }) => {
    await enterRestaurant(page);
    await gotoSettings(
      page,
      "/app/settings?section=policies&policy=service_capacity&stay=1",
    );
    await expect(
      page.getByRole("heading", { name: /Policies/i }),
    ).toBeVisible();
    await expect(
      page.locator('[data-policy-id="service_capacity"]'),
    ).toHaveAttribute("data-highlight", "true");

    await gotoSettings(
      page,
      "/app/settings?section=policies&policy=supplier_emergency&stay=1",
    );
    await expect(
      page.locator('[data-policy-id="supplier_emergency"]'),
    ).toHaveAttribute("data-highlight", "true");
    await expect(page.getByText(/Rush fee/i).first()).toBeVisible();
  });

  test("GM · COO · CFO persona smoke on Control Center", async ({ page }) => {
    await enterRestaurant(page);
    await page.goto("/app?stay=1", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(/need judgment|Needs you/i).first(),
    ).toBeVisible({ timeout: 15000 });
    const roleBtn = page.getByRole("button", { name: /^GM$/i }).first();
    if (await roleBtn.isVisible().catch(() => false)) {
      await roleBtn.click();
      const coo = page.getByRole("menuitem", { name: /COO/i }).or(
        page.getByRole("option", { name: /COO/i }),
      ).or(page.getByRole("button", { name: /COO/i }));
      if (await coo.first().isVisible().catch(() => false)) {
        await coo.first().click();
      }
    }
  });
});
