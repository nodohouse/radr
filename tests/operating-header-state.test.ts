import { describe, expect, it } from "vitest";
import { composeOperatingHeaderState } from "@/lib/radr/product/operatingHeaderState";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { selectNeedsJudgment } from "@/lib/radr/product/selectNeedsJudgment";
import { resetDecisionStore } from "@/lib/radr/decision/store";
import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

const ROLES: RoleView[] = ["gm", "coo", "cfo"];
const VERTICALS: DemoVerticalFamily[] = ["restaurant", "hotel"];
const SCOPES = ["all", "loc_berlin_mitte", "loc_canal_house"] as const;

describe("operatingHeaderState SSOT", () => {
  it("reconciles with Control Center brief for Sarah restaurant estate", () => {
    resetDecisionStore();
    const header = composeOperatingHeaderState({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
      period: "mtd",
    });
    const brief = composeControlCenterBrief({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
      period: "mtd",
    });

    expect(header.needJudgment).toBe(brief.needsYouCount);
    expect(header.verified.formatted).toBe(brief.verifiedFormatted);
    expect(header.compression.evaluated).toBe(
      header.compression.cleared +
        header.compression.handling +
        header.compression.watching +
        header.needJudgment,
    );
    expect(header.signalLine).toMatch(/^(DECISION|WITHIN EXPECTATIONS)\b/);
    expect(header.pulseStatus).toMatch(/^(DECISION|WITHIN EXPECTATIONS)$/);
    expect(header.liveLabel).toBe("LIVE");
    expect(header.clockLabel).toMatch(/\d/);
  });

  it("scopes hotel world without restaurant peak flagship", () => {
    resetDecisionStore();
    const header = composeOperatingHeaderState({
      role: "gm",
      vertical: "hotel",
      locationId: "all",
    });
    expect(header.judgments.every((j) => j.displayId !== "D-1911")).toBe(true);
  });

  for (const role of ROLES) {
    for (const vertical of VERTICALS) {
      it(`header = brief = needsJudgment for ${role} × ${vertical}`, () => {
        resetDecisionStore();
        const locationId =
          vertical === "hotel" ? "loc_canal_house" : "loc_berlin_mitte";
        const header = composeOperatingHeaderState({
          role,
          vertical,
          locationId,
          period: "mtd",
        });
        const brief = composeControlCenterBrief({
          role,
          vertical,
          locationId,
          period: "mtd",
        });
        const needs = selectNeedsJudgment({
          role,
          vertical,
          locationId,
        });
        expect(header.needJudgment).toBe(brief.needsYouCount);
        expect(header.needJudgment).toBe(needs.length);
        expect(header.verified.formatted).toBe(brief.verifiedFormatted);
        expect(header.liveLabel).toBe("LIVE");
      });
    }
  }

  it("estate scope all reconciles judgment count for restaurant GM", () => {
    resetDecisionStore();
    const header = composeOperatingHeaderState({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
      period: "mtd",
    });
    const needs = selectNeedsJudgment({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
    });
    expect(header.needJudgment).toBe(needs.length);
  });

  it("verified header aligns with Value aggregate for GM restaurant", () => {
    resetDecisionStore();
    const header = composeOperatingHeaderState({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
      period: "mtd",
    });
    const brief = composeControlCenterBrief({
      role: "gm",
      vertical: "restaurant",
      locationId: "all",
      period: "mtd",
    });
    const value = deriveValueAggregate("gm", "restaurant");
    expect(header.verified.formatted).toBe(brief.verifiedFormatted);
    expect(value.verifiedTotal).toBeGreaterThan(0);
    expect(header.verified.formatted).toMatch(/€/);
    // Digits in header match rounded aggregate (ignore separators)
    const digits = header.verified.formatted.replace(/[^\d]/g, "");
    expect(digits).toContain(String(Math.round(value.verifiedTotal)));
  });

  it("LIVE label is independent of period scope (mtd still LIVE strip)", () => {
    resetDecisionStore();
    for (const period of ["today", "mtd", "ytd"] as const) {
      const header = composeOperatingHeaderState({
        role: "gm",
        vertical: "restaurant",
        locationId: "all",
        period,
      });
      expect(header.liveLabel).toBe("LIVE");
      expect(header.clockLabel).toMatch(/\d/);
    }
  });

  it.each(SCOPES)("compression identity holds for scope %s", (locationId) => {
    resetDecisionStore();
    const vertical =
      locationId === "loc_canal_house" ? "hotel" : "restaurant";
    const header = composeOperatingHeaderState({
      role: "gm",
      vertical,
      locationId,
      period: "mtd",
    });
    expect(header.compression.evaluated).toBe(
      header.compression.cleared +
        header.compression.handling +
        header.compression.watching +
        header.needJudgment,
    );
  });
});
