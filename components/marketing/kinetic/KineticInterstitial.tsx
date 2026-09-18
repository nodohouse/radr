"use client";

/**
 * KineticInterstitial — short causality morph between sections.
 * CREDIT ISSUED → NOT APPLIED
 */

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { useInView } from "@/components/marketing/motion/useInView";

type Props = {
  from: string;
  to: string;
  tone?: "exposure" | "urgent" | "verified" | "neutral";
};

export function KineticInterstitial({
  from,
  to,
  tone = "exposure",
}: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.55 });
  const [phase, setPhase] = useState<"a" | "b">("a");

  useEffect(() => {
    if (reduced || !inView) {
      setPhase(reduced ? "b" : "a");
      return;
    }
    setPhase("a");
    const t = window.setTimeout(() => setPhase("b"), 900);
    return () => window.clearTimeout(t);
  }, [inView, reduced, from, to]);

  return (
    <div
      ref={ref}
      className="rx-kint"
      data-tone={tone}
      data-phase={phase}
      data-on={inView ? "true" : undefined}
      aria-label={`${from} becomes ${to}`}
    >
      <div className="rx-shell rx-kint-inner">
        <span className="rx-kint-a">{from}</span>
        <span className="rx-kint-arrow" aria-hidden="true">
          →
        </span>
        <span className="rx-kint-b">{to}</span>
      </div>
    </div>
  );
}
