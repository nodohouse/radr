"use client";

import { useMemo, useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { LocationRow } from "@/lib/radr/product/locationsProofEngine";

type Props = {
  rows: LocationRow[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const W = 760;
const H = 360;
const PAD = { l: 56, r: 140, t: 36, b: 52 };
const BUBBLE_GAP = 20;
const LABEL_BOX_H = 28;
const LABEL_GAP = 10;

function fillFor(state: LocationRow["state"]): string {
  if (state === "needs_attention") return "#e15a52";
  if (state === "intervene" || state === "watch" || state === "data_degraded")
    return "#e0a04a";
  if (state === "outperforming") return "#0a6b42";
  return "#1db86a";
}

function moneyShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) {
    const k = Math.round(n / 1000);
    return `$${k}k`;
  }
  return formatDecisionMoney(n);
}

function pctLabel(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

type Placed = LocationRow & {
  cx: number;
  cy: number;
  rPx: number;
  tx: number;
  ty: number;
  maxAbsX: number;
  labelX: number;
  labelY: number;
  labelW: number;
  anchor: "right" | "left" | "above" | "below";
};

function labelWidth(name: string): number {
  // Approximate two-line callout width
  const line1 = name.length * 6.2 + 8;
  const line2 = 72;
  return Math.min(148, Math.max(88, Math.max(line1, line2)));
}

function clampBubble(
  p: Placed,
  plot: { minX: number; maxX: number; minY: number; maxY: number },
) {
  p.cx = Math.min(plot.maxX - p.rPx, Math.max(plot.minX + p.rPx, p.cx));
  p.cy = Math.min(plot.maxY - p.rPx, Math.max(plot.minY + p.rPx, p.cy));
}

function separateBubbles(
  nodes: Placed[],
  plot: { minX: number; maxX: number; minY: number; maxY: number },
) {
  const n = nodes.length;
  for (let iter = 0; iter < 100; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        let dx = b.cx - a.cx;
        let dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);
        const min = a.rPx + b.rPx + BUBBLE_GAP;
        if (dist < 0.01) {
          dx = 1;
          dy = (i % 2 === 0 ? 1 : -1) * 0.5;
          dist = Math.hypot(dx, dy);
        }
        if (dist < min) {
          const push = (min - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.cx -= ux * push;
          a.cy -= uy * push;
          b.cx += ux * push;
          b.cy += uy * push;
        }
      }
    }
    const pull = iter < 35 ? 0.04 : iter < 60 ? 0.015 : 0;
    for (const p of nodes) {
      if (pull > 0) {
        p.cx += (p.tx - p.cx) * pull;
        p.cy += (p.ty - p.cy) * pull;
      }
      clampBubble(p, plot);
    }
  }
  for (let iter = 0; iter < 50; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        let dx = b.cx - a.cx;
        let dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);
        const min = a.rPx + b.rPx + BUBBLE_GAP;
        if (dist < 0.01) {
          dx = 1;
          dy = 0.4;
          dist = Math.hypot(dx, dy);
        }
        if (dist < min) {
          const push = (min - dist) / 2 + 0.4;
          const ux = dx / dist;
          const uy = dy / dist;
          a.cx -= ux * push;
          a.cy -= uy * push;
          b.cx += ux * push;
          b.cy += uy * push;
          moved = true;
        }
      }
    }
    for (const p of nodes) clampBubble(p, plot);
    if (!moved) break;
  }
}

function boxesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  gap: number,
) {
  return !(
    ax + aw + gap <= bx ||
    bx + bw + gap <= ax ||
    ay + ah + gap <= by ||
    by + bh + gap <= ay
  );
}

