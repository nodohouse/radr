"use client";

import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import {
  SEV_HEX,
  VENUE_ZONE_GEOMS,
  entityIdForZone,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";

type Props = {
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone: (kind: VenueZoneKind | null) => void;
  /** Dev-only detail string. */
  reason?: string;
  /** Production: quiet "Reduced spatial mode" notice. */
  reduced?: boolean;
};

/**
 * Emergency 2D venue ONLY when WebGL truly fails.
 * Not the visual target — do not polish as the primary Live experience.
 */
export function VenueFallback2D({
  zones,
  selectedId,
  onSelect,
  onHoverZone,
  reason,
  reduced,
}: Props) {
  const byId = new Map(zones.map((z) => [z.id, z]));
  const locationId =
    zones[0]?.parentId ?? zones[0]?.id.split("__")[0] ?? "loc_berlin_mitte";

  return (
    <div
      className="rp-live3-canvas rp-live3-fallback2d"
      data-testid="radr-live-fallback"
    >
      <svg viewBox="0 0 100 72" role="img" aria-label="Soho · New York venue (reduced)">
        <rect x="0" y="0" width="100" height="72" fill="#121614" />
        <polygon
          points="14,50 50,20 86,50 50,66"
          fill="#1a1f1c"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.3"
        />
        {VENUE_ZONE_GEOMS.map((geom) => {
          const [wx, , wz] = geom.position;
          const [ww, , wd] = geom.size;
          const ix = 50 + wx * 2.8 + wz * 1.6;
          const iy = 42 - wz * 2.1 + wx * 0.35;
          const bw = Math.max(8, ww * 2.1);
          const bh = Math.max(5, wd * 1.5);
          const id = entityIdForZone(locationId, geom.entitySuffix);
          const entity = byId.get(id);
          if (!entity) return null;
          const selected = selectedId === id;
          const sev = SEV_HEX[entity.severity];
          return (
            <g
              key={id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onHoverZone(geom.kind)}
              onMouseLeave={() => onHoverZone(null)}
              onClick={() => onSelect(entity.id)}
              opacity={selectedId && !selected ? 0.4 : 1}
            >
              <polygon
                points={`${ix - bw / 2},${iy} ${ix},${iy - bh / 2} ${ix + bw / 2},${iy} ${ix},${iy + bh / 2}`}
                fill="#252b27"
                stroke={selected ? sev : "rgba(255,255,255,0.1)"}
                strokeWidth={selected ? 0.45 : 0.2}
              />
              <circle cx={ix} cy={iy} r="1" fill={sev} />
              <text
                x={ix}
                y={iy - bh / 2 - 1.5}
                textAnchor="middle"
                fill="#c8cec9"
                fontSize="2.1"
                fontFamily="Instrument Sans, system-ui, sans-serif"
              >
                {entity.label}
              </text>
            </g>
          );
        })}
      </svg>
      {reduced ? (
        <p className="rp-live3-fallback-note">Reduced spatial mode</p>
      ) : reason ? (
        <p className="rp-live3-fallback-note">{reason}</p>
      ) : null}
    </div>
  );
}
