"use client";

/**
 * LeakMapPanel — five value-leak classes.
 * Money owed / missing / overpaid / about to expire / unexplained.
 */

import { useEffect, useState } from "react";
import { LeakClassVisual } from "@/components/marketing/kinetic/LeakClassVisual";
import type { ProblemFamily } from "@/lib/radr/problemFamilies";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { useInView } from "@/components/marketing/motion/useInView";

const ORDER: ProblemFamily[] = [
  "SUPPLIER_AP",
  "RECONCILIATION",
  "COST_VARIANCE",
  "PROCUREMENT",
  "PERISHABLE_REVENUE",
];

const LABELS: Record<ProblemFamily, string> = {
  SUPPLIER_AP: "Supplier / AP",
  RECONCILIATION: "Reconciliation",
  COST_VARIANCE: "Cost variance",
  PROCUREMENT: "Procurement",
  PERISHABLE_REVENUE: "Perishable",
};

const FRAMES: Record<ProblemFamily, string> = {
  SUPPLIER_AP: "Money owed back.",
  RECONCILIATION: "Money missing between systems.",
  COST_VARIANCE: "Why margin moved.",
  PROCUREMENT: "What the group is overpaying.",
  PERISHABLE_REVENUE: "Revenue about to disappear.",
};

type Props = {
  kicker: string;
  title: string;
  bodies: Record<ProblemFamily, string>;
  metas: Record<ProblemFamily, string>;
};

export function LeakMapPanel({ kicker, title, bodies, metas }: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35 });
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const family = ORDER[idx]!;

  useEffect(() => {
    if (reduced || paused || !inView) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % ORDER.length);
    }, 4200);
    return () => window.clearInterval(t);
  }, [reduced, paused, inView]);

  return (
    <div ref={ref} className="rx-leak-panel">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-leak-panel-frame" aria-live="polite">
        {FRAMES[family]}
      </p>

      <nav className="rx-leak-panel-nav" aria-label="Value leak classes">
        {ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            data-on={i === idx ? "true" : undefined}
            onClick={() => {
              setPaused(true);
              setIdx(i);
            }}
            onMouseEnter={() => {
              setPaused(true);
              setIdx(i);
            }}
          >
            <span>{LABELS[id]}</span>
            <em>{FRAMES[id]}</em>
          </button>
        ))}
      </nav>

      <div className="rx-leak-panel-stage">
        <LeakClassVisual key={family} family={family} />
        <div className="rx-leak-panel-copy">
          <h3>{LABELS[family]}</h3>
          <p>{bodies[family]}</p>
          <p className="rx-sticky-meta">{metas[family]}</p>
        </div>
      </div>
    </div>
  );
}
