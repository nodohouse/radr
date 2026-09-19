/**
 * Market context statistics — NEVER hardcode claims in visual components.
 * Industry context only — NOT RADR TAM.
 *
 * lastVerifiedAt must be updated when a human clicks and confirms the URL.
 */

export type MarketSource = {
  id: string;
  claim: string;
  value: string;
  /** Supporting line under the number — must stay precise */
  context: string;
  population: string;
  region: string;
  period: string;
  sourceName: string;
  sourceTitle: string;
  sourceUrl: string;
  publicationDate: string;
  displayLabel: string;
  lastVerifiedAt: string;
};

export const MARKET_SOURCES = {
  restaurantSales2026: {
    id: "restaurant-sales-us-2026",
    claim: "Projected U.S. restaurant and foodservice sales",
    value: "$1.55T",
    context:
      "42% of surveyed operators said their restaurants were not profitable in 2025.",
    population: "U.S. restaurant and foodservice industry",
    region: "United States",
    period: "2026 forecast · 2025 operator survey",
    sourceName: "National Restaurant Association",
    sourceTitle: "2026 State of the Restaurant Industry",
    /** Resource page states both $1.55T sales and 42% not profitable. */
    sourceUrl:
      "https://www.restaurant.org/education-and-resources/resource-library/report-sales-to-hit-$1-55t-in-2026-despite-challenging-business-environment/",
    publicationDate: "2026-02",
    displayLabel: "U.S. restaurant sales forecast · 2026",
    lastVerifiedAt: "2026-09-17",
  },
  hotelGuestSpend2026: {
    id: "hotel-guest-spend-us-2026",
    claim: "Expected U.S. hotel guest spending",
    value: "$805B",
    context:
      "GOPPAR roughly 90% of 2019 — rising operating expenses a primary factor.",
    population: "U.S. hotel guest spending",
    region: "United States",
    period: "2026 expectation",
    sourceName: "American Hotel & Lodging Association",
    sourceTitle: "2026 State of the Industry",
    sourceUrl: "https://www.ahla.com/resource/2026-state-industry",
    publicationDate: "2026-01",
    displayLabel: "U.S. hotel guest spending · 2026",
    lastVerifiedAt: "2026-09-17",
  },
  hotelDataHours2026: {
    id: "hotel-data-hours-2026",
    claim:
      "Hotel owners/operators spending more than 11 hours per week consolidating or reconciling data",
    value: "27%",
    context:
      "91% still use some manual reporting. 11% report a fully integrated stack.",
    population: "Surveyed hotel owners & operators",
    region: "Multi-market survey",
    period: "2026",
    sourceName: "Otelier · Agilysys · Sage",
    sourceTitle: "2026 Hotel Operations Index",
    sourceUrl:
      "https://resources.otelier.io/whitepapers/the-2026-hotel-operations-index-progress-pressure-and-the-path-forward",
    publicationDate: "2026-01",
    displayLabel: "Spend 11+ hours / week reconciling data",
    lastVerifiedAt: "2026-09-17",
  },
} as const satisfies Record<string, MarketSource>;

export type MarketSourceId = keyof typeof MARKET_SOURCES;

export function marketSource(id: MarketSourceId): MarketSource {
  return MARKET_SOURCES[id];
}

/** Why Now — three facts maximum */
export const WHY_NOW_STATS: MarketSourceId[] = [
  "restaurantSales2026",
  "hotelGuestSpend2026",
  "hotelDataHours2026",
];
