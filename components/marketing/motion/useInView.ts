"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Options = {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
};

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.28,
  once = true,
  rootMargin = "0px 0px -8% 0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (reduced) {
      setInView(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    // Fail-safe: if already in viewport on mount, fire immediately
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    if (rect.top < vh * 0.85 && rect.bottom > vh * 0.1) {
      setInView(true);
      if (once) return;
    }

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
  }, [mounted, reduced, once, threshold, rootMargin]);

  return { ref, inView: reduced || inView, reduced, mounted };
}
