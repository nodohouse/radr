"use client";

import { useState } from "react";
import type { LiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

type Mode = "cumulative" | "rate";

export type PaceSeriesPoint = {
  label: string;
  actual: number;
  expected: number;
  target: number;
  observed: boolean;
};

/** Shared warm trajectory SVG — used by restaurant, CFO, hotel, apartment. */
export function PaceTrajectoryChart({
  series,
  ariaLabel,
  clockLabel,
  hero,
}: {
  series: PaceSeriesPoint[];
  ariaLabel: string;
  clockLabel?: string;
  hero?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 720;
  const h = hero ? 280 : 220;
  const padL = 28;
  const padR = 20;
  const padT = 32;
  const padB = 40;
  const resolvedNow = series.findIndex((s) => s.label === "NOW");
  const ni = resolvedNow >= 0 ? resolvedNow : Math.max(0, series.filter((s) => s.observed).length - 1);

  const maxR = Math.max(
    ...series.flatMap((s) => [s.actual, s.expected, s.target]),
    1,
  );
  const xAt = (i: number) =>
    padL + (i / Math.max(series.length - 1, 1)) * (w - padL - padR);
  const yAt = (v: number) =>
    h - padB - (v / maxR) * (h - padT - padB);

  const actualPts = series
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.observed)
    .map(({ s, i }) => `${xAt(i)},${yAt(s.actual)}`);
  const forecastPts = series
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => i >= ni)
    .map(({ s, i }) => `${xAt(i)},${yAt(i === ni ? s.actual : s.expected)}`);
  const targetPts = series.map((s, i) => `${xAt(i)},${yAt(s.target)}`).join(" ");
  const nowX = xAt(ni);
  const nowY = yAt(series[ni]?.actual ?? 0);
  const tip = hover != null ? series[hover] : null;

  return (
    <div className="rp-live-traj-wrap" data-hero={hero ? "true" : undefined}>
      <svg
        className="rp-live-traj"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        <rect x={0} y={0} width={w} height={h} className="rp-live-traj-bg" rx={10} />
        <polyline points={targetPts} fill="none" className="rp-live-traj-target" />
        <polyline
          points={forecastPts.join(" ")}
          fill="none"
          className="rp-live-traj-forecast"
        />
        <polyline
          points={actualPts.join(" ")}
          fill="none"
          className="rp-live-traj-actual"
        />
        <line
          x1={nowX}
          y1={padT - 6}
          x2={nowX}
          y2={h - padB + 8}
          className="rp-live-traj-now-line"
        />
        <circle cx={nowX} cy={nowY} r={5.5} className="rp-live-traj-now-dot" />
        <text
          x={nowX}
          y={padT - 10}
          textAnchor="middle"
          className="rp-live-traj-now-label"
        >
          NOW
        </text>
        {series.map((s, i) => (
          <g key={s.label}>
            <circle
              cx={xAt(i)}
              cy={yAt(s.observed ? s.actual : s.expected)}
              r={10}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(i)}
            />
            <text
              x={xAt(i)}
              y={h - 12}
              textAnchor="middle"
              className="rp-live-traj-axis"
            >
              {s.label === "NOW" && clockLabel ? clockLabel : s.label}
            </text>
          </g>
        ))}
      </svg>
      {tip ? (
        <aside className="rp-live-tip" aria-live="polite">
          <p className="rp-live-tip-t">{tip.label}</p>
          <dl>
            <div>
              <dt>{tip.observed ? "Actual" : "Forecast"}</dt>
              <dd>
                {formatDecisionMoney(tip.observed ? tip.actual : tip.expected)}
              </dd>
            </div>
            <div>
              <dt>Expected</dt>
              <dd>{formatDecisionMoney(tip.expected)}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{formatDecisionMoney(tip.target)}</dd>
            </div>
          </dl>
        </aside>
      ) : null}
    </div>
  );
}

