/**
 * Demo lookback - invented history so owners can review Month / Year / Day.
 * Deterministic from horizon + scope + fiscal year (not live service).
 */

import { LOCATIONS } from "@/lib/product/demo/catalog";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import { locationLabel, type LocationScope } from "@/lib/product/demo/dashboard";
import type { RoleView } from "@/lib/product/types";
import { shortLocationName } from "@/lib/radr/locationCatalog";

export type LookbackHorizon = "day" | "mtd" | "ytd";

export type LookbackTone = "good" | "watch" | "bad" | "neutral";

export type FiscalYearId = "fy2024" | "fy2025" | "fy2026";

export type FiscalYearOption = {
  id: FiscalYearId;
  label: string;
  short: string;
  /** Calendar year the FY maps to in this demo */
  year: number;
  /** True when year is still in progress */
  partial?: boolean;
};

export const FISCAL_YEARS: FiscalYearOption[] = [
  { id: "fy2024", label: "FY 2024", short: "’24", year: 2024 },
  { id: "fy2025", label: "FY 2025", short: "’25", year: 2025 },
  { id: "fy2026", label: "FY 2026", short: "’26", year: 2026, partial: true },
];

export type LookbackKpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: LookbackTone;
};

export type LookbackSeriesPoint = {
  id: string;
  label: string;
  /** 0-11 for months, week/service index otherwise */
  index: number;
  revenue: number;
  expenses: number;
  contribution: number;
  /** Planned contribution for bar track */
  planContribution: number;
  verified: number;
  vsPlanPct: number;
  revenueVsPlanPct: number;
  expenseVsPlanPct: number;
  tone: LookbackTone;
  /** Incomplete / in-progress month */
  partial?: boolean;
  /** Remaining months of a partial year - forecast only */
  forecastOnly?: boolean;
  /**
   * Only when something exceptional moved the month.
   * Unmarked months held near plan - no sticker needed.
   */
  notable?: {
    label: string;
    detail: string;
    tone: LookbackTone;
  } | null;
  /** @deprecated use notable.label */
  marker?: string | null;
  /** Prior FY same month, when comparing */
  compare?: {
    revenue: number;
    expenses: number;
    contribution: number;
    vsPlanPct: number;
  };
};

export type YearTrackPoint = {
  id: string;
  label: string;
  index: number;
  /** Cumulative actual contribution through this month (null if future) */
  actualCum: number | null;
  /** Cumulative full-year forecast / plan through this month */
  forecastCum: number;
  monthlyActual: number | null;
  monthlyForecast: number;
  future: boolean;
  partial?: boolean;
  /** Bar fill: green strong · amber soft · red material · grey future/neutral */
  barTone: LookbackTone;
  /** Progressive disclosure on hover / click */
  revenue: number | null;
  expenses: number | null;
  verified: number | null;
  /**
   * Exceptional condition only - unmarked = near plan, nothing special to call out.
   */
  notable?: {
    label: string;
    detail: string;
    tone: LookbackTone;
  } | null;
  marker?: string | null;
  /** Prior-year same month when comparing */
  compareContribution?: number | null;
};

export type YearQuarter = {
  id: "Q1" | "Q2" | "Q3" | "Q4";
  /** e.g. Q1 · Winter */
  label: string;
  monthFrom: number;
  monthTo: number;
  contribution: number;
  plan: number;
  vsPlanPct: number;
  /** Season reading for operators */
  season: string;
  /** Why this quarter landed where it did */
  why: string;
  tone: LookbackTone;
  partial?: boolean;
};

export type YearSeasonBand = {
  id: string;
  label: string;
  monthFrom: number;
  monthTo: number;
  detail: string;
};

export type SeatingPartyRow = {
  id: "two" | "four" | "six";
  label: string;
  /** Share of seated covers */
  coverSharePct: number;
  /** Tables of this size on the floor */
  tableCount: number;
  contribPerCover: number;
  turnsPerNight: number;
  vsPlanPct: number;
  tone: LookbackTone;
};

export type SeatingMixInsight = {
  /** Short chapter kicker */
  kicker: string;
  headline: string;
  radrSays: string;
  /** Expected annual contribution uplift (demo range midpoint) */
  impactEuro: number;
  impactLabel: string;
  parties: SeatingPartyRow[];
  actions: string[];
  evidenceNote: string;
};

export type YearVerifiedCategory = {
  id: string;
  label: string;
  amount: number;
  detail: string;
};

export type YearVerifiedProof = {
  total: number;
  recoveryRatePct: number;
  line: string;
  categories: YearVerifiedCategory[];
};

export type YearTrack = {
  points: YearTrackPoint[];
  ytdActual: number;
  ytdForecast: number;
  fullYearForecast: number;
  vsForecastPct: number;
  statusLine: string;
  quarters: YearQuarter[];
  seasons: YearSeasonBand[];
  seating: SeatingMixInsight;
};

export type LookbackHighlight = {
  id: string;
  title: string;
  detail: string;
  value?: string;
};

export type LookbackLocationRow = {
  id: string;
  name: string;
  city: string;
  contribution: number;
  revenue: number;
  expenses: number;
  verified: number;
  vsPlanPct: number;
  highlight: string;
};

export type YearDriver = {
  id: string;
  territory: string; // uppercase short e.g. TERRACE, LABOR
  detail: string;
  amount: number; // signed euros
  tone: "good" | "bad" | "neutral";
  tag?: string;
};

export type YearGuidance = {
  repeat: string[];
  fix: string[];
  /** Chapter 07 · operating changes for next year */
  nextYear: string[];
};

export type MonthDriver = {
  id: string;
  label: string;
  detail: string;
  impact: string;
  tone: LookbackTone;
};

export type MonthLesson = {
  id: string;
  title: string;
  detail: string;
};

export type MonthLookbackDetail = {
  id: string;
  monthIndex: number;
  label: string;
  fullLabel: string;
  fiscalYearId: FiscalYearId;
  fiscalYearLabel: string;
  headline: string;
  verdict: string;
  tone: LookbackTone;
  kpis: LookbackKpi[];
  labor: string;
  laborPct: string;
  cogs: string;
  channelMix: string;
  dineInPct: number;
  deliveryPct: number;
  returningGuestRevenue: string;
  terraceEffect: string;
  topPositive: string;
  topNegative: string;
  verified: string;
  notable: string;
  drivers: MonthDriver[];
  lessons: MonthLesson[];
  locations: LookbackLocationRow[];
};

export type LookbackBrief = {
  horizon: LookbackHorizon;
  title: string;
  periodLabel: string;
  scopeLabel: string;
  /** Role-aware narrative under the title */
  narrative: string;
  fiscalYearId?: FiscalYearId;
  compareFiscalYearId?: FiscalYearId | null;
  fiscalYears?: FiscalYearOption[];
  kpis: LookbackKpi[];
  series: LookbackSeriesPoint[];
  seriesLabel: string;
  highlights: LookbackHighlight[];
  yearDrivers: YearDriver[];
  pulseLine: string;
  guidance: YearGuidance | null;
  locations: LookbackLocationRow[];
  /** Full-year forecast vs YTD actual tracking */
  yearTrack: YearTrack | null;
  /** Concise RADR proof block */
  verifiedProof: YearVerifiedProof | null;
  /** Best complete month in the viewed series */
  bestMonthId: string | null;
  bestMonthLabel: string | null;
};

function seedFrom(...parts: Array<string | number>): number {
  let h = 0;
  const s = parts.join(":");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h || 1;
}

