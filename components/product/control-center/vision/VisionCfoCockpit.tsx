"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BusinessPulse } from "@/lib/radr/product/businessPulse";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import type { ContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { RoleView } from "@/lib/product/types";
import {
  CFO_CATALOG,
  LOC_META_VISION,
  cfoMarginTrend,
  cfoRevenueMtdSeries,
  verifiedBars,
} from "./visionMeta";
type Props = {
  roleView: RoleView;
  pulse: BusinessPulse;
  bridge: ContributionBridge;
  needsYou: NeedsYouRow[];
  verifiedFormatted: string;
  onSelectDecision: (id: string) => void;
};

type LocState = "healthy" | "watch" | "intervene";
type SortKey =
  | "state"
  | "exposure"
  | "contribution"
  | "revenue"
  | "labor"
  | "cogs"
  | "verified";

type PortfolioRow = {
  id: string;
  label: string;
  revenue: number;
  vsPlan: number;
  contribution: number;
  margin: number;
  laborPct: number;
  cogsPct: number;
  channelPct: number;
  exposure: number;
  verified: number;
  state: LocState;
  driver: string;
  decision: string;
  decisionId: string;
  covers: number;
  thumb: string;
};

const PORTFOLIO: PortfolioRow[] = [
  {
    id: "loc_stuttgart_mitte",
    label: "Shibuya · Tokyo",
    revenue: 109800,
    vsPlan: -6.1,
    contribution: 29800,
    margin: 27.1,
    laborPct: 34.2,
    cogsPct: 31.8,
    channelPct: 14.2,
    exposure: 2800,
    verified: 180,
    state: "intervene",
    driver: "Labor + channel mix",
    decision: "Review staffing / channel allocation",
    decisionId: "dec_menu_peak_berlin",
    covers: 140,
    thumb: "/demo/facilities/berlin-dining.jpg",
  },
  {
    id: "loc_munich_altstadt",
    label: "Soho · London",
    revenue: 162400,
    vsPlan: -4.2,
    contribution: 41800,
    margin: 25.7,
    laborPct: 33.8,
    cogsPct: 30.4,
    channelPct: 12.8,
    exposure: 2400,
    verified: 320,
    state: "intervene",
    driver: "Contribution gap · menu mix",
    decision: "Approve menu price update",
    decisionId: "dec_menu_peak_berlin",
    covers: 224,
    thumb: "/demo/facilities/berlin-bar.jpg",
  },
  {
    id: "loc_frankfurt_westend",
    label: "Jardins · São Paulo",
    revenue: 132800,
    vsPlan: -3.8,
    contribution: 38600,
    margin: 29.1,
    laborPct: 32.6,
    cogsPct: 29.2,
    channelPct: 13.4,
    exposure: 2800,
    verified: 410,
    state: "intervene",
    driver: "Labor +3.8pp · channel mix",
    decision: "Review staffing / channel allocation",
    decisionId: "dec_menu_peak_berlin",
    covers: 176,
    thumb: "/demo/facilities/berlin-dining.jpg",
  },
  {
    id: "loc_koln_ehrenfeld",
    label: "DIFC · Dubai",
    revenue: 118200,
    vsPlan: -1.8,
    contribution: 36400,
    margin: 30.8,
    laborPct: 31.4,
    cogsPct: 28.6,
    channelPct: 11.2,
    exposure: 1400,
    verified: 520,
    state: "watch",
    driver: "COGS drift",
    decision: "Watch supplier variance",
    decisionId: "dec_tuna_berlin",
    covers: 168,
    thumb: "/demo/facilities/berlin-terrace.jpg",
  },
  {
    id: "loc_berlin_mitte",
    label: "Soho · New York",
    revenue: 184200,
    vsPlan: 8.4,
    contribution: 61200,
    margin: 33.2,
    laborPct: 28.4,
    cogsPct: 27.1,
    channelPct: 9.8,
    exposure: 974,
    verified: 1128,
    state: "watch",
    driver: "Labor + kitchen pressure tonight",
    decision: "Throttle delivery · peak wave",
    decisionId: "dec_peak_berlin",
    covers: 412,
    thumb: "/demo/facilities/berlin-dining.jpg",
  },
  {
    id: "loc_berlin_kreuzberg",
    label: "West Hollywood · Los Angeles",
    revenue: 141200,
    vsPlan: 4.8,
    contribution: 48600,
    margin: 34.4,
    laborPct: 29.6,
    cogsPct: 26.8,
    channelPct: 15.1,
    exposure: 2100,
    verified: 610,
    state: "watch",
    driver: "Refund rate +1.4pp",
    decision: "Review delivery refund pattern",
    decisionId: "dec_peak_berlin",
    covers: 286,
    thumb: "/demo/facilities/berlin-terrace.jpg",
  },
  {
    id: "loc_hamburg_hafen",
    label: "Roma Norte · Mexico City",
    revenue: 148600,
    vsPlan: 3.1,
    contribution: 48200,
    margin: 32.4,
    laborPct: 29.1,
    cogsPct: 27.4,
    channelPct: 10.2,
    exposure: 420,
    verified: 380,
    state: "healthy",
    driver: "Within plan",
    decision: "No action",
    decisionId: "dec_peak_berlin",
    covers: 198,
    thumb: "/demo/facilities/berlin-terrace.jpg",
  },
  {
    id: "loc_dusseldorf_medienhafen",
    label: "Tanjong Pagar · Singapore",
    revenue: 126400,
    vsPlan: 2.4,
    contribution: 41200,
    margin: 32.6,
    laborPct: 28.9,
    cogsPct: 27.0,
    channelPct: 9.4,
    exposure: 210,
    verified: 245,
    state: "healthy",
    driver: "Within plan",
    decision: "No action",
    decisionId: "dec_peak_berlin",
    covers: 152,
    thumb: "/demo/facilities/berlin-bar.jpg",
  },
];

