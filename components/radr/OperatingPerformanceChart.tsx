"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { RADR_MOTION } from "@/lib/radr/motion";

export type PerfMetric =
  | "revenue"
  | "margin"
  | "labor"
  | "value"
  | "covers"
  | "avgSpend";
export type PerfRange = "today" | "7d" | "30d" | "qtd" | "ytd" | "yoy";

export type PerfPoint = {
  label: string;
  /** Full date for tooltip / drawer, e.g. "8 AUG" or "8 AUGUST 2026" */
  fullLabel: string;
  dateKey: string;
  actual: number;
  forecast: number;
  plan: number;
  /** Comparable period last year (seasonal / same weekday) */
  lastYear?: number;
  covers?: number;
  avgSpend?: number;
  calendarNote?: string;
  events?: {
    territory: "BUY" | "LABOR" | "SELL" | "RECOVER";
    title: string;
    money: string;
    href: string;
  }[];
};

type Props = {
  metric: PerfMetric;
  range: PerfRange;
  series: PerfPoint[];
  unit: "euro" | "pct" | "count";
  onMetric: (m: PerfMetric) => void;
  onRange: (r: PerfRange) => void;
  onSelectDay: (p: PerfPoint) => void;
};

const METRICS: { id: PerfMetric; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "margin", label: "Margin" },
  { id: "covers", label: "Covers" },
  { id: "avgSpend", label: "Avg spend" },
  { id: "labor", label: "Labor" },
  { id: "value", label: "Value" },
];

const RANGES: { id: PerfRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "qtd", label: "QTD" },
  { id: "ytd", label: "YTD" },
  { id: "yoy", label: "YoY" },
];

const RANGE_TITLE: Record<PerfRange, string> = {
  today: "TODAY",
  "7d": "LAST 7 DAYS",
  "30d": "LAST 30 DAYS",
  qtd: "QUARTER TO DATE",
  ytd: "YEAR TO DATE",
  yoy: "YEAR OVER YEAR",
};

const METRIC_TITLE: Record<PerfMetric, string> = {
  revenue: "REVENUE",
  margin: "MARGIN",
  labor: "LABOR",
  value: "VALUE",
  covers: "COVERS",
  avgSpend: "AVG SPEND",
};

function formatDeltaPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

function fmt(v: number, unit: "euro" | "pct" | "count") {
  if (unit === "pct") return `${v.toFixed(1)}%`;
  if (unit === "count") return Math.round(v).toLocaleString("en-IE");
  return formatCompactEuro(v);
}

function fmtExact(v: number, unit: "euro" | "pct" | "count") {
  if (unit === "pct") return `${v.toFixed(1)}%`;
  if (unit === "count") return Math.round(v).toLocaleString("en-IE");
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

/** Sensible rounded ticks: 4-5 labels, may not start at zero. */
function niceTicks(
  rawMin: number,
  rawMax: number,
  unit: "euro" | "pct" | "count",
): number[] {
  const span = Math.max(rawMax - rawMin, unit === "pct" ? 0.5 : 1);
  const pad = span * 0.12;
  let lo = rawMin - pad;
  const hi = rawMax + pad;

  if (unit === "euro" && lo > 0 && lo / hi < 0.35) {
    // Keep resolution; do not force zero when it flattens the series
  } else if ((unit === "euro" || unit === "count") && lo < span * 0.15) {
    lo = 0;
  }

  if (unit === "pct") {
    lo = Math.max(0, lo);
  }

  const target = 4;
  const rough = (hi - lo) / target;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-6))));
  const norms = [1, 2, 2.5, 5, 10];
  const step = norms.map((n) => n * mag).find((s) => s >= rough) ?? mag * 10;

  const start = Math.floor(lo / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= hi + step * 0.01 && ticks.length < 5; v += step) {
    if (v >= lo - step * 0.05)
      ticks.push(Number(v.toFixed(unit === "pct" ? 1 : 0)));
  }
  if (ticks.length < 2) return [Number(lo.toFixed(1)), Number(hi.toFixed(1))];
  return ticks;
}

