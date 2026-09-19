import type { TerritoryId } from "@/lib/radr/brandTokens";
import { SPEC_BY_ID } from "@/lib/radr/deltaFieldData";

/** Resting territory: clearly readable before scan. */
export const HERO_NEON: Record<TerritoryId, string> = {
  BUY: "#18E885",
  LABOR: "#B07AFF",
  SELL: "#F0B824",
  RECOVER: "#A878F0",
};

/** Peak neon on beam hit. */
export const HERO_NEON_HIT: Record<TerritoryId, string> = {
  BUY: "#6CFFBD",
  LABOR: "#D8A7FF",
  SELL: "#FFE477",
  RECOVER: "#D1A3FF",
};

/** Core neon for amount/territory at peak. */
export const HERO_NEON_CORE: Record<TerritoryId, string> = {
  BUY: "#00FF85",
  LABOR: "#B96FFF",
  SELL: "#FFC21A",
  RECOVER: "#AC74FF",
};

export type ContactContent = {
  specId: string;
  value: string;
  label: string;
  territory: TerritoryId;
  color: string;
  hitColor: string;
  coreColor: string;
  material: true;
  captureEuro: number;
};

export type Zone = {
  id: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

/**
 * Curated spawn zones: organic spread, off headline / CTA / VALUE / network.
 * A upper-middle · B upper-right · C middle · D middle-right · E far-right · F lower-middle
 */
export const SIGNAL_ZONES: readonly Zone[] = [
  { id: 0, x0: 0.45, x1: 0.57, y0: 0.16, y1: 0.29 },
  { id: 1, x0: 0.7, x1: 0.88, y0: 0.15, y1: 0.28 },
  { id: 2, x0: 0.5, x1: 0.64, y0: 0.34, y1: 0.48 },
  { id: 3, x0: 0.7, x1: 0.84, y0: 0.35, y1: 0.49 },
  { id: 4, x0: 0.84, x1: 0.94, y0: 0.32, y1: 0.51 },
  { id: 5, x0: 0.51, x1: 0.64, y0: 0.49, y1: 0.59 },
];

export const MIN_SIGNAL_SEP_PX = 220;

/** Pre-sweep spawn window within a radar cycle (0→1). */
export const SPAWN_WINDOW_START = 0.78;
export const SPAWN_WINDOW_END = 0.96;

function entry(
  specId: string,
  value: string,
  label: string,
  territory: TerritoryId,
  captureEuro: number,
): ContactContent {
  return {
    specId,
    value,
    label,
    territory,
    color: HERO_NEON[territory],
    hitColor: HERO_NEON_HIT[territory],
    coreColor: HERO_NEON_CORE[territory],
    material: true,
    captureEuro,
  };
}

const SIGNAL_CATALOG: readonly ContactContent[] = [
  entry("buy_freshco", "€418", "SUPPLIER PRICING", "BUY", 418),
  entry("buy_annual", "€18.6k / yr", "CONTRACT VARIANCE", "BUY", 1860),
  entry("buy_unit", "€3.60", "UNIT PRICE", "BUY", 190),
  entry("labor_dinner", "€840", "DINNER STAFFING", "LABOR", 840),
  entry("labor_ot", "€1.2k", "OVERTIME", "LABOR", 1200),
  entry("sell_fee", "€218", "CHANNEL FEE", "SELL", 218),
  entry("sell_channel", "€3.60", "PROMOTION", "SELL", 360),
  entry("sell_menu", "€1.30", "MENU CONTRIBUTION", "SELL", 1300),
  entry("recover_payout", "€332", "DELIVERY PAYOUT", "RECOVER", 332),
  entry("recover_credit", "€4.3k", "SUPPLIER CREDIT", "RECOVER", 4300),
];

export const SIGNAL_SLOT_COUNT = 3;
export const MATERIAL_SLOT_COUNT = SIGNAL_SLOT_COUNT;
export const SLOT_COUNT = SIGNAL_SLOT_COUNT;

/** Max 3: hard ceiling including tracked + spawning. */
export const MAX_VISIBLE_CONTACTS = 3;

export function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Pre-sweep fade-in. */
export function fadeInMs() {
  return randBetween(700, 1000);
}

export function fadeOutMs() {
  return randBetween(1200, 1800);
}

/** Survive multiple radar rotations. */
export function trackLifetimeMs() {
  return randBetween(9000, 14000);
}

export function minTrackMs() {
  return 5500;
}

export const MIN_SCAN_COUNT = 2;

/** Resting opacity: readable before beam (~0.65-0.75). */
export function restingBase(scanCount: number) {
  if (scanCount <= 0) return 0.7;
  if (scanCount === 1) return 0.74;
  if (scanCount === 2) return 0.78;
  return 0.82;
}

export function trackConfidence(scanCount: number) {
  if (scanCount <= 0) return 0.35;
  if (scanCount === 1) return 0.55;
  if (scanCount === 2) return 0.75;
  return 0.9;
}

export function pickContent(recentIds: string[]): ContactContent {
  const avoid = new Set(recentIds.slice(-4));
  const fresh = SIGNAL_CATALOG.filter((c) => !avoid.has(c.specId));
  const pool = fresh.length ? fresh : SIGNAL_CATALOG;
  return { ...pool[Math.floor(Math.random() * pool.length)]! };
}

function sampleZone(z: Zone) {
  return {
    x: z.x0 + Math.random() * (z.x1 - z.x0),
    y: z.y0 + Math.random() * (z.y1 - z.y0),
  };
}

export function angleDistance(a: number, b: number) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

/** Clockwise degrees from `from` to `to` (0-360). */
export function clockwiseAhead(from: number, to: number) {
  return (to - from + 360) % 360;
}

export function signalAngleDeg(dx: number, dy: number) {
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

/**
 * How many new contacts to introduce this pre-sweep, given empty slots.
 * Typical 1-2; occasionally 3 when field is empty.
 */
export function desiredNewContacts(emptySlots: number, visible: number): number {
  if (emptySlots <= 0) return 0;
  if (visible <= 0) {
    return Math.min(emptySlots, Math.random() < 0.28 ? 3 : 2);
  }
  if (visible === 1) {
    return Math.min(emptySlots, Math.random() < 0.55 ? 2 : 1);
  }
  if (visible === 2) {
    return Math.min(emptySlots, 1);
  }
  return 0;
}

/**
 * Staggered cycleProgress targets inside the spawn window.
 * Planned once per radar cycle: never same-frame.
 */
export function planSpawnProgresses(count: number): number[] {
  if (count <= 0) return [];
  const bases = [0.8, 0.87, 0.93];
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const b = bases[i] ?? SPAWN_WINDOW_START + 0.04 * i;
    const jitter = randBetween(-0.018, 0.02);
    out.push(
      Math.min(
        SPAWN_WINDOW_END - 0.008,
        Math.max(SPAWN_WINDOW_START + 0.005, b + jitter),
      ),
    );
  }
  out.sort((a, b) => a - b);
  // Enforce minimum stagger so they never share a frame.
  for (let i = 1; i < out.length; i++) {
    if (out[i]! < out[i - 1]! + 0.035) {
      out[i] = Math.min(SPAWN_WINDOW_END - 0.004, out[i - 1]! + 0.035);
    }
  }
  return out;
}

export type PlacementOpts = {
  beamDeg: number;
  /** Minimum clockwise clearance before beam hits (deg). */
  minAheadDeg?: number;
  vw?: number;
  vh?: number;
  originX?: number;
  originY?: number;
};

/**
 * Pick a zone/position that is ahead of the beam (clockwise) and not
 * about to be hit immediately. Prefers varied lead angles.
 */
export function pickPlacement(
  occupied: Array<{ x: number; y: number; zoneId: number }>,
  recentZones: number[],
  opts: PlacementOpts,
): { x: number; y: number; zoneId: number } {
  const vw = opts.vw ?? (typeof window !== "undefined" ? window.innerWidth : 1600);
  const vh = opts.vh ?? (typeof window !== "undefined" ? window.innerHeight : 900);
  const ox = (opts.originX ?? 0.69) * vw;
  const oy = (opts.originY ?? 0.71) * vh;
  const minAhead = opts.minAheadDeg ?? randBetween(35, 50);
  const preferBands = [45, 110, 190];
  const band = preferBands[Math.floor(Math.random() * preferBands.length)]!;

  const banned = new Set(recentZones.slice(-2));
  const occupiedZones = new Set(occupied.map((o) => o.zoneId));
  let pool = SIGNAL_ZONES.filter(
    (z) => !banned.has(z.id) && !occupiedZones.has(z.id),
  );
  if (!pool.length) {
    pool = SIGNAL_ZONES.filter((z) => !occupiedZones.has(z.id));
  }
  if (!pool.length) pool = [...SIGNAL_ZONES];

  let best = { x: 0.72, y: 0.28, zoneId: pool[0]!.id };
  let bestScore = -Infinity;
  const minSep = MIN_SIGNAL_SEP_PX;

  for (let attempt = 0; attempt < 36; attempt++) {
    const z = pool[Math.floor(Math.random() * pool.length)]!;
    const p = sampleZone(z);
    const ang = signalAngleDeg(p.x * vw - ox, p.y * vh - oy);
    const ahead = clockwiseAhead(opts.beamDeg, ang);
    const clearance = angleDistance(ang, opts.beamDeg);

    if (ahead < minAhead || clearance < minAhead) continue;
    // Prefer ahead of the next sweep (not behind / just passed).
    if (ahead > 300) continue;

    let minD = Infinity;
    for (let i = 0; i < occupied.length; i++) {
      const o = occupied[i]!;
      const d = Math.hypot((p.x - o.x) * vw, (p.y - o.y) * vh);
      if (d < minD) minD = d;
    }
    if (!occupied.length) minD = minSep;
    if (minD < minSep * 0.85) continue;

    const bandScore = 80 - Math.min(80, Math.abs(ahead - band));
    const score = minD + bandScore + Math.random() * 12;
    if (score > bestScore) {
      bestScore = score;
      best = { x: p.x, y: p.y, zoneId: z.id };
    }
    if (minD >= minSep && bandScore > 40) break;
  }

  // Fallback: any legal ahead position if scoring failed.
  if (bestScore === -Infinity) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const z = pool[Math.floor(Math.random() * pool.length)]!;
      const p = sampleZone(z);
      const ang = signalAngleDeg(p.x * vw - ox, p.y * vh - oy);
      const ahead = clockwiseAhead(opts.beamDeg, ang);
      if (ahead >= minAhead && ahead <= 300) {
        return { x: p.x, y: p.y, zoneId: z.id };
      }
    }
  }

  return best;
}

export function landSpec(specId: string) {
  return SPEC_BY_ID[specId];
}
