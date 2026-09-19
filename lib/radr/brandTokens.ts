/**
 * RADR brand tokens: product source of truth for `/app`.
 * product.css `.rp-root` must stay aligned.
 *
 * Environments:
 * - Marketing: mineral light (radr.css `.radr`, canvas #F7FAF8)
 * - Product: mineral dark control room (`.rp-root`, #07110C)
 * - Developers: aligning to mineral (`.rx-dev-root`)
 * - Ask RADR: elevated intelligence layer (`.rp-intel`)
 */

/** Brand emerald: intelligence, live, verified, key CTA */
export const RADR_GREEN = "#00D978";
export const RADR_GREEN_STRONG = "#00B764";
export const RADR_GREEN_BRIGHT = "#3AF0A2";
export const RADR_GREEN_SOFT = "rgba(0, 217, 120, 0.12)";
export const RADR_GREEN_MUTED = "rgba(0, 217, 120, 0.45)";

/** Territory palette: readable on dark product canvas */
export const BUY_COLOR = "#2ECF9A";
export const LABOR_COLOR = "#9A8BC4";
export const SELL_COLOR = "#E0B45A";
export const RECOVER_COLOR = "#4AA8B8";

export const TERRITORY_COLORS = {
  BUY: BUY_COLOR,
  LABOR: LABOR_COLOR,
  SELL: SELL_COLOR,
  RECOVER: RECOVER_COLOR,
} as const;

export type TerritoryId = keyof typeof TERRITORY_COLORS;

/** Status: separate from territory */
export const STATUS_COLORS = {
  critical: "#E06B63",
  warning: "#E0A84A",
  positive: "#00B764",
} as const;

/**
 * Location series for comparison charts on dark canvases.
 * Never reuse territory colors for venues.
 */
export const LOCATION_CHART_COLORS = [
  "#5EE6B0",
  "#7EB8E8",
  "#E0A070",
  "#9AD4C2",
  "#C4B48A",
  "#B0A0D8",
] as const;

/**
 * Mineral dark control-room surfaces.
 * Sync with .rp-root in product.css
 */
export const RADR_SURFACES = {
  /** L0: application canvas */
  canvas: "#07110C",
  /** L1: sidebar / navigation */
  sidebar: "#0B1711",
  /** L2: panels / cards */
  surface: "#0F1D16",
  /** L2b: elevated / nested */
  surface2: "#14231B",
  /** L3: interactive */
  interactive: "#1A2C23",
  /** Hover */
  hover: "rgba(255, 255, 255, 0.04)",
  /** Selected */
  selected: "rgba(0, 217, 120, 0.12)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  border: "rgba(255, 255, 255, 0.07)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  /** Primary text on mineral dark */
  text: "rgba(255, 255, 255, 0.95)",
  /** Secondary */
  text2: "rgba(255, 255, 255, 0.62)",
  /** Muted tertiary */
  text3: "rgba(255, 255, 255, 0.42)",
  textDisabled: "rgba(255, 255, 255, 0.28)",
} as const;

/** Ask RADR / intelligence terminal: elevated on mineral dark product */
export const RADR_INTEL = {
  canvas: "#0B1711",
  surface: "#14231B",
  surface2: "#1A2C23",
  border: "rgba(0, 217, 120, 0.22)",
  text: "rgba(255, 255, 255, 0.95)",
  text2: "rgba(255, 255, 255, 0.62)",
  text3: "rgba(255, 255, 255, 0.42)",
  signal: "#00D978",
} as const;

/** Re-export motion tokens for product/marketing parity */
export {
  RADR_MOTION,
  RADR_MOTION_CSS_VARS,
} from "@/lib/radr/motion/tokens";
export type { MotionPrimitive, RadrMotionDuration } from "@/lib/radr/motion/tokens";

/**
 * Temporal visual grammar - Actual solid / Expected translucent / Forecast ghost.
 * Contrast-safe on mineral dark; do not rely on color alone (pair with pattern/label).
 */
export const TEMPORAL_LAYERS = {
  actual: {
    opacity: 1,
    fill: "rgba(255, 255, 255, 0.92)",
    stroke: "rgba(255, 255, 255, 0.88)",
  },
  expected: {
    opacity: 0.55,
    fill: "rgba(255, 255, 255, 0.45)",
    stroke: "rgba(255, 255, 255, 0.5)",
  },
  forecast: {
    opacity: 0.32,
    fill: "rgba(0, 217, 120, 0.14)",
    stroke: "rgba(0, 217, 120, 0.35)",
  },
} as const;

/** Official uploaded RADR triangle (transparent glass frame) */
export const RADR_DELTA_ASSET = "/brand/delta-glyph.png?v=8";
export const RADR_DELTA_NAV_ASSET = "/brand/delta-nav.png?v=8";
/** Intrinsic pixel size of the official delta PNGs */
export const RADR_DELTA_INTRINSIC = { width: 654, height: 571 } as const;
