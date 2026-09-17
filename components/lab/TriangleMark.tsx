type Props = {
  size?: number;
  className?: string;
  title?: string;
};

/** Triangle only. Never a letter R. */
export function TriangleMark({ size = 28, className = "", title = "RADR" }: Props) {
  return (
    <svg
      className={`lab-mark ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 100 90"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        className="lab-mark-acid"
        d="M50 8 L90 81 H10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
