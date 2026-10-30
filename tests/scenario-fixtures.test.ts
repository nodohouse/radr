import { describe, expect, it } from "vitest";
import {
  SCENARIO_FIXTURES,
  activeScenario,
  scenarioById,
  type ScenarioId,
} from "@/lib/radr/product/scenarioFixtures";
import {
  getApartmentDayPace,
  getDayPaceForVertical,
  getHotelDayPace,
  getRestaurantDayPace,
} from "@/lib/radr/product/revenuePacing";
import { getSettlementBridge } from "@/lib/radr/intelligence/opsModules";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";

const ALL_IDS: ScenarioId[] = [
  "quiet_day",
  "busy_service",
  "event_driven",
  "bad_weather_terrace",
  "high_cancellation",
  "labor_shortage",
  "supplier_cost_shock",
  "settlement_gap",
  "hotel_arrival_wave",
  "hotel_demand_pickup",
  "apartment_cleaning_delay",
];

describe("Scenario fixtures + vertical pace", () => {
  it("covers the operating scenario matrix", () => {
    expect(Object.keys(SCENARIO_FIXTURES).sort()).toEqual(
      [...ALL_IDS].sort(),
    );
    for (const id of ALL_IDS) {
      const s = scenarioById(id);
      expect(s.id).toBe(id);
      expect(s.lead.length).toBeGreaterThan(8);
      expect(s.signals.length).toBeGreaterThan(0);
    }
  });

  it("active demo scenario is busy service with a Decision", () => {
    const s = activeScenario();
    expect(s.id).toBe("busy_service");
    expect(s.judgment).toBe("DECISION_FORMED");
    expect(s.decisionHint).toContain("D-1911");
  });

  it("quiet day stays NO_ACTION", () => {
    expect(SCENARIO_FIXTURES.quiet_day.judgment).toBe("NO_ACTION");
    expect(SCENARIO_FIXTURES.quiet_day.decisionHint).toBeNull();
  });

  it("hotel and apartment pace expose vertical metrics", () => {
    const hotel = getHotelDayPace();
    expect(hotel.vertical).toBe("hotel");
    expect(hotel.roomsAtRisk).toBe(7);
    expect(hotel.status).toBe("BEHIND");

    const apt = getApartmentDayPace();
    expect(apt.vertical).toBe("apartment");
    expect(apt.gapNights).toBe(3);
    expect(apt.cleaningBehind).toBe(2);

    expect(getDayPaceForVertical("hotel")).toEqual(hotel);
    expect(getDayPaceForVertical("apartment")).toEqual(apt);
    expect(getDayPaceForVertical("restaurant").vertical).toBe("restaurant");
    expect(getRestaurantDayPace().locationLabel.length).toBeGreaterThan(0);
  });

  it("settlement bridge math leaves €395 unexplained", () => {
    const b = getSettlementBridge();
    expect(b.expectedSettlement).toBe(
      b.posExpected - b.fees - b.refunds - b.timing,
    );
    expect(b.unexplained).toBe(395);
    expect(b.received).toBe(b.expectedSettlement - 395);
  });

  it("since-last-check carries verified or outlier deltas", () => {
    const brief = composeControlCenterBrief({ role: "gm" });
    expect(brief.sinceLastCheck.length).toBeGreaterThan(0);
    expect(brief.sinceLastCheck.some((s) => s.text.length > 6)).toBe(true);
  });
});
