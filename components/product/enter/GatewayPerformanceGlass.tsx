"use client";

import { useId } from "react";
import type { EnterKpi, EnterWorld } from "@/lib/radr/demo/enterWorlds";

function SparkLine() {
  const gid = useId().replace(/:/g, "");
  return (
    <svg className="rgw-spark" viewBox="0 0 280 36" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 26 C28 24 42 10 70 14 C98 18 112 30 140 22 C168 14 196 8 224 12 C248 15 264 10 280 8"
        fill="none"
        stroke="#00D978"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M0 26 C28 24 42 10 70 14 C98 18 112 30 140 22 C168 14 196 8 224 12 C248 15 264 10 280 8 V36 H0 Z"
        fill={`url(#${gid})`}
      />
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D978" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D978" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SparkBars() {
  const heights = [14, 18, 12, 22, 17, 26, 20, 28, 19, 24];
  const gap = 280 / heights.length;
  return (
    <svg className="rgw-spark" viewBox="0 0 280 36" preserveAspectRatio="none" aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * gap + 4}
          y={36 - h}
          width={gap - 8}
          height={h}
          rx="2"
          fill="#00D978"
          opacity={0.5 + i * 0.04}
        />
      ))}
    </svg>
  );
}

function KpiCell({ kpi }: { kpi: EnterKpi }) {
  return (
    <div className="rgw-kpi">
      <span>{kpi.label}</span>
      <strong>{kpi.value}</strong>
      <em>{kpi.delta}</em>
    </div>
  );
}

export function GatewayPerformanceGlass({ world }: { world: EnterWorld }) {
  return (
    <div className="rgw-glass" aria-hidden>
      <div className="rgw-glass-head">
        <p className="rgw-glass-title">{world.performanceTitle}</p>
        <p className="rgw-glass-period">Last 7 days</p>
      </div>
      <div className="rgw-glass-row">
        {world.kpis.map((kpi) => (
          <KpiCell key={kpi.label} kpi={kpi} />
        ))}
      </div>
      {world.chartKind === "line" ? <SparkLine /> : <SparkBars />}
    </div>
  );
}
