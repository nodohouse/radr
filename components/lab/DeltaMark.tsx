type Props = {
  height?: number;
  className?: string;
};

/** Triangle mark — never a letter R. */
export function DeltaMark({ height = 15, className = "" }: Props) {
  return (
    <span
      className={`lab-delta ${className}`.trim()}
      style={{ height, width: height * 0.9 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 90" width="100%" height="100%" focusable="false">
        <path
          d="M50 8 L90 81 H10 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
