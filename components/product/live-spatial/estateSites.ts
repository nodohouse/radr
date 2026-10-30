/**
 * Estate demo sites — pin geometry for Live estate art.
 * Identity / labels / slugs derive from DemoEstateRegistry (10 restaurants).
 * Positions compose to /public/live/estate/ art — do not invent a parallel city list.
 */

import { RESTAURANT_ESTATE } from "@/lib/radr/demo/estateRegistry";

export type EstateSev = "healthy" | "watch" | "intervene";
export type EstateDepth = "back" | "mid" | "fore";
export type EstateBuildingVariant = "villa" | "block" | "terrace" | "corner";

export type EstateSite = {
  id: string;
  slug: string;
  label: string;
  city: string;
  /** % position on estate art canvas (composed, not random) */
  x: number;
  y: number;
  depth: EstateDepth;
  variant: EstateBuildingVariant;
  severity: EstateSev;
  delta: string;
  revenue: string;
  revenueDelta: string;
  contribution: string;
  contributionDelta: string;
  margin: string;
  marginDelta: string;
  exposure: string;
  exposureNum: number;
  labor: string;
  covers: string;
  driver: string;
  decisionValue: string;
  decisionId: string;
  canEnterVenue: boolean;
};

/** Storyboard pin layout — one slot per canonical restaurant id. */
const PIN_LAYOUT: Record<
  string,
  {
    x: number;
    y: number;
    depth: EstateDepth;
    variant: EstateBuildingVariant;
    severity: EstateSev;
    delta: string;
    revenue: string;
    revenueDelta: string;
    contribution: string;
    contributionDelta: string;
    margin: string;
    marginDelta: string;
    exposure: string;
    exposureNum: number;
    labor: string;
    covers: string;
    driver: string;
    decisionValue: string;
    decisionId: string;
    canEnterVenue: boolean;
  }
