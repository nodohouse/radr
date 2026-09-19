import { describe, expect, it } from "vitest";
import { findingsForScope } from "@/lib/radr/findings";
import { rolePrioritize } from "@/lib/radr/role/prioritize";
import { composeOperatingBrief } from "@/lib/radr/brief/operatingBrief";
import { migrateRoleView } from "@/lib/product/types";
import { getRoleProfile } from "@/lib/radr/role/profiles";

describe("role prioritize", () => {
  it("migrates legacy role ids", () => {
    expect(migrateRoleView("procurement")).toBe("finance");
    expect(migrateRoleView("operations")).toBe("coo");
    expect(migrateRoleView("gm")).toBe("gm");
  });

  it("ranks LABOR ahead of BUY for GM on Berlin", () => {
    const findings = findingsForScope("loc_ber");
    const ranked = rolePrioritize(findings, "gm", "loc_ber");
    expect(ranked.length).toBeGreaterThanOrEqual(2);
    expect(ranked[0]!.finding.territory).toBe("LABOR");
    expect(ranked.every((r) => r.whyNow.length > 0)).toBe(true);
  });

  it("ranks BUY ahead of LABOR for CFO and Finance", () => {
    const findings = findingsForScope("all");
    const gm = rolePrioritize(findings, "gm", "all");
    const cfo = rolePrioritize(findings, "cfo", "all");
    const finance = rolePrioritize(findings, "finance", "all");

    expect(new Set(cfo.map((r) => r.finding.id))).toEqual(
      new Set(gm.map((r) => r.finding.id)),
    );
    expect(gm[0]!.finding.territory).toBe("LABOR");
    expect(cfo[0]!.finding.territory).toBe("BUY");
    expect(finance[0]!.finding.territory).toBe("BUY");
  });

  it("COO elevates BUY relative to GM via group lens", () => {
    const findings = findingsForScope("all");
    const coo = rolePrioritize(findings, "coo", "all");
    const gm = rolePrioritize(findings, "gm", "all");
    const buyId = findings.find((f) => f.territory === "BUY")!.id;
    const laborId = findings.find((f) => f.territory === "LABOR")!.id;
    const ratio = (ranked: typeof coo) => {
      const buy = ranked.find((r) => r.finding.id === buyId)!.roleScore;
      const labor = ranked.find((r) => r.finding.id === laborId)!.roleScore;
      return buy / labor;
    };
    expect(ratio(coo)).toBeGreaterThan(ratio(gm));
  });
});

describe("composeOperatingBrief", () => {
  it("GM brief is service-first with Sarah persona", () => {
    const brief = composeOperatingBrief({
      role: "gm",
      findings: findingsForScope("loc_ber"),
      locationScope: "loc_ber",
      locationName: "Berlin Mitte",
      isGroup: false,
    });
    expect(brief.firstName).toBe("Sarah");
    expect(getRoleProfile("gm").metricEmphasis).toBe("service");
    expect(brief.greeting).toContain("Sarah");
    expect(brief.valuePanel.title).toMatch(/Tonight/i);
    expect(
      brief.valuePanel.lines.some((m) =>
        /cover|Staffing|Demand|Peak/i.test(m.label),
      ),
    ).toBe(true);
  });

  it("CFO brief is money-first without duplicating hero KPI", () => {
    const brief = composeOperatingBrief({
      role: "cfo",
      findings: findingsForScope("all"),
      locationScope: "all",
      locationName: "All locations",
      isGroup: true,
    });
    expect(brief.firstName).toBe("Alex");
    expect(brief.hero?.label).toMatch(/needs attention|ready to recover/i);
    expect(brief.hero?.amount).toBeTruthy();
    // Hero amount must not repeat in breakdown
    expect(
      brief.breakdown.every((s) => s.amount !== brief.hero!.amount),
    ).toBe(true);
    expect(brief.breakdown.some((s) => /at risk/i.test(s.label))).toBe(true);
    expect(brief.valuePanel.title).toMatch(/Financial Pulse/i);
    expect(brief.valuePanel.lines.length).toBeLessThanOrEqual(4);
    expect(brief.ranked[0]!.finding.territory).toBe("BUY");
    expect(brief.whatChanged.length).toBeGreaterThan(0);
    expect(brief.now[0]?.whyMatters.length).toBeGreaterThan(0);
  });

  it("COO brief is locations-first with Maya persona", () => {
    const brief = composeOperatingBrief({
      role: "coo",
      findings: findingsForScope("all"),
      locationScope: "all",
      locationName: "All locations",
      isGroup: true,
    });
    expect(brief.firstName).toBe("Maya");
    expect(brief.valuePanel.title).toMatch(/Location Health/i);
    expect(brief.hero?.label).toMatch(/location/i);
  });

  it("does not invent euros beyond finding + scenario fixtures", () => {
    const findings = findingsForScope("loc_ber");
    const brief = composeOperatingBrief({
      role: "cfo",
      findings,
      locationScope: "loc_ber",
      locationName: "Berlin Mitte",
      isGroup: false,
    });
    const fixtureSum = findings.reduce(
      (s, f) => s + f.financialImpact.primaryValue,
      0,
    );
    const amounts = [
      brief.hero?.amount,
      ...brief.breakdown.map((s) => s.amount),
      ...brief.valuePanel.lines.map((l) => l.value),
    ].filter(Boolean) as string[];
    for (const amount of amounts) {
      const n = Number(
        amount
          .replace(/[^\d.,-]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );
      if (!Number.isFinite(n) || n === 0) continue;
      expect(n).toBeLessThanOrEqual(fixtureSum + 184);
    }
  });
});
