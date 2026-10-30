/**
 * Locale intelligence packs — country → region → city → catchment.
 * Versioned. Never bury regulation in React.
 */

export type ProvenanceKind =
  | "LEGAL_REQUIREMENT"
  | "CUSTOMER_POLICY"
  | "MARKET_SIGNAL"
  | "LEARNED_BEHAVIOR";

export type LocaleRule = {
  id: string;
  kind: ProvenanceKind;
  label: string;
  detail: string;
  source: string;
  version: string;
};

export type LocaleIntelligencePack = {
  id: string;
  country: string;
  region: string | null;
  city: string | null;
  version: string;
  holidaySources: string[];
  schoolCalendarSources: string[];
  religiousCalendarSources: string[];
  incomeCycleSources: string[];
  tourismPatterns: string[];
  eventSources: string[];
  mobilitySources: string[];
  rules: LocaleRule[];
};

const BERLIN_PACK: LocaleIntelligencePack = {
  id: "pack_us_nyc_v1",
  country: "US",
  region: "New York",
  city: "New York",
  version: "2026.09.1",
  holidaySources: ["US federal holidays", "NYC municipal calendar"],
  schoolCalendarSources: ["NYC DOE calendar"],
  religiousCalendarSources: ["Public Christian calendar", "optional Islamic observances"],
  incomeCycleSources: [
    "LEARNED: Friday dinner elevation near month-end salary weeks",
    "CONFIGURED: customer payroll calendar (optional)",
  ],
  tourismPatterns: ["Fashion Week", "summer patio season", "December holiday dining"],
  eventSources: ["venue calendars", "city event feeds"],
  mobilitySources: ["MTA disruption (planned)", "weather nowcast"],
  rules: [
    {
      id: "rule_salary_learned",
      kind: "LEARNED_BEHAVIOR",
      label: "Salary-week Friday dinner elevation",
      detail:
        "Historically associated with +7–9% dinner demand across comparable periods. Not legislation.",
      source: "Operating Memory · Soho · New York",
      version: "2026.09.1",
    },
    {
      id: "rule_rain_delivery",
      kind: "LEARNED_BEHAVIOR",
      label: "Rain after 19:00 → delivery ↑ terrace ↓",
      detail: "Location-specific. Other US sites may differ.",
      source: "Operating Memory · Soho · New York",
      version: "2026.09.1",
    },
  ],
};

const AMS_PACK: LocaleIntelligencePack = {
  id: "pack_us_nyc_hotel_v1",
  country: "US",
  region: "New York",
  city: "New York",
  version: "2026.09.1",
  holidaySources: ["US federal holidays", "NYC municipal calendar"],
  schoolCalendarSources: ["NYC DOE calendar"],
  religiousCalendarSources: ["Public Christian calendar"],
  incomeCycleSources: [
    "LEARNED: salary-week Friday patterns (region)",
    "CONFIGURED: optional employer calendars",
  ],
  tourismPatterns: ["Fashion Week", "conference weeks", "summer leisure"],
  eventSources: ["city events", "hotel feeder venues"],
  mobilitySources: ["MTA / PATH disruption (planned)"],
  rules: [
    {
      id: "rule_ams_salary",
      kind: "LEARNED_BEHAVIOR",
      label: "Salary-week Friday dinner +7.8%",
      detail: "Based on 16 comparable periods. Association, not causation.",
      source: "Operating Memory · Mercer House · New York catchment",
      version: "2026.09.1",
    },
  ],
};

const LISBON_PACK: LocaleIntelligencePack = {
  id: "pack_pt_lisbon_v1",
  country: "PT",
  region: "Lisboa",
  city: "Lisbon",
  version: "2026.09.1",
  holidaySources: ["Portal da Empresa holidays"],
  schoolCalendarSources: ["Portuguese school calendar"],
  religiousCalendarSources: ["Public Christian calendar"],
  incomeCycleSources: ["LEARNED: local booking patterns (sparse)"],
  tourismPatterns: ["summer arrivals", "congress weeks"],
  eventSources: ["city events"],
  mobilitySources: [],
  rules: [
    {
      id: "rule_chiado_rain",
      kind: "LEARNED_BEHAVIOR",
      label: "Rain: booking behavior largely unaffected",
      detail: "Unlike New York delivery lift — location-specific memory.",
      source: "Operating Memory · Chiado",
      version: "2026.09.1",
    },
  ],
};

const BY_LOCATION: Record<string, LocaleIntelligencePack> = {
  loc_berlin_mitte: BERLIN_PACK,
  loc_ber: BERLIN_PACK,
  loc_canal_house: AMS_PACK,
  loc_chiado_collective: LISBON_PACK,
};

export function getLocalePack(
  locationId: string,
): LocaleIntelligencePack | null {
  return BY_LOCATION[locationId] ?? null;
}