/** Hero revenue trajectory — observed → forecast, warm canvas, rate toggle. */
export function LiveTrajectoryChart({
  live,
  hero,
  events = [],
}: {
  live: LiveServicePerformance;
  hero?: boolean;
  /** Material system events along the night */
  events?: { at: string; label: string; kind: string }[];
}) {
  const [mode, setMode] = useState<Mode>("cumulative");
  const [hover, setHover] = useState<number | null>(null);

  const w = 720;
  const h = hero ? 280 : 236;
  const padL = 28;
  const padR = 20;
  const padT = 32;
  const padB = 40;
  const series = live.series;
  const nowIdx = live.nowIndex >= 0 ? live.nowIndex : 3;

  const valueAt = (i: number, kind: "actual" | "forecast" | "target" | "comp") => {
    const s = series[i]!;
    if (mode === "rate") {
      if (kind === "actual") return s.observed ? s.revenueRatePerHour : 0;
      if (kind === "forecast") return s.revenueRatePerHour;
      if (kind === "target") return Math.round(s.revenueRatePerHour * 0.96);
      return Math.round(s.revenueRatePerHour * 0.9);
    }
    if (kind === "actual") return s.actualRevenue;
    if (kind === "forecast") return s.forecastRevenue;
    if (kind === "target") return s.targetRevenue;
    return s.comparableRevenue;
  };

  const maxR = Math.max(
    ...series.flatMap((_, i) => [
      valueAt(i, "actual"),
      valueAt(i, "forecast"),
      valueAt(i, "target"),
      valueAt(i, "comp"),
    ]),
    1,
  );

  const xAt = (i: number) =>
    padL + (i / Math.max(series.length - 1, 1)) * (w - padL - padR);
  const yAt = (v: number) =>
    h - padB - (v / maxR) * (h - padT - padB);

  const actualPts = series
    .map((s, i) => ({ i, s }))
    .filter(({ s }) => s.observed)
    .map(({ i }) => `${xAt(i)},${yAt(valueAt(i, "actual"))}`);

  const forecastFromNow = series
    .map((s, i) => ({ i, s }))
    .filter(({ i }) => i >= nowIdx)
    .map(({ i }) => {
      const v =
        i === nowIdx ? valueAt(i, "actual") : valueAt(i, "forecast");
      return `${xAt(i)},${yAt(v)}`;
    });

  const targetPts = series
    .map((_, i) => `${xAt(i)},${yAt(valueAt(i, "target"))}`)
    .join(" ");
  const comparablePts = series
    .map((_, i) => `${xAt(i)},${yAt(valueAt(i, "comp"))}`)
    .join(" ");

  const nowX = xAt(nowIdx);
  const nowY = yAt(valueAt(nowIdx, "actual"));
  const tip = hover != null ? series[hover] : null;

  return (
    <div className="rp-live-traj-wrap" data-hero={hero ? "true" : undefined}>
      <div className="rp-live-traj-modes" role="tablist" aria-label="Trajectory mode">
        <button
          type="button"
          role="tab"
          data-active={mode === "cumulative"}
          aria-selected={mode === "cumulative"}
          onClick={() => setMode("cumulative")}
        >
          Cumulative
        </button>
        <button
          type="button"
          role="tab"
          data-active={mode === "rate"}
          aria-selected={mode === "rate"}
          onClick={() => setMode("rate")}
        >
          € / hour
        </button>
      </div>

      <svg
        className="rp-live-traj"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={
          mode === "cumulative"
            ? "Revenue trajectory from open through close"
            : "Revenue velocity euros per hour"
        }
        onMouseLeave={() => setHover(null)}
      >
        <rect x={0} y={0} width={w} height={h} className="rp-live-traj-bg" rx={10} />
        <polyline points={comparablePts} fill="none" className="rp-live-traj-comp" />
        <polyline points={targetPts} fill="none" className="rp-live-traj-target" />
        <polyline
          points={forecastFromNow.join(" ")}
          fill="none"
          className="rp-live-traj-forecast"
        />
        <polyline
          points={actualPts.join(" ")}
          fill="none"
          className="rp-live-traj-actual"
        />
        <line
          x1={nowX}
          y1={padT - 6}
          x2={nowX}
          y2={h - padB + 8}
          className="rp-live-traj-now-line"
        />
        <circle cx={nowX} cy={nowY} r={5.5} className="rp-live-traj-now-dot" />
        <text
          x={nowX}
          y={padT - 10}
          textAnchor="middle"
          className="rp-live-traj-now-label"
        >
          NOW
        </text>
        {series.map((s, i) => (
          <g key={s.label}>
            <circle
              cx={xAt(i)}
              cy={yAt(
                s.observed || i === nowIdx
                  ? valueAt(i, "actual") || valueAt(i, "forecast")
                  : valueAt(i, "forecast"),
              )}
              r={10}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(i)}
            />
            <text
              x={xAt(i)}
              y={h - 12}
              textAnchor="middle"
              className="rp-live-traj-axis"
            >
              {s.label === "NOW" ? live.clockLabel : s.label}
            </text>
          </g>
        ))}
      </svg>

      {tip ? (
        <aside className="rp-live-tip" aria-live="polite">
          <p className="rp-live-tip-t">{tip.clock ?? tip.label}</p>
          <dl>
            <div>
              <dt>{tip.observed ? "Actual" : "Forecast"}</dt>
              <dd>
                {formatDecisionMoney(
                  mode === "rate"
                    ? tip.revenueRatePerHour
                    : tip.observed
                      ? tip.actualRevenue
                      : tip.forecastRevenue,
                )}
                {mode === "rate" ? "/h" : ""}
              </dd>
            </div>
            <div>
              <dt>Expected</dt>
              <dd>
                {formatDecisionMoney(
                  mode === "rate"
                    ? Math.round(tip.revenueRatePerHour * 0.96)
                    : tip.forecastRevenue,
                )}
              </dd>
            </div>
            <div>
              <dt>Covers</dt>
              <dd>
                {tip.observed ? tip.actualCovers : tip.forecastCovers}
              </dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd>{tip.orders}</dd>
            </div>
            <div>
              <dt>Avg spend</dt>
              <dd>€{tip.avgSpend}</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      {events.length > 0 ? (
        <ul className="rp-live-sys-events" aria-label="System events">
          {events.map((e) => (
            <li key={`${e.at}-${e.label}`} data-kind={e.kind}>
              <time>{e.at}</time>
              <span>{e.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
