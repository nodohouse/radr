"use client";

import { RadrWordmark } from "@/components/radr/RadrWordmark";

type Props = {
  className?: string;
  /** display = cinematic hero H0 · close = brand band */
  size?: "display" | "close";
};

/**
 * Brand lockup: NOTHING OFF THE R△DR
 * Green △ replaces the A — never letter-R as the mark.
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
      <span className="rx-notr-prefix" aria-hidden="true">
        <span className="rx-notr-w">Nothing</span>{" "}
        <span className="rx-notr-w">off the</span>
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
