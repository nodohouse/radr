"use client";

/**
 * Living €273 object — same value travels the recovery path.
 * Scroll-linked when sticky; scrubber always.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const STAGES = [
  {
    id: "exposed",
    label: "Exposed",
    body: "Invoice €7.45/L · Contract €6.80/L · 420 L",
    euro: "€273",
    grade: "EXPOSED",
  },
  {
    id: "review",
    label: "Under review",
    body: "Contract clear · qty matched · UOM matched · prior history checked",
    euro: "€273",
    grade: "UNDER REVIEW",
  },
  {
    id: "dispute",
    label: "Dispute prepared",
    body: "Evidence package staged for Finance. Do not reprice the menu yet.",
    euro: "€273",
    grade: "DISPUTE PREPARED",
  },
  {
    id: "credit",
    label: "Credit memo",
    body: "Credit memo CM-44102 issued against INV-88421.",
    euro: "€273",
    grade: "CREDIT MEMO ISSUED",
  },
  {
    id: "verified",
    label: "Verified",
    body: "Matched to original invoice. Value closed in AP.",
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

  const scrollTo = (i: number) => {
    setIdx(i);
    const el = rootRef.current;
    if (!el || reduced) return;
    const total = el.offsetHeight - window.innerHeight * 0.45;
    const y =
      el.getBoundingClientRect().top +
      window.scrollY +
      (i / STAGES.length) * Math.max(1, total) +
      4;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      ref={rootRef}
      className="rx-rso rx-euro-journey"
      style={reduced ? undefined : { minHeight: `${STAGES.length * 58}vh` }}
    >
      <div className="rx-rso-pin">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
        {lead ? <p className="rx-rec-p">{lead}</p> : null}

        <div
          className="rx-euro-chip rx-euro-chip-hero"
          data-sealed={sealed ? "true" : undefined}
          data-stage={stage.id}
          key={stage.id}
        >
          <strong>{stage.euro}</strong>
          <em>{stage.grade}</em>
        </div>

        <div
          className="rx-rso-object"
          data-stage={stage.id}
          data-sealed={sealed ? "true" : undefined}
        >
          <div className="rx-rso-papers" aria-hidden="true">
            <div className="rx-rso-paper" data-kind="invoice">
              <em>INV-88421</em>
              <strong>€7.45/L</strong>
            </div>
            <div className="rx-rso-paper" data-kind="contract">
              <em>CTR-OIL-2026</em>
              <strong>€6.80/L</strong>
            </div>
            {idx >= 3 ? (
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
              onClick={() => scrollTo(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
