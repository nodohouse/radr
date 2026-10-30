"use client";

/**
 * Operating Pulse — Daylight trajectory for Restaurant GM Control Center.
 * Green actual · dashed forecast · coral constraint · NOW 19:48 · canon events.
 */

import { useState } from "react";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";
import {
  BERLIN_GM_PULSE_EVENTS,
  D1911_CC_DECISION,
} from "@/lib/radr/product/restaurantGmControlCenterCanon";

type Props = {
  onMarkerClick?: () => void;
  onConstraintClick?: () => void;
};

const AXIS = [
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

export function OperatingPulseLandscape({
  onMarkerClick,
  onConstraintClick,
}: Props) {
  const nowX = 0.493;
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    time: string;
    covers: number;
    revenue: string;
    contribution: string;
    kitchen: number;
    forecast: number;
  } | null>(null);

  const events = BERLIN_GM_PULSE_EVENTS.filter((e) => e.type !== "now");

  return (
    <div
      className="rp-pulse-land"
      data-theme="daylight"
      data-testid="gm-cc-pulse"
      aria-label="Operating pulse trajectory"
      onMouseLeave={() => setTip(null)}
    >
      <ul className="rv-pulse-legend" aria-hidden>
        <li data-c="actual">Actual</li>
        <li data-c="forecast">Forecast</li>
        <li data-c="constraint">Constraint window</li>
      </ul>
      <svg
        className="rp-pulse-land-svg"
        viewBox="0 0 900 300"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Covers actual versus forecast through dinner service"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = (e.clientX - rect.left) / rect.width;
          const clamped = Math.min(0.95, Math.max(0.05, rel));
          // Approximate service metrics along the curve for hover.
          const covers = Math.round(70 + clamped * 70 - Math.abs(clamped - 0.42) * 40);
          const kitchen = Math.round(72 + clamped * 28);
          setTip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time:
              AXIS[Math.min(AXIS.length - 1, Math.floor(clamped * (AXIS.length - 1)))] ??
              "19:40",
            covers,
            revenue: `€${(14000 + covers * 45).toLocaleString("en-IE")}`,
            contribution: `€${(5200 + covers * 12).toLocaleString("en-IE")}`,
            kitchen,
            forecast: Math.max(70, kitchen - 4),
          });
        }}
      >
        <defs>
          <linearGradient id="rpPulseArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d978" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#00d978" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#00d978" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[56, 104, 152, 200, 248].map((y) => (
          <line
            key={y}
            x1="48"
            y1={y}
            x2="880"
            y2={y}
            stroke="rgba(18, 23, 19, 0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Constraint window ~20:00–20:30 */}
        <rect
          className="rp-pulse-constraint"
          x={48 + 0.55 * 832}
          y="40"
          width={0.16 * 832}
          height="210"
          fill="rgba(180, 35, 24, 0.07)"
          rx="4"
          style={{ cursor: onConstraintClick ? "pointer" : undefined }}
          onClick={onConstraintClick}
        />

        <path
          d="M48,210 C140,204 220,180 300,152 C380,124 460,118 540,134 C620,150 700,168 780,158 C830,152 860,142 880,136"
          fill="none"
          stroke="rgba(95, 104, 97, 0.4)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeDasharray="5 5"
        />

        <path
          d="M48,200 C120,194 180,175 240,128 C300,78 360,68 420,74 C480,80 520,108 580,148 C640,188 700,206 760,180 C820,158 860,142 880,132 L880,260 L48,260 Z"
          fill="url(#rpPulseArea)"
        />

        <path
          d="M48,200 C120,194 180,175 240,128 C300,78 360,68 420,74 C480,80 520,108 580,148 C640,188 700,206 760,180 C820,158 860,142 880,132"
          fill="none"
          stroke="#00d978"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        <line
          x1={48 + nowX * 832}
          y1="36"
          x2={48 + nowX * 832}
          y2="260"
          stroke="rgba(18, 23, 19, 0.45)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={48 + nowX * 832 + 6}
          y="32"
          fill="#5f6861"
          fontSize="11"
          fontWeight="600"
        >
          NOW {LIVE_SCENARIO.clockLabel}
        </text>

        {events.map((e) => {
          const x = 48 + e.t * 832;
          const y = e.severity === "neg" ? 58 : 78;
          return (
            <g
              key={e.id}
              style={{ cursor: onMarkerClick ? "pointer" : undefined }}
              onClick={() => {
                if (e.type === "constraint" && onConstraintClick) {
                  onConstraintClick();
                } else {
                  onMarkerClick?.();
                }
              }}
            >
              <circle
                cx={x}
                cy={y + 40}
                r="4.5"
                fill={e.severity === "neg" ? "#b42318" : "#00a85a"}
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text x={x + 8} y={y + 34} fill="#121713" fontSize="11" fontWeight="600">
                {e.time}
              </text>
              <text x={x + 8} y={y + 48} fill="#5f6861" fontSize="10">
                {e.title}
              </text>
              <text x={x + 8} y={y + 62} fill="#8a928b" fontSize="9.5">
                {e.description}
              </text>
            </g>
          );
        })}

        {AXIS.filter((_, i) => i % 2 === 0).map((t, i) => (
          <text
            key={t}
            x={48 + i * (832 / 5)}
            y="286"
            fill="#8a928b"
            fontSize="10"
          >
            {t}
          </text>
        ))}
      </svg>

      {tip ? (
        <div
          className="rp-pulse-tip"
          style={{ left: tip.x + 12, top: Math.max(8, tip.y - 72) }}
          role="tooltip"
        >
          <strong>{tip.time}</strong>
          <span>Covers {tip.covers}</span>
          <span>Revenue {tip.revenue}</span>
          <span>Contribution {tip.contribution}</span>
          <span>Kitchen load {tip.kitchen}%</span>
          <span>Forecast {tip.forecast}%</span>
          <span>Next constraint {D1911_CC_DECISION.deadlineLabel === "19:59" ? "20:10" : "—"}</span>
        </div>
      ) : null}
    </div>
  );
}
