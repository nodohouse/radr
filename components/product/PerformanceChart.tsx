"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ChartMetric = "revenue" | "margin" | "labor" | "verified";
export type ChartRange = "today" | "7d" | "30d" | "qtd" | "ytd";
export type CompareMode = "none" | "group" | "quartile" | "region";

export type PerfPoint = {
  label: string;
  actual: number;
  forecast: number;
  plan: number;
  compare?: number;
  /** Event markers tied to this point */
  events?: { area: string; title: string; money: string; href: string }[];
};

type Props = {
  metric: ChartMetric;
  range: ChartRange;
  compare: CompareMode;
  series: PerfPoint[];
  onMetric: (m: ChartMetric) => void;
  onRange: (r: ChartRange) => void;
  onCompare: (c: CompareMode) => void;
  onSelectDay: (point: PerfPoint, index: number) => void;
  unit: "euro" | "pct";
};

const METRICS: { id: ChartMetric; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "margin", label: "Margin" },
  { id: "labor", label: "Labor %" },
  { id: "verified", label: "Verified value" },
];

const RANGES: { id: ChartRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "qtd", label: "QTD" },
  { id: "ytd", label: "YTD" },
];

/** Legacy chart: prefer OperatingPerformanceChart for new surfaces. */
export function PerformanceChart({
  metric,
  range,
  compare,
  series,
  onMetric,
  onRange,
  onCompare,
  onSelectDay,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId();

  const w = 640;
  const h = 220;
  const pad = { t: 16, r: 16, b: 28, l: 48 };
  const vals = series.flatMap((s) =>
    [s.actual, s.forecast, s.plan, s.compare].filter(
      (n): n is number => typeof n === "number",
    ),
  );
  const min = Math.min(...vals) * 0.96;
  const max = Math.max(...vals) * 1.04;
  const x = (i: number) =>
    pad.l + (i / Math.max(series.length - 1, 1)) * (w - pad.l - pad.r);
  const y = (v: number) =>
    pad.t + (1 - (v - min) / (max - min || 1)) * (h - pad.t - pad.b);

  const path = (key: "actual" | "forecast" | "plan" | "compare") =>
    series
      .map((s, i) => {
        const v = key === "compare" ? s.compare : s[key];
        if (v == null) return null;
        return `${i === 0 || (key === "compare" && i === 0) ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");

  return (
    <section className="rp-perf">
      <header className="rp-perf-head">
        <div>
          <p className="rp-cc-label">Performance</p>
          <div className="rp-perf-metrics" role="tablist">
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                data-on={metric === m.id ? "true" : "false"}
                onClick={() => onMetric(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rp-perf-controls">
          <div className="rp-perf-ranges">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                data-on={range === r.id ? "true" : "false"}
                onClick={() => onRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="rp-perf-compare">
            Compare
            <select
              value={compare}
              onChange={(e) => onCompare(e.target.value as CompareMode)}
            >
              <option value="none">Off</option>
              <option value="group">Group average</option>
              <option value="quartile">Top quartile</option>
              <option value="region">Region average</option>
            </select>
          </label>
        </div>
      </header>

      <div className="rp-perf-body">
        <svg
          ref={svgRef}
          className="rp-perf-svg"
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`${metric} performance chart`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,244,238,0.12)" />
              <stop offset="100%" stopColor="rgba(245,244,238,0)" />
            </linearGradient>
          </defs>

          <path d={path("plan")} className="rp-perf-line-plan" fill="none" />
          <path
            d={path("forecast")}
            className="rp-perf-line-forecast"
            fill="none"
          />
          {compare !== "none" ? (
            <path
              d={path("compare")}
              className="rp-perf-line-compare"
              fill="none"
            />
          ) : null}

          <path
            d={`${path("actual")} L ${x(series.length - 1).toFixed(1)} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`}
            fill={`url(#${uid}-fill)`}
          />
          <path d={path("actual")} className="rp-perf-line-actual" fill="none" />

          {series.map((s, idx) =>
            s.events?.length ? (
              <g key={`ev-${idx}`}>
                <circle
                  cx={x(idx)}
                  cy={y(s.actual)}
                  r={4}
                  className="rp-perf-marker"
                />
                <title>
                  {s.events.map((e) => `${e.area}: ${e.title} · ${e.money}`).join("\n")}
                </title>
              </g>
            ) : null,
          )}

          {series.map((s, idx) => (
            <rect
              key={s.label}
              x={x(idx) - 12}
              y={pad.t}
              width={24}
              height={h - pad.t - pad.b}
              fill="transparent"
              onMouseEnter={() => setHover(idx)}
              onClick={() => onSelectDay(s, idx)}
              style={{ cursor: "pointer" }}
            />
          ))}

          {hover != null ? (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.t}
              y2={h - pad.b}
              className="rp-perf-cross"
            />
          ) : null}

          {series.map((s, idx) =>
            idx % Math.ceil(series.length / 6) === 0 ||
            idx === series.length - 1 ? (
              <text
                key={`lbl-${s.label}`}
                x={x(idx)}
                y={h - 8}
                className="rp-perf-xlabel"
                textAnchor="middle"
              >
                {s.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="rp-perf-legend">
        <span data-l="actual">Actual</span>
        <span data-l="forecast">Forecast</span>
        <span data-l="plan">Plan</span>
        {compare !== "none" ? <span data-l="compare">Compare</span> : null}
      </div>
    </section>
  );
}

/** Build demo performance series for the stock chart. */
export function buildPerfSeries(
  metric: ChartMetric,
  range: ChartRange,
  compare: CompareMode,
  base: {
    revenue: number;
    margin: number;
    labor: number;
    verified: number;
  },
): PerfPoint[] {
  const n =
    range === "today"
      ? 12
      : range === "7d"
        ? 7
        : range === "30d"
          ? 15
          : range === "qtd"
            ? 12
            : 12;

  const labels =
    range === "today"
      ? Array.from({ length: n }, (_, i) => `${8 + i}:00`)
      : range === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : range === "30d"
          ? Array.from({ length: n }, (_, i) => `${i * 2 + 1} Aug`)
          : range === "qtd"
            ? ["Apr", "May", "Jun", "Jul", "Aug", "W1", "W2", "W3", "W4", "W5", "W6", "W7"]
            : ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  const center =
    metric === "revenue"
      ? base.revenue
      : metric === "margin"
        ? base.margin
        : metric === "labor"
          ? base.labor
          : base.verified;

  return labels.slice(0, n).map((label, i) => {
    const t = i / Math.max(n - 1, 1);
    const wave = Math.sin(t * Math.PI * 2) * 0.04;
    const actual =
      metric === "revenue" || metric === "verified"
        ? Math.round(center * (0.88 + t * 0.14 + wave) )
        : Math.round((center * (0.94 + t * 0.08 + wave * 0.5)) * 10) / 10;
    const forecast =
      metric === "revenue" || metric === "verified"
        ? Math.round(center * (0.9 + t * 0.1))
        : Math.round((center * (0.96 + t * 0.04)) * 10) / 10;
    const plan =
      metric === "revenue" || metric === "verified"
        ? Math.round(center * (0.92 + t * 0.06))
        : metric === "labor"
          ? 32
          : 17.6;
    const compareVal =
      compare === "none"
        ? undefined
        : metric === "revenue" || metric === "verified"
          ? Math.round(actual * (compare === "quartile" ? 1.08 : 0.96))
          : Math.round(actual * (compare === "quartile" ? 1.04 : 0.97) * 10) /
            10;

    const events =
      i === n - 2
        ? [
            {
              area: "LABOR",
              title: "Peak service capacity",
              money: "€290 at risk",
              href: "/app/labor",
            },
          ]
        : i === n - 4
          ? [
              {
                area: "BUY",
                title: "Supplier invoice discrepancy",
                money: "€118 recoverable",
                href: "/app/findings",
              },
            ]
          : undefined;

    return {
      label,
      actual,
      forecast,
      plan,
      compare: compareVal,
      events,
    };
  });
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}
