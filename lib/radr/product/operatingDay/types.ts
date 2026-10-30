/**
 * Operating day — canonical types for Live as an unfolding day.
 * Vertical-aware. No React-side invention.
 */

export type OperatingMode =
  | "restaurant"
  | "hotel_24_7"
  | "serviced_apartment_24_7";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ServicePeriodKind =
  | "pre_service"
  | "early"
  | "peak"
  | "second_turn"
  | "late"
  | "close"
  | "night_audit"
  | "breakfast"
  | "departures"
  | "housekeeping"
  | "check_in"
  | "evening"
  | "overnight"
  | "turnover"
  | "arrivals";

export type OperatingWindow = {
  open: string; // HH:MM
  close: string;
  label: string;
};

export type LocationOperatingHours = {
  locationId: string;
  mode: OperatingMode;
  timezone: string;
  /** Weekly windows — empty array = closed that day */
  week: Record<DayOfWeek, OperatingWindow[]>;
};

export type ServicePeriod = {
  id: string;
  kind: ServicePeriodKind;
  label: string;
  start: string;
  end: string;
};

export type HourlyMetricPoint = {
  id: string;
  /** Clock label e.g. 17:00 or NOW */
  label: string;
  clock: string;
  /** Minutes from day start (or service open for restaurants) */
  minute: number;
  observed: boolean;
  isNow?: boolean;
  /** Cumulative revenue */
  revenueActual: number | null;
  revenueExpected: number;
  revenueForecast: number;
  /** Forecast uncertainty band (cumulative) — future only */
  revenueLow: number | null;
  revenueHigh: number | null;
  /** Interval (this hour) revenue when available */
  intervalActual: number | null;
  intervalExpected: number | null;
  covers: number | null;
  coversForecast: number | null;
  contribution: number | null;
  contributionPlan: number | null;
  pressure: number; // 0–100 operational pressure
  pressureLevel: "low" | "medium" | "high" | "critical";
};

export type PressureWindow = {
  id: string;
  start: string;
  end: string;
  level: "low" | "medium" | "high" | "critical";
  label: string;
  detail: string;
  revenuePacePct: number | null;
  kitchenPct: number | null;
  risk: string | null;
  clearsIf?: string;
};

export type TimelineMarker = {
  id: string;
  at: string;
  kind: "now" | "demand" | "pressure" | "ops" | "decision" | "weather" | "event" | "release";
  label: string;
  detail: string;
  decisionId?: string;
  decisionLabel?: string;
  economicFormatted?: string;
};

export type ServiceDayStatus =
  | "pre_shift"
  | "open"
  | "peak"
  | "late"
  | "closed"
  | "complete"
  | "always_on";

export type PaceStatus = "ahead" | "within" | "behind" | "at_risk";

export type OperatingDayStatus = {
  status: ServiceDayStatus;
  pace: PaceStatus;
  serviceLabel: string;
  openLabel: string;
  closeLabel: string;
  clockLabel: string;
  minutesToClose: number | null;
  revenueNow: number;
  revenueExpectedNow: number;
  revenueDeltaPct: number;
  expectedClose: number;
  expectedCloseLow: number | null;
  expectedCloseHigh: number | null;
  contributionDelta: number | null;
  nextPressureAt: string | null;
  nextPressureLabel: string | null;
  decisionNeeded: boolean;
};

export type CalendarMetricId =
  | "revenue_vs_forecast"
  | "contribution_vs_plan"
  | "verified_value"
  | "decision_count"
  | "forecast_accuracy"
  | "operational_pressure";

export type CalendarCellTone = "positive" | "negative" | "neutral" | "empty";

export type DayPerformanceCell = {
  dateIso: string;
  dayLabel: string;
  dow: string;
  isoWeek: number;
  metricId: CalendarMetricId;
  value: number;
  formatted: string;
  tone: CalendarCellTone;
  tooltip: {
    revenueActual: number;
    revenueDeltaPct: number;
    contributionActual: number;
    contributionDeltaPct: number;
    moneyIn: number;
    moneyOut: number;
    covers: number;
    avgSpend: number;
    decisions: number;
    verifiedEuro: number;
    forecastErrorPct: number;
    peakPressure: string | null;
    highlights: string[];
  };
  services?: { label: string; deltaPct: number; tone: CalendarCellTone }[];
};

export type DayReplayBeat = {
  at: string;
  label: string;
  detail: string;
  kind: TimelineMarker["kind"];
  /** Minutes from open for scrubber (restaurant dinner = 17:00 = 0) */
  minuteFromOpen?: number;
  /** What RADR knew at this beat — no future leakage */
  knownAtTime?: string[];
};

export type DayReplay = {
  dateIso: string;
  locationId: string;
  title: string;
  openClock: string;
  closeClock: string;
  revenueActual: number;
  revenueForecast: number;
  contributionActual: number;
  contributionPlan: number;
  verifiedEuro: number;
  beats: DayReplayBeat[];
  outcome: string;
};
