"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { TERRITORY_OPEN } from "@/lib/radr/demoModel";
import { RADR_MOTION } from "@/lib/radr/motion";

const ORDER = ["buy", "labor", "sell", "recover"] as const;
const ANGLES: Record<(typeof ORDER)[number], number> = {
  buy: -90,
  labor: 0,
  sell: 90,
  recover: 180,
};

type Props = {
  compact?: boolean;
  className?: string;
};

/**
 * Proprietary RADR territory instrument: SVG + Motion.
 * Not a generic radar chart. Elegant financial navigation.
 */
export function TerritoryRadar({ compact, className }: Props) {
  const reduced = useReducedMotion();
  const size = compact ? 200 : 260;

  return (
    <div className={`rx-radar-inst ${compact ? "is-compact" : ""} ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="rx-radar-inst-svg"
        aria-label="RADR territories"
        role="img"
      >
        <defs>
          <radialGradient id="rxRadarField" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,232,106,0.06)" />
            <stop offset="100%" stopColor="rgba(0,232,106,0)" />
          </radialGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.42}
          fill="url(#rxRadarField)"
        />
        {[0.42, 0.28, 0.14].map((r) => (
          <circle
            key={r}
            cx={size / 2}
            cy={size / 2}
            r={size * r}
            className="rx-radar-inst-ring"
          />
        ))}
        <line
          x1={size / 2}
          y1={size * 0.06}
          x2={size / 2}
          y2={size * 0.94}
          className="rx-radar-inst-axis"
        />
        <line
          x1={size * 0.06}
          y1={size / 2}
          x2={size * 0.94}
          y2={size / 2}
          className="rx-radar-inst-axis"
        />

        {!reduced ? (
          <motion.g
            style={{ originX: "50%", originY: "50%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          >
            <path
              d={`M${size / 2} ${size / 2} L${size / 2} ${size * 0.08} A${size * 0.42} ${size * 0.42} 0 0 1 ${size / 2 + size * 0.06} ${size * 0.09} Z`}
              className="rx-radar-inst-sweep"
            />
          </motion.g>
        ) : null}

        {ORDER.map((area) => {
          const rad = (ANGLES[area] * Math.PI) / 180;
          const cx = size / 2 + Math.cos(rad) * size * 0.32;
          const cy = size / 2 + Math.sin(rad) * size * 0.32;
          return (
            <g key={area}>
              <motion.circle
                cx={cx}
                cy={cy}
                r={compact ? 3.5 : 4.5}
                className="rx-radar-inst-dot"
                initial={false}
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  delay: ORDER.indexOf(area) * 0.7,
                  ease: "easeInOut",
                }}
              />
              <text
                x={cx}
                y={cy - (compact ? 10 : 12)}
                textAnchor="middle"
                className="rx-radar-inst-delta"
              >
                △
              </text>
            </g>
          );
        })}
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          className="rx-radar-inst-center"
        >
          RADR
        </text>
      </svg>

      <ul className="rx-radar-inst-legend">
        {ORDER.map((area) => {
          const open = TERRITORY_OPEN[area];
          const money =
            open.value > 0
              ? formatCompactEuro(open.value)
              : area === "recover"
                ? formatCompactEuro(184)
                : formatCompactEuro(0);
          return (
            <li key={area}>
              <Link href={`/app/${area}`}>
                <motion.span
                  className="rx-radar-inst-leg-area"
                  whileHover={{ opacity: 1 }}
                  transition={RADR_MOTION.hover}
                >
                  {area.toUpperCase()}
                </motion.span>
                <strong>△ {money}</strong>
                <em>
                  {open.findings} · {open.kind}
                </em>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
