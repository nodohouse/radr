"use client";

import { memo, useMemo, useState } from "react";
import {
  CHART_BY_RANGE,
  CHART_EVENTS,
  POINT_VALUE,
  type ChartDayCase,
  type ChartRange,
  type OpTerritory,
} from "@/lib/radr/operatingHero";
import { TextSep } from "@/components/TextSep";

const RANGES: { id: ChartRange; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "ytd", label: "YTD" },
];

function money(n: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  currency?: "EUR" | "GBP" | "USD" | "JPY" | "SGD";
  highlightTerritory?: OpTerritory | null;
  onDayClick?: (day: ChartDayCase) => void;
};

/** Chart: hover preview in-bounds; click opens day investigation. */
function OperatingChartInner({
  currency = "EUR",
  highlightTerritory = null,
  onDayClick,
}: Props) {
  const [range, setRange] = useState<ChartRange>("30d");
  const [i, setI] = useState<number | null>(null);
  const [eventKey, setEventKey] = useState<string | null>(null);

  const series = CHART_BY_RANGE[range];
  const w = 440;
  const h = 112;
  const padX = 8;
  const padY = 14;

  const eventsForRange = useMemo(
    () =>
      range === "7d" || range === "30d"
        ? CHART_EVENTS.filter((ev) => series.some((p) => p.key === ev.key))
        : [],
    [range, series],
  );

  const geo = useMemo(() => {
    const margins = series.flatMap((p) => [p.margin, p.plan]);
    const min = Math.min(...margins) - 0.35;
    const max = Math.max(...margins) + 0.35;
    const span = max - min || 1;
    const xs = series.map((_, idx) => padX + (idx * (w - padX * 2)) / Math.max(series.length - 1, 1));
    const y = (v: number) => h - padY - ((v - min) / span) * (h - padY * 2);
    const actual = series.map((p, idx) => `${xs[idx]},${y(p.margin)}`).join(" ");
    const plan = series.map((p, idx) => `${xs[idx]},${y(p.plan)}`).join(" ");

    const above = series.map((p, idx) => ({ p, x: xs[idx], ya: y(p.margin), yp: y(p.plan) }));
    const segs: string[] = [];
    for (let a = 0; a < above.length; a++) {
      if (above[a].p.margin < above[a].p.plan) continue;
      let b = a;
      while (b + 1 < above.length && above[b + 1].p.margin >= above[b + 1].p.plan) b++;
      const slice = above.slice(a, b + 1);
      const top = slice.map((s) => `${s.x},${s.ya}`).join(" L");
      const bot = [...slice].reverse().map((s) => `${s.x},${s.yp}`).join(" L");
      segs.push(`M${slice[0].x},${slice[0].yp} L${top} L${bot} Z`);
      a = b;
    }

    return { xs, y, actual, plan, area: segs.join(" ") };
  }, [series]);

  const point = i !== null ? series[i] : null;
  const pv = point ? POINT_VALUE[point.key] : null;
  const tipSide =
    i === null ? "mid" : i < series.length * 0.28 ? "right" : i > series.length * 0.72 ? "left" : "mid";
  const delta = point ? point.margin - point.plan : 0;

  const openDay = (idx: number) => {
    if (!onDayClick) return;
    const p = series[idx];
    const events = CHART_EVENTS.filter((ev) => ev.key === p.key);
    onDayClick({
      key: p.key,
      label: p.label,
      revenue: p.revenue,
      margin: p.margin,
      plan: p.plan,
      signals: POINT_VALUE[p.key]?.signals ?? events.length,
      events,
    });
  };

  return (
    <div className="rx-om-chart" data-tip={tipSide}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="rx-om-chart-svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        onMouseLeave={() => {
          setI(null);
          setEventKey(null);
        }}
      >
        <defs>
          <linearGradient id="rx-om-above" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,232,106,0.14)" />
            <stop offset="100%" stopColor="rgba(0,232,106,0.015)" />
          </linearGradient>
        </defs>

        {geo.area ? <path d={geo.area} fill="url(#rx-om-above)" pointerEvents="none" /> : null}

        <polyline
          points={geo.plan}
          fill="none"
          stroke="rgba(244,241,234,0.2)"
          strokeWidth="1.2"
          strokeDasharray="3.5 4"
          pointerEvents="none"
        />
        <polyline
          points={geo.actual}
          fill="none"
          stroke="rgba(250,248,243,0.95)"
          strokeWidth="2.1"
          strokeLinejoin="round"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {geo.xs.map((x, idx) => (
          <rect
            key={series[idx].key}
            x={x - (w / series.length) * 0.45}
            y={0}
            width={(w / series.length) * 0.9}
            height={h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => {
              setI(idx);
              setEventKey(null);
            }}
            onClick={() => openDay(idx)}
          />
        ))}

        {eventsForRange.map((ev) => {
          const idx = series.findIndex((p) => p.key === ev.key);
          if (idx < 0) return null;
          const lit =
            !highlightTerritory || highlightTerritory === ev.territory || eventKey === ev.key;
          const hot = highlightTerritory === ev.territory;
          const x = geo.xs[idx];
          const y = geo.y(series[idx].margin);
          return (
            <g
              key={ev.key}
              className="rx-om-chart-ev"
              opacity={lit ? 1 : 0.18}
              style={{ transition: "opacity 180ms ease" }}
            >
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="rx-om-chart-delta"
                fontSize={hot || eventKey === ev.key ? 12 : 10}
                fill="rgba(0,232,106,0.9)"
                onMouseEnter={() => {
                  setEventKey(ev.key);
                  setI(idx);
                }}
                onClick={() => openDay(idx)}
                style={{ cursor: "pointer" }}
              >
                △
              </text>
            </g>
          );
        })}

        {i !== null ? (
          <g pointerEvents="none">
            <line
              x1={geo.xs[i]}
              x2={geo.xs[i]}
              y1={2}
              y2={h - 2}
              stroke="rgba(0,232,106,0.32)"
              strokeWidth="1"
            />
            <circle cx={geo.xs[i]} cy={geo.y(series[i].margin)} r={3} fill="#00e86a" />
          </g>
        ) : null}
      </svg>

      <div className="rx-om-chart-ranges" role="tablist" aria-label="Chart range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            data-on={range === r.id ? "true" : "false"}
            onClick={() => {
              setRange(r.id);
              setI(null);
              setEventKey(null);
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {eventKey ? (
        (() => {
          const ev = CHART_EVENTS.find((e) => e.key === eventKey);
          if (!ev) return null;
          return (
            <div className="rx-om-chart-tip" data-kind="event">
              <strong>{point?.label ?? ev.key}</strong>
              <TextSep srOnly />
              <span className="rx-om-chart-tip-signal">{ev.title}</span>
              <TextSep srOnly />
              <span>{ev.body}</span>
              <TextSep srOnly />
              <span data-signal>{ev.value}</span>
            </div>
          );
        })()
      ) : point ? (
        <div className="rx-om-chart-tip">
          <strong>{point.label}</strong>
          <div className="rx-om-chart-tip-row">
            <span>Revenue</span>
            <TextSep>: </TextSep>
            <b>{money(point.revenue, currency)}</b>
          </div>
          <div className="rx-om-chart-tip-row">
            <span>Margin</span>
            <TextSep>: </TextSep>
            <b>{point.margin.toFixed(1)}%</b>
          </div>
          <div className="rx-om-chart-tip-row">
            <span>Plan</span>
            <TextSep>: </TextSep>
            <b>{point.plan.toFixed(1)}%</b>
          </div>
          <div className="rx-om-chart-tip-row">
            <span>Δ</span>
            <TextSep>: </TextSep>
            <b data-signal>
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} pts
            </b>
          </div>
          {pv ? (
            <p className="rx-om-chart-tip-insight">
              {pv.signals > 0 ? (
                <>
                  RADR
                  <TextSep />
                  {pv.signals} finding{pv.signals === 1 ? "" : "s"}
                  <TextSep />
                  click to investigate
                </>
              ) : (
                "Click to investigate day"
              )}
            </p>
          ) : (
            <p className="rx-om-chart-tip-insight" data-quiet="true">
              Click to investigate day
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export const OperatingChart = memo(OperatingChartInner);
