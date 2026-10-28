"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/** Continuously animate visible diagrams; motion preferences are handled in CSS. */
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
  return (
    <div
      ref={ref}
      className={`${className} mx-motion-scene`}
      data-moving={visible}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