function mulberry(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function eur(n: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function signedEur(n: number) {
  const abs = eur(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

function signedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1).replace(".", ",")}%`;
}

function toneFromDelta(pct: number): LookbackTone {
  if (pct >= 2) return "good";
  if (pct <= -3) return "bad";
  if (pct < 0) return "watch";
  return "neutral";
}

function scopeLocations(scope: LocationScope) {
  if (scope === "all") return LOCATIONS;
  if (scope.startsWith("region_")) {
    const code = scope.replace("region_", "").toUpperCase();
    const map: Record<string, string[]> = {
      DE: ["DE"],
      NL: ["NL"],
      UK: ["UK"],
      FR: ["FR"],
      US: ["US"],
      APAC: ["JP", "SG", "AU"],
      MENA: ["AE"],
    };
    const countries = map[code] ?? [];
    return LOCATIONS.filter((l) => countries.includes(l.country));
  }
  return LOCATIONS.filter((l) => l.id === scope);
}

function monthLabels(): string[] {
  return [
    "J A N",
    "F E B",
    "M A R",
    "A P R",
    "M A Y",
    "J U N",
    "J U L",
    "A U G",
    "S E P",
    "O C T",
    "N O V",
    "D E C",
  ];
}

/**
 * Hospitality contribution seasonality - not a flat run-rate.
 * Soft winter → terrace ramp → midsummer heat soft → autumn cool → Dec rebound.
 */
const MONTH_SEASON = [
  0.66, 0.72, 0.9, 1.02, 1.2, 1.42, 1.12, 1.24, 1.08, 0.84, 0.76, 1.14,
] as const;

const MONTH_SHOCK: Record<
  number,
  {
    mult: number;
    notable: {
      label: string;
      detail: string;
      tone: LookbackTone;
    };
  }
> = {
  2: {
    mult: 1.07,
    notable: {
      label: "Terrace opened",
      detail:
        "Patio nights started early - covers extended without adding fixed labor.",
      tone: "good",
    },
  },
  5: {
    mult: 1.1,
    notable: {
      label: "Terrace peak",
      detail:
        "Peak outdoor season. Contribution climbed with the weather, not with overtime.",
      tone: "good",
    },
  },
  6: {
    mult: 0.78,
    notable: {
      label: "Heat cut covers",
      detail:
        "Extreme heat suppressed covers. Contribution fell vs the plan for July.",
      tone: "bad",
    },
  },
  11: {
    mult: 1.12,
    notable: {
      label: "Holiday rush",
      detail:
        "Holiday bookings and beverage mix lifted contribution above the plan.",
      tone: "good",
    },
  },
};

function sumSeason(from: number, to: number): number {
  let s = 0;
  for (let i = from; i < to; i++) s += MONTH_SEASON[i] ?? 1;
  return s || 1;
}

function monthFullLabels(year: number): string[] {
  return [
    `January ${year}`,
    `February ${year}`,
    `March ${year}`,
    `April ${year}`,
    `May ${year}`,
    `June ${year}`,
    `July ${year}`,
    `August ${year}`,
    `September ${year}`,
    `October ${year}`,
    `November ${year}`,
    `December ${year}`,
  ];
}

function weekLabels(): string[] {
  return ["W1", "W2", "W3", "W4", "W5"];
}

export function periodToLookbackHorizon(
  period: DashPeriod,
): LookbackHorizon | null {
  if (period === "mtd") return "mtd";
  if (period === "ytd") return "ytd";
  if (period === "yesterday") return "day";
  return null;
}

function fyOption(id: FiscalYearId): FiscalYearOption {
  return FISCAL_YEARS.find((y) => y.id === id) ?? FISCAL_YEARS[2]!;
}

function yearScale(fy: FiscalYearOption): number {
  // Older years slightly softer; current year partial through Sep
  if (fy.id === "fy2024") return 0.88;
  if (fy.id === "fy2025") return 0.96;
  return 1;
}

function monthsInYear(fy: FiscalYearOption): number {
  if (fy.partial) return 9; // Jan-Sep 2026 actual
  return 12;
}

/** YTD strip always shows 12 months - remaining are forecast. */
function seriesMonthCount(horizon: LookbackHorizon, fy: FiscalYearOption): number {
  if (horizon === "ytd") return 12;
  return monthsInYear(fy);
}

type BuiltSeries = {
  series: LookbackSeriesPoint[];
  totalRevenue: number;
  totalExpenses: number;
  totalContrib: number;
  totalVerified: number;
  vsPlan: number;
};

function buildSeries(input: {
  scope: LocationScope;
  horizon: LookbackHorizon;
  fy: FiscalYearOption;
  compareFy?: FiscalYearOption | null;
  group: boolean;
}): BuiltSeries {
  const rand = mulberry(
    seedFrom(String(input.scope), input.horizon, input.fy.id),
  );
  const baseContrib = input.group ? 2_450_000 : 186_000;
  const horizonScale =
    input.horizon === "ytd" ? 1 : input.horizon === "mtd" ? 0.09 : 0.0032;
  const totalContrib =
    baseContrib *
    horizonScale *
    yearScale(input.fy) *
    (0.85 + rand() * 0.3) *
    (input.group ? 1 : 0.12 / 0.09);

  const actualMonths =
    input.horizon === "ytd" ? monthsInYear(input.fy) : seriesMonthCount(input.horizon, input.fy);
  const labels =
    input.horizon === "ytd"
      ? monthLabels()
      : input.horizon === "mtd"
        ? weekLabels()
        : ["Lunch", "Dinner"];

  const compareRand = input.compareFy
    ? mulberry(seedFrom(String(input.scope), input.horizon, input.compareFy.id))
    : null;
  const compareTotal = input.compareFy
    ? baseContrib *
      horizonScale *
      yearScale(input.compareFy) *
      (0.85 + (compareRand?.() ?? 0.5) * 0.3) *
      (input.group ? 1 : 0.12 / 0.09)
    : 0;

  const monthDenom =
    input.horizon === "ytd"
      ? input.fy.partial
        ? actualMonths
        : 12
      : labels.length;

  const series: LookbackSeriesPoint[] = labels.map((label, i) => {
    const forecastOnly =
      input.horizon === "ytd" && input.fy.partial && i >= actualMonths;

    let contribution: number;
    let planContribution: number;
    let vsPlanPct: number;
    let notable: LookbackSeriesPoint["notable"] = null;

    if (input.horizon === "ytd") {
      // Plan follows seasonal hospitality curve; exceptional months get a notable.
      const ytdWeight = sumSeason(0, input.fy.partial ? actualMonths : 12);
      const yearWeight = sumSeason(0, 12);
      const fullYearPlan = input.fy.partial
        ? totalContrib * (yearWeight / ytdWeight)
        : totalContrib;
      const season = MONTH_SEASON[i] ?? 1;
      const planMonthly = fullYearPlan * (season / yearWeight);
      const shock = MONTH_SHOCK[i];
      planContribution = planMonthly;
      if (forecastOnly) {
        contribution = planMonthly;
        vsPlanPct = 0;
        notable = null;
      } else {
        const eventMult = shock?.mult ?? 1;
        const wobble = 0.84 + rand() * 0.36;
        contribution = planMonthly * eventMult * wobble;
        vsPlanPct =
          ((contribution - planContribution) / planContribution) * 100;
        notable = shock?.notable ?? null;
      }
    } else {
      const seasonal = 1 + Math.sin((i - 1) / 2.2) * 0.12;
      const wobble = 0.78 + rand() * 0.45;
      contribution = (totalContrib / monthDenom) * wobble * seasonal;
      vsPlanPct = (rand() - 0.42) * 11;
      planContribution = contribution / (1 + vsPlanPct / 100);
      notable = null;
    }

    const margin = 0.54 + rand() * 0.1;
    const revenue = contribution / margin;
    const expenses = revenue - contribution;
    const revenueVsPlanPct = forecastOnly ? 0 : vsPlanPct * (0.7 + rand() * 0.4);
    const expenseVsPlanPct = forecastOnly ? 0 : (rand() - 0.55) * 10;
    const partial = Boolean(
      input.fy.partial &&
        input.horizon === "ytd" &&
        i === actualMonths - 1 &&
        !forecastOnly,
    );

    let compare: LookbackSeriesPoint["compare"];
    if (compareRand && input.compareFy && !forecastOnly) {
      const cSeason = MONTH_SEASON[i] ?? 1;
      const cWeight = sumSeason(0, 12);
      const cBase = compareTotal * (cSeason / cWeight);
      const cShock = MONTH_SHOCK[i]?.mult ?? 1;
      const cContrib = cBase * cShock * (0.85 + compareRand() * 0.32);
      const cMargin = 0.54 + compareRand() * 0.1;
      const cRev = cContrib / cMargin;
      compare = {
        revenue: cRev,
        expenses: cRev - cContrib,
        contribution: cContrib,
        vsPlanPct: ((cContrib - cBase) / cBase) * 100,
      };
    }

    return {
      id: `p_${input.fy.id}_${i}`,
      label,
      index: i,
      revenue,
      expenses,
      contribution,
      planContribution,
      verified: forecastOnly ? 0 : contribution * (0.015 + rand() * 0.02),
      vsPlanPct,
      revenueVsPlanPct,
      expenseVsPlanPct,
      tone: forecastOnly || partial ? "neutral" : toneFromDelta(vsPlanPct),
      partial,
      forecastOnly,
      notable,
      marker: notable?.label ?? null,
      compare,
    };
  });

  const actual = series.filter((p) => !p.forecastOnly);
  const totalRevenue = actual.reduce((s, p) => s + p.revenue, 0);
  const totalExpenses = actual.reduce((s, p) => s + p.expenses, 0);
  const totalVerified = actual.reduce((s, p) => s + p.verified, 0);
  const vsPlan =
    actual.reduce((s, p) => s + p.vsPlanPct, 0) / Math.max(1, actual.length);

  return {
    series,
    totalRevenue,
    totalExpenses,
    totalContrib: actual.reduce((s, p) => s + p.contribution, 0),
    totalVerified,
    vsPlan,
  };
}

function barToneFromDelta(
  vsPlanPct: number,
  future: boolean,
  partial?: boolean,
): LookbackTone {
  if (future || partial) return "neutral";
  if (vsPlanPct >= 1) return "good";
  if (vsPlanPct <= -8) return "bad";
  if (vsPlanPct <= -2) return "watch";
  return "neutral";
}

function buildYearTrack(series: LookbackSeriesPoint[]): YearTrack {
  let actualCum = 0;
  let forecastCum = 0;
  let ytdForecast = 0;
  let lastActualIdx = -1;

  const points: YearTrackPoint[] = series.map((p) => {
    const monthlyForecast = p.planContribution;
    forecastCum += monthlyForecast;
    const future = Boolean(p.forecastOnly);
    let monthlyActual: number | null = null;
    let actualCumOut: number | null = null;
    if (!future) {
      monthlyActual = p.contribution;
      actualCum += p.contribution;
      actualCumOut = actualCum;
      ytdForecast = forecastCum;
      lastActualIdx = p.index;
    }
    return {
      id: p.id,
      label: p.label,
      index: p.index,
      actualCum: actualCumOut,
      forecastCum,
      monthlyActual,
      monthlyForecast,
      future,
      partial: p.partial,
      barTone: barToneFromDelta(p.vsPlanPct, future, p.partial),
      revenue: future ? null : p.revenue,
      expenses: future ? null : p.expenses,
      verified: future ? null : p.verified,
      notable: p.notable ?? null,
      marker: p.notable?.label ?? p.marker ?? null,
      compareContribution: p.compare?.contribution ?? null,
    };
  });

  const ytdActual = actualCum;
  const fullYearForecast = forecastCum;
  const vsForecastPct =
    ytdForecast > 0 ? ((ytdActual - ytdForecast) / ytdForecast) * 100 : 0;
  const remaining = fullYearForecast - ytdActual;
  const statusLine =
    lastActualIdx < 11
      ? `Year to date is ${signedPct(vsForecastPct)} vs the plan for the same months · ${eur(remaining)} still in the forecast`
      : `Year closed ${signedPct(vsForecastPct)} vs full-year plan`;

  const quarterDefs: Array<{
    id: YearQuarter["id"];
    season: string;
    from: number;
    to: number;
    whyGood: string;
    whySoft: string;
    whyBad: string;
    whyAhead: string;
  }> = [
    {
      id: "Q1",
      season: "Indoor winter",
      from: 0,
      to: 2,
      whyGood:
        "Indoor turns held density while patio stayed closed - labor tracked the quieter cover curve.",
      whySoft:
        "Indoor winter held covers, but weekday lunch conversion left contribution soft.",
      whyBad:
        "Indoor months missed plan - midweek covers and labor ratio both slipped.",
      whyAhead: "Still ahead in the forecast.",
    },
    {
      id: "Q2",
      season: "Terrace opens",
      from: 3,
      to: 5,
      whyGood:
        "Terrace open added incremental covers without overtime spikes on warm evenings.",
      whySoft:
        "Terrace opened on schedule, but contribution barely cleared plan - staffing lagged weather clears.",
      whyBad:
        "Terrace season opened late relative to weather - covers stretched outdoors without matching labor and product.",
      whyAhead: "Still ahead in the forecast.",
    },
    {
      id: "Q3",
      season: "Peak terrace",
      from: 6,
      to: 8,
      whyGood:
        "Peak terrace covers converted - heatwave nights held contribution with controlled labor.",
      whySoft:
        "Terrace was busy, but labor and hero-item stockouts compressed contribution.",
      whyBad:
        "Underperformed despite terrace strength - labor spikes and hero-item stockouts compressed contribution.",
      whyAhead: "Partial quarter - remaining months still in forecast.",
    },
    {
      id: "Q4",
      season: "Cooling · holidays",
      from: 9,
      to: 11,
      whyGood:
        "Holiday rushes indoors offset patio wind-down - returning guests lifted December.",
      whySoft:
        "Cooling months near plan - holiday rushes helped, soft midweeks did not.",
      whyBad:
        "Cooling into holidays missed plan - indoor density did not replace terrace contribution.",
      whyAhead: "Forecast · cooling + holiday rushes still ahead.",
    },
  ];

  const quarters: YearQuarter[] = quarterDefs.map((q) => {
    const slice = points.filter((p) => p.index >= q.from && p.index <= q.to);
    const actualSlice = slice.filter((p) => p.monthlyActual != null);
    const contribution = actualSlice.reduce(
      (s, p) => s + (p.monthlyActual ?? 0),
      0,
    );
    const plan = slice.reduce((s, p) => s + p.monthlyForecast, 0);
    const planForActual = actualSlice.reduce((s, p) => s + p.monthlyForecast, 0);
    const vs =
      planForActual > 0 && actualSlice.length
        ? ((contribution - planForActual) / planForActual) * 100
        : 0;
    const partial = slice.some((p) => p.partial || p.future);
    const tone = actualSlice.length ? toneFromDelta(vs) : "neutral";
    const why =
      !actualSlice.length
        ? q.whyAhead
        : vs >= 1
          ? q.whyGood
          : vs <= -6
            ? q.whyBad
            : vs <= -2
              ? q.whySoft
              : q.whyGood;
    return {
      id: q.id,
      label: `${q.id} · ${q.season}`,
      monthFrom: q.from,
      monthTo: q.to,
      contribution,
      plan,
      vsPlanPct: actualSlice.length ? vs : 0,
      season: q.season,
      why,
      tone,
      partial,
    };
  });

  const seasons: YearSeasonBand[] = [
    {
      id: "indoor",
      label: "Indoor",
      monthFrom: 0,
      monthTo: 1,
      detail: "Patio closed · denser indoor turns",
    },
    {
      id: "terrace",
      label: "Terrace",
      monthFrom: 2,
      monthTo: 8,
      detail: "Terrace open Mar-Sep · covers stretch outdoors",
    },
    {
      id: "cool",
      label: "Indoor",
      monthFrom: 9,
      monthTo: 11,
      detail: "Patio winds down · holiday rushes indoors",
    },
  ];

  const seating: SeatingMixInsight = {
    kicker: "Floor opportunity",
    headline:
      "2-tops earn +22% more contribution per cover than 4-tops on Thu-Sat peak.",
    radrSays:
      "Convert 3 fixed 4-tops to flexible 2+2 for Thu-Sat dinner. Keep 4-tops for Sat lunch and family Sunday.",
    impactEuro: 18_400,
    impactLabel: "Expected annual contribution uplift",
    parties: [
      {
        id: "two",
        label: "2-tops",
        coverSharePct: 34,
        tableCount: 18,
        contribPerCover: 48.2,
        turnsPerNight: 2.4,
        vsPlanPct: 6.8,
        tone: "good",
      },
      {
        id: "four",
        label: "4-tops",
        coverSharePct: 49,
        tableCount: 22,
        contribPerCover: 39.1,
        turnsPerNight: 1.7,
        vsPlanPct: -2.4,
        tone: "watch",
      },
      {
        id: "six",
        label: "6+",
        coverSharePct: 17,
        tableCount: 6,
        contribPerCover: 36.4,
        turnsPerNight: 1.3,
        vsPlanPct: -4.1,
        tone: "watch",
      },
    ],
    actions: [
      "Add 4 flexible 2-tops for terrace season (already proven in Q2-Q3)",
      "Hold large 6+ for booked groups only - do not default walk-ins there",
      "Revisit after next terrace open: measure contrib / cover by party size again",
    ],
    evidenceNote:
      "From POS party size × table assignment · contribution allocated by cover",
  };

  return {
    points,
    ytdActual,
    ytdForecast,
    fullYearForecast,
    vsForecastPct,
    statusLine,
    quarters,
    seasons,
    seating,
  };
}

function pickBestMonth(series: LookbackSeriesPoint[]): {
  id: string;
  label: string;
} | null {
  const closed = series.filter((p) => !p.forecastOnly && !p.partial);
  const pool = closed.length ? closed : series.filter((p) => !p.forecastOnly);
  if (!pool.length) return null;
  const best = pool.reduce((a, b) =>
    a.contribution >= b.contribution ? a : b,
  );
  return { id: best.id, label: best.label };
}

function buildLocations(input: {
  scope: LocationScope;
  totalContrib: number;
  totalRevenue: number;
  seedKey: string;
}): LookbackLocationRow[] {
  const locs = scopeLocations(input.scope);
  const n = Math.max(1, locs.length);
  const rand = mulberry(seedFrom(input.seedKey, "locs"));
  const practices = [
    "Terrace opened on warm nights",
    "Waitlist fill under 12 min",
    "Beverage attach held",
    "86 risk sourced early",
    "Labor matched peak covers",
    "Delivery fees watched",
  ];
  const rows = locs.map((loc, i) => {
    const share = (0.04 + rand() * 0.12) / Math.max(0.5, n * 0.08);
    const contribution = input.totalContrib * share * (0.7 + (i % 5) * 0.08);
    const margin = 0.55 + rand() * 0.08;
    const revenue = contribution / margin;
    return {
      id: loc.id,
      name: shortLocationName(loc.name),
      city: loc.city,
      contribution,
      revenue,
      expenses: revenue - contribution,
      verified: contribution * (0.012 + rand() * 0.02),
      vsPlanPct: (rand() - 0.4) * 9,
      highlight: practices[i % practices.length]!,
    };
  });
  rows.sort((a, b) => b.contribution - a.contribution);
  return rows;
}

type YearContext = {
  role: RoleView;
  built: BuiltSeries;
  locations: LookbackLocationRow[];
  recoveryRate: number;
  attentionAbsorbed: number;
  rand: () => number;
};

function roleBucket(
  role: RoleView,
): "gm" | "finance" | "portfolio" | "kitchen" | "ops" {
  if (role === "gm") return "gm";
  if (role === "cfo" || role === "finance") return "finance";
  if (role === "owner" || role === "coo" || role === "regional") return "portfolio";
  if (role === "head_chef" || role === "kitchen") return "kitchen";
  return "ops";
}

function buildYearDrivers(ctx: YearContext): YearDriver[] {
  const { built, locations, rand } = ctx;
  const c = built.totalContrib;
  const leader = locations[0];
  const lagger = [...locations].sort((a, b) => a.vsPlanPct - b.vsPlanPct)[0];
  const bucket = roleBucket(ctx.role);

  if (bucket === "gm") {
    return [
      {
        id: "yd_service",
        territory: "SERVICE",
        detail: "Peak covers held without overtime spikes on Friday-Saturday",
        amount: c * (0.045 + rand() * 0.02),
        tone: "good",
      },
      {
        id: "yd_labor",
        territory: "LABOR",
        detail: "Soft nights avoided overstaffing - hours tracked the cover curve",
        amount: c * (0.03 + rand() * 0.015),
        tone: "good",
      },
      {
        id: "yd_recover",
        territory: "RECOVERY",
        detail: "Waitlist refill protected perishable seats before social blast",
        amount: built.totalVerified * (0.85 + rand() * 0.3),
        tone: "good",
      },
      {
        id: "yd_menu",
        territory: "MENU",
        detail: "Stockouts on hero dishes compressed peak-night contribution",
        amount: -(c * (0.022 + rand() * 0.012)),
        tone: "bad",
      },
      {
        id: "yd_ops",
        territory: "CHANNEL",
        detail: "Delivery fee drift thinned weekday lunch contribution",
        amount: -(c * (0.018 + rand() * 0.012)),
        tone: "bad",
      },
    ];
  }

  if (bucket === "finance") {
    const laborPct = 28 + rand() * 4;
    const cogsPct = 26 + rand() * 3;
    return [
      {
        id: "yd_rev",
        territory: "REVENUE",
        detail: `${signedPct(
          built.series.reduce((s, p) => s + p.revenueVsPlanPct, 0) /
            Math.max(1, built.series.length),
        )} vs plan across the fiscal year`,
        amount: built.totalRevenue - built.totalRevenue / (1 + built.vsPlan / 100),
        tone: built.vsPlan >= 0 ? "good" : "bad",
      },
      {
        id: "yd_contrib",
        territory: "CONTRIBUTION",
        detail: "Operating contribution after controllable costs",
        amount: c * (0.02 + rand() * 0.02) * (built.vsPlan >= 0 ? 1 : -1),
        tone: built.vsPlan >= 0 ? "good" : "bad",
      },
      {
        id: "yd_margin",
        territory: "MARGIN",
        detail: `Contribution margin ${((c / Math.max(1, built.totalRevenue)) * 100).toFixed(1)}% of revenue`,
        amount: c * (0.015 + rand() * 0.01),
        tone: "good",
      },
      {
        id: "yd_labor",
        territory: "LABOR%",
        detail: `Labor ${laborPct.toFixed(1)}% of revenue - ${laborPct < 30 ? "inside" : "above"} band`,
        amount:
          laborPct < 30
            ? c * (0.012 + rand() * 0.01)
            : -(c * (0.015 + rand() * 0.01)),
        tone: laborPct < 30 ? "good" : "bad",
      },
      {
        id: "yd_cogs",
        territory: "COGS",
        detail: `Food & beverage COGS ${cogsPct.toFixed(1)}% - supplier variance watched`,
        amount:
          cogsPct < 28
            ? c * (0.01 + rand() * 0.008)
            : -(c * (0.012 + rand() * 0.01)),
        tone: cogsPct < 28 ? "good" : "bad",
      },
      {
        id: "yd_channel",
        territory: "CHANNEL",
        detail: "Delivery mix climbed mid-year - fee thresholds reset late",
        amount: -(c * (0.02 + rand() * 0.01)),
        tone: "bad",
      },
      {
        id: "yd_supplier",
        territory: "SUPPLIER",
        detail: "Credit notes and short-delivery claims verified in-period",
        amount: built.totalVerified * (0.4 + rand() * 0.25),
        tone: "good",
      },
    ];
  }

  if (bucket === "portfolio") {
    return [
      {
        id: "yd_group_rev",
        territory: "GROUP DEMAND",
        detail: "Group revenue held through seasonal soft patches",
        amount: built.totalRevenue * (0.012 + rand() * 0.01),
        tone: "good",
        tag: "Estate",
      },
      {
        id: "yd_guests",
        territory: "RETURNING GUESTS",
        detail: "Repeat visits lifted contribution in Q2 and Q3",
        amount: c * (0.028 + rand() * 0.012),
        tone: "good",
        tag: "Guest mix",
      },
      {
        id: "yd_terrace",
        territory: "TERRACE",
        detail: "Warm evenings added incremental covers and contribution",
        amount: c * (0.022 + rand() * 0.01),
        tone: "good",
        tag: "Sell",
      },
      {
        id: "yd_labor",
        territory: "LABOR DRIFT",
        detail: "14 services exceeded target labor ratio",
        amount: -(c * (0.018 + rand() * 0.01)),
        tone: "bad",
        tag: "Labor",
      },
      {
        id: "yd_verified",
        territory: "VERIFIED BY RADR",
        detail: "Recovery + absorbed losses attributable to RADR",
        amount: built.totalVerified,
        tone: "good",
        tag: "Proof",
      },
      {
        id: "yd_risk",
        territory: "SOFT SITES",
        detail: lagger
          ? `${lagger.name} ${signedPct(lagger.vsPlanPct)} vs plan - copy winning plays`
          : "A few soft sites need the fill playbook",
        amount: lagger
          ? -(Math.abs(lagger.contribution) * (0.06 + rand() * 0.04))
          : -(c * 0.015),
        tone: "bad",
        tag: "Locations",
      },
    ];
  }

  if (bucket === "kitchen") {
    return [
      {
        id: "yd_covers",
        territory: "COVERS",
        detail: "Kitchen paced peak covers without ticket time blowouts",
        amount: c * (0.03 + rand() * 0.02),
        tone: "good",
      },
      {
        id: "yd_menu",
        territory: "MENU",
        detail: "Hero dishes held attach; soft items trimmed mid-year",
        amount: c * (0.022 + rand() * 0.015),
        tone: "good",
      },
      {
        id: "yd_waste",
        territory: "WASTE",
        detail: "Prep waste tracked under house target on protein lines",
        amount: c * (0.015 + rand() * 0.01),
        tone: "good",
      },
      {
        id: "yd_86",
        territory: "STOCKOUTS",
        detail: "86 risk caught early - prep adjusted before guest-facing gaps",
        amount: c * (0.018 + rand() * 0.012),
        tone: "good",
      },
      {
        id: "yd_allergy",
        territory: "ALLERGY",
        detail: "Allergy tickets stayed clean - no critical misses logged",
        amount: c * (0.008 + rand() * 0.006),
        tone: "good",
      },
      {
        id: "yd_prod",
        territory: "KITCHEN",
        detail: "Productivity dipped on two understaffed soft Tuesdays",
        amount: -(c * (0.012 + rand() * 0.01)),
        tone: "bad",
      },
    ];
  }

  // Balanced ops default
  return [
    {
      id: "yd_ops_rev",
      territory: "REVENUE",
      detail: "Top-line held near plan across the operating year",
      amount: built.totalRevenue * (0.01 + rand() * 0.008),
      tone: "good",
    },
    {
      id: "yd_ops_labor",
      territory: "LABOR",
      detail: "Labor matched covers on peak nights; soft nights watched",
      amount: c * (0.02 + rand() * 0.012),
      tone: "good",
    },
    {
      id: "yd_ops_recover",
      territory: "RECOVER",
      detail: "Cancellations and no-shows filled before leakage",
      amount: built.totalVerified * (0.7 + rand() * 0.3),
      tone: "good",
    },
    {
      id: "yd_ops_channel",
      territory: "CHANNEL",
      detail: "Delivery share climbed - contribution thinned midweek",
      amount: -(c * (0.015 + rand() * 0.01)),
      tone: "bad",
    },
    {
      id: "yd_ops_loc",
      territory: "LOCATION",
      detail: leader
        ? `${leader.name} taught the year · ${leader.highlight}`
        : "Estate practices transferred across sites",
      amount: leader ? leader.contribution * 0.06 : c * 0.02,
      tone: "good",
    },
  ];
}

function buildRoleKpis(ctx: YearContext, horizon: LookbackHorizon): LookbackKpi[] {
  const { built, recoveryRate, attentionAbsorbed, rand } = ctx;
  const expenseDelta =
    built.series.reduce((s, p) => s + p.expenseVsPlanPct, 0) /
    Math.max(1, built.series.length);
  const expenseTone: LookbackTone =
    expenseDelta <= -1 ? "good" : expenseDelta >= 3 ? "bad" : "watch";
  const revDelta =
    built.series.reduce((s, p) => s + p.revenueVsPlanPct, 0) /
    Math.max(1, built.series.length);
  const marginPct = (built.totalContrib / Math.max(1, built.totalRevenue)) * 100;
  const laborPct = 28 + rand() * 4;
  const cogsPct = 26 + rand() * 3;
  const covers = Math.round(
    (horizon === "ytd" ? 420_000 : horizon === "mtd" ? 38_000 : 1_240) *
      (0.9 + rand() * 0.2),
  );

  const baseFinance: LookbackKpi[] = [
    {
      id: "revenue",
      label: "Revenue",
      value: eur(built.totalRevenue),
      delta: `${signedPct(revDelta)} vs plan`,
      tone: toneFromDelta(revDelta),
    },
    {
      id: "expenses",
      label: "Expenses",
      value: eur(built.totalExpenses),
      delta: `${signedPct(expenseDelta)} vs plan`,
      tone: expenseTone,
    },
    {
      id: "contrib",
      label: "Contribution",
      value: eur(built.totalContrib),
      delta: `${signedPct(built.vsPlan)} vs plan`,
      tone: toneFromDelta(built.vsPlan),
    },
    {
      id: "verified",
      label: "Verified by RADR",
      value: eur(built.totalVerified),
      delta: `${recoveryRate.toFixed(0)}% recovery · ${Math.round(attentionAbsorbed)} absorbed`,
      tone: "good",
    },
  ];

  if (horizon !== "ytd") return baseFinance;

  const bucket = roleBucket(ctx.role);

  if (bucket === "gm") {
    return [
      {
        id: "covers",
        label: "Covers",
        value: covers.toLocaleString("de-DE"),
        delta: `${signedPct(1.2 + rand() * 2.4)} vs plan`,
        tone: "good",
      },
      {
        id: "labor",
        label: "Labor",
        value: eur(built.totalExpenses * (laborPct / 100)),
        delta: `${laborPct.toFixed(1)}% of revenue`,
        tone: laborPct < 30 ? "good" : "watch",
      },
      {
        id: "contrib",
        label: "Contribution",
        value: eur(built.totalContrib),
        delta: `${signedPct(built.vsPlan)} vs plan`,
        tone: toneFromDelta(built.vsPlan),
      },
      {
        id: "verified",
        label: "Verified recovery",
        value: eur(built.totalVerified),
        delta: `${recoveryRate.toFixed(0)}% recovery rate`,
        tone: "good",
      },
    ];
  }

  if (bucket === "finance") {
    return [
      {
        id: "revenue",
        label: "Revenue",
        value: eur(built.totalRevenue),
        delta: `${signedPct(revDelta)} vs plan`,
        tone: toneFromDelta(revDelta),
      },
      {
        id: "contrib",
        label: "Contribution",
        value: eur(built.totalContrib),
        delta: `${signedPct(built.vsPlan)} vs plan`,
        tone: toneFromDelta(built.vsPlan),
      },
      {
        id: "margin",
        label: "Margin",
        value: `${marginPct.toFixed(1)}%`,
        delta: `${signedPct(built.vsPlan * 0.4)} vs plan`,
        tone: toneFromDelta(built.vsPlan),
      },
      {
        id: "labor_pct",
        label: "Labor %",
        value: `${laborPct.toFixed(1)}%`,
        delta: laborPct < 30 ? "Inside band" : "Above band",
        tone: laborPct < 30 ? "good" : "watch",
      },
      {
        id: "cogs",
        label: "COGS",
        value: `${cogsPct.toFixed(1)}%`,
        delta: eur(built.totalExpenses * (cogsPct / 100)),
        tone: cogsPct < 28 ? "good" : "watch",
      },
      {
        id: "verified",
        label: "Supplier recovery",
        value: eur(built.totalVerified * 0.55),
        delta: "Credits & claims verified",
        tone: "good",
      },
    ];
  }

  if (bucket === "portfolio") {
    const growth = 1.4 + rand() * 3.2;
    return [
      {
        id: "group_rev",
        label: "Group revenue",
        value: eur(built.totalRevenue),
        delta: `${signedPct(revDelta)} vs plan`,
        tone: toneFromDelta(revDelta),
      },
      {
        id: "contrib",
        label: "Contribution",
        value: eur(built.totalContrib),
        delta: `${signedPct(built.vsPlan)} vs plan`,
        tone: toneFromDelta(built.vsPlan),
      },
      {
        id: "growth",
        label: "Same-store growth",
        value: signedPct(growth),
        delta: "YoY · estate comparable",
        tone: toneFromDelta(growth),
      },
      {
        id: "verified",
        label: "Verified Value",
        value: eur(built.totalVerified),
        delta: "RADR attributable outcomes",
        tone: "good",
      },
    ];
  }

  if (bucket === "kitchen") {
    return [
      {
        id: "covers",
        label: "Covers",
        value: covers.toLocaleString("de-DE"),
        delta: `${signedPct(0.8 + rand() * 2)} vs plan`,
        tone: "good",
      },
      {
        id: "waste",
        label: "Waste",
        value: `${(2.1 + rand() * 1.4).toFixed(1)}%`,
        delta: "Under house target",
        tone: "good",
      },
      {
        id: "86",
        label: "Stockouts avoided",
        value: `${Math.round(18 + rand() * 40)}`,
        delta: "86 risks caught early",
        tone: "good",
      },
      {
        id: "contrib",
        label: "Kitchen contribution",
        value: eur(built.totalContrib * 0.42),
        delta: `${signedPct(built.vsPlan)} vs plan`,
        tone: toneFromDelta(built.vsPlan),
      },
    ];
  }

  return baseFinance;
}

function driversToHighlights(drivers: YearDriver[]): LookbackHighlight[] {
  return drivers.map((d) => ({
    id: d.id,
    title: d.territory,
    detail: d.detail,
    value: signedEur(d.amount),
  }));
}

function buildYearNarrative(ctx: YearContext): string {
  const { built, locations, rand } = ctx;
  const leader = locations[0];
  const soft = [...locations].sort((a, b) => a.vsPlanPct - b.vsPlanPct)[0];
  const bucket = roleBucket(ctx.role);
  const vs = signedPct(built.vsPlan);

  if (bucket === "portfolio") {
    return built.vsPlan >= 0
      ? `Contribution held ${vs} vs plan. ${leader?.name ?? "Lead sites"} and returning guests offset softer lunch demand in Q2${soft ? ` - watch ${soft.name}` : ""}.`
      : `Contribution ran ${vs} vs plan. Terrace and recovery helped, but labor drift and a few soft sites pulled the year under.`;
  }
  if (bucket === "gm") {
    return built.vsPlan >= 0
      ? `Service held slightly above plan (${vs}). Labor tracked covers and waitlist recovery protected perishable seats - lunch conversion still soft midweek.`
      : `Operating contribution ${vs} vs plan. Peak nights performed; Tuesday lunch and labor on two soft services need the fix list.`;
  }
  if (bucket === "finance") {
    return `Revenue ${signedPct(
      built.series.reduce((s, p) => s + p.revenueVsPlanPct, 0) /
        Math.max(1, built.series.length),
    )} and contribution ${vs} vs plan. Verified recovery ${eur(built.totalVerified)} - channel mix and COGS are the cost pressure to watch.`;
  }
  if (bucket === "kitchen") {
    return `Covers paced without ticket blowouts. Menu contribution held; waste stayed under target - stockout risk caught early on ${(18 + Math.round(rand() * 20))} nights.`;
  }
  return `Contribution ${vs} vs plan. The drivers below explain what to repeat and what to fix before next year.`;
}

function buildYearGuidance(ctx: YearContext): YearGuidance {
  const bucket = roleBucket(ctx.role);
  if (bucket === "portfolio") {
    return {
      repeat: [
        "Terrace staffing pattern from May-July across warm markets",
        "Returning guest recovery sequences that lifted Q2-Q3",
        "High-margin dine-in mix on Fridays",
      ],
      fix: [
        "Tuesday lunch underperformance at lagging sites",
        "Labor drift on peak services",
        "Hero-item stockouts that compressed Q3 contribution",
      ],
      nextYear: [
        "Convert 3 fixed 4-tops to flexible 2+2 on peak nights",
        "Rework Salmon Teriyaki before the next menu print",
        "Protect Tuna Tataki Thu-Sat supply (par +14% or dual-source)",
        "Grow Miso Aubergine visibility before adding SKUs",
        "Copy terrace open-call discipline to every warm-market site",
      ],
    };
  }
  if (bucket === "gm") {
    return {
      repeat: [
        "Labor matched to the cover curve on Friday-Saturday",
        "Waitlist refill under 12 minutes",
        "Terrace open calls when weather clears",
      ],
      fix: [
        "Tuesday lunch conversion",
        "86 risk on hero dishes after 20:00",
        "4-top-heavy floor on Thu-Sat dinner",
      ],
      nextYear: [
        "Flexible 2+2 on three peak-night 4-tops",
        "Raise Thu-Sat Tataki par ~14%",
        "Cut early-week salmon par before touching peak nights",
        "Feature Miso Aubergine on FOH recommendations",
        "Keep waitlist refill under 12 minutes as house standard",
      ],
    };
  }
  if (bucket === "finance") {
    return {
      repeat: [
        "Supplier credit notes verified in-period",
        "Delivery fee thresholds reset when mix drifts",
        "Contribution margin reviews by channel",
      ],
      fix: [
        "Labor % above band on peak services",
        "COGS spike in seafood weeks",
        "Delivery share climbing without fee guardrails",
      ],
      nextYear: [
        "Board-ready verified recovery rollup each quarter",
        "Reprice or reformulate Salmon Teriyaki (~€12-16k annual)",
        "Guardrail delivery mix before commission thins weekday lunch",
        "Dual-source bluefin before another +20% cost year",
        "Floor mix change: expected +€18k contribution if 2+2 lands",
      ],
    };
  }
  if (bucket === "kitchen") {
    return {
      repeat: [
        "Early 86 risk sourcing on hero dishes",
        "Prep adjusted to forecast curve",
        "Waste checks under house target",
      ],
      fix: [
        "Late stockouts on Saturday peaks",
        "Over-prep on soft Tuesdays",
        "Salmon waste from early-week over-ordering",
      ],
      nextYear: [
        "Rework Salmon Teriyaki recipe or supplier",
        "Protect Tataki supply on Thu-Sat",
        "Raise aubergine par for Miso growth",
        "Cut early-week salmon par ~16%",
        "Keep allergen acknowledgment before first seating",
      ],
    };
  }
  return {
    repeat: [
      "Plays that held contribution above plan",
      "Verified recovery sequences",
    ],
    fix: ["Soft services that repeated", "Cost leaks that compounded"],
    nextYear: [
      "Protect what worked on peak nights",
      "Fix the three softest recurring services",
      "Convert floor mix where 2-tops outperform",
    ],
  };
}

function buildVerifiedProof(ctx: YearContext): YearVerifiedProof {
  const { built, recoveryRate, rand } = ctx;
  const total = built.totalVerified;
  const categories: YearVerifiedCategory[] = [
    {
      id: "cancel",
      label: "Cancellation recovery",
      amount: total * (0.34 + rand() * 0.06),
      detail: "Waitlist refill before social blast",
    },
    {
      id: "supplier",
      label: "Supplier recovery",
      amount: total * (0.18 + rand() * 0.05),
      detail: "Credit notes and short-delivery claims",
    },
    {
      id: "labor",
      label: "Labor protection",
      amount: total * (0.16 + rand() * 0.04),
      detail: "Soft nights avoided overstaffing",
    },
    {
      id: "menu",
      label: "Menu availability",
      amount: total * (0.14 + rand() * 0.04),
      detail: "Hero-item 86 risk caught early",
    },
    {
      id: "other",
      label: "Other verified",
      amount: 0,
      detail: "Comps, holds, and policy catches",
    },
  ];
  const assigned = categories
    .slice(0, 4)
    .reduce((s, c) => s + c.amount, 0);
  categories[4]!.amount = Math.max(0, total - assigned);

  return {
    total,
    recoveryRatePct: Math.round(recoveryRate),
    line: "Only outcomes with a trace - not projected savings.",
    categories,
  };
}

function rankDrivers(drivers: YearDriver[], limit = 5): YearDriver[] {
  return [...drivers]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, limit);
}

export function composeLookbackBrief(input: {
  period: DashPeriod;
  locationScope: LocationScope;
  dayLabel?: string;
  fiscalYearId?: FiscalYearId;
  compareFiscalYearId?: FiscalYearId | null;
  roleView?: RoleView;
}): LookbackBrief | null {
  const horizon = periodToLookbackHorizon(input.period);
  if (!horizon) return null;

  const role = input.roleView ?? "gm";
  const fy =
    horizon === "ytd"
      ? fyOption(input.fiscalYearId ?? "fy2026")
      : fyOption("fy2026");
  const compareFy =
    horizon === "ytd" && input.compareFiscalYearId
      ? fyOption(input.compareFiscalYearId)
      : null;

  const group =
    input.locationScope === "all" ||
    String(input.locationScope).startsWith("region_");

  const built = buildSeries({
    scope: input.locationScope,
    horizon,
    fy,
    compareFy,
    group,
  });

  const rand = mulberry(
    seedFrom(String(input.locationScope), horizon, fy.id, role),
  );
  const recoveryRate = 62 + rand() * 28;
  const attentionAbsorbed =
    Math.round(40 + rand() * 180) *
    (horizon === "ytd" ? 12 : horizon === "mtd" ? 1 : 0.05);

  const locations = buildLocations({
    scope: input.locationScope,
    totalContrib: built.totalContrib,
    totalRevenue: built.totalRevenue,
    seedKey: `${input.locationScope}:${fy.id}`,
  });
  const leader = locations[0]!;
  const lagger = [...locations].sort((a, b) => a.vsPlanPct - b.vsPlanPct)[0]!;

  const periodLabel =
    horizon === "ytd"
      ? compareFy
        ? `${fy.label} vs ${compareFy.label}`
        : fy.partial
          ? `${fy.label} · year to date`
          : fy.label
      : horizon === "mtd"
        ? "Month to date · Sep 2026"
        : input.dayLabel
          ? `Day · ${input.dayLabel}`
          : "Yesterday";

  const title =
    horizon === "ytd"
      ? compareFy
        ? "Year compare"
        : "Year in review"
      : horizon === "mtd"
        ? "Month in review"
        : "Day in review";

  const ctx: YearContext = {
    role,
    built,
    locations,
    recoveryRate,
    attentionAbsorbed,
    rand,
  };

  const kpis = buildRoleKpis(ctx, horizon);
  const yearDrivers =
    horizon === "ytd"
      ? rankDrivers(buildYearDrivers(ctx), 5)
      : [];
  const pulseLine = `${eur(built.totalContrib)} contribution · ${signedPct(built.vsPlan)}`;
  const narrative =
    horizon === "ytd"
      ? buildYearNarrative(ctx)
      : horizon === "mtd"
        ? `Month running ${signedPct(built.vsPlan)} vs plan - ${leader.name} leads.`
        : `Service reviewed · contribution ${eur(built.totalContrib)}.`;
  const guidance = horizon === "ytd" ? buildYearGuidance(ctx) : null;
  const yearTrack = horizon === "ytd" ? buildYearTrack(built.series) : null;
  const verifiedProof = horizon === "ytd" ? buildVerifiedProof(ctx) : null;
  const best = horizon === "ytd" ? pickBestMonth(built.series) : null;

  const highlights: LookbackHighlight[] =
    horizon === "ytd"
      ? driversToHighlights(yearDrivers)
      : horizon === "day"
        ? [
            {
              id: "h1",
              title: "Peak held",
              detail: "Covers matched plan through 20:30 without overtime spike",
              value: signedPct(2.4 + rand() * 2),
            },
            {
              id: "h2",
              title: "Recovery proved",
              detail: "Cancelled covers refilled from waitlist before social",
              value: eur(180 + rand() * 220),
            },
            {
              id: "h3",
              title: "Leakage watched",
              detail: "Comps and discounts stayed inside policy band",
            },
          ]
        : [
            {
              id: "h1",
              title: `${leader.name} led`,
              detail: leader.highlight,
              value: eur(leader.contribution),
            },
            {
              id: "h2",
              title: `${lagger.name} needs attention`,
              detail: `${signedPct(lagger.vsPlanPct)} vs plan · copy what works elsewhere`,
              value: eur(lagger.contribution),
            },
            {
              id: "h3",
              title: "Verified recovery compound",
              detail: "Waitlist + walk-in hold kept perishable seats alive",
              value: eur(built.totalVerified),
            },
            {
              id: "h4",
              title: "Human attention returned",
              detail: `${Math.round(attentionAbsorbed)} moments RADR handled or prepared`,
            },
          ];

  return {
    horizon,
    title,
    periodLabel,
    scopeLabel: locationLabel(input.locationScope),
    narrative,
    fiscalYearId: horizon === "ytd" ? fy.id : undefined,
    compareFiscalYearId: compareFy?.id ?? null,
    fiscalYears: horizon === "ytd" ? FISCAL_YEARS : undefined,
    kpis,
    series: built.series,
    seriesLabel:
      horizon === "ytd"
        ? compareFy
          ? `Months · ${fy.short} vs ${compareFy.short}`
          : fy.partial
            ? `Full year · actual + forecast · ${fy.label}`
            : `How the year moved · ${fy.label}`
        : horizon === "mtd"
          ? "By week"
          : "By service",
    highlights,
    yearDrivers,
    pulseLine,
    guidance,
    locations: locations.slice(0, group ? 8 : 4),
    yearTrack,
    verifiedProof,
    bestMonthId: best?.id ?? null,
    bestMonthLabel: best?.label ?? null,
  };
}

const DRIVER_BANK: Array<Omit<MonthDriver, "id" | "impact"> & { impactScale: number }> = [
  {
    label: "Terrace & patio nights",
    detail: "Warm evenings extended covers without adding fixed labor",
    tone: "good",
    impactScale: 1,
  },
  {
    label: "Waitlist recovery",
    detail: "Cancelled seats refilled under 12 minutes before social blast",
    tone: "good",
    impactScale: 0.85,
  },
  {
    label: "Beverage attach",
    detail: "Wine and cocktail attach held above house target on Friday-Saturday",
    tone: "good",
    impactScale: 0.7,
  },
  {
    label: "Labor matched peak",
    detail: "Floor and kitchen hours tracked covers - no overtime surprise",
    tone: "good",
    impactScale: 0.65,
  },
  {
    label: "86 risk caught early",
    detail: "Prep adjusted before guest-facing stockouts on hero dishes",
    tone: "good",
    impactScale: 0.55,
  },
  {
    label: "Delivery fee drift",
    detail: "Channel mix leaned expensive - contribution thinned on weekday lunch",
    tone: "bad",
    impactScale: 0.6,
  },
  {
    label: "Discount leakage",
    detail: "Comps ran above policy on two soft Tuesdays",
    tone: "watch",
    impactScale: 0.5,
  },
  {
    label: "No-show cluster",
    detail: "Thursday no-shows hit before waitlist depth was ready",
    tone: "bad",
    impactScale: 0.7,
  },
];

const LESSON_BANK: MonthLesson[] = [
  {
    id: "l1",
    title: "Copy the fill playbook",
    detail:
      "When a cancellation hits, auto-offer the next waitlist party before anyone chases the floor.",
  },
  {
    id: "l2",
    title: "Protect contribution, not just covers",
    detail:
      "Push beverage and terrace packages on strong nights - volume alone does not teach the year.",
  },
  {
    id: "l3",
    title: "Staff to the forecast curve",
    detail:
      "Match labor to the same shape as covers. Soft nights that over-staff become next month’s drag.",
  },
  {
    id: "l4",
    title: "Watch channel mix early",
    detail:
      "If delivery share climbs mid-month, reset menu and fee thresholds before expenses compound.",
  },
];

export function composeMonthLookbackDetail(input: {
  locationScope: LocationScope;
  fiscalYearId: FiscalYearId;
  monthIndex: number;
}): MonthLookbackDetail | null {
  const fy = fyOption(input.fiscalYearId);
  if (input.monthIndex < 0 || input.monthIndex >= 12) return null;

  const group =
    input.locationScope === "all" ||
    String(input.locationScope).startsWith("region_");

  const built = buildSeries({
    scope: input.locationScope,
    horizon: "ytd",
    fy,
    compareFy: null,
    group,
  });
  const point = built.series[input.monthIndex];
  if (!point) return null;

  const rand = mulberry(
    seedFrom(String(input.locationScope), fy.id, input.monthIndex, "detail"),
  );
  const full = monthFullLabels(fy.year)[input.monthIndex]!;

  if (point.forecastOnly) {
    return {
      id: point.id,
      monthIndex: input.monthIndex,
      label: point.label,
      fullLabel: full,
      fiscalYearId: fy.id,
      fiscalYearLabel: fy.label,
      headline: `${point.label} is still ahead - year forecast`,
      verdict:
        "Not closed yet. RADR is holding the planned contribution shape so you can see the full year, not only what’s already booked.",
      tone: "neutral",
      kpis: [
        {
          id: "forecast",
          label: "Forecast contribution",
          value: eur(point.contribution),
          delta: "Plan shape",
          tone: "neutral",
        },
        {
          id: "rev",
          label: "Forecast revenue",
          value: eur(point.revenue),
          tone: "neutral",
        },
        {
          id: "status",
          label: "Status",
          value: "Remaining",
          delta: "Watching",
          tone: "watch",
        },
      ],
      labor: " - ",
      laborPct: " - ",
      cogs: " - ",
      channelMix: "Planned mix",
      dineInPct: 0,
      deliveryPct: 0,
      returningGuestRevenue: " - ",
      terraceEffect: "Seasonal plan",
      topPositive: "Hold the forecast curve",
      topNegative: "Do not staff to hope",
      verified: " - ",
      notable: "Opens when the month starts",
      drivers: [],
      lessons: [],
      locations: [],
    };
  }

  const good = point.vsPlanPct >= 1.5;
  const soft = point.vsPlanPct <= -2;

  const headline = good
    ? `${point.label} outperformed - worth teaching the rest of the year`
    : soft
      ? `${point.label} under plan - isolate what leaked`
      : `${point.label} held near plan - a few moves still transferable`;

  const verdict = good
    ? "Strong contribution with expenses in band. The plays below are the ones other months should steal."
    : soft
      ? "Revenue or cost slipped vs plan. Fix the drivers before they become a yearly pattern."
      : "Solid operating month. Tighten the two soft spots and promote the one clear win.";

  const driverCount = good ? 4 : soft ? 4 : 3;
  const preferred = DRIVER_BANK.filter((d) =>
    good ? d.tone === "good" : soft ? d.tone !== "good" : true,
  );
  const pool = preferred.length >= driverCount ? [...preferred] : [...DRIVER_BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = pool[i]!;
    const b = pool[j]!;
    pool[i] = b;
    pool[j] = a;
  }
  const chosen = pool.slice(0, driverCount);

  const drivers: MonthDriver[] = chosen.map((d, i) => {
    const impactAmt =
      point.contribution * (0.04 + d.impactScale * 0.06) * (0.7 + rand() * 0.5);
    const sign = d.tone === "bad" || d.tone === "watch" ? "−" : "+";
    return {
      id: `d_${i}`,
      label: d.label,
      detail: d.detail,
      impact: `${sign}${eur(impactAmt)}`,
      tone: d.tone,
    };
  });

  const lessons = LESSON_BANK.map((l, i) => ({
    ...l,
    id: `lesson_${i}`,
  })).slice(0, good ? 3 : 3);

  const locations = buildLocations({
    scope: input.locationScope,
    totalContrib: point.contribution,
    totalRevenue: point.revenue,
    seedKey: `${input.locationScope}:${fy.id}:m${input.monthIndex}`,
  }).slice(0, group ? 5 : 3);

  const expenseTone: LookbackTone =
    point.expenseVsPlanPct <= -1
      ? "good"
      : point.expenseVsPlanPct >= 3
        ? "bad"
        : "watch";

  const laborAmt = point.expenses * (0.48 + rand() * 0.08);
  const cogsAmt = point.expenses * (0.38 + rand() * 0.08);
  const laborPct = 26 + rand() * 8;
  const dineIn = Math.round(62 + rand() * 18);
  const delivery = Math.round(12 + rand() * 14);
  const other = Math.max(0, 100 - dineIn - delivery);
  const returning = point.revenue * (0.28 + rand() * 0.12);
  const pos = drivers.find((d) => d.tone === "good");
  const neg = drivers.find((d) => d.tone === "bad" || d.tone === "watch");

  return {
    id: point.id,
    monthIndex: input.monthIndex,
    label: point.label,
    fullLabel: full,
    fiscalYearId: fy.id,
    fiscalYearLabel: fy.label,
    headline,
    verdict,
    tone: point.tone,
    kpis: [
      {
        id: "rev",
        label: "Revenue",
        value: eur(point.revenue),
        delta: `${signedPct(point.revenueVsPlanPct)} vs plan`,
        tone: toneFromDelta(point.revenueVsPlanPct),
      },
      {
        id: "contrib",
        label: "Contribution",
        value: eur(point.contribution),
        delta: `${signedPct(point.vsPlanPct)} vs plan`,
        tone: point.tone,
      },
      {
        id: "exp",
        label: "Expenses",
        value: eur(point.expenses),
        delta: `${signedPct(point.expenseVsPlanPct)} vs plan`,
        tone: expenseTone,
      },
      {
        id: "verified",
        label: "Verified by RADR",
        value: eur(point.verified),
        delta: "In-month attributable",
        tone: "good",
      },
    ],
    labor: eur(laborAmt),
    laborPct: `${laborPct.toFixed(1)}%`,
    cogs: eur(cogsAmt),
    channelMix: `Dine-in ${dineIn}% · Delivery ${delivery}% · Other ${other}%`,
    dineInPct: dineIn,
    deliveryPct: delivery,
    returningGuestRevenue: eur(returning),
    terraceEffect: point.notable
      ? point.notable.detail
      : "Weather-neutral · terrace within plan",
    topPositive: pos ? `${pos.label} - ${pos.detail}` : "Peak held without overtime",
    topNegative: neg
      ? `${neg.label} - ${neg.detail}`
      : "No material negative driver",
    verified: eur(point.verified),
    notable: point.notable
      ? point.notable.detail
      : "No exceptional condition - this month held near plan",
    drivers,
    lessons,
    locations,
  };
}
