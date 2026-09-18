import { describe, expect, it } from "vitest";
import { composeBerlinPostShiftBrief } from "@/lib/radr/preShift";

describe("post-shift learning brief", () => {
  it("surfaces dish mix, drinks, wins, and next-shift carry-forward", () => {
    const brief = composeBerlinPostShiftBrief();

    expect(brief.covers).toBe(149);
    expect(brief.fnb.beverageSharePct).toBe(34.8);
    expect(brief.highlights.length).toBeGreaterThan(0);
    expect(brief.dishes[0]?.tag).toBe("bestseller");
    expect(brief.dishes[0]?.name).toMatch(/Schnitzel/i);
    expect(brief.drinks[0]?.name).toMatch(/Burgundy/i);
    expect(brief.dishes.some((d) => d.tag === "soft")).toBe(true);
    expect(brief.nextShift.length).toBeGreaterThan(0);
    expect(brief.nextShift.every((a) => a.mode)).toBe(true);
    expect(brief.learning.errors.covers).toBe(7);
    expect(brief.learning.errors.walkIns).toBe(3);
  });

  it("accounts for food, drinks, delivery in and leakage out", () => {
    const brief = composeBerlinPostShiftBrief();
    const { money } = brief;
    const inSum = money.in.reduce((s, l) => s + l.amount, 0);
    expect(inSum).toBe(money.netSales);
    expect(money.food).toBeGreaterThan(money.beverage);
    expect(money.delivery).toBeGreaterThan(0);
    expect(money.refunds).toBeGreaterThan(0);
    expect(money.comps).toBeGreaterThan(0);
    expect(money.discounts).toBeGreaterThan(0);
    expect(money.deliveryFees).toBeGreaterThan(0);
    expect(money.leakageTotal).toBe(
      money.refunds + money.comps + money.discounts,
    );
    expect(money.out.some((l) => l.id === "out_fees")).toBe(true);
  });

  it("every money category carries dig-deeper evidence and actions", () => {
    const brief = composeBerlinPostShiftBrief();
    const lines = [...brief.money.in, ...brief.money.out];
    expect(lines.length).toBe(7);
    for (const line of lines) {
      expect(line.soWhat.length).toBeGreaterThan(20);
      expect(line.evidence.length).toBeGreaterThanOrEqual(3);
      expect(line.actions.length).toBeGreaterThanOrEqual(1);
      expect(line.actions.every((a) => a.mode && a.label && a.reason)).toBe(
        true,
      );
    }
    expect(lines.some((l) => l.actions.some((a) => a.mode === "decide"))).toBe(
      true,
    );
  });

  it("keeps learning language actionable without a task inbox", () => {
    const brief = composeBerlinPostShiftBrief();
    const prepared = brief.nextShift.filter((a) => a.mode === "prepared");
    expect(prepared.length).toBeGreaterThan(0);
    expect(brief.watchPoints.length).toBeLessThanOrEqual(5);
  });
});
