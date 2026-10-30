/**
 * Operating scenario fixtures — different nights produce different RADR behavior.
 * Deterministic. Used by tests + ExperienceComposer materiality.
 */

export type ScenarioId =
  | "quiet_day"
  | "busy_service"
  | "event_driven"
  | "bad_weather_terrace"
  | "high_cancellation"
  | "labor_shortage"
  | "supplier_cost_shock"
  | "settlement_gap"
  | "hotel_arrival_wave"
  | "hotel_demand_pickup"
  | "apartment_cleaning_delay";

export type ScenarioFixture = {
  id: ScenarioId;
  label: string;
  vertical: "restaurant" | "hotel" | "apartment" | "group";
  lead: string;
  judgment: "NO_ACTION" | "WATCHING" | "DECISION_FORMED";
  decisionHint: string | null;
  signals: string[];
};

export const SCENARIO_FIXTURES: Record<ScenarioId, ScenarioFixture> = {
  quiet_day: {
    id: "quiet_day",
    label: "Normal quiet day",
    vertical: "restaurant",
    lead: "On pace · kitchen within band",
    judgment: "NO_ACTION",
    decisionHint: null,
    signals: ["bookings flat", "weather neutral", "labor within 1pp"],
  },
  busy_service: {
    id: "busy_service",
    label: "Busy restaurant service",
    vertical: "restaurant",
    lead: "+3.2% ahead · kitchen → 94% band",
    judgment: "DECISION_FORMED",
    decisionHint: "D-1911 · Wait 12 minutes",
    signals: ["walk-ins +14", "delivery wave", "ticket time ↑"],
  },
  event_driven: {
    id: "event_driven",
    label: "Event-driven service",
    vertical: "restaurant",
    lead: "Concert + bookings + rain → 95% kitchen",
    judgment: "DECISION_FORMED",
    decisionHint: "D-1911 · Capacity",
    signals: ["concert +12%", "bookings +8%", "rain −7% terrace"],
  },
  bad_weather_terrace: {
    id: "bad_weather_terrace",
    label: "Bad-weather terrace disruption",
    vertical: "restaurant",
    lead: "Rain 18:40 · terrace −28% · inside +12 covers",
    judgment: "WATCHING",
    decisionHint: null,
    signals: ["rain timing", "inside compression", "no labor action"],
  },
  high_cancellation: {
    id: "high_cancellation",
    label: "High cancellation night",
    vertical: "restaurant",
    lead: "12 cancellations · €760 still exposed",
    judgment: "DECISION_FORMED",
    decisionHint: "D-6671 · Recover tables",
    signals: ["34 covers released", "€1,420 recovered", "waitlist ready"],
  },
  labor_shortage: {
    id: "labor_shortage",
    label: "Labor shortage",
    vertical: "restaurant",
    lead: "Labor +0.8pp · revenue/labor hour within 2%",
    judgment: "NO_ACTION",
    decisionHint: null,
    signals: ["menu mix drives pressure", "not understaffing"],
  },
  supplier_cost_shock: {
    id: "supplier_cost_shock",
    label: "Supplier cost shock",
    vertical: "restaurant",
    lead: "Invoice €7.45 vs contract €6.80 · €273 exposed",
    judgment: "DECISION_FORMED",
    decisionHint: "D-4102 · Supplier / AP",
    signals: ["COGS driver", "do not reprice yet"],
  },
  settlement_gap: {
    id: "settlement_gap",
    label: "Settlement discrepancy",
    vertical: "group",
    lead: "€395 unexplained after fees / refunds / timing",
    judgment: "DECISION_FORMED",
    decisionHint: "Payments reconciliation",
    signals: ["POS vs processor", "accounting lag"],
  },
  hotel_arrival_wave: {
    id: "hotel_arrival_wave",
    label: "Hotel arrival-wave risk",
    vertical: "hotel",
    lead: "7 rooms at readiness risk · VIP protected",
    judgment: "DECISION_FORMED",
    decisionHint: "Housekeeping reallocate",
    signals: ["42 arrivals", "31 ready", "early arrivals"],
  },
  hotel_demand_pickup: {
    id: "hotel_demand_pickup",
    label: "Hotel demand pickup",
    vertical: "hotel",
    lead: "Convention pickup +18% · direct +6pp",
    judgment: "WATCHING",
    decisionHint: null,
    signals: ["RevPAR ahead", "no room readiness Decision"],
  },
  apartment_cleaning_delay: {
    id: "apartment_cleaning_delay",
    label: "Serviced-apartment cleaning delay",
    vertical: "apartment",
    lead: "2 units behind SLA · gap nights €118 gate",
    judgment: "DECISION_FORMED",
    decisionHint: "Turnover / orphan night",
    signals: ["11 depart", "6 cleaning", "9 arrivals"],
  },
};

/** Active demo editorial scenario (busy Friday service). */
export function activeScenario(): ScenarioFixture {
  return SCENARIO_FIXTURES.busy_service;
}

export function scenarioById(id: ScenarioId): ScenarioFixture {
  return SCENARIO_FIXTURES[id];
}
