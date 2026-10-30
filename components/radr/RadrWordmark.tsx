/**
 * RADR wordmark — canonical SVG artwork only (not live text + icon).
 * @deprecated Prefer `RadrLogo variant="wordmark" | "horizontal"`.
 */

import { RadrLogo, type RadrLogoSize } from "@/components/brand/RadrLogo";

type Variant = "plain" | "luminous";
type Size = "nav" | "md" | "lg" | "hero" | "footer" | "headline";
export type LogoSurface = "light" | "dark";

type Props = {
  className?: string;
  variant?: Variant;
  size?: Size;
  surface?: LogoSurface;
  compact?: boolean;
  as?: "span" | "p" | "div";
  animate?: boolean;
};

const SIZE_MAP: Record<Size, RadrLogoSize> = {
  nav: "sm",
  md: "md",
  lg: "lg",
  hero: "xl",
  footer: "lg",
  headline: "xl",
};

export function RadrWordmark({
  className = "",
  size = "md",
  surface = "dark",
}: Props) {
  return (
    <RadrLogo
      variant="wordmark"
      theme={surface === "light" ? "light" : "dark"}
      size={SIZE_MAP[size]}
      className={`radr-wm radr-wm--${size} ${className}`.trim()}
    />
  );
}

export { RadrLogo, BrandMark } from "@/components/brand/RadrLogo";
