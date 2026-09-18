import { describe, expect, it } from "vitest";
import {
  composeBerlinFinanceOperatingBrief,
  moneyLeftMatchesContribution,
  waterfallContributionIdentity,
} from "@/lib/radr/finance";
import { getTerm, searchTerms } from "@/lib/radr/terminology";

describe("Financial Operating Layer", () => {
  it("keeps waterfall identity: net − less lines = live contribution", () => {
    const state = composeBerlinFinanceOperatingBrief();
    const id = waterfallContributionIdentity(state);
    expect(id.ok).toBe(true);
    expect(id.fromLines).toBe(state.liveContribution);
    expect(id.expected).toBe(state.liveContribution);
  });

  it("matches Money Left total to live contribution", () => {
    const state = composeBerlinFinanceOperatingBrief();
    expect(moneyLeftMatchesContribution(state)).toBe(true);
  });

  it("never labels waterfall or money flow as profit", () => {
    const state = composeBerlinFinanceOperatingBrief();
    const labels = [
      ...state.waterfall.map((l) => l.label),
      ...state.moneyFlow.flatMap((c) => [
        c.title,
        c.totalLabel,
        ...c.items.map((i) => i.label),
      ]),
      "Live contribution",
      "Contribution margin",
    ];
    for (const label of labels) {
      expect(label.toLowerCase()).not.toContain("profit");
    }
    expect(state.waterfall.some((l) => l.kind === "result")).toBe(true);
    expect(
      state.waterfall.find((l) => l.kind === "result")?.label,
    ).toMatch(/live contribution/i);
  });

  it("exposes margin pts variance vs plan", () => {
    const state = composeBerlinFinanceOperatingBrief();
    expect(typeof state.marginVariancePts).toBe("number");
    const marginLine = state.waterfall.find((l) => l.kind === "margin");
    expect(marginLine?.variance?.unit).toBe("pts");
  });

  it("scales contribution when live net sales override is provided", () => {
    const base = composeBerlinFinanceOperatingBrief();
    const overridden = composeBerlinFinanceOperatingBrief(7200);
    expect(overridden.netSales).toBe(7200);
    expect(overridden.liveContribution).not.toBe(base.liveContribution);
    expect(waterfallContributionIdentity(overridden).ok).toBe(true);
    expect(moneyLeftMatchesContribution(overridden)).toBe(true);
  });

  it("caps finance attentions at three", () => {
    const state = composeBerlinFinanceOperatingBrief();
    expect(state.attentions.length).toBeLessThanOrEqual(3);
    expect(state.attentions.length).toBeGreaterThan(0);
  });
});

describe("finance terminology", () => {
  it("defines netSales and liveContribution without profit as the term", () => {
    expect(getTerm("netSales").term).toBe("Net sales");
    expect(getTerm("liveContribution").term).toBe("Live contribution");
    expect(getTerm("liveContribution").shortDefinition.toLowerCase()).toContain(
      "not accounting profit",
    );
    expect(searchTerms("live contribution").some((t) => t.id === "liveContribution")).toBe(
      true,
    );
    expect(searchTerms("net sales").some((t) => t.id === "netSales")).toBe(true);
  });
});
