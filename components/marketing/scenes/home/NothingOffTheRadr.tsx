"use client";

import { RadrWordmark } from "@/components/radr/RadrWordmark";

type Props = {
  className?: string;
  /** display = left-column stacked H0 · close = brand band */
  size?: "display" | "close";
};

/**
 * Brand lockup: NOTHING / OFF THE / R△DR
 * Green △ replaces the A — never letter-R as the mark.
 * Subtle brand-green outline + traveling laser along the letterforms.
 */
export function NothingOffTheRadr({
  className = "",
  size = "display",
}: Props) {
  return (
    <p
      className={`rx-notr rx-notr--${size} ${className}`.trim()}
      aria-label="Nothing off the RADR"
    >
      <span className="rx-notr-line" data-text="Nothing" aria-hidden="true">
        Nothing
      </span>
      <span className="rx-notr-line" data-text="Off the" aria-hidden="true">
        Off the
      </span>
      <RadrWordmark
        size={size === "display" ? "headline" : "lg"}
        surface="light"
        variant="plain"
        className="rx-notr-wm"
      />
    </p>
  );
}
