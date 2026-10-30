"use client";

import { useState } from "react";
import { CALIBRATION_SERIES } from "@/lib/radr/product/memoryProofEngine";
import "./memory-calibration.css";

export { CALIBRATION_SERIES };

const W = 720;
const H = 290;
const M = { l: 46, r: 20, t: 18, b: 44 };
const X_MAX = 24;
const Y_MAX = 24;

const x = (n: number) => M.l + ((n - 1) / (X_MAX - 1)) * (W - M.l - M.r);
const y = (v: number) => H - M.b - (v / Y_MAX) * (H - M.t - M.b);

export function CalibrationChart() {
  const [active, setActive] = useState<number>(CALIBRATION_SERIES.length - 1);
  const pts = CALIBRATION_SERIES;
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  const a = pts[active]!;

  const band = [
    ...pts.map((p, i) => `${i ? "L" : "M"} ${x(p.n).toFixed(1)} ${y(p.hi).toFixed(1)}`),
    ...[...pts].reverse().map((p) => `L ${x(p.n).toFixed(1)} ${y(p.lo).toFixed(1)}`),
    "Z",
  ].join(" ");
  const line = pts
    .map((p, i) => `${i ? "L" : "M"} ${x(p.n).toFixed(1)} ${y(p.error).toFixed(1)}`)
    .join(" ");

  const tipLeft = x(a.n) > W * 0.62;

  return (
    <figure className="rp-cal">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="rp-cal-svg"
        role="img"
        aria-label="Forecast error narrows from 14.2% to 5.4% across 24 comparable Friday peaks"
        onMouseLeave={() => setActive(pts.length - 1)}
      >
        <defs>
          <linearGradient id="rpCalBand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00a85a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00d978" stopOpacity="0.26" />
          </linearGradient>
        </defs>

        {[0, 6, 12, 18, 24].map((v) => (
          <g key={v}>
            <line
              x1={M.l}
              x2={W - M.r}
              y1={y(v)}
              y2={y(v)}
              className={v === 0 ? "rp-cal-axis" : "rp-cal-grid"}
            />
            <text x={M.l - 8} y={y(v) + 3} textAnchor="end" className="rp-cal-tick">
              {v}%
            </text>
          </g>
        ))}
        {[1, 6, 12, 18, 24].map((n) => (
          <text key={n} x={x(n)} y={H - M.b + 16} textAnchor="middle" className="rp-cal-tick">
            {n}
          </text>
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" className="rp-cal-axislabel">
          Comparable Friday-peak observations
        </text>
        <text
          transform={`translate(12 ${(M.t + H - M.b) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="rp-cal-axislabel"
        >
          Forecast error
        </text>

        {/* starting error reference */}
        <line
          x1={M.l}
          x2={W - M.r}
          y1={y(first.error)}
          y2={y(first.error)}
          className="rp-cal-ref"
        />
        <text x={W - M.r} y={y(first.error) - 6} textAnchor="end" className="rp-cal-reflabel">
          Starting error {first.error}%
        </text>

        <path d={band} fill="url(#rpCalBand)" />
        <path d={line} className="rp-cal-line" fill="none" />

        {/* crosshair */}
        <line
          x1={x(a.n)}
          x2={x(a.n)}
          y1={M.t}
          y2={H - M.b}
          className="rp-cal-cross"
        />

        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={p.n}>
              <circle
                cx={x(p.n)}
                cy={y(p.error)}
                r={i === active ? 6 : isLast ? 5 : 4}
                className="rp-cal-dot"
                data-now={isLast ? "true" : undefined}
                data-active={i === active ? "true" : undefined}
              />
              <circle
                cx={x(p.n)}
                cy={y(p.error)}
                r={16}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`After ${p.n} observations: ${p.error}% error, range ${p.lo}% to ${p.hi}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="rp-cal-hit"
              />
            </g>
          );
        })}

        {/* end labels */}
        <text x={x(first.n) + 10} y={y(first.error) - 10} className="rp-cal-endlabel">
          {first.error}%
        </text>
        <text
          x={x(last.n) - 10}
          y={y(last.error) + 22}
          textAnchor="end"
          className="rp-cal-endlabel"
          data-now="true"
        >
          {last.error}%
        </text>

        {/* tooltip */}
        <g
          transform={`translate(${tipLeft ? x(a.n) - 168 : x(a.n) + 14} ${M.t + 2})`}
          className="rp-cal-tip"
          pointerEvents="none"
        >
          <rect width="154" height="52" rx="6" />
          <text x="10" y="18" className="rp-cal-tip-k">
            N={a.n} observations
          </text>
          <text x="10" y="37" className="rp-cal-tip-v">
            {a.error}% error
            <tspan className="rp-cal-tip-m"> · {a.lo}–{a.hi}%</tspan>
          </text>
        </g>
      </svg>

      <table className="sr-only">
        <caption>Forecast error by number of comparable Friday-peak observations</caption>
        <thead>
          <tr>
            <th>Observations</th>
            <th>Error</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          {pts.map((p) => (
            <tr key={p.n}>
              <td>{p.n}</td>
              <td>{p.error}%</td>
              <td>
                {p.lo}–{p.hi}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="rp-cal-cap">
        <span>
          <i data-k="line" /> Forecast error
        </span>
        <span>
          <i data-k="band" /> Uncertainty range
        </span>
        <span>
          <i data-k="ref" /> Starting error
        </span>
        <em>DEMO envelope · historically associated, not causal</em>
      </figcaption>
    </figure>
  );
}
