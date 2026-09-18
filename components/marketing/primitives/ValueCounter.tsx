"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";
import { formatEuro } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";

type Props = {
  value: number;
  /** Optional stable label for a11y when different from live value */
  semantic?: string;
  className?: string;
  duration?: number;
};

/**
 * Animates visual number. Single visible node: no duplicate € readout.
 */
export function ValueCounter({
  value,
  semantic,
  className = "",
  duration = 0.55,
}: Props) {
  const reduced = useReducedMotionSafe();
  const mv = useMotionValue(value);
  const [shown, setShown] = useState(value);
  const label = semantic ?? formatEuro(value);

  useMotionValueEvent(mv, "change", (v) => setShown(v));

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      setShown(value);
      return;
    }
    const ctrl = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [value, reduced, duration, mv]);

  return (
    <span
      className={`rx-money ${className}`.trim()}
      aria-label={label}
    >
      {formatEuro(shown)}
    </span>
  );
}
