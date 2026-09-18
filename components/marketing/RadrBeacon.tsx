"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DeltaMark } from "@/components/radr/DeltaMark";

type Props = {
  className?: string;
  /** Visual size in px: desktop nav ~30-34 */
  size?: number;
  /** Idle pulse / glow. Off when reduced motion. */
  living?: boolean;
};

/**
 * RADR beacon: uploaded orbit △ (circle + sparks) for marketing surfaces.
 */
export function RadrBeacon({
  className = "",
  size = 30,
  living = true,
}: Props) {
  const reduced = useReducedMotion();
  const [pulse, setPulse] = useState(0);
  const [hover, setHover] = useState(false);
  const live = living && !reduced;

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    let timer = 0;

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setPulse((n) => n + 1);
        schedule();
      }, 5200 + Math.random() * 1800);
    };

    timer = window.setTimeout(() => {
      if (cancelled) return;
      setPulse((n) => n + 1);
      schedule();
    }, 2400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [live]);

  return (
    <motion.span
      className={`rx-beacon ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
      onHoverStart={() => {
        setHover(true);
        if (live) setPulse((n) => n + 1);
      }}
      onHoverEnd={() => setHover(false)}
      animate={{
        scale: hover ? 1.04 : 1,
        filter: hover ? "brightness(1.12)" : "brightness(1)",
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="rx-beacon-glow" data-on={live ? "true" : "false"} />
      {live ? (
        <motion.span
          key={hover ? `h-${pulse}` : pulse}
          className="rx-beacon-ring"
          initial={{ opacity: 0.45, scale: 0.55 }}
          animate={{ opacity: 0, scale: 1.55 }}
          transition={{
            duration: hover ? 0.55 : 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ) : null}
      <DeltaMark
        size="brand"
        tone="brand"
        asset="orbit"
        pixelSize={size}
        className="rx-beacon-delta-mark"
      />
    </motion.span>
  );
}
