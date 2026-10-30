/**
 * Settings IA — every nav panel id has a renderer in the governance engine.
 */
import { describe, expect, it } from "vitest";
import { SETTINGS_NAV } from "@/lib/radr/product/settingsProofEngine";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Settings IA", () => {
  it("canonical nav has 12 governance sections", () => {
    expect(SETTINGS_NAV).toHaveLength(12);
    expect(SETTINGS_NAV.map((n) => n.id)).toEqual([
      "organization",
      "locations",
      "context",
      "forecasting",
      "workforce",
      "access",
      "policies",
      "autonomy",
      "attention",
      "notifications",
      "integrations",
      "audit",
    ]);
  });

  it("SettingsShell mounts every governance section", () => {
    const shell = readFileSync(
      join(
        process.cwd(),
        "components/product/settings/engine/SettingsShell.tsx",
      ),
      "utf8",
    );
    for (const name of [
      "SettingsOrganization",
      "SettingsLocations",
      "SettingsContextPanel",
      "SettingsForecasting",
      "SettingsWorkforce",
      "SettingsAccess",
      "SettingsPolicies",
      "SettingsAutonomy",
      "SettingsAttention",
      "SettingsNotifications",
      "SettingsIntegrations",
      "SettingsAudit",
    ]) {
      expect(shell.includes(name), name).toBe(true);
    }
  });

  it("page mounts SettingsShell (no legacy monolith)", () => {
    const src = readFileSync(
      join(process.cwd(), "app/app/settings/page.tsx"),
      "utf8",
    );
    expect(src.includes("SettingsShell")).toBe(true);
    expect(src.includes("SettingsPageInner")).toBe(false);
  });
});
