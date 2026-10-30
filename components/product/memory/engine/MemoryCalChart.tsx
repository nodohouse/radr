"use client";

import { useState } from "react";
import type {
  CalibrationPoint,
  MemoryPeriod,
} from "@/lib/radr/product/memoryProofEngine";

type Props = {
  series: readonly CalibrationPoint[];
  period: MemoryPeriod;
  onPeriod: (p: MemoryPeriod) => void;
  startError: number;
  improvementPct: number;
  errorTooltip: string;
  uncertaintyTooltip: string;
};

const W = 640;
const H = 210;
const M = { l: 42, r: 16, t: 12, b: 36 };
const X_MAX = 24;
const Y_MAX = 24;

const PERIODS: { id: MemoryPeriod; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
];

export function MemoryCalChart({
  series,
  period,
  onPeriod,
  startError,
  improvementPct,
  errorTooltip,
  uncertaintyTooltip,
}: Props) {
  const pts = series.length ? series : [];
  const [active, setActive] = useState(Math.max(pts.length - 1, 0));
  const safeActive = Math.min(active, Math.max(pts.length - 1, 0));
  const first = pts[0];
  const last = pts[pts.length - 1];
  const a = pts[safeActive] ?? last;

  if (!first || !last || !a) {
    return null;
  }

  const x = (n: number) => M.l + ((n - 1) / (X_MAX - 1)) * (W - M.l - M.r);
  const y = (v: number) => H - M.b - (v / Y_MAX) * (H - M.t - M.b);

  const band = [
    ...pts.map(
      (p, i) =>
        `${i ? "L" : "M"} ${x(p.n).toFixed(1)} ${y(p.hi).toFixed(1)}`,
    ),
    ...[...pts]
      .reverse()
      .map((p) => `L ${x(p.n).toFixed(1)} ${y(p.lo).toFixed(1)}`),
    "Z",
  ].join(" ");
  const line = pts
    .map((p, i) => `${i ? "L" : "M"} ${x(p.n).toFixed(1)} ${y(p.error).toFixed(1)}`)
    .join(" ");

  const tipLeft = x(a.n) > W * 0.58;

  return (
    <div className="me-chart" aria-label="Forecast error trend">
      <div className="me-chart-head">
        <h2>Forecast error trend</h2>
        <div className="me-periods" role="group" aria-label="Sample window">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              data-active={period === p.id ? "true" : undefined}
              onClick={() => onPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="me-chart-stat" title={errorTooltip}>
        <span>N = {last.n} OBSERVATIONS</span>
        <strong>
          {last.error}% error ({last.lo} – {last.hi}%)
        </strong>
        <em>↓ {improvementPct}% vs start</em>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="me-cal-svg"
        role="img"
        aria-label={`Forecast error narrows from ${startError}% to ${last.error}% across ${last.n} comparable Friday peaks`}
        onMouseLeave={() => setActive(pts.length - 1)}
      >
        <defs>
          <linearGradient id="meCalBand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00a85a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00d978" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {[0, 6, 12, 18, 24].map((v) => (
          <g key={v}>
            <line
              x1={M.l}
              x2={W - M.r}
              y1={y(v)}
              y2={y(v)}
              className={v === 0 ? "me-cal-axis" : "me-cal-grid"}
            />
            <text x={M.l - 8} y={y(v) + 3} textAnchor="end" className="me-cal-tick">
              {v}%
            </text>
          </g>
        ))}
        {[1, 6, 12, 18, 24].map((n) => (
          <text
            key={n}
            x={x(n)}
            y={H - M.b + 16}
            textAnchor="middle"
            className="me-cal-tick"
          >
            {n}
          </text>
        ))}
        <text
          x={(M.l + W - M.r) / 2}
          y={H - 4}
          textAnchor="middle"
          className="me-cal-axislabel"
        >
          Comparable Friday-peak observations
        </text>
        <text
          transform={`translate(12 ${(M.t + H - M.b) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="me-cal-axislabel"
        >
          Forecast error
        </text>

        <line
          x1={M.l}
          x2={W - M.r}
          y1={y(startError)}
          y2={y(startError)}
          className="me-cal-ref"
        />
        <text
          x={W - M.r}
          y={y(startError) - 6}
          textAnchor="end"
          className="me-cal-reflabel"
        >
          Starting error {startError}%
        </text>

        <path d={band} fill="url(#meCalBand)">
          <title>{uncertaintyTooltip}</title>
        </path>
        <path d={line} className="me-cal-line" fill="none" />

        <line
          x1={x(a.n)}
          x2={x(a.n)}
          y1={M.t}
          y2={H - M.b}
          className="me-cal-cross"
        />

        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={p.n}>
              <circle
                cx={x(p.n)}
                cy={y(p.error)}
                r={i === safeActive ? 5.5 : isLast ? 5 : 3.5}
                className="me-cal-dot"
                data-now={isLast ? "true" : undefined}
              />
              <circle
                cx={x(p.n)}
                cy={y(p.error)}
                r={14}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`After ${p.n} observations: ${p.error}% error, range ${p.lo}% to ${p.hi}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              />
            </g>
          );
        })}

        {safeActive < pts.length - 1 ? (
          <g
            transform={`translate(${tipLeft ? x(a.n) - 172 : x(a.n) + 12} ${M.t + 2})`}
            pointerEvents="none"
          >
            <rect width="160" height="46" rx="7" className="me-cal-tip" />
            <text x="10" y="18" className="me-cal-tip-k">
              N={a.n} OBSERVATIONS
            </text>
            <text x="10" y="36" className="me-cal-tip-v">
              {a.error}% error · {a.lo}–{a.hi}%
            </text>
          </g>
        ) : null}
      </svg>

      <div className="me-cal-legend">
        <span>
          <i data-k="line" /> Forecast error
        </span>
        <span title={uncertaintyTooltip}>
          <i data-k="band" /> Uncertainty range
        </span>
        <span>
          <i data-k="ref" /> Starting error
        </span>
      </div>
    </div>
  );
}