function pickXIndices(n: number, range: PerfRange): number[] {
  if (n <= 1) return [0];
  if (range === "7d" || range === "yoy") return Array.from({ length: n }, (_, i) => i);
  if (range === "today") {
    const step = Math.max(1, Math.ceil(n / 6));
    const out: number[] = [];
    for (let i = 0; i < n; i += step) out.push(i);
    if (out[out.length - 1] !== n - 1) out.push(n - 1);
    return out;
  }
  const count = range === "30d" ? 6 : range === "qtd" ? 5 : 6;
  const out: number[] = [];
  for (let k = 0; k < count; k++) {
    out.push(Math.round((k / (count - 1)) * (n - 1)));
  }
  return [...new Set(out)];
}

/**
 * Dominant operating performance chart: axes, hover tip, click to investigate.
 * No permanent side panel.
 */
export function OperatingPerformanceChart({
  metric,
  range,
  series,
  unit,
  onMetric,
  onRange,
  onSelectDay,
}: Props) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [eventTip, setEventTip] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const w = 800;
  const h = 280;
  const pad = { t: 20, r: 16, b: 36, l: 56 };

  const vals = series.flatMap((s) => [s.actual, s.forecast, s.plan]);
  const dataMin = Math.min(...vals);
  const dataMax = Math.max(...vals);
  const ticks = useMemo(
    () => niceTicks(dataMin, dataMax, unit),
    [dataMin, dataMax, unit],
  );
  const min = ticks[0]!;
  const max = ticks[ticks.length - 1]!;

  const x = useCallback(
    (i: number) =>
      pad.l + (i / Math.max(series.length - 1, 1)) * (w - pad.l - pad.r),
    [series.length, pad.l, pad.r],
  );
  const y = useCallback(
    (v: number) =>
      pad.t + (1 - (v - min) / (max - min || 1)) * (h - pad.t - pad.b),
    [min, max, pad.t, pad.b],
  );

  const pathFor = useCallback(
    (key: "actual" | "forecast" | "plan") =>
      series
        .map((s, i) => {
          const v = s[key];
          return `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
        })
        .join(" "),
    [series, x, y],
  );

  const areaPath = useMemo(() => {
    if (!series.length) return "";
    const line = pathFor("actual");
    return `${line} L ${x(series.length - 1).toFixed(1)} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`;
  }, [pathFor, series.length, x, pad.b, pad.l]);

  const xLabels = useMemo(
    () => pickXIndices(series.length, range),
    [series.length, range],
  );

  const summary = useMemo(() => {
    if (!series.length) return { value: 0, deltaPct: 0 };
    if (unit === "euro" || unit === "count") {
      const actual = series.reduce((a, s) => a + s.actual, 0);
      const forecast = series.reduce((a, s) => a + s.forecast, 0);
      const deltaPct =
        forecast !== 0 ? ((actual - forecast) / Math.abs(forecast)) * 100 : 0;
      return { value: actual, deltaPct };
    }
    const last = series[series.length - 1]!;
    const deltaPct =
      last.forecast !== 0
        ? ((last.actual - last.forecast) / Math.abs(last.forecast)) * 100
        : 0;
    return { value: last.actual, deltaPct };
  }, [series, unit]);

  const indexFromClientX = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || !series.length) return 0;
      const rect = svg.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * w;
      const t = (localX - pad.l) / (w - pad.l - pad.r);
      const idx = Math.round(t * (series.length - 1));
      return Math.max(0, Math.min(series.length - 1, idx));
    },
    [series.length, pad.l, pad.r],
  );

  const onPlotMove = (e: ReactPointerEvent) => {
    setHover(indexFromClientX(e.clientX));
    setEventTip(null);
  };

  const active = hover != null ? series[hover] : null;
  const tipSide =
    hover != null && hover / Math.max(series.length - 1, 1) > 0.55
      ? "left"
      : "right";
  const tipY =
    active != null
      ? y(active.actual) / h > 0.35
        ? "above"
        : "below"
      : "above";

  const tipStyle = useMemo(() => {
    if (hover == null || !active) return undefined;
    const px = (x(hover) / w) * 100;
    const py = (y(active.actual) / h) * 100;
    return {
      left: `${px}%`,
      top: `${py}%`,
      transform:
        tipSide === "left"
          ? tipY === "below"
            ? "translate(-100%, 12px)"
            : "translate(-100%, calc(-100% - 12px))"
          : tipY === "below"
            ? "translate(8px, 12px)"
            : "translate(8px, calc(-100% - 12px))",
    } as const;
  }, [hover, active, x, y, tipSide, tipY]);

  return (
    <section className="rp-opchart">
      <div className="rp-opchart-summary">
        <p className="rp-opchart-summary-kicker">
          {METRIC_TITLE[metric]} · {RANGE_TITLE[range]}
        </p>
        <p className="rp-opchart-summary-value">
          <strong>{fmt(summary.value, unit)}</strong>
          <span
            className={
              summary.deltaPct >= 0 ? "rp-cc-pos" : "rp-cc-neg"
            }
          >
            {formatDeltaPct(summary.deltaPct)} vs forecast
          </span>
        </p>
      </div>

      <header className="rp-opchart-head">
        <div className="rp-opchart-metrics" role="tablist" aria-label="Metric">
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
        <div className="rp-opchart-ranges" role="group" aria-label="Period">
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
      </header>

      <div
        className="rp-opchart-plot"
        ref={plotRef}
        onPointerLeave={() => {
          setHover(null);
          setEventTip(null);
        }}
      >
        <svg
          ref={svgRef}
          className="rp-opchart-svg"
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`${metric} operating performance`}
          onPointerMove={onPlotMove}
          onClick={(e) => {
            const idx = indexFromClientX(e.clientX);
            onSelectDay(series[idx]!);
          }}
        >
          <defs>
            <linearGradient id="rpOpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,232,137,0.16)" />
              <stop offset="100%" stopColor="rgba(0,232,137,0)" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {ticks.map((t) => (
            <g key={`yt-${t}`}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(t)}
                y2={y(t)}
                className="rp-opchart-grid"
              />
              <text
                x={pad.l - 8}
                y={y(t) + 3}
                className="rp-opchart-ylabel"
                textAnchor="end"
              >
                {unit === "pct"
                  ? `${t.toFixed(t % 1 === 0 ? 0 : 1)}%`
                  : unit === "count"
                    ? Math.round(t).toLocaleString("en-IE")
                    : formatCompactEuro(t)}
              </text>
            </g>
          ))}

          <motion.path
            key={`plan-${metric}-${range}`}
            d={pathFor("plan")}
            className="rp-opchart-plan"
            fill="none"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          />
          <motion.path
            key={`fc-${metric}-${range}`}
            d={pathFor("forecast")}
            className="rp-opchart-forecast"
            fill="none"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          />
          <motion.path
            key={`area-${metric}-${range}`}
            d={areaPath}
            fill="url(#rpOpFill)"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          />
          <motion.path
            key={`act-${metric}-${range}`}
            d={pathFor("actual")}
            className="rp-opchart-actual"
            fill="none"
            initial={reduced ? false : { opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.28 }}
          />

          {/* Finding markers: green dots only */}
          {series.map((s, idx) =>
            s.events?.length ? (
              <g
                key={`ev-${idx}`}
                className="rp-opchart-marker"
                onPointerEnter={(e) => {
                  e.stopPropagation();
                  setHover(idx);
                  setEventTip(idx);
                }}
                onPointerLeave={() => setEventTip(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDay(s);
                }}
                style={{ cursor: "pointer" }}
              >
                <circle cx={x(idx)} cy={y(s.actual)} r={4.5} />
              </g>
            ) : null,
          )}

          {hover != null ? (
            <>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={pad.t}
                y2={h - pad.b}
                className="rp-opchart-cross"
              />
              <circle
                cx={x(hover)}
                cy={y(series[hover]!.actual)}
                r={3.5}
                className="rp-opchart-focus"
              />
            </>
          ) : null}

          {xLabels.map((idx) => (
            <text
              key={`xl-${series[idx]!.dateKey}`}
              x={x(idx)}
              y={h - 10}
              className="rp-opchart-xlabel"
              textAnchor="middle"
            >
              {series[idx]!.label}
            </text>
          ))}
        </svg>

        <AnimatePresence>
          {hover != null && active && eventTip == null ? (
            <motion.div
              key="tip"
              className="rp-opchart-tip"
              style={tipStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={RADR_MOTION.tooltip}
              role="tooltip"
            >
              <p className="rp-opchart-tip-when">{active.fullLabel}</p>
              <dl>
                <div>
                  <dt>{METRICS.find((m) => m.id === metric)?.label}</dt>
                  <dd>{fmtExact(active.actual, unit)}</dd>
                </div>
                <div>
                  <dt>Forecast</dt>
                  <dd>{fmtExact(active.forecast, unit)}</dd>
                </div>
                {active.lastYear != null ? (
                  <div>
                    <dt>Comparable last year</dt>
                    <dd>{fmtExact(active.lastYear, unit)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>vs forecast</dt>
                  <dd
                    className={
                      active.actual >= active.forecast
                        ? "rp-cc-pos"
                        : "rp-cc-neg"
                    }
                  >
                    {formatDeltaPct(
                      active.forecast !== 0
                        ? ((active.actual - active.forecast) /
                            Math.abs(active.forecast)) *
                            100
                        : 0,
                    )}
                  </dd>
                </div>
                {active.lastYear != null ? (
                  <div>
                    <dt>YoY</dt>
                    <dd
                      className={
                        active.actual >= active.lastYear
                          ? "rp-cc-pos"
                          : "rp-cc-neg"
                      }
                    >
                      {formatDeltaPct(
                        ((active.actual - active.lastYear) /
                          Math.abs(active.lastYear)) *
                          100,
                      )}
                    </dd>
                  </div>
                ) : null}
                {metric === "revenue" && active.covers != null ? (
                  <div>
                    <dt>Covers</dt>
                    <dd>{active.covers}</dd>
                  </div>
                ) : null}
                {metric === "revenue" && active.avgSpend != null ? (
                  <div>
                    <dt>Avg spend</dt>
                    <dd>€{active.avgSpend.toFixed(0)}</dd>
                  </div>
                ) : null}
              </dl>
              {active.calendarNote ? (
                <p className="rp-opchart-tip-cal">{active.calendarNote}</p>
              ) : null}
              {active.events?.length ? (
                <p className="rp-opchart-tip-story">
                  <i aria-hidden="true" />
                  <span>RADR SIGNAL</span>
                  {active.events.length === 1
                    ? active.events[0]!.title
                    : `${active.events.length} findings · ${active.events[0]!.money}`}
                </p>
              ) : (
                <p className="rp-opchart-tip-story" data-quiet="true">
                  Click to investigate day
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {eventTip != null && series[eventTip]?.events?.[0] ? (
            <motion.div
              key="evtip"
              className="rp-opchart-tip rp-opchart-tip-event"
              style={{
                left: `${(x(eventTip) / w) * 100}%`,
                top: `${(y(series[eventTip]!.actual) / h) * 100}%`,
                transform:
                  eventTip / Math.max(series.length - 1, 1) > 0.55
                    ? "translate(-100%, calc(-100% - 12px))"
                    : "translate(8px, calc(-100% - 12px))",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={RADR_MOTION.tooltip}
              role="tooltip"
            >
              <p className="rp-opchart-tip-when">RADR FINDING</p>
              <p className="rp-opchart-tip-title">
                {series[eventTip]!.events![0]!.title}
              </p>
              <p className="rp-opchart-tip-money">
                {series[eventTip]!.events![0]!.money}
              </p>
              <p className="rp-opchart-tip-terr">
                {series[eventTip]!.events![0]!.territory}
              </p>
              <Link
                href={series[eventTip]!.events![0]!.href}
                className="rp-opchart-tip-link"
                onClick={(e) => e.stopPropagation()}
              >
                View finding →
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="rp-opchart-legend">
        <span data-l="actual">Actual</span>
        <span data-l="forecast">Forecast</span>
        <span data-l="plan">Plan</span>
        <span data-l="event">Finding</span>
      </div>
    </section>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Build reconciled performance series ending 19 Aug 2026. */
export function buildOperatingSeries(
  metric: PerfMetric,
  range: PerfRange,
  base: {
    revenue: number;
    margin: number;
    labor: number;
    value: number;
    covers?: number;
    avgSpend?: number;
  },
): PerfPoint[] {
  const end = new Date(2026, 7, 19); // 19 Aug 2026

  type Slot = { label: string; fullLabel: string; dateKey: string };
  let slots: Slot[] = [];

  if (range === "today") {
    slots = Array.from({ length: 12 }, (_, i) => {
      const hour = 8 + i;
      return {
        label: `${hour}:00`,
        fullLabel: `WED 19 AUG · ${hour}:00`,
        dateKey: `h-${hour}`,
      };
    });
  } else if (range === "7d" || range === "yoy") {
    slots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (6 - i));
      const dow = d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
      return {
        label: dow,
        fullLabel: `${dow} ${d.getDate()} ${MONTHS[d.getMonth()]!.toUpperCase()}`,
        dateKey: d.toISOString().slice(0, 10),
      };
    });
  } else if (range === "30d") {
    const n = 30;
    slots = Array.from({ length: n }, (_, i) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (n - 1 - i));
      const label = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      return {
        label,
        fullLabel: label.toUpperCase(),
        dateKey: d.toISOString().slice(0, 10),
      };
    });
  } else if (range === "qtd") {
    const n = 12;
    slots = Array.from({ length: n }, (_, i) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (n - 1 - i) * 7);
      return {
        label: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        fullLabel: `W/C ${d.getDate()} ${MONTHS[d.getMonth()]}`.toUpperCase(),
        dateKey: `w-${d.toISOString().slice(0, 10)}`,
      };
    });
  } else {
    slots = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2025, 8 + i, 1);
      return {
        label: MONTHS[d.getMonth()]!,
        fullLabel: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`.toUpperCase(),
        dateKey: `m-${d.getFullYear()}-${d.getMonth()}`,
      };
    });
  }

  const n = slots.length;
  const center =
    metric === "revenue"
      ? base.revenue
      : metric === "margin"
        ? base.margin
        : metric === "labor"
          ? base.labor
          : metric === "covers"
            ? (base.covers ?? 122)
            : metric === "avgSpend"
              ? (base.avgSpend ?? 137)
              : base.value;

  const pointScale =
    metric === "revenue"
      ? range === "today"
        ? 1 / 10
        : range === "ytd"
          ? 22
          : range === "qtd"
            ? 6
            : 1
      : metric === "value"
        ? range === "ytd"
          ? 8
          : 1
        : 1;

  return slots.map((slot, i) => {
    const t = i / Math.max(n - 1, 1);
    const wave = Math.sin(t * Math.PI * 1.8) * 0.035;
    const scaled = center * pointScale;
    const isMoneyish =
      metric === "revenue" || metric === "value" || metric === "avgSpend";
    const actual = isMoneyish
      ? Math.round(scaled * (0.9 + t * 0.12 + wave))
      : metric === "covers"
        ? Math.round(scaled * (0.9 + t * 0.12 + wave))
        : Math.round((scaled * (0.95 + t * 0.07 + wave * 0.4)) * 10) / 10;
    const forecast = isMoneyish
      ? Math.round(scaled * (0.92 + t * 0.08))
      : metric === "covers"
        ? Math.round(scaled * (0.92 + t * 0.08))
        : Math.round((scaled * (0.97 + t * 0.03)) * 10) / 10;
    const plan =
      metric === "labor"
        ? 32
        : metric === "margin"
          ? 17.6
          : Math.round(scaled * (0.93 + t * 0.05));
    const lastYear = isMoneyish || metric === "covers"
      ? Math.round(actual * 0.88)
      : Math.round(actual * 0.96 * 10) / 10;

    const covers =
      metric === "revenue"
        ? Math.round((base.covers ?? 122) * (0.9 + t * 0.12 + wave))
        : undefined;
    const avgSpend =
      metric === "revenue"
        ? Math.round((base.avgSpend ?? 137) * (0.97 + t * 0.04) * 100) / 100
        : undefined;

    const events =
      i === n - 2
        ? [
            {
              territory: "LABOR" as const,
              title: "Peak service capacity gap",
              money: "€290 at risk",
              href: "/app/labor",
            },
          ]
        : i === Math.max(0, n - 5)
          ? [
              {
                territory: "SELL" as const,
                title: "Terrace weather opportunity",
                money: "€420 gross · €348 net",
                href: "/app/sell",
              },
            ]
          : i === Math.max(0, n - 8)
            ? [
                {
                  territory: "BUY" as const,
                  title: "Supplier invoice discrepancy",
                  money: "€118 recoverable",
                  href: "/app/buy",
                },
              ]
            : undefined;

    const calendarNote =
      slot.dateKey === "2026-08-22" || i === n - 1
        ? range === "7d" || range === "yoy"
          ? i === n - 1
            ? "Comparable Wednesday · seasonal baseline"
            : undefined
          : undefined
        : slot.dateKey.endsWith("-15")
          ? "Comparable Saturday 2025 baseline"
          : undefined;

    return {
      ...slot,
      actual,
      forecast,
      plan,
      lastYear,
      covers,
      avgSpend,
      calendarNote,
      events,
    };
  });
}