const STATE_RANK: Record<LocState, number> = {
  intervene: 0,
  watch: 1,
  healthy: 2,
};

const STATE_LABEL: Record<LocState, string> = {
  intervene: "Intervene",
  watch: "Watch",
  healthy: "Healthy",
};

const ATTENTION = [
  {
    id: "loc_frankfurt_westend",
    title: "Jardins · São Paulo",
    line: "Contribution −4.5%",
    impact: "$2.8k exposed",
    why: "Labor + channel mix",
    decisionId: "dec_menu_peak_berlin",
  },
  {
    id: "loc_berlin_mitte",
    title: "Soho · New York",
    line: "Labor +3.8pp",
    impact: "$974 exposed",
    why: "Kitchen pressure · dinner wave",
    decisionId: "dec_peak_berlin",
  },
  {
    id: "loc_berlin_kreuzberg",
    title: "West Hollywood · LA",
    line: "Refund rate +1.4pp",
    impact: "$2.1k exposed",
    why: "Delivery Friday pattern",
    decisionId: "dec_peak_berlin",
  },
  {
    id: "loc_stuttgart_mitte",
    title: "Stuttgart",
    line: "Contribution −6.1%",
    impact: "€2.8k exposed",
    why: "Labor + menu mix",
    decisionId: "dec_menu_peak_berlin",
  },
];

const VERIFIED_ATTR = [
  { label: "Procurement", value: "€1,590" },
  { label: "Service", value: "€1,128" },
  { label: "Menu", value: "€610" },
  { label: "Supplier / AP", value: "€273" },
  { label: "Other", value: "€192" },
];

function RevenueVsPlanChart() {
  const series = useMemo(() => cfoRevenueMtdSeries(), []);
  const w = 520;
  const h = 168;
  const pad = { l: 36, r: 12, t: 18, b: 24 };
  const maxY = Math.max(...series.map((s) => Math.max(s.plan, s.forecast, s.actual || 0)));
  const x = (i: number) =>
    pad.l + (i / (series.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) =>
    pad.t + (1 - v / maxY) * (h - pad.t - pad.b);
  const planPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s.plan).toFixed(1)}`)
    .join(" ");
  const actualPts = series.filter((s) => s.actual > 0);
  const actualPath = actualPts
    .map((s, i) => {
      const idx = series.indexOf(s);
      return `${i === 0 ? "M" : "L"}${x(idx).toFixed(1)},${y(s.actual).toFixed(1)}`;
    })
    .join(" ");
  const forecastPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s.forecast).toFixed(1)}`)
    .join(" ");
  const annotations = [
    { day: 12, label: "Supplier" },
    { day: 19, label: "Delivery" },
    { day: 22, label: "Friday peak" },
  ];

  return (
    <svg className="rv-line rv-line-rich" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Revenue vs plan MTD">
      <path d={planPath} fill="none" stroke="#8a928b" strokeWidth="1.6" />
      <path
        d={forecastPath}
        fill="none"
        stroke="var(--rv-green)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.55"
      />
      <path d={actualPath} fill="none" stroke="var(--rv-green)" strokeWidth="2.4" />
      {annotations.map((a) => {
        const s = series[a.day - 1];
        if (!s) return null;
        const cx = x(a.day - 1);
        const cy = y(s.actual || s.forecast);
        return (
          <g key={a.label}>
            <circle cx={cx} cy={cy} r="3.5" fill="var(--rv-green)" />
            <text x={cx + 4} y={cy - 8} fontSize="9" fill="var(--rv-muted)" fontFamily="var(--rv-font-ui)">
              {a.label}
            </text>
          </g>
        );
      })}
      <text x={pad.l} y={14} fontSize="10" fill="var(--rv-muted)" fontFamily="var(--rv-font-ui)">
        Actual · Plan · Forecast EOM · MTD +4.2% · EOM +3.1%
      </text>
    </svg>
  );
}

