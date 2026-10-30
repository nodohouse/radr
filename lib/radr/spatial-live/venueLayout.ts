/**
 * Soho · New York restaurant — connected architectural floor plate.
 * Coordinates tuned for elevated isometric (~40°) framing.
 * No Three.js import here — keep this module safe for any bundling path.
 */

import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export type VenueZoneKind =
  | "main"
  | "bar"
  | "terrace"
  | "kitchen"
  | "delivery";

export type VenueZoneGeom = {
  kind: VenueZoneKind;
  entitySuffix: string;
  /** Zone floor center on the podium. */
  position: [number, number, number];
  /** Floor footprint [width, wallHeight, depth]. */
  size: [number, number, number];
  labelAnchor: [number, number, number];
  /** Which sides have solid walls (N=+z back in our layout uses -z as back). */
  walls: { n: boolean; e: boolean; s: boolean; w: boolean };
};

/**
 * Connected plan (top-down, +x right, +z toward camera-front):
 *
 *   [ KITCHEN ][  BAR   ]
 *   [ MAIN DINING ][TERR]
 *   [DELIV]  ······
 */
export const VENUE_ZONE_GEOMS: VenueZoneGeom[] = [
  {
    kind: "kitchen",
    entitySuffix: "zone_kitchen",
    position: [-4.35, 0, -3.15],
    size: [7.4, 2.55, 5.6],
    labelAnchor: [-4.35, 3.6, -3.15],
    walls: { n: true, e: true, s: false, w: true },
  },
  {
    kind: "bar",
    entitySuffix: "zone_bar",
    position: [3.55, 0, -3.25],
    size: [6.2, 2.15, 5.4],
    labelAnchor: [3.55, 3.2, -3.25],
    walls: { n: true, e: true, s: false, w: false },
  },
  {
    kind: "main",
    entitySuffix: "zone_main",
    position: [-1.1, 0, 2.35],
    size: [12.6, 1.65, 6.4],
    labelAnchor: [-1.1, 2.6, 2.35],
    walls: { n: false, e: false, s: true, w: false },
  },
  {
    kind: "terrace",
    entitySuffix: "zone_terrace",
    position: [6.85, 0, 2.45],
    size: [5.0, 0.55, 6.2],
    labelAnchor: [6.85, 1.9, 2.45],
    walls: { n: true, e: true, s: true, w: false },
  },
  {
    kind: "delivery",
    entitySuffix: "zone_delivery",
    position: [-6.55, 0, 2.55],
    size: [4.0, 1.55, 4.4],
    labelAnchor: [-6.55, 2.5, 2.55],
    walls: { n: false, e: false, s: true, w: true },
  },
];

/** Shared architectural podium under the whole venue. */
export const VENUE_FLOOR = {
  size: [22.5, 0.42, 15.8] as [number, number, number],
  position: [0.15, -0.21, -0.15] as [number, number, number],
};

export const SEV_HEX: Record<LiveSeverity, string> = {
  healthy: "#3dcf8e",
  watch: "#c9a05a",
  intervene: "#c86b5c",
  critical: "#c86b5c",
};

export function entityIdForZone(locationId: string, suffix: string): string {
  return `${locationId}__${suffix}`;
}

export function zoneKindFromEntity(entity: LiveEntity): VenueZoneKind | null {
  if (entity.id.includes("zone_main")) return "main";
  if (entity.id.includes("zone_bar")) return "bar";
  if (entity.id.includes("zone_terrace")) return "terrace";
  if (entity.id.includes("zone_kitchen")) return "kitchen";
  if (entity.id.includes("zone_delivery")) return "delivery";
  return null;
}

const FOV_DEG = 34;
const ELEV_DEG = 40;
const AZIM_DEG = 44;

/** Axis-aligned bounds of all operating zones (world space). */
export function venueZoneBounds(): {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
} {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  let maxY = 0.5;
  for (const g of VENUE_ZONE_GEOMS) {
    const [x, , z] = g.position;
    const [w, h, d] = g.size;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minZ = Math.min(minZ, z - d / 2);
    maxZ = Math.max(maxZ, z + d / 2);
    maxY = Math.max(maxY, h);
  }
  const pad = 0.85;
  minX -= pad;
  maxX += pad;
  minZ -= pad;
  maxZ += pad;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  return {
    min: [minX, 0, minZ],
    max: [maxX, maxY, maxZ],
    center: [cx, maxY * 0.28, cz],
    size: [maxX - minX, maxY, maxZ - minZ],
  };
}

/**
 * Auto-frame zone bounds so the venue fills ~65–75% of the canvas.
 */
export function computeOverviewCamera(
  fill = 0.72,
): { position: [number, number, number]; target: [number, number, number]; fov: number } {
  const bounds = venueZoneBounds();
  const [cx, cy, cz] = bounds.center;
  const [bw, , bd] = bounds.size;
  const target: [number, number, number] = [cx, cy, cz];
  const span = Math.max(bw, bd);
  // Empirically framed for 34° fov + ~40° elev isometric maquette.
  const dist = (span * 0.58) / Math.max(0.55, Math.min(0.9, fill));
  const elev = degToRad(ELEV_DEG);
  const azim = degToRad(AZIM_DEG);
  const y = Math.sin(elev) * dist + 0.6;
  const horiz = Math.cos(elev) * dist;
  const x = cx + Math.sin(azim) * horiz;
  const z = cz + Math.cos(azim) * horiz;
  return { position: [x, y, z], target, fov: FOV_DEG };
}

export const VENUE_OVERVIEW_CAM = computeOverviewCamera();

export function focusCameraForZone(kind: VenueZoneKind): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const g = VENUE_ZONE_GEOMS.find((z) => z.kind === kind)!;
  const [x, , z] = g.position;
  const [w, h, d] = g.size;
  const elev = degToRad(34);
  const azim = degToRad(38);
  const zoneExtent = Math.hypot(w, d);
  // Keep enough distance that the zone still reads as a room, not a wall crop.
  const dist = Math.max(10.5, zoneExtent * 1.35);
  const hy = Math.sin(elev) * dist;
  const horiz = Math.cos(elev) * dist;
  return {
    target: [x, Math.min(h * 0.35, 1.15), z],
    position: [x + Math.sin(azim) * horiz, hy + 1.1, z + Math.cos(azim) * horiz],
  };
}
