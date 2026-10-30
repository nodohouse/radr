"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms for nested children with --i */
  as?: "div" | "section" | "article";
};

/** Quiet section enter: opacity + 10px. One-shot. */
export function RevealOnView({
  children,
  className = "",
  as: Tag = "div",
}: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <Tag
      ref={ref as never}
      className={`rx30-reveal ${className}`.trim()}
      data-on={on ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}
