"use client";

import { useState } from "react";
import type { ChartHoverPoint } from "@/lib/radr/product/intelligenceEngine";

type Props = {
  points: ChartHoverPoint[];
  contractRate: number;
  currentRate: number;
  onSpikeClick?: () => void;
};

export function IntelPriceChart({
  points,
  contractRate,
  currentRate,
  onSpikeClick,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 640;
  const h = 176;
  const padL = 44;
  const padR = 20;
  const padT = 24;
  const padB = 36;
  const vals = points.flatMap((p) => [p.contract, p.paid]);
  const minV = Math.min(...vals) * 0.92;
  const maxV = Math.max(...vals) * 1.08;
  const n = points.length;
  const xAt = (i: number) =>
    padL + (i / Math.max(n - 1, 1)) * (w - padL - padR);
  const yAt = (v: number) =>
    padT + (1 - (v - minV) / Math.max(maxV - minV, 0.01)) * (h - padT - padB);

  const paidPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.paid)}`)
    .join(" ");
  const contractPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.contract)}`)
    .join(" ");

  const hi = hover ?? n - 1;
  const tip = points[hi]!;

  return (
    <div className="ie-chart">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Invoiced price vs contract price"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y = padT + t * (h - padT - padB);
          return (
            <line
              key={t}
              x1={padL}
              x2={w - padR}
              y1={y}
              y2={y}
              className="ie-chart-grid"
            />
          );
        })}
        <path d={contractPath} className="ie-chart-contract" />
        <path d={paidPath} className="ie-chart-paid" />
        {points.map((p, i) => (
          <circle
            key={p.label}
            cx={xAt(i)}
            cy={yAt(p.paid)}
            r={hover === i ? 5 : 3.5}
            className="ie-chart-dot"
            onMouseEnter={() => setHover(i)}
            onClick={() => {
              setHover(i);
              onSpikeClick?.();
            }}
            style={{ cursor: onSpikeClick ? "pointer" : "crosshair" }}
          />
        ))}
        <text x={xAt(0)} y={h - 10} className="ie-chart-axis">
          {points[0]?.label}
        </text>
        <text
          x={xAt(n - 1)}
          y={h - 10}
          className="ie-chart-axis"
          textAnchor="end"
        >
          {points[n - 1]?.label}
        </text>
        <text x={padL - 8} y={yAt(contractRate) + 4} className="ie-chart-anno" textAnchor="end">
          €{contractRate.toFixed(2)}
        </text>
        <text x={w - padR} y={yAt(currentRate) - 8} className="ie-chart-anno-live" textAnchor="end">
          €{currentRate.toFixed(2)}
        </text>
        {hover != null ? (
          <line
            x1={xAt(hi)}
            x2={xAt(hi)}
            y1={padT}
            y2={h - padB}
            className="ie-chart-cross"
          />
        ) : null}
      </svg>
      <div className="ie-chart-legend">
        <span data-tone="paid">Invoiced price (avg.)</span>
        <span data-tone="contract">Contract price</span>
      </div>
      {hover != null ? (
        <div className="ie-chart-tip" role="status">
          <strong>{tip.label}</strong>
          <span>Contract €{tip.contract.toFixed(2)}</span>
          <span>Invoice €{tip.paid.toFixed(2)}</span>
          <span>
            {tip.variancePct >= 0 ? "+" : ""}
            {tip.variancePct}% · {tip.qty} {tip.supplier.split(" ")[0]}
          </span>
          <span>€{tip.exposure.toFixed(0)} exposure</span>
        </div>
      ) : null}
    </div>
  );
}
