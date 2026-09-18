"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Stage index from a tall sticky section: rAF-throttled, one getBoundingClientRect per frame max.
 */
export function useScrollStage(
  stageCount: number,
  enabled: boolean,
) {
  const rootRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root || stageCount < 1) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(stageCount - 1, Math.floor(p * stageCount));
      setIndex((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, stageCount]);

  return { rootRef, index, setIndex };
}
