"use client";

import type { VerifiedTrendPoint } from "@/lib/radr/product/demoValueHistory";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

type Props = {
  points: VerifiedTrendPoint[];
  currency?: import("@/lib/radr/demo/estateRegistry").DemoEstateCurrency;
  tipLabel?: string;
};

export function ValueTrendChart({ points, tipLabel = "MTD", currency = "USD" }: Props) {
  if (!points.length || !points.some(point=>point.cumulative!==0)) return <div className="rs-chart-empty"><p>No verified outcomes yet.</p><span>Evidence-linked results will appear here.</span></div>;
  const series = points;

  const w = 560;
  const h = 160;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const maxV = Math.max(...series.map((p) => p.cumulative), 1) * 1.08;
  const n = series.length;
  const xAt = (i: number) =>
    padL + (i / Math.max(n - 1, 1)) * (w - padL - padR);
  const yAt = (v: number) =>
    padT + (1 - v / maxV) * (h - padT - padB);

  const line = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.cumulative)}`)
    .join(" ");
  const area = `${line} L ${xAt(n - 1)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`;
  const last = series[n - 1]!;
  const tipX = xAt(n - 1);
  const tipY = yAt(last.cumulative);

  return (
    <div className="ve-trend" aria-label="Verified value over time chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img">
        {[0, 0.5, 1].map((t) => {
          const y = padT + t * (h - padT - padB);
          return (
            <line
              key={t}
              x1={padL}
              x2={w - padR}
              y1={y}
              y2={y}
              className="ve-trend-grid"
            />
          );
        })}
        <path d={area} className="ve-trend-area" />
        <path d={line} className="ve-trend-line" />
        <circle cx={tipX} cy={tipY} r={4} className="ve-trend-dot" />
        <rect
          x={tipX - 54}
          y={tipY - 28}
          width={72}
          height={22}
          rx={6}
          className="ve-trend-tip"
        />
        <text
          x={tipX - 18}
          y={tipY - 13}
          textAnchor="middle"
          className="ve-trend-tip-text"
        >
          {formatDecisionMoney(last.cumulative,currency)} {tipLabel}
        </text>
        <text x={padL} y={h - 8} className="ve-trend-axis">
          Jan 1
        </text>
        <text x={w - padR} y={h - 8} textAnchor="end" className="ve-trend-axis">
          Jan 31
        </text>
        <text x={padL - 6} y={padT + 4} textAnchor="end" className="ve-trend-axis">
          €{Math.round(maxV / 1000)}K
        </text>
        <text
          x={padL - 6}
          y={h - padB}
          textAnchor="end"
          className="ve-trend-axis"
        >
          €0
        </text>
      </svg>
    </div>
  );
}
