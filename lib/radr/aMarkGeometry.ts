/**
 * DEPRECATED — do not render from these constants.
 * Production logo is the approved soft SVG master only:
 *   /public/brand/radr-mark-master-v4.svg
 *   /public/brand/radr-wordmark-master-v4.svg
 *
 * Kept so older imports compile. Never use to invent a CSS/SVG A.
 * Paths below are legacy sharp geometry — not the live v4 silhouette.
 */

export const AMARK_VIEWBOX = "-10.00 -7.65 120.00 91.81";

/** @deprecated Legacy sharp paths — live mark is radr-mark-master-v4.svg */
export const AMARK_LEFT_PATH = "M6 92 L48 8 L63 26 L30 92 Z";
export const AMARK_RIGHT_PATH = "M58 34 L96 92 L70 92 L49 61 Z";
export const AMARK_DOT = { cx: 50.16, cy: 65.71, r: 9.56 } as const;

export const RADR_INK = "#0B1512";
export const RADR_GREEN = "#00E676";
export const RADR_WHITE = "#FFFFFF";
export const RADR_APP_BG = "#050705";
