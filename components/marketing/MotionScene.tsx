"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";

/** Pause moving diagrams when offscreen; give readers a persistent local pause control. */
export function MotionScene({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.15 });
  const [paused, setPaused] = useState(false);
  return (
    <div
      ref={ref}
      className={`${className} mx-motion-scene`}
      data-moving={visible && !paused}
      role="group"
      aria-label={label}
    >
      {children}
      <button
        className="mx-motion-toggle"
        onClick={() => setPaused((p) => !p)}
        aria-label={`${paused ? "Play" : "Pause"} ${label} animation`}
      >
        {paused ? "Play flow" : "Pause flow"}
      </button>
    </div>
  );
}
