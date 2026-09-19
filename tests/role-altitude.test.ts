import { describe, expect, it } from "vitest";
import { composeBerlinActiveRevenue } from "@/lib/radr/activeRevenue";
import {
  portfolioLiveLabel,
  portfolioRecoveryRollup,
  recoveryAltitudeForRole,
} from "@/lib/radr/activeRevenue/roleAltitude";
import {
  composeGlanceBrief,
  glanceInputFromDemo,
  injectRecoveryIntoGlance,
} from "@/lib/radr/glance";
import type { RoleView } from "@/lib/product/types";

const base = glanceInputFromDemo({
  role: "gm",
  phase: "LIVE",
  locationName: "Berlin Mitte",
  expectedCovers: 142,
  expectedWalkIns: 26,
  projectedRevenue: 9480,
  expectedContribution: 5860,
  peakStart: "19:30",
  peakEnd: "21:00",
  terraceOpen: true,
  terraceNet: 400,
  menuPortionsLeft: 9,
  menuPortionsExpected: 31,
  menuRunOutBy: "20:15",
  menuContributionAtRisk: 730,
  menuSourcingNet: 558,
  staffingAtRisk: 290,
  staffingWindow: "19:15–20:30",
  allergyTables: 2,
  allergyUnconfirmed: 1,
  allergyKitchenPending: 1,
  allergyLines: [
    { table: "Table 12", time: "19:30", label: "Peanut" },
    { table: "Table 18", time: "20:00", label: "Shellfish" },
  ],
  birthdays: 4,
  engagements: 1,
  anniversaries: 1,
  quietRequests: 2,
  terraceRequests: 3,
  privateDining: 1,
  returningGuests: 42,
});

describe("role altitude — metrics not floor noise", () => {
  it("maps executive roles to portfolio altitude", () => {
    expect(recoveryAltitudeForRole("owner")).toBe("portfolio");
    expect(recoveryAltitudeForRole("cfo")).toBe("portfolio");
    expect(recoveryAltitudeForRole("finance")).toBe("portfolio");
    expect(recoveryAltitudeForRole("coo")).toBe("portfolio");
    expect(recoveryAltitudeForRole("gm")).toBe("floor");
    expect(recoveryAltitudeForRole("host")).toBe("floor");
    expect(recoveryAltitudeForRole("head_chef")).toBe("floor");
  });

  it("rewrites live labels without table numbers", () => {
    const revenue = composeBerlinActiveRevenue();
    for (const e of revenue.liveEvents) {
      const label = portfolioLiveLabel(e);
      expect(label).not.toMatch(/TABLE\s*\d+/i);
      expect(label.length).toBeGreaterThan(8);
    }
  });

  it("owner / cfo / finance never see TABLE in glance after inject", () => {
    const revenue = composeBerlinActiveRevenue();
    for (const role of ["owner", "cfo", "finance", "coo"] as RoleView[]) {
      const input = { ...base, role };
      const brief = injectRecoveryIntoGlance(
        composeGlanceBrief(input),
        revenue,
        input,
      );
      const blob = JSON.stringify(brief);
      expect(blob).not.toMatch(/TABLE\s*\d+/i);
      expect(blob).not.toMatch(/GUEST LATE/i);
    }
  });

  it("gm and host still see table-level recovery", () => {
    const revenue = composeBerlinActiveRevenue();
    for (const role of ["gm", "host"] as RoleView[]) {
      const input = { ...base, role };
      const brief = injectRecoveryIntoGlance(
        composeGlanceBrief(input),
        revenue,
        input,
      );
      expect(JSON.stringify(brief)).toMatch(/TABLE/i);
    }
  });

  it("chef glance stays kitchen — prep and safety, not owner pulse", () => {
    const chef = composeGlanceBrief({ ...base, role: "head_chef" });
    expect(chef.primary.some((p) => p.id === "bluefin")).toBe(true);
    expect(chef.secondary.some((p) => p.id === "prep")).toBe(true);
    expect(chef.primary.every((p) => p.id !== "contrib")).toBe(true);
  });

  it("owner glance emphasizes contribution and verified value", () => {
    const owner = composeGlanceBrief({ ...base, role: "owner" });
    expect(owner.primary.some((p) => p.id === "contrib")).toBe(true);
    expect(owner.primary.some((p) => p.id === "verified")).toBe(true);
    expect(JSON.stringify(owner.primary)).not.toMatch(/TABLE 8/i);
  });

  it("portfolio rollup is money, not seat identity", () => {
    const rollup = portfolioRecoveryRollup(composeBerlinActiveRevenue());
    expect(rollup.openCount).toBeGreaterThan(0);
    expect(rollup.atRisk).toBeGreaterThan(0);
    expect(JSON.stringify(rollup)).not.toMatch(/TABLE/i);
  });
});