function placeLabels(nodes: Placed[]) {
  const order = [...nodes].sort((a, b) => a.cx - b.cx || a.cy - b.cy);
  const placedIds = new Set<string>();

  for (const p of order) {
    const w = p.labelW;
    const h = LABEL_BOX_H;
    const slots: { x: number; y: number; anchor: Placed["anchor"] }[] = [
      { x: p.cx + p.rPx + 10, y: p.cy - h / 2, anchor: "right" },
      { x: p.cx + p.rPx + 10, y: p.cy - h - 4, anchor: "right" },
      { x: p.cx + p.rPx + 10, y: p.cy + 4, anchor: "right" },
      { x: p.cx - p.rPx - w - 10, y: p.cy - h / 2, anchor: "left" },
      { x: p.cx - w / 2, y: p.cy - p.rPx - h - 8, anchor: "above" },
      { x: p.cx - w / 2, y: p.cy + p.rPx + 8, anchor: "below" },
      { x: p.cx + p.rPx + 14, y: p.cy - h - 16, anchor: "right" },
      { x: p.cx - p.rPx - w - 14, y: p.cy - h - 12, anchor: "left" },
    ];

    let chosen = slots[0]!;
    for (const slot of slots) {
      const x = Math.min(W - w - 6, Math.max(6, slot.x));
      const y = Math.min(H - h - 4, Math.max(8, slot.y));
      let ok = true;

      for (const bub of nodes) {
        const nearestX = Math.max(x, Math.min(bub.cx, x + w));
        const nearestY = Math.max(y, Math.min(bub.cy, y + h));
        const dist = Math.hypot(bub.cx - nearestX, bub.cy - nearestY);
        const pad = bub.id === p.id ? 2 : 6;
        if (dist < bub.rPx + pad) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      for (const other of order) {
        if (!placedIds.has(other.id)) continue;
        if (
          boxesOverlap(
            x,
            y,
            w,
            h,
            other.labelX,
            other.labelY,
            other.labelW,
            LABEL_BOX_H,
            LABEL_GAP,
          )
        ) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      chosen = { x, y, anchor: slot.anchor };
      break;
    }

    p.labelX = Math.min(W - w - 6, Math.max(6, chosen.x));
    p.labelY = Math.min(H - h - 4, Math.max(8, chosen.y));
    p.anchor = chosen.anchor;
    placedIds.add(p.id);
  }

  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const a = order[i]!;
        const b = order[j]!;
        if (
          !boxesOverlap(
            a.labelX,
            a.labelY,
            a.labelW,
            LABEL_BOX_H,
            b.labelX,
            b.labelY,
            b.labelW,
            LABEL_BOX_H,
            LABEL_GAP,
          )
        ) {
          continue;
        }
        const acx = a.labelX + a.labelW / 2;
        const bcx = b.labelX + b.labelW / 2;
        const acy = a.labelY + LABEL_BOX_H / 2;
        const bcy = b.labelY + LABEL_BOX_H / 2;
        const dx = bcx - acx;
        const dy = bcy - acy;
        const push = 4;
        if (Math.abs(dy) >= Math.abs(dx)) {
          a.labelY -= push;
          b.labelY += push;
        } else {
          a.labelX -= push;
          b.labelX += push;
        }
        moved = true;
      }
    }
    for (const p of order) {
      p.labelX = Math.min(W - p.labelW - 6, Math.max(6, p.labelX));
      p.labelY = Math.min(H - LABEL_BOX_H - 4, Math.max(8, p.labelY));
    }
    if (!moved) break;
  }
}

