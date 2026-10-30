"use client";

import { useMemo, useState } from "react";
import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

const SEV: Record<LiveSeverity, string> = {
  healthy: "#00d978",
  watch: "#c9a05a",
  intervene: "#c86b5c",
  critical: "#c86b5c",
};

type Props = {
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone?: (kind: string | null) => void;
  simProgress?: number;
  venueLabel: string;
};

/** Hand-authored 2.5D restaurant world — zones map onto architectural regions. */
const ZONE_GEO: Record<
  string,
  { path: string; labelX: number; labelY: number; tip: string }
> = {
  zone_main: {
    path: "M180 220 L420 160 L560 240 L520 380 L240 420 Z",
    labelX: 340,
    labelY: 250,
    tip: "High demand",
  },
  zone_bar: {
    path: "M520 140 L680 120 L720 220 L580 250 Z",
    labelX: 600,
    labelY: 165,
    tip: "On track",
  },
  zone_terrace: {
    path: "M560 360 L760 340 L800 460 L600 500 Z",
    labelX: 680,
    labelY: 400,
    tip: "On track",
  },
  zone_kitchen: {
    path: "M80 360 L240 340 L280 480 L100 510 Z",
    labelX: 160,
    labelY: 410,
    tip: "High load",
  },
  zone_delivery: {
    path: "M280 460 L420 440 L450 540 L300 560 Z",
    labelX: 350,
    labelY: 490,
    tip: "3 waiting",
  },
};

function zoneKey(id: string) {
  const m = id.match(/zone_\w+/);
  return m?.[0] ?? id;
}

function Table({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <ellipse cx="0" cy="4" rx="14" ry="8" fill="#1a1e1b" stroke="rgba(255,255,255,0.1)" />
      <ellipse cx="0" cy="0" rx="12" ry="7" fill="#222824" stroke="rgba(255,255,255,0.14)" />
      <circle cx="-10" cy="-6" r="2.2" fill="#2a302c" />
      <circle cx="10" cy="-6" r="2.2" fill="#2a302c" />
      <circle cx="-10" cy="8" r="2.2" fill="#2a302c" />
      <circle cx="10" cy="8" r="2.2" fill="#2a302c" />
    </g>
  );
}

