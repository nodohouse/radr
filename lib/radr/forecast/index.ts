/**
 * Forecast Engine — explainable point + band + drivers.
 */

export type ForecastHorizon =
  | "nowcast"
  | "shift"
  | "day"
  | "week"
  | "planning"
  | "financial";

export type ForecastDriver = {
  id: string;
  label: string;
  amountEuro: number | null;
  amountPct: number | null;
  kind: "positive" | "negative" | "neutral";
  source: string;
  observedOrModeled: "OBSERVED" | "MODELED";
};

export type ForecastResult = {
  id: string;
  locationId: string;
  metric: string;
  horizon: ForecastHorizon;
  pointEstimate: number;
  lowerBound: number | null;
  upperBound: number | null;
  unit: "EUR" | "PCT" | "COUNT";
  drivers: ForecastDriver[];
  comparisonLabel: string;
  sourceFreshness: string;
  historicalErrorPct: number | null;
  modelVersion: string;
  asOf: string;
};

/** Berlin expected close — explainable decomposition. */
export function berlinExpectedCloseForecast(): ForecastResult {
  return {
    id: "fc_berlin_close",
    locationId: "loc_berlin_mitte",
    metric: "revenue_close",
    horizon: "shift",
    pointEstimate: 26_800,
    lowerBound: 26_100,
    upperBound: 27_400,
    unit: "EUR",
    drivers: [
      {
        id: "realized",
        label: "Realized now",
        amountEuro: 18_400,
        amountPct: null,
        kind: "neutral",
        source: "POS",
        observedOrModeled: "OBSERVED",
      },
      {
        id: "res",
        label: "Remaining reservations",
        amountEuro: 4_900,
        amountPct: null,
        kind: "positive",
        source: "Reservations",
        observedOrModeled: "MODELED",
      },
      {
        id: "walk",
        label: "Walk-ins",
        amountEuro: 2_100,
        amountPct: null,
        kind: "positive",
        source: "Host / historical",
        observedOrModeled: "MODELED",
      },
      {
        id: "del",
        label: "Delivery",
        amountEuro: 1_800,
        amountPct: null,
        kind: "positive",
        source: "Channels",
        observedOrModeled: "MODELED",
      },
      {
        id: "turns",
        label: "Additional turns",
        amountEuro: 1_100,
        amountPct: null,
        kind: "positive",
        source: "Table management",
        observedOrModeled: "MODELED",
      },
      {
        id: "rain",
        label: "Rain",
        amountEuro: -220,
        amountPct: null,
        kind: "negative",
        source: "Weather nowcast",
        observedOrModeled: "MODELED",
      },
      {
        id: "concert",
        label: "Concert",
        amountEuro: 410,
        amountPct: null,
        kind: "positive",
        source: "Event calendar",
        observedOrModeled: "MODELED",
      },
    ],
    comparisonLabel: "vs target close €26,100",
    sourceFreshness: "POS 1m 42s · Reservations 2m · Weather 5m",
    historicalErrorPct: 6.1,
    modelVersion: "shift_close_v3",
    asOf: "19:48",
  };
}

export function groupExpectedCloseForecast(
  vertical: "restaurant" | "hotel" = "restaurant",
): ForecastResult {
  if (vertical === "hotel") {
    return {
      id: "fc_hotel_group_close",
      locationId: "all",
      metric: "revenue_close",
      horizon: "day",
      pointEstimate: 72_400,
      lowerBound: 69_800,
      upperBound: 74_900,
      unit: "EUR",
      drivers: [
        {
          id: "canal",
          label: "Canal House rooms",
          amountEuro: 28_900,
          amountPct: null,
          kind: "positive",
          source: "PMS pace",
          observedOrModeled: "MODELED",
        },
        {
          id: "harbour",
          label: "Harbour rooms",
          amountEuro: 22_100,
          amountPct: null,
          kind: "positive",
          source: "PMS pace",
          observedOrModeled: "MODELED",
        },
        {
          id: "other",
          label: "Other properties",
          amountEuro: 21_400,
          amountPct: null,
          kind: "neutral",
          source: "Group rollup",
          observedOrModeled: "MODELED",
        },
      ],
      comparisonLabel: "vs expected-now pace",
      sourceFreshness: "Hotel rollup · 1m 42s",
      historicalErrorPct: 4.8,
      modelVersion: "hotel_group_day_v2",
      asOf: "14:20",
    };
  }
  return {
    id: "fc_group_close",
    locationId: "all",
    metric: "revenue_close",
    horizon: "day",
    pointEstimate: 91_200,
    lowerBound: 88_400,
    upperBound: 93_600,
    unit: "EUR",
    drivers: [
      {
        id: "berlin",
        label: "Berlin dinner",
        amountEuro: 26_800,
        amountPct: null,
        kind: "positive",
        source: "Live service",
        observedOrModeled: "MODELED",
      },
      {
        id: "hamburg",
        label: "Hamburg dinner",
        amountEuro: 18_400,
        amountPct: null,
        kind: "positive",
        source: "Live service",
        observedOrModeled: "MODELED",
      },
      {
        id: "frankfurt",
        label: "Frankfurt dinner",
        amountEuro: 14_200,
        amountPct: null,
        kind: "positive",
        source: "Live service",
        observedOrModeled: "MODELED",
      },
      {
        id: "other",
        label: "Other connected residual",
        amountEuro: 31_800,
        amountPct: null,
        kind: "neutral",
        source: "Group rollup",
        observedOrModeled: "MODELED",
      },
    ],
    comparisonLabel: "vs expected-now pace",
    sourceFreshness: "Group rollup · 1m 42s",
    historicalErrorPct: 5.4,
    modelVersion: "group_day_v2",
    asOf: "19:48",
  };
}

export type ForecastAccuracyCell = {
  metric: string;
  locationId: string;
  horizon: ForecastHorizon;
  predicted: number;
  actual: number;
  errorPct: number;
  learned: string;
};

export function berlinForecastAccuracySample(): ForecastAccuracyCell[] {
  return [
    {
      metric: "revenue_close",
      locationId: "loc_berlin_mitte",
      horizon: "shift",
      predicted: 26_800,
      actual: 27_420,
      errorPct: 2.3,
      learned: "Concert uplift under-weighted on Friday salary weeks",
    },
  ];
}
