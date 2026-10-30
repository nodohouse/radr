/*
 RADR mark inside square / card / intelligence nodes.
 Approved soft master-v4 SVG verbatim — container safe-area only.
 DO NOT edit SVG geometry.
*/

import type { FrozenRadrLogoTheme } from "@/components/brand/FrozenRadrLogo";
import "@/app/radr-mark-node.css";

const SRC: Record<FrozenRadrLogoTheme, string> = {
  light: "/brand/radr-mark-master-v4.svg",
  dark: "/brand/radr-mark-master-v4-white.svg",
  mono: "/brand/radr-mark-master-v4-mono-black.svg",
};

type Props = {
  theme?: FrozenRadrLogoTheme;
  className?: string;
  /** Accessible name when the node is meaningful; omit for decorative. */
  label?: string;
  priority?: boolean;
};

/**
 * Single reusable mark for square RADR nodes.
 *
 * Master mark includes intrinsic clear space; canvas remains flex-centered.
 */
export function RadrMarkNode({
  theme = "light",
  className = "",
  label,
  priority = false,
}: Props) {
  const decorative = !label;

  return (
    <div
      className={`radr-mark-node ${className}`.trim()}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
    >
      <div className="radr-mark-safe-area">
        <div className="radr-mark-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element -- frozen SVG verbatim */}
          <img
            src={SRC[theme]}
            alt={decorative ? "" : label || "RADR"}
            aria-hidden={decorative ? true : undefined}
            className="radr-mark-node__img radr-logo radr-logo--mark"
            width={60}
            height={46}
            decoding="async"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
