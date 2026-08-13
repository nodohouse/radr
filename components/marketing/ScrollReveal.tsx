"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "./motion/useInView";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.22 });

  return (
    <div
      ref={ref}
      className={`radr-reveal ${className}`.trim()}
      data-on={inView ? "true" : "false"}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
