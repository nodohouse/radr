type Props = {
  className?: string;
  /** Animated laser circuit — large brand moments only */
  animate?: boolean;
  size?: "nav" | "md" | "lg" | "hero";
  as?: "span" | "p" | "div";
};

/**
 * Canonical R△DR wordmark — one SVG, shared baseline.
 * Soft rounded outline △ with letter-matched stroke weight.
 */
export function RadrWordmark({
  className = "",
  animate = false,
  size = "md",
  as: Tag = "span",
}: Props) {
  // Cap band ~ y8–32. Soft △ sized as a custom A without crossbar.
  const d = "M41 8.5 L59.5 32 H22.5 Z";

  return (
    <Tag
      className={`radr-mark radr-mark--${size} ${className}`.trim()}
      aria-label="RADR"
      data-animate={animate ? "true" : "false"}
    >
      <svg
        className={`radr-mark-svg ${animate ? "radr-mark-svg--live" : ""}`}
        viewBox="0 0 124 40"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <title>RADR</title>
        <text
          className="radr-mark-letter"
          x="0"
          y="32"
          fontSize="30"
          fontWeight="700"
          dominantBaseline="alphabetic"
        >
          R
        </text>
        <path
          className="radr-mark-delta-base"
          d={d}
          fill="none"
          pathLength={100}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {animate ? (
          <path
            className="radr-mark-delta-runner"
            d={d}
            fill="none"
            pathLength={100}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <text
          className="radr-mark-letter"
          x="65"
          y="32"
          fontSize="30"
          fontWeight="700"
          dominantBaseline="alphabetic"
        >
          D
        </text>
        <text
          className="radr-mark-letter"
          x="93"
          y="32"
          fontSize="30"
          fontWeight="700"
          dominantBaseline="alphabetic"
        >
          R
        </text>
      </svg>
    </Tag>
  );
}

export function RadrLogo(props: Props) {
  return <RadrWordmark {...props} />;
}

export { RadrWordmark as BrandMark };