function MarginTrendChart() {
  const { pts, plan, annotations } = useMemo(() => cfoMarginTrend(), []);
  const w = 520;
  const h = 168;
  const pad = { l: 36, r: 12, t: 18, b: 24 };
  const min = 26.5;
  const max = 30.5;
  const x = (i: number) =>
    pad.l + (i / (pts.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) =>
    pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const actualPath = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const planPath = plan
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg className="rv-line rv-line-rich" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Contribution margin trend">
      <path d={planPath} fill="none" stroke="#8a928b" strokeWidth="1.4" />
      <path d={actualPath} fill="none" stroke="var(--rv-green)" strokeWidth="2.3" />
      {annotations.map((a) => (
        <g key={a.label}>
          <line
            x1={x(a.i)}
            x2={x(a.i)}
            y1={pad.t}
            y2={h - pad.b}
            stroke="rgba(20,24,20,0.12)"
            strokeDasharray="2 2"
          />
          <text
            x={x(a.i) + 3}
            y={pad.t + 10}
            fontSize="9"
            fill="var(--rv-muted)"
            fontFamily="var(--rv-font-ui)"
          >
            {a.label}
          </text>
        </g>
      ))}
      <text x={pad.l} y={14} fontSize="10" fill="var(--rv-muted)" fontFamily="var(--rv-font-ui)">
        Actual 28.2% · Plan 29.4% · Drivers: COGS · Labor · Channel
      </text>
    </svg>
  );
}

