"use client";

/**
 * Living D-4102 recovery object — €273 survives the journey.
 * Scroll-linked stages when sticky; clickable scrubber always.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const STAGES = [
  {
    id: "leak",
    label: "Leak",
    body: "Invoice €7.45/L · Contract €6.80/L · 420 L",
    euro: "€273",
    grade: "exposed",
  },
  {
    id: "evidence",
    label: "Evidence",
    body: "Contract clear · qty matched · UOM matched · prior history checked",
    euro: "€273",
    grade: "under review",
  },
  {
    id: "decision",
    label: "Decision",
    body: "Dispute the variance. Do not reprice the menu yet.",
    euro: "€273",
    grade: "Expected",
  },
  {
    id: "action",
    label: "Action",
    body: "Evidence package prepared for Finance approval.",
    euro: "€273",
    grade: "Expected",
  },
  {
    id: "outcome",
    label: "Outcome",
    body: "Credit memo CM-44102 issued.",
    euro: "€273",
    grade: "credit issued",
  },
  {
    id: "verified",
    label: "Verified",
    body: "Matched to original invoice INV-88421.",
    euro: "€273",
    grade: "VERIFIED",
  },
] as const;

type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export function RecoveryStoryObject({ kicker, title, lead }: Props) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const stage = STAGES[idx]!;
  const sealed = stage.id === "verified";

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight * 0.45;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const next = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
      setIdx((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="rx-rso rx-euro-journey"
      style={reduced ? undefined : { minHeight: `${STAGES.length * 55}vh` }}
    >
      <div className="rx-rso-pin">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
        <p className="rx-rec-p">{lead}</p>

        <div
          className="rx-euro-chip"
          data-sealed={sealed ? "true" : undefined}
          data-stage={stage.id}
        >
          <strong>{stage.euro}</strong>
          <em>{stage.grade}</em>
        </div>

        <div className="rx-rso-object" data-stage={stage.id} data-sealed={sealed ? "true" : undefined}>
          <div className="rx-rso-papers" aria-hidden="true">
            <div className="rx-rso-paper" data-kind="invoice">
              <em>INV-88421</em>
              <strong>€7.45/L</strong>
            </div>
            <div className="rx-rso-paper" data-kind="contract">
              <em>CTR-OIL-2026</em>
              <strong>€6.80/L</strong>
            </div>
            {idx >= 4 ? (
              <div className="rx-rso-paper" data-kind="credit">
                <em>CM-44102</em>
                <strong>€273</strong>
              </div>
            ) : null}
          </div>

          <div className="rx-rso-face">
            <p className="rx-rso-stage">{stage.label}</p>
            <p className="rx-rso-body">{stage.body}</p>
          </div>
        </div>

        <div className="rx-rso-scrub" role="tablist" aria-label="Recovery stages">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              data-on={i === idx ? "true" : undefined}
              data-past={i < idx ? "true" : undefined}
              onClick={() => setIdx(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
