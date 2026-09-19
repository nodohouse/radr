"use client";

/**
 * Compatibility layer. Prefer RadrWordmark / RadrDelta going forward.
 * Keeps existing imports working while enforcing official delta asset.
 */
export {
  RADR_DELTA_ASSET as RADR_MARK_GLYPH_SRC,
} from "@/lib/radr/brandTokens";

export { RadrDelta as RadrMark, RadrDelta as BrandA } from "./RadrDelta";

import { RADR_DELTA_ASSET, RADR_DELTA_NAV_ASSET, RADR_DELTA_INTRINSIC } from "@/lib/radr/brandTokens";

export const RADR_MARK = {
  nav: {
    src: RADR_DELTA_NAV_ASSET,
    width: RADR_DELTA_INTRINSIC.width,
    height: RADR_DELTA_INTRINSIC.height,
  },
  glyph: {
    src: RADR_DELTA_ASSET,
    width: RADR_DELTA_INTRINSIC.width,
    height: RADR_DELTA_INTRINSIC.height,
  },
  visual: {
    src: RADR_DELTA_ASSET,
    width: RADR_DELTA_INTRINSIC.width,
    height: RADR_DELTA_INTRINSIC.height,
  },
} as const;

export type RadrMarkVariant = keyof typeof RADR_MARK;
