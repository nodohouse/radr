"use client";

import { useInView } from "./motion/useInView";

type Props = {
  className?: string;
};

/** Thin horizontal scan that travels once when in view */
export function ScanLine({ className = "" }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`radr-scanline ${className}`.trim()}
      data-on={inView ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
