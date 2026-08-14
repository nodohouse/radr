"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

type Options = {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
  /** Fire immediately if already in view on mount */
  eager?: boolean;
};

/**
 * Single IntersectionObserver primitive for reveals.
 * Content must remain visible without waiting on this.
 */
export function useRadrReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.22,
  once = true,
  rootMargin = "0px 0px -10% 0px",
  eager = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotionSafe();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced) {
      setActive(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    if (eager) {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.top < vh * 0.88 && rect.bottom > 0) {
        setActive(true);
        if (once) return;
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setActive(true);
          if (once) io.disconnect();
        } else if (!once) {
          setActive(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced, once, threshold, rootMargin, eager]);

  return { ref, active: reduced || active, reduced };
}

/** Alias for clarity in call sites */
export const useRadrScroll = useRadrReveal;
