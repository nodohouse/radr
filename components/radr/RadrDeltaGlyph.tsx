/**
 * Official wordmark △: flat luminous brand character (the letter A).
 * Lockup match: equilateral outline, rounded joins, open center, neon bloom.
 */
type Props = {
  className?: string;
};

export function RadrDeltaGlyph({ className = "" }: Props) {
  return (
    <svg
      className={`radr-delta-glyph ${className}`.trim()}
      viewBox="0 0 100 90"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M50 8 L90 81 H10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
