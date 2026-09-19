import { LOCATIONS } from "./catalog";
import type { Area, RoleView } from "../types";
import type { TerritoryState } from "./command";

export type DashPeriod = "today" | "yesterday" | "wtd" | "mtd" | "ytd";
export type LocationScope = "all" | string;

export type DashPoint = { label: string; actual: number; plan: number; forecast: number };
export type ValuePoint = { label: string; value: number };
export type ExposurePoint = { label: string; value: number };

export type LocationRow = {
  id: string;
  name: string;
  revenue: number;
  vsForecast: number;
  margin: number;
  marginVsPlan: number;
  laborPct: number;
  buyExposure: number;
  sellOpportunity: number;
  valueAtRisk: number;
  recoverable: number;
  verified: number;
  openActions: number;
  status: TerritoryState;
};

const PERIOD_LABEL: Record<DashPeriod, string> = {
  today: "Today",
  yesterday: "Yesterday",
  wtd: "WTD",
  mtd: "MTD",
  ytd: "YTD",
};

/** Deterministic multipliers by location: all figures reconcile within each scope */
const LOC_FACTOR: Record<string, number> = {
  all: 1,
  region_de: 0.22,
  region_us: 0.38,
  region_apac: 0.28,
  region_mena: 0.1,
  region_nl: 0.14,
  region_uk: 0.16,
  region_fr: 0.14,
  loc_ber: 0.19,
  loc_ber_kreuz: 0.12,
  loc_nyc: 0.22,
  loc_nyc_wvill: 0.16,
  loc_sf: 0.14,
  loc_tyo: 0.18,
  loc_sin: 0.13,
  loc_dxb: 0.1,
  loc_syd: 0.11,
  loc_ams: 0.14,
  loc_lon: 0.16,
  loc_par: 0.14,
};

const REGION_LOCS: Record<string, string[]> = {
  region_de: ["loc_ber", "loc_ber_kreuz"],
  region_us: ["loc_nyc", "loc_nyc_wvill", "loc_sf"],
  region_apac: ["loc_tyo", "loc_sin", "loc_syd"],
  region_mena: ["loc_dxb"],
  region_nl: ["loc_ams"],
  region_uk: ["loc_lon"],
  region_fr: ["loc_par"],
};

const PERIOD_FACTOR: Record<DashPeriod, number> = {
  today: 0.08,
  yesterday: 0.08,
  wtd: 0.22,
  mtd: 1,
  ytd: 6.4,
};

function roundEuro(n: number) {
  return Math.round(n / 10) * 10;
}

function pts(n: number) {
  return Math.round(n * 10) / 10;
}

export function periodLabel(p: DashPeriod) {
  return PERIOD_LABEL[p];
}

export function locationLabel(scope: LocationScope) {
  if (scope === "all") return "All locations";
  const region: Record<string, string> = {
    region_de: "Germany",
    region_us: "United States",
    region_apac: "Asia Pacific",
    region_mena: "Middle East",
    region_nl: "Netherlands",
    region_uk: "United Kingdom",
    region_fr: "France",
  };
  if (region[scope]) return region[scope]!;
  return LOCATIONS.find((l) => l.id === scope)?.name ?? "All locations";
}

