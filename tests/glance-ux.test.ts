import { describe, expect, it } from "vitest";
import {
  composeGlanceBrief,
  glanceInputFromDemo,
  bluefinForRole,
  injectRecoveryIntoGlance,
} from "@/lib/radr/glance";
import { composeBerlinActiveRevenue } from "@/lib/radr/activeRevenue";
import { migrateRoleView } from "@/lib/product/types";
import { getRoleProfile, ROLE_ORDER } from "@/lib/radr/role/profiles";

const base = glanceInputFromDemo({
  role: "gm",
  phase: "PRE_SHIFT",
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

describe("role migration", () => {
  it("accepts hospitality roles", () => {
    expect(migrateRoleView("head_chef")).toBe("head_chef");
    expect(migrateRoleView("chef")).toBe("head_chef");
    expect(ROLE_ORDER).toContain("host");
    expect(getRoleProfile("server").shortLabel).toBe("Server");
  });
});

describe("glance compression", () => {
  it("caps primary at 3 and secondary at 5", () => {
    for (const role of [
      "gm",
      "head_chef",
      "kitchen",
      "host",
      "server",
      "cfo",
      "owner",
      "finance",
      "coo",
    ] as const) {
      const brief = composeGlanceBrief({ ...base, role });
      expect(brief.primary.length).toBeLessThanOrEqual(3);
      expect(brief.secondary.length).toBeLessThanOrEqual(5);
    }
  });

  it("chef sees portions language, not euros first", () => {
    const chef = composeGlanceBrief({ ...base, role: "head_chef" });
    const bluefin = chef.primary.find((p) => p.id === "bluefin");
    expect(bluefin?.state).toMatch(/9 \/ 31/);
    expect(bluefin?.label).toBe("BLUEFIN");
  });

  it("cfo sees money, not allergy tables", () => {
    const cfo = composeGlanceBrief({ ...base, role: "cfo" });
    expect(cfo.primary.every((p) => p.id !== "allergies")).toBe(true);
    expect(cfo.headline).toMatch(/€|1\.020|1020/);
  });

  it("server is section-only", () => {
    const server = composeGlanceBrief({ ...base, role: "server" });
    expect(server.headline).toMatch(/section/i);
    expect(server.primary.some((p) => p.id === "section")).toBe(true);
    expect(server.primary.some((p) => p.id === "bluefin")).toBe(false);
  });

  it("marks human decisions as actionable for CFO", () => {
    const cfo = composeGlanceBrief({ ...base, role: "cfo" });
    const actionable = cfo.primary.filter((p) => p.action !== "none");
    expect(actionable.length).toBeGreaterThan(0);
  });

  it("ranks safety ahead of commercial risk for GM", () => {
    const gm = composeGlanceBrief({
      ...base,
      role: "gm",
      minutesToOpen: 72,
    });
    const actionable = gm.primary.filter((p) => p.action !== "none");
    expect(actionable[0]?.id).toBe("allergies");
    expect(actionable[0]?.label).toBe("SAFETY");
    expect(gm.meta).toMatch(/72 min/);
    expect(gm.contextPanel?.title).toMatch(/Tonight/i);
  });

  it("injects CANCELLED into the Control Center priority queue", () => {
    const input = { ...base, role: "gm" as const, minutesToOpen: 72 };
    const revenue = composeBerlinActiveRevenue();
    const brief = injectRecoveryIntoGlance(
      composeGlanceBrief(input),
      revenue,
      input,
    );
    const actionable = brief.primary.filter((p) => p.action !== "none");
    const cancelled = actionable.find((p) => p.label === "CANCELLED");
    expect(cancelled).toBeTruthy();
    expect(cancelled?.state).toMatch(/TABLE 8 · 4 GUESTS/i);
    expect(cancelled?.number).toMatch(/184/);
    expect(cancelled?.impact).toMatch(/EXPECTED REVENUE AT RISK/i);
    expect(cancelled?.actionLabel).toBe("Recover");
    expect(actionable[0]?.label).toBe("SAFETY");
    expect(brief.strip.some((s) => s.label === "CANCELLED" || s.label === "NO-SHOW")).toBe(
      true,
    );
    expect(brief.headline).toMatch(/need you/);
  });

  it("owner and cfo see portfolio recovery, not TABLE 8", () => {
    const revenue = composeBerlinActiveRevenue();
    for (const role of ["owner", "cfo"] as const) {
      const input = { ...base, role, minutesToOpen: 72 };
      const brief = injectRecoveryIntoGlance(
        composeGlanceBrief(input),
        revenue,
        input,
      );
      const blob = JSON.stringify(brief);
      expect(blob).not.toMatch(/TABLE 8/i);
      expect(blob).not.toMatch(/TABLE 14/i);
      expect(blob).not.toMatch(/GUEST LATE/i);
      const recoverable = brief.primary.find(
        (p) => p.id === "recovery_portfolio" || p.label === "RECOVERABLE",
      );
      expect(recoverable).toBeTruthy();
      expect(recoverable?.state).toMatch(/€/);
      expect(brief.strip.some((s) => s.label === "RECOVERABLE")).toBe(true);
    }
  });

  it("owner with group metrics leads on locations, not one floor", () => {
    const owner = composeGlanceBrief({
      ...base,
      role: "owner",
      locationName: "All locations",
      groupReady: 15,
      groupNeedAttention: 2,
      groupAtRisk: 1,
      groupExposure: 12480,
    });
    expect(owner.headline).toMatch(/location/i);
    expect(owner.primary.some((p) => p.id === "group")).toBe(true);
    expect(JSON.stringify(owner.primary)).not.toMatch(/TABLE/i);
  });

  it("shows NO-SHOW with party size and revenue at risk", () => {
    const input = { ...base, role: "gm" as const };
    const revenue = composeBerlinActiveRevenue();
    const brief = injectRecoveryIntoGlance(
      composeGlanceBrief(input),
      revenue,
      input,
    );
    const noshow = brief.primary.find((p) => p.label === "NO-SHOW");
    expect(noshow?.state).toMatch(/TABLE 14 · 2 GUESTS/i);
    expect(noshow?.number).toMatch(/96/);
    expect(noshow?.impact).toMatch(/AT RISK/i);
  });

  it("translates bluefin by role", () => {
    expect(bluefinForRole("head_chef", 9, 31, "20:15", 730, 558).state).toBe(
      "9 / 31",
    );
    expect(bluefinForRole("cfo", 9, 31, "20:15", 730, 558).state).toMatch(
      /730/,
    );
    expect(bluefinForRole("host", 9, 31, "20:15", 730, 558).why).toMatch(
      /late tables|serve/i,
    );
  });
});
