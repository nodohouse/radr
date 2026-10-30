/**
 * External operating signals — weather, events, holidays.
 * Canonical objects only. Impact is modeled / historically associated — not causal claims.
 */

export type ExternalSignalType =
  | "weather"
  | "event"
  | "holiday"
  | "sports"
  | "conference"
  | "concert";

export type ExternalSignal = {
  id: string;
  type: ExternalSignalType;
  locationId: string;
  locationLabel: string;
  label: string;
  startIso: string;
  endIso: string | null;
  magnitude: number;
  source: string;
  retrievedAt: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  expectedOperationalEffect: string;
  /** Modeled demand lift/drag vs baseline, percentage points */
  demandDeltaPct: number;
};

export type CombinedDemandContext = {
  locationLabel: string;
  nightLabel: string;
  bookingsDeltaPct: number;
  eventDeltaPct: number;
  weatherDeltaPct: number;
  walkInForecastCovers: number;
  netDemandDeltaPct: number;
  implication: string;
  judgment: "NO_ACTION" | "WATCHING" | "DECISION_FORMED";
  relatedDecisionId: string | null;
  signals: ExternalSignal[];
};

const BERLIN_SIGNALS: ExternalSignal[] = [
  {
    id: "wx_berlin_rain",
    type: "weather",
    locationId: "loc_berlin_mitte",
    locationLabel: "Soho · New York",
    label: "Rain · 18:40",
    startIso: "2026-03-13T18:40:00+01:00",
    endIso: "2026-03-13T21:00:00+01:00",
    magnitude: 0.72,
    source: "Open-Meteo · Berlin-Mitte grid",
    retrievedAt: "2026-03-13T16:12:00+01:00",
    confidence: "HIGH",
    expectedOperationalEffect:
      "Terrace demand −28% expected. Inside demand +12 covers. Arrival compression 19:00–19:30.",
    demandDeltaPct: -7,
  },
  {
    id: "evt_berlin_concert",
    type: "concert",
    locationId: "loc_berlin_mitte",
    locationLabel: "Soho · New York",
    label: "Columbiahalle · concert · 20:00",
    startIso: "2026-03-13T20:00:00+01:00",
    endIso: "2026-03-13T23:00:00+01:00",
    magnitude: 0.55,
    source: "Local events feed · DEMO",
    retrievedAt: "2026-03-13T09:40:00+01:00",
    confidence: "MEDIUM",
    expectedOperationalEffect:
      "Historically associated with +12% pre-event dinner and +21% late walk-ins.",
    demandDeltaPct: 12,
  },
];

export function getBerlinExternalSignals(): ExternalSignal[] {
  return BERLIN_SIGNALS;
}

export function getCombinedTonightDemand(
  locationId = "loc_berlin_mitte",
): CombinedDemandContext {
  const signals = BERLIN_SIGNALS.filter((s) => s.locationId === locationId);
  const weather = signals.find((s) => s.type === "weather");
  const event = signals.find(
    (s) => s.type === "concert" || s.type === "event" || s.type === "sports",
  );
  const bookingsDeltaPct = 8;
  const eventDeltaPct = event?.demandDeltaPct ?? 0;
  const weatherDeltaPct = weather?.demandDeltaPct ?? 0;
  const walkInForecastCovers = 22;
  const net =
    Math.round((bookingsDeltaPct + eventDeltaPct + weatherDeltaPct) * 10) / 10;

  return {
    locationLabel: "Soho · New York",
    nightLabel: "Tonight · Friday dinner",
    bookingsDeltaPct,
    eventDeltaPct,
    weatherDeltaPct,
    walkInForecastCovers,
    netDemandDeltaPct: net,
    implication: "19:00 kitchen pressure likely 95%.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: "dec_peak_berlin",
    signals,
  };
}

export type CancellationIntel = {
  count: number;
  coversReleased: number;
  expectedRevenueLost: number;
  alreadyRecovered: number;
  stillExposed: number;
  radrRead: string;
  judgment: "NO_ACTION" | "WATCHING" | "DECISION_FORMED";
  relatedDecisionId: string | null;
};

export function getCancellationIntel(): CancellationIntel {
  return {
    count: 12,
    coversReleased: 34,
    expectedRevenueLost: 2_180,
    alreadyRecovered: 1_420,
    stillExposed: 760,
    radrRead: "€760 still exposed — waitlist path prepared.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: "dec_table_recover_berlin",
  };
}
