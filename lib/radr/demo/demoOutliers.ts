/**
 * DemoOutlierScenario — canonical restaurant estate stories.
 * Same outliers drive Control Center, Locations, Decisions, Intelligence, Value, Memory.
 */

import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";

export type OutlierPolarity = "negative" | "positive" | "healthy";

export type DemoOutlierScenario = {
  locationId: string;
  polarity: OutlierPolarity;
  archetype: string;
  headline: string;
  /** Editorial one-liner for portfolio brain */
  soWhat: string;
  revenueVsPlanPct: number;
  contributionVsPlanPct: number;
  drivers: { label: string; amount: number }[];
  decisionId: string | null;
  futuresHref: string;
  materialEvents: string[];
};

/** Northstar Restaurants · 10 locations · purposeful outliers. */
export const RESTAURANT_OUTLIER_SCENARIOS: DemoOutlierScenario[] = [
  {
    locationId: "loc_berlin_mitte",
    polarity: "negative",
    archetype: "high_volume_delivery_peak",
    headline: "Revenue strong · contribution weak",
    soWhat: "Delivery share and fees are eating the night.",
    revenueVsPlanPct: 4.2,
    contributionVsPlanPct: -3.1,
    drivers: [
      { label: "Delivery share ↑", amount: -1200 },
      { label: "Platform fees ↑", amount: -900 },
      { label: "Refunds ↑", amount: -400 },
      { label: "Peak pressure", amount: -200 },
    ],
    decisionId: "dec_peak_berlin",
    futuresHref: "/app/decisions/dec_peak_berlin",
    materialEvents: [
      "Delivery share +6.1pp",
      "Peak Decision protected €590",
      "Supplier credit €273 verified",
    ],
  },
  {
    locationId: "loc_berlin_kreuzberg",
    polarity: "negative",
    archetype: "delivery_refund",
    headline: "Refund outlier",
    soWhat: "61% of refund lift linked to delivery lateness Fri 19:00–21:00.",
    revenueVsPlanPct: 0.4,
    contributionVsPlanPct: -2.2,
    drivers: [
      { label: "Refund rate +1.4pp", amount: -1100 },
      { label: "Delivery lateness", amount: -700 },
      { label: "Missing items", amount: -280 },
    ],
    decisionId: null,
    futuresHref: "/app/locations/loc_berlin_kreuzberg",
    materialEvents: [
      "Refunds +38% vs prior",
      "61% delivery lateness",
      "Peak window Fri 19:00–21:00",
    ],
  },
  {
    locationId: "loc_hamburg_hafen",
    polarity: "positive",
    archetype: "premium_attach",
    headline: "Positive operating pattern",
    soWhat: "Wine attach +9.4pp with service still in band — learning candidate.",
    revenueVsPlanPct: 5.6,
    contributionVsPlanPct: 8.1,
    drivers: [
      { label: "Wine attach +9.4pp", amount: 2100 },
      { label: "Avg spend ↑", amount: 800 },
      { label: "No discount dependency", amount: 200 },
    ],
    decisionId: null,
    futuresHref: "/app/compare?from=loc_hamburg_hafen&to=loc_berlin_mitte",
    materialEvents: [
      "Contribution +8.1%",
      "Wine attach +9.4pp",
      "Service times within range",
    ],
  },
  {
    locationId: "loc_frankfurt_westend",
    polarity: "negative",
    archetype: "procurement_shock",
    headline: "Procurement cost shock",
    soWhat: "Tuna +19% / 90D · annualized exposure €8.4k.",
    revenueVsPlanPct: 1.2,
    contributionVsPlanPct: -4.5,
    drivers: [
      { label: "Tuna +19% / 90D", amount: -1840 },
      { label: "COGS pressure", amount: -920 },
    ],
    decisionId: "dec_tuna_berlin",
    futuresHref: "/app/intelligence?module=cost_movers",
    materialEvents: [
      "Tuna +19% · 90D",
      "6-week contribution exposure",
      "Vendor fill rate 91%",
    ],
  },
  {
    locationId: "loc_munich_altstadt",
    polarity: "healthy",
    archetype: "labor_heavy",
    headline: "Labor-heavy · within watch band",
    soWhat: "Labor +0.8pp vs target · no Decision formed.",
    revenueVsPlanPct: 1.8,
    contributionVsPlanPct: -0.6,
    drivers: [{ label: "Labor ↑", amount: -420 }],
    decisionId: null,
    futuresHref: "/app/locations/loc_munich_altstadt",
    materialEvents: ["Labor 31.2% vs 29.6% target"],
  },
  {
    locationId: "loc_koln_ehrenfeld",
    polarity: "healthy",
    archetype: "discount_spend",
    headline: "Discount pressure · within range",
    soWhat: "Avg spend soft from promo mix · contribution near plan.",
    revenueVsPlanPct: -0.8,
    contributionVsPlanPct: -0.4,
    drivers: [{ label: "Discounts", amount: -310 }],
    decisionId: null,
    futuresHref: "/app/locations/loc_koln_ehrenfeld",
    materialEvents: ["Promo mix −€0.4k vs plan"],
  },
  {
    locationId: "loc_dusseldorf_medienhafen",
    polarity: "positive",
    archetype: "premium_mix",
    headline: "Strong premium mix",
    soWhat: "Private events + menu mix lifting contribution.",
    revenueVsPlanPct: 3.4,
    contributionVsPlanPct: 5.2,
    drivers: [
      { label: "Events mix", amount: 980 },
      { label: "Menu mix", amount: 640 },
    ],
    decisionId: null,
    futuresHref: "/app/locations/loc_dusseldorf_medienhafen",
    materialEvents: ["Events share +4pp", "Contribution +5.2%"],
  },
  {
    locationId: "loc_stuttgart_mitte",
    polarity: "healthy",
    archetype: "stable",
    headline: "Stable · within range",
    soWhat: "No material outlier this period.",
    revenueVsPlanPct: 0.6,
    contributionVsPlanPct: 0.3,
    drivers: [],
    decisionId: null,
    futuresHref: "/app/locations/loc_stuttgart_mitte",
    materialEvents: ["Quiet operating week"],
  },
  {
    locationId: "loc_hk_central",
    polarity: "healthy",
    archetype: "premium_attach",
    headline: "Stable · within range",
    soWhat: "Premium attach holding · no material outlier.",
    revenueVsPlanPct: 1.1,
    contributionVsPlanPct: 0.8,
    drivers: [],
    decisionId: null,
    futuresHref: "/app/locations/loc_hk_central",
    materialEvents: ["Quiet operating week"],
  },
  {
    locationId: "loc_sydney_surry",
    polarity: "healthy",
    archetype: "premium_attach",
    headline: "Stable · within range",
    soWhat: "Lunch trade steady · watching dinner mix.",
    revenueVsPlanPct: 0.4,
    contributionVsPlanPct: 0.2,
    drivers: [],
    decisionId: null,
    futuresHref: "/app/locations/loc_sydney_surry",
    materialEvents: ["Quiet operating week"],
  },
];

export function outlierFor(locationId: string): DemoOutlierScenario | undefined {
  return RESTAURANT_OUTLIER_SCENARIOS.find((s) => s.locationId === locationId);
}

export function estateEditorial() {
  const intervention = needsAttentionOutliers();
  const pos = RESTAURANT_OUTLIER_SCENARIOS.filter((s) => s.polarity === "positive");
  return {
    locationCount: NORTHSTAR_RESTAURANTS.locations.length,
    needIntervention: intervention.length,
    outperforming: pos.length,
    withinRange:
      NORTHSTAR_RESTAURANTS.locations.length -
      intervention.length -
      pos.length,
    conclusion:
      "Revenue is ahead across the estate. Two locations are leaking contribution.",
  };
}

/** Operational interventions COO must see first — Berlin + Kreuzberg. */
export function needsAttentionOutliers(): DemoOutlierScenario[] {
  return RESTAURANT_OUTLIER_SCENARIOS.filter(
    (s) =>
      s.locationId === "loc_berlin_mitte" ||
      s.locationId === "loc_berlin_kreuzberg",
  );
}

export function positiveLearningOutliers(): DemoOutlierScenario[] {
  return RESTAURANT_OUTLIER_SCENARIOS.filter((s) => s.polarity === "positive");
}