> = {
  loc_berlin_mitte: {
    x: 54,
    y: 40,
    depth: "mid",
    variant: "corner",
    severity: "watch",
    delta: "$974",
    revenue: "$198.4k",
    revenueDelta: "+8.4%",
    contribution: "$61.2k",
    contributionDelta: "−1.8%",
    margin: "30.8%",
    marginDelta: "−0.9pp",
    exposure: "$974",
    exposureNum: 974,
    labor: "+3.8pp",
    covers: "+8%",
    driver: "Kitchen contribution exposed tonight · delivery mix.",
    decisionValue: "+$280",
    decisionId: "dec_peak_berlin",
    canEnterVenue: true,
  },
  loc_berlin_kreuzberg: {
    x: 36,
    y: 28,
    depth: "back",
    variant: "villa",
    severity: "watch",
    delta: "$420",
    revenue: "$142.0k",
    revenueDelta: "+2.1%",
    contribution: "$44.1k",
    contributionDelta: "−2.4%",
    margin: "31.1%",
    marginDelta: "−0.6pp",
    exposure: "$420",
    exposureNum: 420,
    labor: "+1.2pp",
    covers: "+3%",
    driver: "Delivery refund pressure.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_hamburg_hafen: {
    x: 48,
    y: 22,
    depth: "back",
    variant: "block",
    severity: "healthy",
    delta: "+1.5%",
    revenue: "$168.2k",
    revenueDelta: "+1.5%",
    contribution: "$52.1k",
    contributionDelta: "+1.2%",
    margin: "31.0%",
    marginDelta: "+0.3pp",
    exposure: "$95",
    exposureNum: 95,
    labor: "−0.4pp",
    covers: "+2%",
    driver: "Wine attach holding.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_munich_altstadt: {
    x: 80,
    y: 42,
    depth: "mid",
    variant: "villa",
    severity: "healthy",
    delta: "+1.1%",
    revenue: "$161.4k",
    revenueDelta: "+1.1%",
    contribution: "$41.8k",
    contributionDelta: "−0.4%",
    margin: "25.9%",
    marginDelta: "−0.2pp",
    exposure: "$210",
    exposureNum: 210,
    labor: "+0.6pp",
    covers: "+2%",
    driver: "Recovering after supplier variance.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_koln_ehrenfeld: {
    x: 46,
    y: 50,
    depth: "mid",
    variant: "terrace",
    severity: "healthy",
    delta: "+0.7%",
    revenue: "$128.9k",
    revenueDelta: "+0.7%",
    contribution: "$39.1k",
    contributionDelta: "+0.3%",
    margin: "30.3%",
    marginDelta: "+0.1pp",
    exposure: "$120",
    exposureNum: 120,
    labor: "+0.2pp",
    covers: "+1%",
    driver: "Stable.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_dusseldorf_medienhafen: {
    x: 40,
    y: 40,
    depth: "mid",
    variant: "block",
    severity: "healthy",
    delta: "+0.4%",
    revenue: "$136.2k",
    revenueDelta: "+0.4%",
    contribution: "$41.1k",
    contributionDelta: "+0.2%",
    margin: "30.2%",
    marginDelta: "+0.1pp",
    exposure: "$95",
    exposureNum: 95,
    labor: "0.0pp",
    covers: "+1%",
    driver: "Channel mix stable.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_stuttgart_mitte: {
    x: 66,
    y: 46,
    depth: "mid",
    variant: "block",
    severity: "healthy",
    delta: "+0.6%",
    revenue: "$118.4k",
    revenueDelta: "+0.6%",
    contribution: "$29.8k",
    contributionDelta: "+0.3%",
    margin: "25.2%",
    marginDelta: "+0.2pp",
    exposure: "$90",
    exposureNum: 90,
    labor: "0.0pp",
    covers: "+1%",
    driver: "Quiet operating week.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_hk_central: {
    x: 34,
    y: 58,
    depth: "fore",
    variant: "terrace",
    severity: "healthy",
    delta: "+1.6%",
    revenue: "$132.0k",
    revenueDelta: "+1.6%",
    contribution: "$40.2k",
    contributionDelta: "+0.8%",
    margin: "30.5%",
    marginDelta: "+0.3pp",
    exposure: "$140",
    exposureNum: 140,
    labor: "−0.3pp",
    covers: "+4%",
    driver: "Premium attach holding.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_sydney_surry: {
    x: 76,
    y: 60,
    depth: "fore",
    variant: "block",
    severity: "healthy",
    delta: "+0.8%",
    revenue: "$148.8k",
    revenueDelta: "+0.8%",
    contribution: "$45.6k",
    contributionDelta: "+0.5%",
    margin: "30.6%",
    marginDelta: "+0.2pp",
    exposure: "$120",
    exposureNum: 120,
    labor: "0.0pp",
    covers: "+2%",
    driver: "Within expectations.",
    decisionValue: "—",
    decisionId: "dec_peak_berlin",
    canEnterVenue: false,
  },
  loc_frankfurt_westend: {
    x: 58,
    y: 58,
    depth: "fore",
    variant: "corner",
    severity: "intervene",
    delta: "$2.8k",
    revenue: "$154.6k",
    revenueDelta: "−4.2%",
    contribution: "$48.2k",
    contributionDelta: "−4.5%",
    margin: "31.2%",
    marginDelta: "−3.8pp",
    exposure: "$2,800",
    exposureNum: 2800,
    labor: "+3.8pp",
    covers: "−9%",
    driver:
      "Labor is 3.8pp above plan while covers are 9% below forecast.",
    decisionValue: "+$1,120",
    decisionId: "dec_menu_peak_berlin",
    canEnterVenue: true,
  },
};

export const ESTATE_SITES: EstateSite[] = RESTAURANT_ESTATE.map((e) => {
  const pin = PIN_LAYOUT[e.id];
  if (!pin) {
    throw new Error(`Missing Live estate pin layout for ${e.id}`);
  }
  return {
    id: e.id,
    slug: e.slug,
    label: e.displayName,
    city: e.city,
    ...pin,
  };
});

export function siteBySlug(slug: string) {
  return ESTATE_SITES.find((s) => s.slug === slug) ?? null;
}

export function siteById(id: string) {
  return ESTATE_SITES.find((s) => s.id === id) ?? null;
}
