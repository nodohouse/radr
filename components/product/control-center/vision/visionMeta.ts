/** Vision presentation helpers — catalog-faithful imagery + sparklines. */

export const LOC_META_VISION: Record<
  string,
  {
    covers: number;
    laborPct: number;
    thumb: string;
    state?: "healthy" | "strong" | "watch" | "intervene";
  }
> = {
  loc_berlin_mitte: {
    covers: 412,
    laborPct: 28.4,
    thumb: "/demo/facilities/berlin-dining.jpg",
    state: "strong",
  },
  loc_berlin_kreuzberg: {
    covers: 286,
    laborPct: 29.8,
    thumb: "/demo/facilities/berlin-bar.jpg",
    state: "healthy",
  },
  loc_hamburg_hafen: {
    covers: 198,
    laborPct: 31.2,
    thumb: "/demo/facilities/berlin-terrace.jpg",
    state: "watch",
  },
  loc_frankfurt_westend: {
    covers: 176,
    laborPct: 30.1,
    thumb: "/demo/facilities/berlin-dining.jpg",
    state: "healthy",
  },
  loc_munich_altstadt: {
    covers: 224,
    laborPct: 32.4,
    thumb: "/demo/facilities/berlin-bar.jpg",
    state: "intervene",
  },
  loc_koln_ehrenfeld: {
    covers: 168,
    laborPct: 27.9,
    thumb: "/demo/facilities/berlin-terrace.jpg",
    state: "watch",
  },
  loc_dusseldorf_medienhafen: {
    covers: 152,
    laborPct: 28.8,
    thumb: "/demo/facilities/berlin-dining.jpg",
    state: "healthy",
  },
  loc_stuttgart_mitte: {
    covers: 140,
    laborPct: 27.2,
    thumb: "/demo/facilities/berlin-bar.jpg",
    state: "intervene",
  },
};

/** Catalog CFO metric lock — group MTD (5-second read). */
export const CFO_CATALOG = {
  revenue: "$479k",
  revenueDelta: "+4.2%",
  contribution: "$135k",
  contributionDelta: "−1.8%",
  margin: "28.2%",
  marginDelta: "−1.6pp",
  exposure: "$5.8k",
  exposureDelta: "at risk",
  verified: "$3,793",
  verifiedDelta: "+8% vs prior MTD",
  verifiedDecisions: "6 Decisions",
} as const;

/** Deterministic MTD daily series for Revenue vs Plan (day 1–28). */
export function cfoRevenueMtdSeries(): {
  day: number;
  actual: number;
  plan: number;
  forecast: number;
}[] {
  const out: { day: number; actual: number; plan: number; forecast: number }[] =
    [];
  let actual = 0;
  let plan = 0;
  for (let d = 1; d <= 28; d++) {
    const weekday = (d + 2) % 7;
    const planDay = weekday === 5 || weekday === 6 ? 19500 : 15500;
    const actualDay =
      planDay *
      (d <= 22
        ? 1.04 + (d % 5) * 0.008 - (d === 12 || d === 19 ? 0.06 : 0)
        : 0);
    plan += planDay;
    if (d <= 22) actual += actualDay;
    const forecast =
      d <= 22 ? actual : actual + (d - 22) * 16200 * (d > 25 ? 1.08 : 1);
    out.push({
      day: d,
      actual: d <= 22 ? Math.round(actual) : 0,
      plan: Math.round(plan),
      forecast: Math.round(forecast),
    });
  }
  return out;
}

/** Contribution margin % trend (30 points) + driver annotations. */
export function cfoMarginTrend(): {
  pts: number[];
  plan: number[];
  annotations: { i: number; label: string }[];
} {
  const pts = [
    29.8, 29.6, 29.4, 29.1, 28.9, 29.2, 29.5, 29.3, 28.8, 28.4, 28.1, 27.6,
    27.9, 28.2, 28.0, 27.7, 27.4, 27.8, 28.1, 28.3, 28.0, 27.6, 27.9, 28.2,
    28.4, 28.1, 27.8, 28.0, 28.2, 28.2,
  ];
  const plan = pts.map((_, i) => 29.4 - i * 0.01);
  return {
    pts,
    plan,
    annotations: [
      { i: 11, label: "COGS" },
      { i: 17, label: "Labor" },
      { i: 22, label: "Channel" },
    ],
  };
}

/** Catalog GM metric lock (PDF 02). */
export const GM_CATALOG = {
  revenue: "$18,420",
  revenueDelta: "+12.6% vs plan",
  contribution: "$6,870",
  contributionDelta: "+14.2% vs plan",
  covers: "124",
  coversDelta: "+8.8% vs plan",
  avgCheck: "$148",
  avgCheckDelta: "+3.5% vs plan",
  labor: "26.1%",
  laborDelta: "−2.3 pp vs plan",
  reservations: "112",
  reservationsDelta: "93% booked capacity · 12 walk-ins",
  verified: "$3,793",
  verifiedDelta: "+18.6% vs prior MTD",
  weather: "22°C · Partly cloudy",
  service: "In service",
} as const;

export const MISSION_ART = "/demo/facilities/berlin-terrace.jpg";

/** Deterministic demo sparklines for metric cards. */
export function sparkPath(seed: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const x = 2 + i * 7;
    const y =
      18 -
      ((Math.sin(seed * 1.7 + i * 0.7) * 0.5 + 0.5) * 10 + (i / 12) * 4);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Verified Value bar chart (catalog silhouette). */
export function verifiedBars(seed = 1): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const v =
      28 +
      ((Math.sin(seed + i * 0.55) * 0.5 + 0.5) * 48 + i * 2.2);
    return Math.min(92, Math.round(v));
  });
}
