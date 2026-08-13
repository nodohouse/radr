"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Options = {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
};

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.35,
  once = true,
  rootMargin = "0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setInView(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced, once, threshold, rootMargin]);

  return { ref, inView, reduced };
}
