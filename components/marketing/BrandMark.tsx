"use client";

/**
 * Brand mark — re-exports BrandLogo (A-mark system).
 * Prefer BrandLogo for new call sites.
 */

export {
  BrandLogo,
  BrandMark,
  BrandLogo as RadrLogo,
  type BrandLogoLockup,
  type BrandLogoSize,
  type BrandLogoVariant,
} from "@/components/marketing/BrandLogo";

export {
  RadrWordmark,
  RadrWordmark as RadrLogoWordmark,
  type LogoSurface,
} from "@/components/radr/RadrWordmark";

/** Legacy PNG paths — archived. Do not use for public logo. */
export const DELTA_ASSETS = {
  glass: "/brand/legacy/delta-glass-trim.png?v=3",
  orbit: "/brand/legacy/delta-orbit-trim.png?v=3",
} as const;
