"use client";

/**
 * Portfolio Exposure Field — clean plot + identity rail (no leader lines).
 * Plot answers WHERE. Rail answers WHO. Hover syncs both.
 */

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type ExposureFieldPoint = {
  id: string;
  href: string;
  label: string;
  shortLabel: string;
  xValue: number;
  exposure: number;
  sizeValue: number;
  state: "needs" | "warn" | "ok";
  detail: string;
};

type Props = {
  points: ExposureFieldPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  kicker?: string;
  legendHint?: string;
  embedded?: boolean;
};

function money(n: number) {
  return formatDecisionMoney(n);
}

export function portfolioShortLabel(label: string): string {
  const primary = label.split("·")[0]?.trim() || label;
  const parts = primary.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return primary;
  if (parts[0] === "Berlin" && parts[1]) {
    return `${parts[0]} ${parts[1]}`;
  }
  if (parts.length === 1) return parts[0]!;
  if (primary.length <= 16) return primary;
  return parts[0]!;
}

type Placed = ExposureFieldPoint & { cx: number; cy: number; r: number };

function layoutDots(
  points: ExposureFieldPoint[],
  W: number,
  H: number,
  pad: { l: number; r: number; t: number; b: number },
): Placed[] {
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const domainPad = 0.12;
  const maxAbsX = Math.max(...points.map((p) => Math.abs(p.xValue)), 1);
  const maxExp = Math.max(...points.map((p) => p.exposure), 1);
  const maxSize = Math.max(...points.map((p) => p.sizeValue), 1);

  return points.map((p) => {
    let xNorm = (p.xValue / maxAbsX) * (1 - domainPad * 2) * 0.5 + 0.5;
    let yNorm =
      domainPad +
      (1 - domainPad * 2) * (1 - Math.min(1, p.exposure / maxExp));
    xNorm = Math.min(1 - domainPad, Math.max(domainPad, xNorm));
    yNorm = Math.min(1 - domainPad, Math.max(domainPad, yNorm));
    return {
      ...p,
      cx: pad.l + xNorm * plotW,
      cy: pad.t + yNorm * plotH,
      r: 9 + Math.sqrt(p.sizeValue / maxSize) * 20,
    };
  });
}