export function LocationsBubbleChart({ rows, selectedId, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const placed = useMemo(() => {
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;
    const maxAbsX = Math.max(
      ...rows.map((r) => Math.abs(r.contributionVsPlanPct)),
      18,
    );
    const maxExp = Math.max(...rows.map((r) => r.exposure), 1);
    const maxRev = Math.max(...rows.map((r) => r.revenue), 1);

    const plot = {
      minX: PAD.l + 10,
      maxX: W - PAD.r + 40,
      minY: PAD.t + 10,
      maxY: H - PAD.b - 10,
    };

    const ranked = [...rows].sort(
      (a, b) => a.contributionVsPlanPct - b.contributionVsPlanPct,
    );
    const rankOf = new Map(ranked.map((r, i) => [r.id, i]));

    const nodes: Placed[] = rows.map((r) => {
      const xNorm = 0.5 + (r.contributionVsPlanPct / maxAbsX) * 0.36;
      const expNorm = Math.min(1, r.exposure / maxExp);
      let yNorm = 1 - expNorm * 0.7 - 0.12;
      const idx = rankOf.get(r.id) ?? 0;
      const t = rows.length > 1 ? idx / (rows.length - 1) : 0.5;
      if (expNorm < 0.2) {
        yNorm = 0.68 + t * 0.22;
      }
      const cx = PAD.l + Math.min(0.9, Math.max(0.1, xNorm)) * plotW;
      const cy = PAD.t + Math.min(0.88, Math.max(0.12, yNorm)) * plotH;
      const rPx = 9 + Math.sqrt(r.revenue / maxRev) * 16;
      const labelW = labelWidth(r.name);
      return {
        ...r,
        cx,
        cy,
        rPx,
        tx: cx,
        ty: cy,
        maxAbsX,
        labelX: cx + rPx + 10,
        labelY: cy - LABEL_BOX_H / 2,
        labelW,
        anchor: "right" as const,
      };
    });

    separateBubbles(nodes, plot);
    placeLabels(nodes);
    return nodes;
  }, [rows]);

  const xTicks = [-30, -15, 0, 15, 30];
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const midX = PAD.l + plotW / 2;

  return (
    <div className="le-chart" aria-label="Performance versus exposure">
      <div className="le-chart-head">
        <h2>Performance × exposure</h2>
        <p>Point size scales with revenue</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="le-bubble-svg"
        role="img"
        aria-label="Contribution vs plan by active exposure"
      >
        <defs>
          <filter id="leBubbleSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.2"
              floodColor="#0a0d0b"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {/* Soft plot field */}
        <rect
          x={PAD.l}
          y={PAD.t}
          width={plotW}
          height={plotH}
          rx="10"
          className="le-plot-bg"
        />

        {/* Subtle behind / ahead washes */}
        <rect
          x={PAD.l}
          y={PAD.t}
          width={plotW / 2}
          height={plotH}
          fill="rgba(212, 83, 74, 0.035)"
        />
        <rect
          x={midX}
          y={PAD.t}
          width={plotW / 2}
          height={plotH}
          fill="rgba(0, 168, 90, 0.04)"
        />

        {/* Grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={`h-${t}`}
            x1={PAD.l}
            x2={PAD.l + plotW}
            y1={PAD.t + plotH * t}
            y2={PAD.t + plotH * t}
            className="le-grid"
          />
        ))}
        {xTicks.map((t) => {
          const maxAbs = placed[0]?.maxAbsX ?? 30;
          const xNorm = 0.5 + (t / maxAbs) * 0.36;
          const x = PAD.l + Math.min(0.9, Math.max(0.1, xNorm)) * plotW;
          return (
            <line
              key={`v-${t}`}
              x1={x}
              x2={x}
              y1={PAD.t}
              y2={PAD.t + plotH}
              className={t === 0 ? "le-grid-mid" : "le-grid"}
            />
          );
        })}

        <text x={PAD.l + 12} y={PAD.t + 18} className="le-quad">
          BEHIND
        </text>
        <text
          x={PAD.l + plotW - 12}
          y={PAD.t + 18}
          textAnchor="end"
          className="le-quad le-quad-pos"
        >
          AHEAD
        </text>

        {/* Axes */}
        <line
          x1={PAD.l}
          x2={PAD.l + plotW}
          y1={PAD.t + plotH}
          y2={PAD.t + plotH}
          className="le-axis"
        />
        <line
          x1={PAD.l}
          x2={PAD.l}
          y1={PAD.t}
          y2={PAD.t + plotH}
          className="le-axis"
        />

        {xTicks.map((t) => {
          const maxAbs = placed[0]?.maxAbsX ?? 30;
          const xNorm = 0.5 + (t / maxAbs) * 0.36;
          const x = PAD.l + Math.min(0.9, Math.max(0.1, xNorm)) * plotW;
          return (
            <text
              key={t}
              x={x}
              y={PAD.t + plotH + 18}
              textAnchor="middle"
              className="le-tick"
            >
              {t > 0 ? `+${t}%` : `${t}%`}
            </text>
          );
        })}

        <text
          x={PAD.l + plotW / 2}
          y={H - 8}
          textAnchor="middle"
          className="le-axislabel"
        >
          Contribution vs plan →
        </text>
        <text
          transform={`translate(16 ${PAD.t + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
          className="le-axislabel"
        >
          Active exposure →
        </text>
        <text x={PAD.l - 8} y={PAD.t + 10} textAnchor="end" className="le-tick">
          High
        </text>
        <text
          x={PAD.l - 8}
          y={PAD.t + plotH / 2}
          textAnchor="end"
          className="le-tick"
        >
          Med
        </text>
        <text
          x={PAD.l - 8}
          y={PAD.t + plotH}
          textAnchor="end"
          className="le-tick"
        >
          Low
        </text>

        {/* Leader lines under bubbles */}
        {placed.map((p) => {
          const lx =
            p.anchor === "left"
              ? p.labelX + p.labelW
              : p.anchor === "right"
                ? p.labelX
                : p.labelX + p.labelW / 2;
          const ly =
            p.anchor === "above"
              ? p.labelY + LABEL_BOX_H
              : p.anchor === "below"
                ? p.labelY
                : p.labelY + LABEL_BOX_H / 2;
          const bx =
            p.anchor === "left"
              ? p.cx - p.rPx
              : p.anchor === "right"
                ? p.cx + p.rPx
                : p.cx;
          const by =
            p.anchor === "above"
              ? p.cy - p.rPx
              : p.anchor === "below"
                ? p.cy + p.rPx
                : p.cy;
          return (
            <line
              key={`lead-${p.id}`}
              x1={bx}
              y1={by}
              x2={lx}
              y2={ly}
              className="le-label-lead"
            />
          );
        })}

        {[...placed]
          .sort((a, b) => a.rPx - b.rPx)
          .map((p) => {
            const selected = selectedId === p.id;
            const hovered = hoverId === p.id;
            const active = selected || hovered;
            return (
              <g key={p.id} className="le-bubble-group">
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={p.rPx + (active ? 3 : 0)}
                  fill="none"
                  stroke={selected ? "#07533f" : "transparent"}
                  strokeWidth={1.5}
                  opacity={0.85}
                />
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={p.rPx}
                  fill={fillFor(p.state)}
                  fillOpacity={active || !selectedId ? 0.78 : 0.32}
                  stroke="#ffffff"
                  strokeWidth={2}
                  filter="url(#leBubbleSoft)"
                  className="le-bubble"
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.name}, contribution vs plan ${p.contributionVsPlanPct}%, exposure ${formatDecisionMoney(p.exposure)}`}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(p.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() => onSelect(selectedId === p.id ? null : p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(selectedId === p.id ? null : p.id);
                    }
                  }}
                />

                {/* Callout label */}
                <g
                  className="le-callout"
                  opacity={active || !selectedId ? 1 : 0.45}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelect(selectedId === p.id ? null : p.id)}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <text
                    x={p.labelX}
                    y={p.labelY + 11}
                    className="le-callout-name"
                  >
                    {p.name}
                  </text>
                  <text
                    x={p.labelX}
                    y={p.labelY + 24}
                    className="le-callout-meta"
                  >
                    <tspan
                      className={
                        p.contributionVsPlanPct >= 0
                          ? "le-callout-pos"
                          : "le-callout-neg"
                      }
                    >
                      {pctLabel(p.contributionVsPlanPct)}
                    </tspan>
                    <tspan className="le-callout-sep"> · </tspan>
                    <tspan>{moneyShort(p.contribution)}</tspan>
                  </text>
                </g>
              </g>
            );
          })}
      </svg>

      <div className="le-legend">
        <span>
          <i data-k="needs" /> Needs attention
        </span>
        <span>
          <i data-k="watch" /> Watch
        </span>
        <span>
          <i data-k="ok" /> On track
        </span>
        <span>
          <i data-k="out" /> Outperforming
        </span>
      </div>
    </div>
  );
}