export function VisionVenueWorld({
  zones,
  selectedId,
  onSelect,
  onHoverZone,
  simProgress = 0,
  venueLabel,
}: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const focusId = selectedId ?? hoverId;
  const kitchenRelief = simProgress > 0.2;

  const viewBox = useMemo(() => {
    if (!selectedId) return "0 40 900 560";
    const key = zoneKey(selectedId);
    const g = ZONE_GEO[key];
    if (!g) return "0 40 900 560";
    return `${g.labelX - 160} ${g.labelY - 120} 340 260`;
  }, [selectedId]);

  const kpis = [
    { label: "Total Covers", value: "186", delta: "+4% vs plan", tone: "pos" },
    { label: "Table Turn", value: "1h 42m", delta: "−8% vs plan", tone: "neg" },
    { label: "Ticket Time", value: kitchenRelief ? "10 min" : "12 min", delta: kitchenRelief ? "−2 min" : "+1 min", tone: kitchenRelief ? "pos" : "watch" },
    { label: "Guest Sat", value: "4.6/5", delta: "Stable", tone: "pos" },
  ];

  const queue = [
    { id: "#428", dish: "Ribeye, Fries", wait: kitchenRelief ? "3 min" : "6 min", station: "Grill" },
    { id: "#429", dish: "Burrata", wait: "4 min", station: "Cold" },
    { id: "#430", dish: "Wagyu tartare", wait: "8 min", station: "Pass" },
  ];

  return (
    <div className="rv-live-svg-host rv-live-venue" data-sim={simProgress > 0 ? "true" : undefined}>
      <header className="rv-live-head">
        <div>
          <h1 className="rv-display">Venue View</h1>
          <p>Live operations, people, and performance · {venueLabel}</p>
        </div>
        <p className="rv-status" data-sev="healthy">
          <i />
          Service: Dinner · LIVE
        </p>
      </header>

      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${venueLabel} venue`}
        style={{ transition: "all var(--rv-dur-spatial) var(--rv-ease)" }}
      >
        <defs>
          <linearGradient id="rvVenueFloor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#171916" />
            <stop offset="100%" stopColor="#0f110f" />
          </linearGradient>
          <filter id="rvZoneGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="40" width="900" height="560" fill="url(#rvVenueFloor)" />

        {/* Building shell */}
        <path
          d="M60 200 L420 80 L840 220 L780 520 L120 560 Z"
          fill="#141714"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
        {/* Plants / terrace edge */}
        <g opacity="0.7">
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={i}
              cx={620 + i * 28}
              cy={480 + (i % 2) * 8}
              rx="10"
              ry="6"
              fill="#1a2a1e"
              stroke="rgba(0,217,120,0.2)"
            />
          ))}
        </g>

        {/* Circulation flows */}
        <g
          className="rv-live-flow"
          stroke={kitchenRelief ? "#00d978" : "#c86b5c"}
          strokeWidth="1.6"
          strokeDasharray="5 7"
          opacity={0.55 + simProgress * 0.25}
        >
          <path d="M340 280 Q280 340 200 400" />
          <path d="M200 400 Q300 450 360 500" />
          <path d="M360 500 Q420 420 500 300" />
        </g>
        <g className="rv-live-flow" stroke="#00d978" strokeWidth="1.2" strokeDasharray="3 6" opacity="0.4">
          <path d="M360 500 Q420 520 520 460" />
        </g>

        {/* Furniture */}
        <Table x={280} y={280} />
        <Table x={340} y={310} r={12} />
        <Table x={400} y={270} r={-8} />
        <Table x={300} y={350} />
        <Table x={380} y={340} r={18} />
        <rect x={560} y={150} width={120} height={28} rx="4" fill="#1c211e" stroke="rgba(255,255,255,0.12)" />
        <rect x={100} y={400} width={90} height={50} rx="3" fill="#1a1e1b" stroke="rgba(255,255,255,0.1)" />
        <rect x={110} y={410} width={20} height={14} fill={kitchenRelief ? "rgba(0,217,120,0.35)" : "rgba(200,107,92,0.45)"} />
        <rect x={140} y={410} width={20} height={14} fill="rgba(201,160,90,0.4)" />
        <rect x={170} y={410} width={20} height={14} fill="rgba(0,217,120,0.25)" />

        {zones.map((z) => {
          const key = zoneKey(z.id);
          const geo = ZONE_GEO[key];
          if (!geo) return null;
          const active = z.id === selectedId;
          const dim = Boolean(selectedId && !active);
          const c =
            key === "zone_kitchen" && kitchenRelief
              ? SEV.healthy
              : SEV[z.severity];
          const tip =
            key === "zone_kitchen" && kitchenRelief
              ? "Stabilizing"
              : geo.tip;

          return (
            <g
              key={z.id}
              className="rv-live-zone"
              data-dim={dim ? "true" : undefined}
              data-active={active ? "true" : undefined}
              onMouseEnter={() => {
                setHoverId(z.id);
                onHoverZone?.(key);
              }}
              onMouseLeave={() => {
                setHoverId(null);
                onHoverZone?.(null);
              }}
              onClick={() => onSelect(z.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onSelect(z.id);
                }
              }}
            >
              <path
                d={geo.path}
                fill={
                  active || focusId === z.id
                    ? c
                    : "rgba(255,255,255,0.03)"
                }
                fillOpacity={active || focusId === z.id ? 0.16 : 1}
                stroke={c}
                strokeWidth={active ? 2.4 : 1.2}
                filter={active ? "url(#rvZoneGlow)" : undefined}
                opacity={0.95}
              />
              <g transform={`translate(${geo.labelX}, ${geo.labelY})`}>
                <rect
                  x="-54"
                  y="-18"
                  width="108"
                  height="28"
                  rx="5"
                  fill="rgba(10,12,10,0.9)"
                  stroke="rgba(255,255,255,0.12)"
                />
                <circle cx="-42" cy="-4" r="3" fill={c} />
                <text x="-34" y="0" fill="#f2f0e8" fontSize="9" fontWeight="560">
                  {z.label}
                </text>
                <text x="-34" y="10" fill="rgba(242,240,232,0.55)" fontSize="7.5">
                  {tip}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      <div className="rv-live-bottom">
        <div className="rv-metric-band rv-live-kpi-band">
          {kpis.map((k) => (
            <div key={k.label} className="rv-metric">
              <span className="rv-label">{k.label}</span>
              <strong className="rv-num">{k.value}</strong>
              <em data-tone={k.tone}>{k.delta}</em>
            </div>
          ))}
        </div>
        <div className="rv-live-queue">
          <div className="rv-live-queue-head">
            <span className="rv-label">Live order queue</span>
            <strong className="rv-num">12 in queue</strong>
          </div>
          <ul>
            {queue.map((o) => (
              <li key={o.id}>
                <strong>{o.id}</strong>
                <span>{o.dish}</span>
                <em>{o.wait}</em>
                <i>{o.station}</i>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
