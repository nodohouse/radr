"use client";

import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

const SEV_COLOR: Record<LiveSeverity, string> = {
  healthy: "#00d978",
  watch: "#d4a04a",
  intervene: "#e07060",
  critical: "#e07060",
};

type Props = {
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  venueLabel: string;
};

/** Isometric-ish venue maquette — abstract zones, not a cartoon simulator. */
export function VenueScene({ zones, selectedId, onSelect, venueLabel }: Props) {
  return (
    <div className="rp-live-scene" data-scene="venue">
      <header className="rp-live-scene-head">
        <p className="rp-live-kicker">Venue</p>
        <h2>{venueLabel}</h2>
        <p className="rp-live-lede">Operating zones · pressure on the object</p>
      </header>
      <svg className="rp-live-svg" viewBox="0 0 100 90" role="img" aria-label={venueLabel}>
        <rect x="0" y="0" width="100" height="90" fill="#141716" rx="1.2" />
        {/* floor plate */}
        <polygon
          points="12,70 50,82 88,70 50,58"
          fill="#1a1e1b"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.3"
        />
        {zones.map((z) => {
          const selected = z.id === selectedId;
          const c = SEV_COLOR[z.severity];
          const w = z.size?.w ?? 16;
          const h = z.size?.h ?? 12;
          const x = z.position.x - w / 2;
          const y = z.position.y - h / 2;
          return (
            <g
              key={z.id}
              className="rp-live-zone"
              data-selected={selected ? "true" : undefined}
              onClick={() => onSelect(z.id)}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onSelect(z.id);
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="0.7"
                fill="#242925"
                stroke={selected ? c : "rgba(255,255,255,0.16)"}
                strokeWidth={selected ? 0.5 : 0.28}
              />
              <rect x={x} y={y} width={w} height="1.1" fill={c} opacity="0.85" />
              <text
                x={z.position.x}
                y={z.position.y - 0.5}
                textAnchor="middle"
                fill="#fff"
                fontSize="2.2"
                fontWeight="600"
              >
                {z.label}
              </text>
              <text
                x={z.position.x}
                y={z.position.y + 2.4}
                textAnchor="middle"
                fill="rgba(242,244,242,0.6)"
                fontSize="1.6"
              >
                {z.status}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
