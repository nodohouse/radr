type Props = {
  className?: string;
  /** Travelling laser along the perimeter: large brand moments only */
  animate?: boolean;
  /** ink on light sections, signal on dark */
  tone?: "signal" | "ink";
};

/**
 * Soft outline △: rounded joins, transparent interior.
 * Custom letterform energy, not a warning glyph.
 */
export function DeltaOutline({
  className = "",
  animate = false,
  tone = "signal",
}: Props) {
  // Soft equilateral-ish △; round joins create the soft apex/base
  const d = "M50 8 L92 90 H8 Z";

  return (
    <svg
      className={`radr-delta-svg ${animate ? "radr-delta-svg--live" : ""} ${className}`.trim()}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      data-tone={tone}
    >
      <path
        className="radr-delta-base"
        d={d}
        fill="none"
        pathLength={100}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {animate ? (
        <path
          className="radr-delta-runner"
          d={d}
          fill="none"
          pathLength={100}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
