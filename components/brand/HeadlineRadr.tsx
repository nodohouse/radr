/*
 Inline RADR lockup for display headlines.
 Uses InlineRadrMark (ink-tight viewBox, 1cap black-stroke height).
*/

import { InlineRadrMark } from "@/components/brand/InlineRadrMark";

type Props = {
  className?: string;
  onDark?: boolean;
  label?: string;
};

export function HeadlineRadr({
  className = "",
  onDark = false,
  label = "RADR",
}: Props) {
  return (
    <span
      className={`rx-headline-radr ${onDark ? "rx-headline-radr--dark" : ""} ${className}`.trim()}
      aria-label={label}
    >
      R
      <InlineRadrMark onDark={onDark} />
      DR
    </span>
  );
}