export function VisionCfoCockpit({
  roleView: _roleView,
  pulse: _pulse,
  bridge: _bridge,
  needsYou,
  verifiedFormatted,
  onSelectDecision,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("state");
  const [focusId, setFocusId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const sorted = [...PORTFOLIO].sort((a, b) => {
      switch (sortKey) {
        case "exposure":
          return b.exposure - a.exposure;
        case "contribution":
          return a.vsPlan - b.vsPlan;
        case "revenue":
          return b.revenue - a.revenue;
        case "labor":
          return b.laborPct - a.laborPct;
        case "cogs":
          return b.cogsPct - a.cogsPct;
        case "verified":
          return b.verified - a.verified;
        default:
          return (
            STATE_RANK[a.state] - STATE_RANK[b.state] ||
            b.exposure - a.exposure
          );
      }
    });
    return sorted;
  }, [sortKey]);

  const largest = rows.find((r) => r.state === "intervene") ?? rows[0]!;
  const verifiedValue = verifiedFormatted || CFO_CATALOG.verified;
  const bars = verifiedBars(5);
  const active = needsYou[0];

  return (
    <div className="rv-cc rv-cc-cfo" data-persona="cfo">
      <div className="rv-cc-main">
        <header className="rv-cc-head">
          <h1 className="rv-display">Control Center</h1>
          <p className="rv-cc-context">All locations · MTD</p>
        </header>

        <div className="rv-metric-band rv-metric-band-cfo" role="list">
          {(
            [
              ["Revenue", CFO_CATALOG.revenue, CFO_CATALOG.revenueDelta, "pos"],
              ["Contribution", CFO_CATALOG.contribution, CFO_CATALOG.contributionDelta, "neg"],
              ["Margin", CFO_CATALOG.margin, CFO_CATALOG.marginDelta, "neg"],
              ["Exposure", CFO_CATALOG.exposure, CFO_CATALOG.exposureDelta, "watch"],
              ["Verified Value", verifiedValue, CFO_CATALOG.verifiedDelta, "pos"],
            ] as const
          ).map(([label, value, delta, tone]) => (
            <article key={label} className="rv-metric" role="listitem">
              <span className="rv-label">{label}</span>
              <strong className="rv-num">{value}</strong>
              <em data-tone={tone}>{delta}</em>
            </article>
          ))}
        </div>

        <p className="rv-editorial" data-block="conclusion">
          <span className="rv-editorial-signal">3 locations</span> explain 82% of
          the contribution gap.
        </p>

        <section className="rv-panel rv-portfolio" aria-label="Portfolio health">
          <div className="rv-panel-head">
            <h2>Portfolio Health</h2>
            <div className="rv-sort" role="group" aria-label="Sort portfolio">
              {(
                [
                  ["state", "State"],
                  ["exposure", "Exposure"],
                  ["contribution", "Contrib gap"],
                  ["revenue", "Revenue"],
                  ["labor", "Labor"],
                  ["verified", "Verified"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  data-active={sortKey === k ? "true" : undefined}
                  onClick={() => setSortKey(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="rv-table-scroll">
            <table className="rv-table rv-table-portfolio">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Revenue</th>
                  <th>vs Plan</th>
                  <th>Contribution</th>
                  <th>Margin</th>
                  <th>Labor %</th>
                  <th>COGS %</th>
                  <th>Channel</th>
                  <th>Exposure</th>
                  <th>Verified</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((loc) => {
                  const meta = LOC_META_VISION[loc.id];
                  return (
                    <tr
                      key={loc.id}
                      data-focus={focusId === loc.id ? "true" : undefined}
                      data-sev={loc.state}
                      onClick={() => setFocusId(loc.id)}
                    >
                      <td>
                        <div className="rv-loc">
                          <span className="rv-loc-thumb" aria-hidden>
                            <Image
                              src={loc.thumb}
                              alt=""
                              width={40}
                              height={40}
                            />
                          </span>
                          <div>
                            <strong>{loc.label}</strong>
                            <span>
                              {meta?.covers ?? loc.covers} covers
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="rv-num">
                        {formatDecisionMoney(loc.revenue)}
                      </td>
                      <td
                        className="rv-num"
                        data-tone={loc.vsPlan < 0 ? "neg" : "pos"}
                      >
                        {loc.vsPlan > 0 ? "+" : ""}
                        {loc.vsPlan}%
                      </td>
                      <td className="rv-num">
                        {formatDecisionMoney(loc.contribution)}
                      </td>
                      <td className="rv-num">{loc.margin.toFixed(1)}%</td>
                      <td className="rv-num">{loc.laborPct}%</td>
                      <td className="rv-num">{loc.cogsPct}%</td>
                      <td className="rv-num">{loc.channelPct}%</td>
                      <td className="rv-num">
                        {formatDecisionMoney(loc.exposure)}
                      </td>
                      <td className="rv-num">
                        {formatDecisionMoney(loc.verified)}
                      </td>
                      <td>
                        <span className="rv-pill" data-sev={loc.state}>
                          <i />
                          {STATE_LABEL[loc.state]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rv-charts">
          <section className="rv-panel rv-chart-box">
            <div className="rv-panel-head">
              <h2>Revenue vs Plan</h2>
              <span className="rv-label">MTD · Actual / Plan / Forecast</span>
            </div>
            <RevenueVsPlanChart />
          </section>
          <section className="rv-panel rv-chart-box">
            <div className="rv-panel-head">
              <h2>Contribution Margin Trend</h2>
              <span className="rv-label">30D · drivers annotated</span>
            </div>
            <MarginTrendChart />
          </section>
        </div>
      </div>

      <aside className="rv-rail" aria-label="What needs attention">
        <div className="rv-rail-block">
          <p className="rv-label">Needs your attention</p>
          <ul className="rv-need-list rv-attention-list">
            {ATTENTION.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  data-sev="watch"
                  onClick={() => {
                    setFocusId(item.id);
                    onSelectDecision(item.decisionId);
                  }}
                >
                  <strong>{item.title}</strong>
                  <span>{item.line}</span>
                  <em>{item.impact}</em>
                  <span className="rv-att-why">Why · {item.why}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rv-rail-block rv-exposure-card">
          <p className="rv-label">Largest exposure</p>
          <h3>{largest.label}</h3>
          <strong className="rv-num">
            {formatDecisionMoney(largest.exposure)} at risk
          </strong>
          <p>
            Contribution {largest.vsPlan}% · Primary driver: {largest.driver}
          </p>
          <p className="rv-decision-econ">RADR · {largest.decision}</p>
          <button
            type="button"
            className="rv-btn"
            data-primary="true"
            onClick={() => onSelectDecision(largest.decisionId)}
          >
            Review Decision
          </button>
        </div>

        <div className="rv-verified">
          <span className="rv-label">Verified Value · MTD</span>
          <strong className="rv-num">{verifiedValue}</strong>
          <em>
            {CFO_CATALOG.verifiedDecisions} · {CFO_CATALOG.verifiedDelta}
          </em>
          <ul className="rv-verified-attr">
            {VERIFIED_ATTR.map((a) => (
              <li key={a.label}>
                <span>{a.label}</span>
                <strong>{a.value}</strong>
              </li>
            ))}
          </ul>
          <div className="rv-verified-bars" aria-hidden>
            {bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <Link href="/app/value" className="rv-btn">
            Open Value →
          </Link>
        </div>

        {active ? (
          <div className="rv-rail-block">
            <p className="rv-label">Active Decision</p>
            <div className="rv-decision-card">
              <h3>{active.title}</h3>
              <p className="rv-decision-econ">
                {active.economicFormatted ?? "Prepared"}
              </p>
              <button
                type="button"
                className="rv-btn"
                data-primary="true"
                onClick={() => onSelectDecision(active.id)}
              >
                Review &amp; approve
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
