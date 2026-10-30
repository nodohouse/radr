/*
 RADR BRAND ASSET — IMMUTABLE.
 Public re-export — all paths render FrozenRadrLogo assets only.
*/

export {
  FrozenRadrLogo,
  RadrLogo,
  RADRLogo,
  BrandLogo,
  BrandMark,
  type RadrLogoVariant,
  type RadrLogoTheme,
  type RadrLogoSize,
} from "@/components/brand/RadrLogo";

/** @deprecated Use RadrLogoTheme */
export type BrandLogoVariant = "light" | "dark" | "monochrome";
/** @deprecated Use RadrLogoVariant */
export type BrandLogoLockup = "mark" | "horizontal" | "wordmark";
/** @deprecated Use RadrLogoSize */
export type BrandLogoSize = "sm" | "md" | "lg";
