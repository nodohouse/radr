"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { VerifiedTrendPoint } from "@/lib/radr/product/demoValueHistory";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

type Props = {
  points: VerifiedTrendPoint[];
  verifiedFormatted: string;
  deltaPct: number | null;
  deltaAmount: number;
  /** When true, omit duplicate hero number (parent owns it). */
  embedded?: boolean;
  /** Light operating surface (default) vs rare graphite instrument. */
  surface?: "bright" | "instrument";
  /** Click a Decision marker (Value page expands euro proof). */
  onMarkerSelect?: (decisionId: string) => void;
};

export function ValueMovementChart({
  points,
  verifiedFormatted,
  deltaPct,
  embedded,
  surface = "bright",
  onMarkerSelect,
}: Props) {
  const bright = surface === "bright";
  const [hover, setHover] = useState<number | null>(null);
  const chart = useMemo(() => {
    if (points.length < 2) return null;
    const w = 720;
    const h = 220;
    const padX = 16;
    const padY = 18;
    const maxY = Math.max(...points.map((p) => p.cumulative), 1);
    const coords = points.map((p, i) => {
      const x = padX + (i / Math.max(points.length - 1, 1)) * (w - padX * 2);
      const y = h - padY - (p.cumulative / maxY) * (h - padY * 2);
      return { x, y, p };
    });
    const line = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ");
    const area = `${line} L ${coords.at(-1)!.x.toFixed(1)} ${h - padY} L ${coords[0]!.x.toFixed(1)} ${h - padY} Z`;
    return { w, h, coords, line, area, maxY, padY };
  }, [points]);

  if (!chart) {
    return (
      <section
        className="rp-ccx-chart"
        data-embedded={embedded ? "true" : undefined}
        data-surface={surface}
      >
        <p className="rp-ccx-quiet">MTD · no sealed history yet</p>
      </section>
    );
  }

  const active = hover != null ? chart.coords[hover] : chart.coords.at(-1);
  const summary = `Verified Value is ${verifiedFormatted} month-to-date${
    deltaPct != null
      ? `, ${deltaPct >= 0 ? "up" : "down"} ${Math.abs(deltaPct)}% versus prior MTD`
      : ""
  }.`;

  const grid = bright
    ? "var(--color-hairline, rgba(10,13,11,0.06))"
    : "rgba(242,245,241,0.06)";
  const stroke = bright
    ? "var(--chart-verified, #00a85a)"
    : "#f2f5f1";
  const muteDot = bright
    ? "rgba(10,13,11,0.18)"
    : "rgba(242,245,241,0.25)";
  const markerFill = bright
    ? "var(--color-brand, #00d978)"
    : "#00a85a";
  const markerStroke = bright
    ? "var(--color-surface, #ffffff)"
    : "#111311";
  const fillId = bright ? "rpCcxFillBright" : "rpCcxFillDark";

  return (
    <section
      className="rp-ccx-chart"
      data-embedded={embedded ? "true" : undefined}
      data-surface={surface}
      aria-label="Verified Value movement"
    >
      {!embedded ? (
        <header className="rp-ccx-chart-head">
          <p className="rp-ccx-k">Verified Value</p>
          <p className="rp-ccx-chart-hero" data-tone="verified">
            {verifiedFormatted}
          </p>
        </header>
      ) : null}

      <p className="sr-only">{summary}</p>

      <svg
        className="rp-ccx-chart-svg"
        viewBox={`0 0 ${chart.w} ${chart.h}`}
        role="img"
        aria-hidden="true"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="#00a85a"
              stopOpacity={bright ? "0.16" : "0.22"}
            />
            <stop offset="100%" stopColor="#00a85a" stopOpacity="0" />
          </linearGradient>
          {bright ? (
            <pattern
              id="rpCcxDotGrid"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.75" fill="rgba(10,13,11,0.09)" />
            </pattern>
          ) : null}
        </defs>
        {bright ? (
          <rect
            x="16"
            y="8"
            width={chart.w - 32}
            height={chart.h - 26}
            fill="url(#rpCcxDotGrid)"
          />
        ) : null}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = chart.h - chart.padY - t * (chart.h - chart.padY * 2);
          return (
            <line
              key={t}
              x1={16}
              x2={chart.w - 16}
              y1={y}
              y2={y}
              stroke={grid}
              strokeWidth="1"
            />
          );
        })}
        <path d={chart.area} fill={`url(#${fillId})`} />
        <path
          d={chart.line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {chart.coords.map((c, i) =>
          c.p.decisionId ? (
            <circle
              key={c.p.decisionId}
              cx={c.x}
              cy={c.y}
              r={hover === i ? 5.5 : 4}
              fill={markerFill}
              stroke={markerStroke}
              strokeWidth="1.5"
              onMouseEnter={() => setHover(i)}
              onClick={() => {
                if (c.p.decisionId) onMarkerSelect?.(c.p.decisionId);
              }}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`${c.p.displayId ?? "Decision"} · ${formatDecisionMoney(c.p.stepAmount)}`}
            />
          ) : (
            <circle
              key={`base-${i}`}
              cx={c.x}
              cy={c.y}
              r={2}
              fill={muteDot}
            />
          ),
        )}
      </svg>

      {active?.p.decisionId ? (
        <div className="rp-ccx-chart-tip">
          <p className="rp-ccx-tip-id">
            {active.p.displayId} · {active.p.classLabel}
          </p>
          <p className="rp-ccx-tip-amt" data-tone="verified">
            {formatDecisionMoney(active.p.stepAmount)} Verified
          </p>
          <p className="rp-ccx-tip-loc">{active.p.locationLabel}</p>
          {onMarkerSelect ? (
            <button
              type="button"
              className="rp-ccx-tip-link"
              onClick={() => onMarkerSelect(active.p.decisionId!)}
            >
              Trace this euro →
            </button>
          ) : (
            <Link
              href={`/app/decisions/${active.p.decisionId}`}
              className="rp-ccx-tip-link"
            >
              Open Decision →
            </Link>
          )}
        </div>
      ) : null}
    </section>
  );
}
