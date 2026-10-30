/*
 RADR BRAND ASSET — IMMUTABLE.
 DO NOT REDRAW, MODIFY SVG GEOMETRY, REPOSITION THE FOCAL DOT,
 OR SUBSTITUTE LIVE TEXT/CSS.
 SOURCE OF TRUTH:
 /public/brand/radr-wordmark-master-v4.svg
 /public/brand/radr-mark-master-v4.svg

 Compatibility shim — all rendering goes through FrozenRadrLogo.
*/

import {
  FrozenRadrLogo,
  type FrozenRadrLogoSize,
  type FrozenRadrLogoTheme,
  type FrozenRadrLogoVariant,
} from "@/components/brand/FrozenRadrLogo";

export type RadrLogoVariant = FrozenRadrLogoVariant | "horizontal";
export type RadrLogoTheme = FrozenRadrLogoTheme;
export type RadrLogoSize = FrozenRadrLogoSize | "xs" | "xl";

type LegacyVariant = "plain" | "luminous";
type LegacySize = "nav" | "md" | "lg" | "hero" | "footer" | "headline";
type LegacySurface = "light" | "dark";

type Props = {
  variant?: RadrLogoVariant | LegacyVariant;
  theme?: RadrLogoTheme | "monochrome" | "monochrome-white";
  size?: RadrLogoSize | LegacySize;
  surface?: LegacySurface;
  className?: string;
  width?: number;
  decorative?: boolean;
  priority?: boolean;
  compact?: boolean;
  as?: "span" | "p" | "div";
  animate?: boolean;
};

function mapSize(size: Props["size"]): FrozenRadrLogoSize {
  if (size === "xs" || size === "sm" || size === "nav") return "sm";
  if (size === "lg" || size === "xl" || size === "hero" || size === "headline" || size === "footer")
    return "lg";
  return "md";
}

function mapTheme(
  theme: Props["theme"],
  surface: Props["surface"],
): FrozenRadrLogoTheme {
  if (theme === "monochrome" || theme === "mono" || theme === "monochrome-white")
    return "mono";
  if (theme === "dark" || surface === "dark") return "dark";
  return "light";
}

function mapVariant(variant: Props["variant"]): FrozenRadrLogoVariant {
  if (variant === "mark") return "mark";
  return "wordmark"; // wordmark | horizontal | plain | luminous
}

/** @deprecated Prefer FrozenRadrLogo — this re-exports the frozen renderer. */
export function RadrLogo(props: Props) {
  return (
    <FrozenRadrLogo
      variant={mapVariant(props.variant)}
      theme={mapTheme(props.theme, props.surface)}
      size={mapSize(props.size)}
      width={props.width}
      className={props.className}
      decorative={props.decorative}
      priority={props.priority}
    />
  );
}

/** @deprecated Prefer FrozenRadrLogo */
export function BrandLogo({
  variant = "light",
  lockup = "horizontal",
  size = "md",
  className,
  priority,
}: {
  variant?: "light" | "dark" | "monochrome" | "mono";
  lockup?: "mark" | "horizontal" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  return (
    <FrozenRadrLogo
      variant={lockup === "mark" ? "mark" : "wordmark"}
      theme={
        variant === "monochrome" || variant === "mono"
          ? "mono"
          : variant === "dark"
            ? "dark"
            : "light"
      }
      size={size}
      className={className}
      priority={priority}
    />
  );
}

export function BrandMark(
  props: Omit<Parameters<typeof BrandLogo>[0], "lockup"> & {
    mode?: "wordmark" | "mark";
  },
) {
  const { mode = "wordmark", ...rest } = props;
  return (
    <BrandLogo {...rest} lockup={mode === "mark" ? "mark" : "wordmark"} />
  );
}

export const RADRLogo = RadrLogo;
export { FrozenRadrLogo };