export function getDashboard(scope: LocationScope, period: DashPeriod) {
  const lf = LOC_FACTOR[scope] ?? 0.2;
  const pf = PERIOD_FACTOR[period];
  const group = scope === "all";
  const regional = scope.startsWith("region_");

  const marginCurrent = group ? 18.4 : pts(17.2 + lf * 3.2);
  const marginPlan = 17.6;
  const marginForecast = pts(marginCurrent - 0.3);
  const vsPlan = pts(marginCurrent - marginPlan);

  const valueAtRisk = roundEuro(
    (group ? 23_740 : 18_620 * (lf / 0.42)) * (period === "today" ? 0.35 : 1),
  );
  const recoverable = roundEuro(
    (group || scope === "loc_ber" || scope === "region_de" ? 4_280 : 0) *
      (period === "ytd" ? 1.4 : 1),
  );
  const actionInProgress = roundEuro(
    Math.max(0, valueAtRisk - recoverable) * 0.78,
  );
  const verifiedMonth = roundEuro(group ? 58_940 : 42_800 * lf);
  const verifiedYtd = roundEuro(group ? 684_000 : 684_000 * lf * 1.1);
  const protectedYtd = roundEuro(group ? 126_400 : 126_400 * lf);
  const openExposure = roundEuro(
    (group ? 42_600 : 42_600 * lf) * pf * (period === "mtd" ? 1 : 0.45),
  );
  const exposureTrendPct =
    group ? -18 : scope === "loc_lon" || scope === "region_uk" ? 8 : -12;

  const status: "ON COURSE" | "WATCH" | "ATTENTION REQUIRED" =
    vsPlan < 0
      ? "ATTENTION REQUIRED"
      : vsPlan < 0.3 || exposureTrendPct > 0
        ? "WATCH"
        : "ON COURSE";

  const today = {
    revenue: roundEuro(184_620 * lf * (group ? 1 : 1.05)),
    revenueVsForecast: group ? 4.8 : pts(2 + lf * 8),
    margin: marginCurrent,
    marginVsPlan: vsPlan,
    laborPct: group ? 33.8 : pts(32 + lf * 6),
    laborVsPlan: group ? 1.1 : scope === "loc_lon" ? 2.1 : pts(0.4),
    valueIdentified: roundEuro(7_840 * lf * (group ? 1 : 1.2)),
    actions: group ? 3 : Math.max(1, Math.round(3 * lf * 2)),
  };

  const territories = [
    {
      area: "buy" as Area,
      href: "/app/buy",
      state: "STABLE" as TerritoryState,
      value: roundEuro(18_620 * lf * (group ? 1 : 1.1)),
      valueKind: "exposure" as const,
      trend: "↓ 12%",
      preview: "Supplier pricing · FreshCo",
    },
    {
      area: "labor" as Area,
      href: "/app/labor",
      state: (scope === "loc_lon" ||
      scope === "region_uk" ||
      group
        ? "WATCH"
        : "STABLE") as TerritoryState,
      value: roundEuro(11_840 * lf * (group ? 1 : 1.2)),
      valueKind: "exposure" as const,
      trend:
        group || scope === "loc_lon" || scope === "region_uk" ? "↑ 8%" : "↓ 3%",
      preview: "Schedule vs demand · dinner",
    },
    {
      area: "sell" as Area,
      href: "/app/sell",
      state: "STABLE" as TerritoryState,
      displayState: "OPPORTUNITY",
      value: roundEuro(34_200 * lf * (group ? 1 : 0.9)),
      valueKind: "upside" as const,
      trend: "↑ 14%",
      preview: "Menu pricing · Truffle Rigatoni",
    },
    {
      area: "recover" as Area,
      href: "/app/recover",
      state: (recoverable > 0 ? "ACTION" : "STABLE") as TerritoryState,
      value: recoverable || roundEuro(1_200 * lf),
      valueKind: "recoverable" as const,
      trend: recoverable > 0 ? "11 days overdue" : "Clear",
      preview: recoverable > 0 ? "Supplier credit overdue" : "No overdue credits",
    },
  ];

  const marginSeries: DashPoint[] =
    period === "today" || period === "yesterday" || period === "wtd"
      ? [
          { label: "Mon", actual: pts(marginCurrent - 0.5), plan: marginPlan, forecast: pts(marginPlan + 0.2) },
          { label: "Tue", actual: pts(marginCurrent - 0.3), plan: marginPlan, forecast: pts(marginPlan + 0.25) },
          { label: "Wed", actual: pts(marginCurrent - 0.2), plan: marginPlan, forecast: pts(marginPlan + 0.3) },
          { label: "Thu", actual: pts(marginCurrent - 0.1), plan: marginPlan, forecast: pts(marginPlan + 0.35) },
          { label: "Fri", actual: pts(marginCurrent + 0.05), plan: marginPlan, forecast: pts(marginPlan + 0.4) },
          { label: "Sat", actual: pts(marginCurrent - 0.05), plan: marginPlan, forecast: pts(marginPlan + 0.4) },
          { label: "Sun", actual: marginCurrent, plan: marginPlan, forecast: marginForecast },
        ]
      : [
          { label: "Mar", actual: pts(marginCurrent - 0.9), plan: marginPlan, forecast: pts(marginPlan - 0.1) },
          { label: "Apr", actual: pts(marginCurrent - 0.6), plan: marginPlan, forecast: pts(marginPlan + 0.1) },
          { label: "May", actual: pts(marginCurrent - 0.4), plan: marginPlan, forecast: pts(marginPlan + 0.2) },
          { label: "Jun", actual: pts(marginCurrent - 0.2), plan: marginPlan, forecast: pts(marginPlan + 0.3) },
          { label: "Jul", actual: pts(marginCurrent - 0.05), plan: marginPlan, forecast: pts(marginPlan + 0.35) },
          { label: "Aug", actual: marginCurrent, plan: marginPlan, forecast: marginForecast },
        ];

  const verifiedBase = group
    ? [32, 71, 118, 185, 282, 401, 548, 684]
    : [32, 71, 118, 185, 282, 401, 548, 684].map((v) =>
        Math.round(v * lf * 1.15),
      );
  const verifiedSeries: ValuePoint[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
  ].map((label, i) => ({ label, value: verifiedBase[i]! * 1000 }));

  const exposureSeries: ExposurePoint[] = (
    period === "wtd" || period === "today" || period === "yesterday"
      ? [52, 49, 47, 45, 44, 43, 42.6]
      : [58, 54, 51, 48, 46, 42.6]
  ).map((v, i) => ({
    label:
      period === "wtd" || period === "today" || period === "yesterday"
        ? ["M", "T", "W", "T", "F", "S", "S"][i]!
        : ["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
    value: roundEuro(v * 1000 * (group ? 1 : lf / 0.5)),
  }));

  const allowedLocs = regional
    ? new Set(REGION_LOCS[scope] ?? [])
    : scope === "all"
      ? null
      : new Set([scope]);

  const locations: LocationRow[] = LOCATIONS.filter((l) =>
    allowedLocs ? allowedLocs.has(l.id) : true,
  ).map((l) => {
    const f = LOC_FACTOR[l.id] ?? 0.15;
    const mvp = pts((f - 0.22) * 4);
    const risk = roundEuro(l.valueOnRadr * 0.35);
    const rec = l.id === "loc_ber" ? 4_280 : 0;
    const actions = l.openSignals > 4 ? 2 : l.openSignals > 2 ? 1 : 0;
    const st: TerritoryState =
      rec > 0 ? "ACTION" : mvp < 0 || actions >= 2 ? "WATCH" : "STABLE";
    const margin = pts(17.6 + mvp);
    return {
      id: l.id,
      name: l.name,
      revenue: roundEuro(24_800 * (f / 0.42) * (period === "today" || period === "yesterday" ? 1 : 7)),
      vsForecast: pts((f - 0.2) * 20),
      margin,
      marginVsPlan: mvp,
      laborPct: pts(32.5 + (mvp < 0 ? 2.2 : 0.8)),
      buyExposure: roundEuro(risk * 0.44),
      sellOpportunity: roundEuro(risk * 0.8),
      valueAtRisk: risk,
      recoverable: rec,
      verified: l.verifiedValue,
      openActions: actions,
      status: st,
    };
  });

  const fleet = {
    total: group ? 18 : locations.length,
    onCourse: locations.filter((l) => l.status === "STABLE").length + (group ? 8 : 0),
    watch: locations.filter((l) => l.status === "WATCH").length + (group ? 0 : 0),
    action: locations.filter((l) => l.status === "ACTION").length,
  };
  if (group) {
    fleet.onCourse = 14;
    fleet.watch = 3;
    fleet.action = 1;
  }

  const brief = {
    greeting: "Good morning",
    locationName: group
      ? "the group"
      : LOCATIONS.find((l) => l.id === scope)?.name?.replace("Northstar ", "") ??
        "this location",
    margin: marginCurrent,
    marginVsPlan: vsPlan,
    newValue: today.valueIdentified,
    actions: today.actions,
    largestOpportunity: {
      area: "sell" as Area,
      title: "Menu contribution",
      value: roundEuro(620 * (group ? 1 : lf / 0.2)),
    },
    largestExposure: {
      area: "buy" as Area,
      title: "Supplier pricing",
      value: roundEuro(418 * (group ? 1 : lf / 0.2)),
    },
    recoverableNow: {
      area: "recover" as Area,
      title: "Delivery payout",
      value: group || scope === "loc_ber" || scope === "region_de" ? 332 : 0,
    },
  };

  const sinceYesterday = {
    identified: roundEuro(8_420 * (group ? 1 : lf / 0.5)),
    resolved: roundEuro(12_600 * (group ? 1 : lf / 0.5)),
    verified: roundEuro(4_280 * (group ? 1 : lf / 0.6)),
    controlsActivated: group ? 2 : 1,
    netUnresolvedDelta: roundEuro(-4_180 * (group ? 1 : lf / 0.5)),
  };

  const valueDrivers = [
    { label: "Supplier controls", value: roundEuro(24_800 * lf * (group ? 1 : 1.2)), kind: "verified" },
    { label: "Labor optimization", value: roundEuro(18_200 * lf * (group ? 1 : 1.1)), kind: "verified" },
    { label: "Credit recovery", value: roundEuro(9_400 * (group || scope === "loc_ber" ? 1 : 0.2)), kind: "recovered" },
    { label: "Pricing optimization", value: roundEuro(6_500 * lf * (group ? 1 : 0.9)), kind: "captured" },
  ];

  const topRisks = [
    { label: "Supplier pricing", value: roundEuro(18_620 * (group || scope === "loc_ams" ? 1 : lf)), kind: "exposure" },
    { label: "Labor scheduling", value: roundEuro(11_840 * (group || scope === "loc_lon" ? 1 : lf)), kind: "exposure" },
    { label: "Channel commissions", value: roundEuro(6_840 * lf * (group ? 1 : 1)), kind: "exposure" },
    { label: "Credits overdue", value: recoverable || roundEuro(1_200), kind: "recoverable" },
  ];

  const yourActions = (
    [
      {
        id: "sig_001",
        title: "Approve supplier recovery escalation",
        value: "€18,620",
        href: "/app/findings/sig_001",
        locs: ["all", "loc_ams"],
      },
      {
        id: "sig_003",
        title: "Review London labor exception",
        value: "€840 tonight",
        href: "/app/findings/sig_003",
        locs: ["all", "loc_lon"],
      },
    ] as const
  )
    .filter((a) => scope === "all" || (a.locs as readonly string[]).includes(scope))
    .map(({ id, title, value, href }) => ({ id, title, value, href }));

  const resolvedActions =
    yourActions.length > 0
      ? yourActions
      : [
          {
            id: "local",
            title: "Review priority findings for this location",
            value: formatCompact(valueAtRisk),
            href: "/app/findings",
          },
        ];

  const handling = {
    signalsInWorkflow: group ? 7 : Math.max(1, Math.round(7 * lf)),
    controlsActive: group ? 47 : Math.max(4, Math.round(47 * lf)),
    protectedMonth: roundEuro(26_800 * lf * (group ? 1 : 1.1)),
    supplierUnderReview: group ? 3 : 1,
    settlementAwaiting: group ? 1 : scope === "loc_ber" ? 1 : 0,
  };

  return {
    status,
    marginCurrent,
    marginPlan,
    marginForecast,
    vsPlan,
    vsPrev: pts(period === "wtd" || period === "today" ? 0.3 : 0.2),
    valueAtRisk,
    recoverable,
    actionInProgress,
    verifiedMonth,
    verifiedYtd,
    protectedYtd,
    openExposure,
    exposureTrendPct,
    today,
    fleet,
    brief,
    territories,
    marginSeries,
    verifiedSeries,
    exposureSeries,
    locations,
    sinceYesterday,
    valueDrivers,
    topRisks,
    yourActions: resolvedActions,
    handling,
    materialExposure: valueAtRisk,
  };
}

function formatCompact(n: number) {
  if (n >= 1000) return `€${(n / 1000).toFixed(1)}k`;
  return `€${n}`;
}

export function attentionIdsForScope(
  roleView: RoleView,
  scope: LocationScope,
  roleMap: Record<RoleView, string[]>,
) {
  const base = roleMap[roleView] ?? roleMap.cfo;
  if (scope === "all") return base;
  const byLoc: Record<string, string[]> = {
    loc_ams: ["sig_001", "sig_005"],
    loc_ber: ["sig_010", "sig_002", "sig_003"],
    loc_lon: ["sig_003", "sig_008"],
    loc_par: ["sig_004", "sig_009"],
    loc_sf: ["sig_006"],
    loc_tyo: ["sig_007"],
    loc_nyc: ["sig_001", "sig_004"],
  };
  return byLoc[scope] ?? base.slice(0, 2);
}

export const LOCATION_OPTIONS = [
  { id: "all" as const, label: "All locations" },
  ...LOCATIONS.map((l) => ({ id: l.id, label: l.name })),
];

export const PERIOD_OPTIONS: { id: DashPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "wtd", label: "WTD" },
  { id: "mtd", label: "MTD" },
  { id: "ytd", label: "YTD" },
];