export function PortfolioExposureField({
  points,
  xAxisLabel = "Contribution vs plan →",
  yAxisLabel = "Active exposure ↑",
  title = "Performance × exposure",
  kicker = "Portfolio",
  legendHint = "Point size scales with revenue",
  embedded = false,
}: Props) {
  const uid = useId();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const W = 640;
  const H = 320;
  const pad = { l: 44, r: 20, t: 28, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const placed = useMemo(() => layoutDots(points, W, H, pad), [points]);

  const ranked = useMemo(
    () =>
      [...placed].sort((a, b) => {
        const rank = (s: ExposureFieldPoint["state"]) =>
          s === "needs" ? 0 : s === "warn" ? 1 : 2;
        return (
          rank(a.state) - rank(b.state) ||
          b.exposure - a.exposure ||
          a.xValue - b.xValue
        );
      }),
    [placed],
  );

  const focusId = hoverId ?? pinnedId;
  const focus =
    placed.find((p) => p.id === focusId) ??
    placed.find((p) => p.state === "needs") ??
    ranked[0] ??
    null;

  if (points.length === 0) return null;

  return (
    <section
      className="rp-pxf"
      data-embedded={embedded ? "true" : undefined}
      aria-label="Portfolio exposure field"
    >
      {!embedded ? (
        <header className="rp-pxf-head">
          <div>
            <p className="rp-cc-kicker">{kicker}</p>
            <h2>{title}</h2>
          </div>
          <p className="rp-pxf-hint">{legendHint}</p>
        </header>
      ) : null}

      <div className="rp-pxf-stage">
        <div className="rp-pxf-frame">
          <svg
            className="rp-pxf-svg"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${title}. ${xAxisLabel}. ${yAxisLabel}.`}
          >
            <defs>
              <radialGradient id={`${uid}-glow`} cx="42%" cy="35%" r="70%">
                <stop offset="0%" stopColor="rgba(0, 217, 120, 0.12)" />
                <stop offset="60%" stopColor="rgba(247, 250, 248, 0)" />
              </radialGradient>
              <linearGradient id={`${uid}-behind`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(181, 71, 8, 0.07)" />
                <stop offset="100%" stopColor="rgba(247, 250, 248, 0)" />
              </linearGradient>
              <linearGradient id={`${uid}-ahead`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(247, 250, 248, 0)" />
                <stop offset="100%" stopColor="rgba(0, 168, 90, 0.08)" />
              </linearGradient>
            </defs>

            <rect
              x={pad.l}
              y={pad.t}
              width={plotW / 2}
              height={plotH}
              fill={`url(#${uid}-behind)`}
            />
            <rect
              x={pad.l + plotW / 2}
              y={pad.t}
              width={plotW / 2}
              height={plotH}
              fill={`url(#${uid}-ahead)`}
            />
            <rect
              x={pad.l}
              y={pad.t}
              width={plotW}
              height={plotH}
              fill={`url(#${uid}-glow)`}
            />

            <line
              x1={pad.l}
              y1={pad.t + plotH}
              x2={pad.l + plotW}
              y2={pad.t + plotH}
              className="rp-pxf-axis"
            />
            <line
              x1={pad.l}
              y1={pad.t}
              x2={pad.l}
              y2={pad.t + plotH}
              className="rp-pxf-axis"
            />
            <line
              x1={pad.l + plotW / 2}
              y1={pad.t}
              x2={pad.l + plotW / 2}
              y2={pad.t + plotH}
              className="rp-pxf-zero"
            />
            <text x={pad.l + 8} y={pad.t + 14} className="rp-pxf-quad">
              Behind
            </text>
            <text
              x={pad.l + plotW - 8}
              y={pad.t + 14}
              textAnchor="end"
              className="rp-pxf-quad"
            >
              Ahead
            </text>
            <text
              x={pad.l + plotW / 2}
              y={H - 10}
              textAnchor="middle"
              className="rp-pxf-axis-label"
            >
              {xAxisLabel}
            </text>
            <text
              x={14}
              y={pad.t + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 14 ${pad.t + plotH / 2})`}
              className="rp-pxf-axis-label"
            >
              {yAxisLabel}
            </text>

            {placed.map((p) => {
              const dim = Boolean(focusId && focusId !== p.id);
              const active =
                focusId === p.id || (!focusId && p.state === "needs");
              return (
                <g
                  key={p.id}
                  className="rp-pxf-node"
                  data-state={p.state}
                  data-dim={dim ? "true" : undefined}
                  data-active={active ? "true" : undefined}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(p.id)}
                  onBlur={() => setHoverId(null)}
                >
                  <a
                    href={p.href}
                    tabIndex={0}
                    aria-label={p.label}
                    onClick={(e) => {
                      // Pin highlight first — rail opens the location
                      e.preventDefault();
                      setPinnedId(p.id);
                    }}
                  >
                    <title>
                      {p.label}
                      {"\n"}
                      {p.detail}
                      {"\n"}
                      Click to pin · open from the list →
                    </title>
                    {p.state === "needs" ? (
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={p.r + 7}
                        className="rp-pxf-pulse"
                      />
                    ) : null}
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={p.r}
                      className="rp-pxf-bubble"
                      data-state={p.state}
                    />
                    {(active || p.state === "needs") && p.r >= 14 ? (
                      <text
                        x={p.cx}
                        y={p.cy + 4}
                        textAnchor="middle"
                        className="rp-pxf-initial"
                        data-state={p.state}
                      >
                        {p.shortLabel.slice(0, 1)}
                      </text>
                    ) : null}
                  </a>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="rp-pxf-rail" aria-label="Locations by attention">
          <p className="rp-pxf-rail-k">Locations</p>
          <ol className="rp-pxf-rail-list">
            {ranked.map((p, i) => {
              const active = focus?.id === p.id;
              return (
                <li key={p.id} data-active={active ? "true" : undefined}>
                  <Link
                    href={p.href}
                    className="rp-pxf-rail-row"
                    data-state={p.state}
                    data-active={active ? "true" : undefined}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(p.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={() => setPinnedId(p.id)}
                  >
                    <span className="rp-pxf-rail-rank" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="rp-pxf-rail-dot" data-state={p.state} />
                    <span className="rp-pxf-rail-name">{p.label}</span>
                    <span
                      className="rp-pxf-rail-delta"
                      data-tone={p.xValue >= 0 ? "pos" : "neg"}
                    >
                      {p.xValue >= 0 ? "+" : "−"}
                      {money(Math.abs(p.xValue))}
                    </span>
                    <span className="rp-pxf-rail-exp">{money(p.exposure)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {focus ? (
            <div className="rp-pxf-rail-focus" data-state={focus.state}>
              <p className="rp-pxf-rail-focus-k">
                {focus.state === "needs"
                  ? "Needs you"
                  : focus.state === "warn"
                    ? "Data degraded"
                    : "In view"}
              </p>
              <p className="rp-pxf-rail-focus-d">{focus.detail}</p>
            </div>
          ) : null}
        </aside>
      </div>

      <ul className="rp-pxf-keys">
        <li data-state="needs">Needs you</li>
        <li data-state="ok">Healthy</li>
        <li data-state="warn">Data degraded</li>
        <li className="rp-pxf-keys-meta">Rail · vs plan · exposure</li>
      </ul>
    </section>
  );
}
