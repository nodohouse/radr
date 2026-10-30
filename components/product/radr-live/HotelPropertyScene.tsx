"use client";

import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

const SEV_COLOR: Record<LiveSeverity, string> = {
  healthy: "#00d978",
  watch: "#d4a04a",
  intervene: "#e07060",
  critical: "#e07060",
};

type Props = {
  floors: LiveEntity[];
  rooms?: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  propertyLabel: string;
  mode: "property" | "floor";
};

export function HotelPropertyScene({
  floors,
  rooms = [],
  selectedId,
  onSelect,
  propertyLabel,
  mode,
}: Props) {
  if (mode === "floor" && rooms.length) {
    return (
      <div className="rp-live-scene" data-scene="floor">
        <header className="rp-live-scene-head">
          <p className="rp-live-kicker">Floor</p>
          <h2>{propertyLabel}</h2>
          <p className="rp-live-lede">Room readiness · priority arrivals</p>
        </header>
        <svg className="rp-live-svg" viewBox="0 0 100 80" role="img" aria-label={propertyLabel}>
          <rect x="0" y="0" width="100" height="80" fill="#141716" rx="1.2" />
          <rect
            x="10"
            y="28"
            width="80"
            height="40"
            rx="1"
            fill="#1a1e1b"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />
          {rooms.map((r) => {
            const selected = r.id === selectedId;
            const c = SEV_COLOR[r.severity];
            const w = r.size?.w ?? 10;
            const h = r.size?.h ?? 10;
            const x = r.position.x - w / 2;
            const y = r.position.y - h / 2;
            return (
              <g
                key={r.id}
                onClick={() => onSelect(r.id)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onSelect(r.id);
                  }
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="0.6"
                  fill="#242925"
                  stroke={selected ? c : "rgba(255,255,255,0.14)"}
                  strokeWidth={selected ? 0.45 : 0.25}
                />
                <circle cx={x + 1.4} cy={y + 1.4} r="0.65" fill={c} />
                <text
                  x={r.position.x}
                  y={r.position.y - 0.4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="2"
                  fontWeight="600"
                >
                  {r.shortLabel}
                </text>
                <text
                  x={r.position.x}
                  y={r.position.y + 2.2}
                  textAnchor="middle"
                  fill="rgba(242,244,242,0.55)"
                  fontSize="1.35"
                >
                  {r.status.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="rp-live-scene" data-scene="property">
      <header className="rp-live-scene-head">
        <p className="rp-live-kicker">Property</p>
        <h2>{propertyLabel}</h2>
        <p className="rp-live-lede">Exploded floors · readiness pressure</p>
      </header>
      <svg className="rp-live-svg" viewBox="0 0 100 90" role="img" aria-label={propertyLabel}>
        <rect x="0" y="0" width="100" height="90" fill="#141716" rx="1.2" />
        {/* building silhouette */}
        <polygon
          points="30,78 50,86 70,78 70,18 50,10 30,18"
          fill="#1a1e1b"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.3"
        />
        {floors.map((f) => {
          const selected = f.id === selectedId;
          const c = SEV_COLOR[f.severity];
          const w = f.size?.w ?? 40;
          const h = f.size?.h ?? 10;
          const x = f.position.x - w / 2;
          const y = f.position.y - h / 2;
          return (
            <g
              key={f.id}
              onClick={() => onSelect(f.id)}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onSelect(f.id);
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="0.6"
                fill="#242925"
                stroke={selected ? c : "rgba(255,255,255,0.14)"}
                strokeWidth={selected ? 0.45 : 0.25}
              />
              <rect x={x} y={y} width={1} height={h} fill={c} />
              <text
                x={f.position.x}
                y={f.position.y - 0.8}
                textAnchor="middle"
                fill="#fff"
                fontSize="2.2"
                fontWeight="600"
              >
                {f.label}
              </text>
              <text
                x={f.position.x}
                y={f.position.y + 2}
                textAnchor="middle"
                fill="rgba(242,244,242,0.55)"
                fontSize="1.5"
              >
                {f.status}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
