import { describe, expect, it } from "vitest";
import {
  aggregateOperatingEvents,
  demoShiftStateAtTick,
  demoStreamBeatCount,
  isLiveShiftEnabled,
  liveShiftMode,
  roleLiveSummary,
} from "@/lib/radr/live";
import type { OperatingEvent } from "@/lib/radr/live";

describe("live shift access", () => {
  it("enables illustrative stream in DEMO and never implies LIVE feeds by default", () => {
    expect(isLiveShiftEnabled("DEMO")).toBe(true);
    expect(liveShiftMode("DEMO")).toBe("illustrative");
    expect(liveShiftMode("LIVE")).toBe(
      process.env.NEXT_PUBLIC_LIVE_SHIFT_FEEDS === "true" ? "live" : "off",
    );
  });
});

describe("aggregateOperatingEvents", () => {
  it("does not double-count payment settlements as net sales", () => {
    const events: OperatingEvent[] = [
      {
        id: "sale_1",
        organizationId: "org",
        locationId: "loc",
        locationName: "Berlin",
        timestamp: "2026-08-19T17:10:00+02:00",
        source: "POS",
        eventType: "SALE",
        amount: 100,
        currency: "EUR",
        serviceId: "s",
        serviceLabel: "Dinner",
        label: "Table closed",
      },
      {
        id: "pay_1",
        organizationId: "org",
        locationId: "loc",
        locationName: "Berlin",
        timestamp: "2026-08-19T17:10:05+02:00",
        source: "PAYMENTS",
        eventType: "PAYMENT",
        amount: 100,
        currency: "EUR",
        serviceId: "s",
        serviceLabel: "Dinner",
        label: "Card",
        settlementOfSaleId: "sale_1",
      },
      {
        id: "ref_1",
        organizationId: "org",
        locationId: "loc",
        locationName: "Berlin",
        timestamp: "2026-08-19T17:12:00+02:00",
        source: "POS",
        eventType: "REFUND",
        amount: 20,
        currency: "EUR",
        serviceId: "s",
        serviceLabel: "Dinner",
        label: "Refund",
      },
    ];
    const state = aggregateOperatingEvents(events, {
      organizationId: "org",
      locationId: "loc",
      locationName: "Berlin",
      serviceId: "s",
      serviceLabel: "Dinner",
      businessDate: "2026-08-19",
      asOf: "2026-08-19T17:12:00+02:00",
      illustrative: false,
      forecastClose: 9000,
      expectedByNow: 80,
    });
    expect(state.netSales).toBe(80);
    expect(state.paymentsReceived).toBe(100);
    expect(state.refunds).toBe(20);
  });
});

describe("demo live stream", () => {
  it("is deterministic and labeled illustrative", () => {
    const a = demoShiftStateAtTick(8);
    const b = demoShiftStateAtTick(8);
    expect(a.illustrative).toBe(true);
    expect(a.netSales).toBe(b.netSales);
    expect(a.netSales).toBeGreaterThan(1000);
    expect(demoStreamBeatCount()).toBeGreaterThan(5);
  });

  it("advances net sales as ticks increase (when sales events land)", () => {
    const early = demoShiftStateAtTick(2);
    const later = demoShiftStateAtTick(12);
    expect(later.netSales).toBeGreaterThanOrEqual(early.netSales);
  });

  it("keeps pace vs expected in a credible hospitality band", () => {
    for (const tick of [0, 3, 8, 14]) {
      const state = demoShiftStateAtTick(tick);
      expect(Math.abs(state.vsExpectedPct)).toBeLessThan(25);
      expect(state.vsExpectedPct).toBeGreaterThan(0);
    }
  });

  it("builds income-stream series so providers can be compared on the pace chart", () => {
    const state = demoShiftStateAtTick(18);
    expect(state.streamSeries.length).toBeGreaterThanOrEqual(4);
    const ids = state.streamSeries.map((s) => s.id);
    expect(ids).toContain("total");
    expect(ids).toContain("dine_in");
    expect(ids).toContain("delivery");
    expect(ids).toContain("uber-eats");
    const delivery = state.streamSeries.find((s) => s.id === "delivery")!;
    const uber = state.streamSeries.find((s) => s.id === "uber-eats")!;
    const last = (s: { points: { net: number }[] }) =>
      s.points[s.points.length - 1]!.net;
    expect(last(delivery)).toBeGreaterThan(0);
    expect(last(uber)).toBeGreaterThan(0);
    expect(last(delivery)).toBeGreaterThanOrEqual(last(uber));
  });

  it("role summaries stay lean and altitude-correct", () => {
    const state = demoShiftStateAtTick(10);
    const cfo = roleLiveSummary("cfo", state);
    const gm = roleLiveSummary("gm", state);
    const owner = roleLiveSummary("owner", state);
    const chef = roleLiveSummary("head_chef", state);
    expect(cfo.lines.length).toBeLessThanOrEqual(4);
    expect(gm.primary.label).toMatch(/net sales/i);
    expect(owner.primary.label).toMatch(/contribution/i);
    expect(owner.narrative).toMatch(/floor/i);
    expect(chef.primary.label).toMatch(/covers/i);
    expect(cfo.kicker).toMatch(/LIVE/i);
  });
});
