/**
 * RADR Context Engine — external / contextual signals.
 * Canonical. Not invented in React.
 */

export type ContextSourceClass =
  | "OFFICIAL"
  | "CONFIGURED"
  | "LEARNED"
  | "INFERRED";

export type ContextSignalFamily =
  | "CALENDAR"
  | "MARKET"
  | "WEATHER"
  | "EVENT"
  | "MOBILITY"
  | "INCOME_CYCLE"
  | "REGULATION"
  | "COMPETITOR"
  | "TOURISM"
  | "MARKETING"
  | "LOCAL_DEMAND";

export type ContextObservationKind = "OBSERVED" | "FORECAST";

export type ContextSignal = {
  id: string;
  locationId: string;
  family: ContextSignalFamily;
  subtype: string;
  geography: "country" | "region" | "city" | "catchment" | "location";
  startAt: string; // HH:MM or ISO date for day-level
  endAt: string | null;
  source: string;
  sourceClass: ContextSourceClass;
  observedOrForecast: ContextObservationKind;
  confidence: number; // 0–100
  expectedDemandImpactPct: number | null;
  expectedRevenueImpactEuro: number | null;
  expectedOperationalImpact: string | null;
  evidence: string[];
  comparablePeriods: number | null;
  updatedAt: string;
  /** Material enough to plot on Live timeline */
  materialForTimeline: boolean;
  timelineLabel: string;
};

export type IncomeCycleSignal = ContextSignal & {
  family: "INCOME_CYCLE";
  historicalDinnerDemandPct: number | null;
  historicalDeliveryPct: number | null;
  historicalAvgSpendPct: number | null;
};

/** Berlin dinner — material context on the operating day. */
export function berlinTonightContext(): ContextSignal[] {
  return [
    {
      id: "ctx_concert_berlin",
      locationId: "loc_berlin_mitte",
      family: "EVENT",
      subtype: "concert",
      geography: "catchment",
      startAt: "19:30",
      endAt: "22:30",
      source: "Eventbrite / venue calendar",
      sourceClass: "OFFICIAL",
      observedOrForecast: "FORECAST",
      confidence: 78,
      expectedDemandImpactPct: 4.1,
      expectedRevenueImpactEuro: 410,
      expectedOperationalImpact: "Walk-ins +18 · peak shifts +20m",
      evidence: ["venue.attendance_est", "historical.nearby_concert_friday"],
      comparablePeriods: 9,
      updatedAt: "2026-09-17T16:00:00+02:00",
      materialForTimeline: true,
      timelineLabel: "Concert demand begins",
    },
    {
      id: "ctx_rain_berlin",
      locationId: "loc_berlin_mitte",
      family: "WEATHER",
      subtype: "rain",
      geography: "city",
      startAt: "20:10",
      endAt: "21:00",
      source: "DWD nowcast",
      sourceClass: "OFFICIAL",
      observedOrForecast: "FORECAST",
      confidence: 84,
      expectedDemandImpactPct: -0.7,
      expectedRevenueImpactEuro: -220,
      expectedOperationalImpact: "Terrace −8 · indoor +10 pressure",
      evidence: ["weather.precip_prob", "historical.rain_after_19"],
      comparablePeriods: 22,
      updatedAt: "2026-09-17T18:55:00+02:00",
      materialForTimeline: true,
      timelineLabel: "Rain",
    },
    {
      id: "ctx_salary_berlin",
      locationId: "loc_berlin_mitte",
      family: "INCOME_CYCLE",
      subtype: "salary_week",
      geography: "region",
      startAt: "20:30",
      endAt: "22:00",
      source: "Learned recurring Friday pattern",
      sourceClass: "LEARNED",
      observedOrForecast: "FORECAST",
      confidence: 71,
      expectedDemandImpactPct: 3.2,
      expectedRevenueImpactEuro: null,
      expectedOperationalImpact: "Dinner demand historically elevated",
      evidence: [
        "learned.salary_week_friday",
        "14 comparable periods",
      ],
      comparablePeriods: 14,
      updatedAt: "2026-09-01T00:00:00+02:00",
      materialForTimeline: true,
      timelineLabel: "Salary-cycle demand",
    },
    {
      id: "ctx_res_wave",
      locationId: "loc_berlin_mitte",
      family: "LOCAL_DEMAND",
      subtype: "reservation_wave",
      geography: "location",
      startAt: "20:00",
      endAt: "20:25",
      source: "SevenRooms",
      sourceClass: "CONFIGURED",
      observedOrForecast: "OBSERVED",
      confidence: 92,
      expectedDemandImpactPct: null,
      expectedRevenueImpactEuro: null,
      expectedOperationalImpact: "18 covers arriving",
      evidence: ["reservations.inbound_22m"],
      comparablePeriods: null,
      updatedAt: "2026-09-17T19:40:00+02:00",
      materialForTimeline: true,
      timelineLabel: "18 covers arriving",
    },
  ];
}

export function berlinIncomeCycleCard(): {
  title: string;
  dinnerPct: number;
  deliveryPct: number;
  avgSpendPct: number;
  comparablePeriods: number;
  sourceClass: ContextSourceClass;
  caveat: string;
} {
  return {
    title: "Salary-week signal",
    dinnerPct: 8.4,
    deliveryPct: 13.1,
    avgSpendPct: 3.2,
    comparablePeriods: 14,
    sourceClass: "LEARNED",
    caveat: "Associated with historically elevated demand — not proven causation.",
  };
}

export function contextForLocation(locationId: string): ContextSignal[] {
  if (
    locationId === "loc_berlin_mitte" ||
    locationId === "loc_ber" ||
    locationId === "all"
  ) {
    return berlinTonightContext();
  }
  if (locationId === "loc_canal_house") {
    return [
      {
        id: "ctx_hk_canal",
        locationId,
        family: "LOCAL_DEMAND",
        subtype: "arrival_wave",
        geography: "location",
        startAt: "14:00",
        endAt: "16:00",
        source: "Mews",
        sourceClass: "CONFIGURED",
        observedOrForecast: "OBSERVED",
        confidence: 88,
        expectedDemandImpactPct: null,
        expectedRevenueImpactEuro: null,
        expectedOperationalImpact: "42 arrivals · 31 ready · 7 at risk",
        evidence: ["pms.arrivals", "hk.readiness"],
        comparablePeriods: null,
        updatedAt: "2026-09-17T13:00:00+02:00",
        materialForTimeline: true,
        timelineLabel: "Arrival surge",
      },
    ];
  }
  if (locationId === "loc_chiado_collective") {
    return [
      {
        id: "ctx_turn_chiado",
        locationId,
        family: "LOCAL_DEMAND",
        subtype: "turnover",
        geography: "location",
        startAt: "12:00",
        endAt: "15:00",
        source: "PMS + housekeeping",
        sourceClass: "CONFIGURED",
        observedOrForecast: "OBSERVED",
        confidence: 85,
        expectedDemandImpactPct: null,
        expectedRevenueImpactEuro: null,
        expectedOperationalImpact: "6 units behind · gap night exposure",
        evidence: ["turnover.sla"],
        comparablePeriods: null,
        updatedAt: "2026-09-17T11:00:00+01:00",
        materialForTimeline: true,
        timelineLabel: "Turnover bottleneck",
      },
    ];
  }
  return [];
}

export function materialTimelineContext(
  locationId: string,
): ContextSignal[] {
  return contextForLocation(locationId).filter((s) => s.materialForTimeline);
}
