import { describe, expect, it } from "vitest";
import {
  getRestaurantMoneyFlow,
  getRestaurantOrderFlow,
  getDeliveryStream,
  getStockWatch,
  getGroupMoneyFlow,
  getHotelMoneyFlow,
  getApartmentMoneyFlow,
  getCancellationFlow,
  getGroupDaySeries,
  liveScenarioIds,
} from "@/lib/radr/product/liveFlows";
import {
  composeLiveOperatingSurface,
  composeCfoLiveSurface,
  getBestsellersForPeriod,
} from "@/lib/radr/product/liveOperating";

describe("Live nervous system flows", () => {
  it("restaurant money sources sum to gross and contribution", () => {
    const m = getRestaurantMoneyFlow();
    expect(m.sources.reduce((a, s) => a + s.amount, 0)).toBe(m.grossRevenue);
    expect(m.grossRevenue).toBe(18_420);
    const red = m.steps
      .filter((s) => s.kind === "reduction")
      .reduce((a, s) => a + s.amount, 0);
    expect(m.grossRevenue + red).toBe(m.contributionPace);
    expect(m.contributionPace).toBe(7_190);
  });

  it("order channel revenue reconciles to service revenue", () => {
    const o = getRestaurantOrderFlow();
    expect(o.channels.reduce((a, c) => a + c.revenue, 0)).toBe(18_420);
    expect(o.last30mOrders).toBe(48);
    expect(o.last30mFees + o.last30mContribution).toBeLessThanOrEqual(
      o.last30mGross,
    );
  });

  it("delivery channels and cancellation flow reconcile", () => {
    const d = getDeliveryStream();
    expect(d.channels.reduce((a, c) => a + c.ordersTonight, 0)).toBe(
      d.ordersReceived,
    );
    expect(d.feesEuro).toBe(
      d.channels.reduce((a, c) => a + c.feesEstimated, 0),
    );
    const c = getCancellationFlow();
    expect(c.waitlistFilled + c.directRebook + c.unrecovered).toBe(
      c.coversReleased,
    );
    expect(c.recovered + c.exposed).toBe(c.revenueAffected);
  });

  it("group money sources sum to €62,400", () => {
    const g = getGroupMoneyFlow();
    expect(g.grossRevenue).toBe(62_400);
    expect(g.sources.reduce((a, s) => a + s.amount, 0)).toBe(62_400);
    expect(getGroupDaySeries().find((s) => s.label === "NOW")!.actual).toBe(
      62_400,
    );
  });

  it("stock, bestsellers periods, and scenarios exist", () => {
    const s = getStockWatch().items[0]!;
    expect(s.state).toBe("PROJECTED_STOCKOUT");
    expect(s.affectedDishes.length).toBe(3);
    const night = getBestsellersForPeriod("tonight");
    const month = getBestsellersForPeriod("month");
    expect(night[0]!.name).toContain("Tuna");
    expect(month.find((d) => d.name.includes("Tuna"))!.rankRevenue).toBe(4);
    expect(liveScenarioIds().length).toBeGreaterThanOrEqual(8);
  });

  it("composed surfaces expose new nervous-system fields", () => {
    const live = composeLiveOperatingSurface();
    expect(live.moneyFlow.sources.length).toBeGreaterThan(3);
    expect(live.cancellationFlow.exposed).toBe(360);
    expect(live.coverFlow.length).toBeGreaterThan(4);
    expect(live.resources.length).toBeGreaterThan(0);
    const cfo = composeCfoLiveSurface();
    expect(cfo.moneyFlow.grossRevenue).toBe(62_400);
    expect(getHotelMoneyFlow().roomRevenue).toBe(18_640);
    expect(getApartmentMoneyFlow().grossRevenue).toBeGreaterThan(0);
  });
});
