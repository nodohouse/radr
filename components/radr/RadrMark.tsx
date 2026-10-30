"use client";

/**
 * Canonical RADR A-mark — approved master-v4 SVG only.
 * Prefer FrozenRadrLogo / RadrMarkNode for new surfaces.
 */

import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";

type Props = {
  className?: string;
  /** Pixel width of the mark (height follows master aspect). */
  size?: number;
  /** Accessible name when not decorative */
  label?: string;
};

export function RadrMark({
  className = "",
  size = 22,
  label,
}: Props) {
  return (
    <span
      className={`radr-mark ${className}`.trim()}
      style={{
        width: size,
        height: Math.round(size * (108 / 112)),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      data-radr-mark="true"
    >
      <FrozenRadrLogo
        variant="mark"
        theme="dark"
        width={size}
        decorative={!label}
      />
    </span>
  );
}

/** Alias — prefer RadrMark in new code */
export { RadrMark as RadrDeltaMark };
