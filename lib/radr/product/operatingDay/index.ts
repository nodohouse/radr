/**
 * Operating day composer — Live as an unfolding day.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { getHotelDayPace } from "@/lib/radr/product/revenuePacing";
import {
  activeWindowNow,
  apartmentOperationalBands,
  formatMinutesRemaining,
  getOperatingHours,
  hotelOperationalBands,
  parseHHMM,
  restaurantServicePeriods,
  DEMO_OPERATING_DOW,
} from "./operatingHours";
import {
  berlinHourlySeries,
  hotelHourlySeries,
  apartmentHourlySeries,
} from "./hourlySeries";
import {
  berlinPressureWindows,
  berlinTimelineMarkers,
  canalPressureWindows,
  chiadoPressureWindows,
} from "./shiftOutlook";
import { materialTimelineContext } from "@/lib/radr/context";
import type {
  HourlyMetricPoint,
  OperatingDayStatus,
  OperatingMode,
  PressureWindow,
  ServicePeriod,
  TimelineMarker,
} from "./types";

export type OperatingDaySurface = {
  locationId: string;
  locationLabel: string;
  mode: OperatingMode;
  status: OperatingDayStatus;
  periods: ServicePeriod[];
  series: HourlyMetricPoint[];
  pressureWindows: PressureWindow[];
  markers: TimelineMarker[];
  heatStrip: { clock: string; level: PressureWindow["level"] }[];
};

function berlinStatus(): OperatingDayStatus {
  const live = getLiveServicePerformance(DEMO_LOCATIONS.berlin.id);
  const hours = getOperatingHours(DEMO_LOCATIONS.berlin.id)!;
  const win = activeWindowNow(hours, DEMO_OPERATING_DOW)!;
  const nowMin = parseHHMM(live.clockLabel);
  const closeMin = parseHHMM(win.close);
  const minsToClose = Math.max(0, closeMin - nowMin);

  const pace: OperatingDayStatus["pace"] =
    live.kitchenProjected >= live.interventionThreshold
      ? "at_risk"
      : live.revenueDeltaPct >= 1.5
        ? "ahead"
        : live.revenueDeltaPct <= -1.5
          ? "behind"
          : "within";

  return {
    status: "peak",
    pace,
    serviceLabel: win.label,
    openLabel: win.open,
    closeLabel: win.close,
    clockLabel: live.clockLabel,
    minutesToClose: minsToClose,
    revenueNow: live.revenue,
    revenueExpectedNow: live.forecastAtNow,
    revenueDeltaPct: live.revenueDeltaPct,
    expectedClose: live.expectedClose,
    expectedCloseLow: live.likelyCloseLow,
    expectedCloseHigh: live.likelyCloseHigh,
    contributionDelta: null,
    nextPressureAt: "20:10–20:35",
    nextPressureLabel: "High pressure · kitchen 97%",
    decisionNeeded: Boolean(live.relatedDecisionId),
  };
}

function hotelStatus(): OperatingDayStatus {
  const pace = getHotelDayPace();
  return {
    status: "always_on",
    pace: pace.deltaPctVsExpected >= 0 ? "ahead" : "behind",
    serviceLabel: "Hotel day · 24/7",
    openLabel: "00:00",
    closeLabel: "24:00",
    clockLabel: pace.clockLabel,
    minutesToClose: null,
    revenueNow: pace.revenueActualNow,
    revenueExpectedNow: Math.round(
      pace.revenueActualNow / (1 + pace.deltaPctVsExpected / 100),
    ),
    revenueDeltaPct: pace.deltaPctVsExpected,
    expectedClose: pace.revenueForecastClose,
    expectedCloseLow: null,
    expectedCloseHigh: null,
    contributionDelta: null,
    nextPressureAt: "14:00",
    nextPressureLabel: "Arrival surge · rooms not ready",
    decisionNeeded: true,
  };
}

function apartmentStatus(): OperatingDayStatus {
  return {
    status: "always_on",
    pace: "within",
    serviceLabel: "Turnover day · 24/7",
    openLabel: "00:00",
    closeLabel: "24:00",
    clockLabel: "14:05",
    minutesToClose: null,
    revenueNow: 4_100,
    revenueExpectedNow: 4_050,
    revenueDeltaPct: 1.2,
    expectedClose: 6_800,
    expectedCloseLow: 6_500,
    expectedCloseHigh: 7_100,
    contributionDelta: null,
    nextPressureAt: "12:00–15:00",
    nextPressureLabel: "Turnover bottleneck",
    decisionNeeded: true,
  };
}

function heatFromWindows(
  windows: PressureWindow[],
): OperatingDaySurface["heatStrip"] {
  return windows.map((w) => ({
    clock: w.start,
    level: w.level,
  }));
}

export function composeOperatingDay(
  locationId: string = DEMO_LOCATIONS.berlin.id,
): OperatingDaySurface {
  const hours = getOperatingHours(locationId);

  if (
    locationId === DEMO_LOCATIONS.canal.id ||
    hours?.mode === "hotel_24_7"
  ) {
    const windows = canalPressureWindows();
    return {
      locationId: DEMO_LOCATIONS.canal.id,
      locationLabel: "Mercer House · New York",
      mode: "hotel_24_7",
      status: hotelStatus(),
      periods: hotelOperationalBands(),
      series: hotelHourlySeries(),
      pressureWindows: windows,
      markers: windows.map((w) => ({
        id: w.id,
        at: w.start,
        kind: w.level === "high" || w.level === "critical" ? "pressure" : "ops",
        label: w.label,
        detail: w.detail,
      })),
      heatStrip: heatFromWindows(windows),
    };
  }

  if (
    locationId === DEMO_LOCATIONS.chiado.id ||
    hours?.mode === "serviced_apartment_24_7"
  ) {
    const windows = chiadoPressureWindows();
    return {
      locationId: DEMO_LOCATIONS.chiado.id,
      locationLabel: "Chiado Collective",
      mode: "serviced_apartment_24_7",
      status: apartmentStatus(),
      periods: apartmentOperationalBands(),
      series: apartmentHourlySeries(),
      pressureWindows: windows,
      markers: windows.map((w) => ({
        id: w.id,
        at: w.start,
        kind: w.level === "high" ? "pressure" : "ops",
        label: w.label,
        detail: w.detail,
      })),
      heatStrip: heatFromWindows(windows),
    };
  }

  // Restaurant default — Berlin
  const win =
    activeWindowNow(
      hours ?? getOperatingHours(DEMO_LOCATIONS.berlin.id)!,
      DEMO_OPERATING_DOW,
    )!;
  const windows = berlinPressureWindows();
  const status = berlinStatus();
  const ctxMarkers: TimelineMarker[] = materialTimelineContext(
    DEMO_LOCATIONS.berlin.id,
  ).map((s) => ({
    id: s.id,
    at: s.startAt,
    kind:
      s.family === "WEATHER"
        ? "weather"
        : s.family === "EVENT"
          ? "event"
          : s.family === "INCOME_CYCLE"
            ? "demand"
            : "demand",
    label: s.timelineLabel,
    detail:
      s.expectedOperationalImpact ??
      (s.expectedRevenueImpactEuro != null
        ? `${s.expectedRevenueImpactEuro >= 0 ? "+" : ""}€${Math.abs(s.expectedRevenueImpactEuro)}`
        : s.sourceClass),
  }));

  const markers = mergeMarkers(berlinTimelineMarkers(), ctxMarkers);

  return {
    locationId: DEMO_LOCATIONS.berlin.id,
    locationLabel: "Soho · New York",
    mode: "restaurant",
    status,
    periods: restaurantServicePeriods(win),
    series: berlinHourlySeries(),
    pressureWindows: windows,
    markers,
    heatStrip: [
      { clock: "17:00", level: "low" },
      { clock: "18:00", level: "medium" },
      { clock: "19:00", level: "medium" },
      { clock: "20:00", level: "critical" },
      { clock: "20:35", level: "medium" },
      { clock: "21:30", level: "low" },
      { clock: "23:00", level: "low" },
    ],
  };
}

function mergeMarkers(
  base: TimelineMarker[],
  extra: TimelineMarker[],
): TimelineMarker[] {
  const seen = new Set(base.map((m) => `${m.at}|${m.label}`));
  const out = [...base];
  for (const m of extra) {
    const key = `${m.at}|${m.label}`;
    if (seen.has(key)) continue;
    // Skip near-duplicates already on the operating timeline
    if (
      /covers arriving/i.test(m.label) &&
      base.some((b) => /covers arriving/i.test(b.label))
    ) {
      continue;
    }
    if (
      /^rain/i.test(m.label) &&
      base.some((b) => /^rain/i.test(b.label) || b.kind === "weather")
    ) {
      continue;
    }
    out.push(m);
    seen.add(key);
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export function remainingServiceLabel(status: OperatingDayStatus): string {
  if (status.minutesToClose == null) return "24/7";
  return `${formatMinutesRemaining(status.minutesToClose)} until close`;
}

export * from "./types";
export * from "./operatingHours";
export * from "./shiftOutlook";
export * from "./hourlySeries";
export * from "./calendarPerformance";
