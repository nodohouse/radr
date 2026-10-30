"use client";

import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

const SEV_COLOR: Record<LiveSeverity, string> = {
  healthy: "#00d978",
  watch: "#d4a04a",
  intervene: "#e07060",
  critical: "#e07060",
};

type Props = {
  entities: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title: string;
  subtitle: string;
};

export function EstateScene({
  entities,
  selectedId,
  onSelect,
  title,
  subtitle,
}: Props) {
  return (
    <div className="rp-live-scene" data-scene="estate">
      <header className="rp-live-scene-head">
        <p className="rp-live-kicker">Estate</p>
        <h2>{title}</h2>
        <p className="rp-live-lede">{subtitle}</p>
      </header>
      <svg
        className="rp-live-svg"
        viewBox="0 0 100 80"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="liveEstateFg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e221f" />
            <stop offset="100%" stopColor="#141716" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="80" fill="url(#liveEstateFg)" rx="1.2" />
        {/* soft grid */}
        {[20, 40, 60, 80].map((x) => (
          <line
            key={`vx${x}`}
            x1={x}
            y1="4"
            x2={x}
            y2="76"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.15"
          />
        ))}
        {[20, 40, 60].map((y) => (
          <line
            key={`hy${y}`}
            x1="4"
            y1={y}
            x2="96"
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.15"
          />
        ))}

        {entities.map((e) => {
          const selected = e.id === selectedId;
          const c = SEV_COLOR[e.severity];
          const w = e.size?.w ?? 10;
          const h = e.size?.h ?? 8;
          const x = e.position.x - w / 2;
          const y = e.position.y - h / 2;
          return (
            <g
              key={e.id}
              className="rp-live-node"
              data-selected={selected ? "true" : undefined}
              data-sev={e.severity}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(e.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onSelect(e.id);
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="0.8"
                fill="#242925"
                stroke={selected ? c : "rgba(255,255,255,0.14)"}
                strokeWidth={selected ? 0.45 : 0.25}
              />
              <rect
                x={x}
                y={y}
                width={0.55}
                height={h}
                rx="0.2"
                fill={c}
                opacity={0.95}
              />
              <text
                x={e.position.x}
                y={e.position.y - 1.2}
                textAnchor="middle"
                className="rp-live-node-label"
                fill="#f2f4f2"
                fontSize="2.1"
                fontWeight="600"
              >
                {(e.shortLabel ?? e.label).slice(0, 14)}
              </text>
              <text
                x={e.position.x}
                y={e.position.y + 1.6}
                textAnchor="middle"
                fill="rgba(242,244,242,0.55)"
                fontSize="1.55"
              >
                {e.metrics[0]?.value ?? e.status}
              </text>
              {e.severity !== "healthy" ? (
                <circle
                  cx={x + w - 1.2}
                  cy={y + 1.2}
                  r="0.7"
                  fill={c}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <ul className="rp-live-legend" aria-label="Status legend">
        <li data-sev="healthy">Healthy</li>
        <li data-sev="watch">Watch</li>
        <li data-sev="intervene">Intervene</li>
      </ul>
    </div>
  );
}
