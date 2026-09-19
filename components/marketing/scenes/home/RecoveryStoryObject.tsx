"use client";

/**
 * Living €273 recovery — cinematic economic loop.
 * Contract → Invoice → Gap → Decision → Credit → Verified.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const STAGES = [
  {
    id: "contract",
    label: "Contract",
    body: "Agreed rate on file.",
    euro: "€6.80/L",
    grade: "CONTRACT",
  },
  {
    id: "invoice",
    label: "Invoice",
    body: "Billed above contract.",
    euro: "€7.45/L",
    grade: "INVOICE",
  },
  {
    id: "exposed",
    label: "Exposed",
    body: "420 L · the gap opens.",
    euro: "€273",
    grade: "EXPOSED",
  },
  {
    id: "dispute",
    label: "Decision",
    body: "Dispute the variance. Evidence package prepared.",
    euro: "€273",
    grade: "DISPUTE",
  },
  {
    id: "credit",
    label: "Credit memo",
    body: "CM-44102 observed against INV-88421.",
    euro: "€273",
    grade: "CREDIT",
  },
  {
    id: "verified",
    label: "Verified",
    body: "Matched to the original invoice. Loop closed.",
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
      style={reduced ? undefined : { minHeight: "180vh" }}
    >
      <div className="rx-rso-pin">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
        {lead ? <p className="rx-rec-p">{lead}</p> : null}

        <div className="rx-rso-cinema" data-stage={stage.id} data-sealed={sealed ? "true" : undefined}>
          <div className="rx-rso-pair" aria-hidden="true">
            <div className="rx-rso-rate" data-on={idx >= 0 ? "true" : undefined} data-kind="contract">
              <em>Contract</em>
              <strong>€6.80/L</strong>
            </div>
            <div
              className="rx-rso-gap"
              data-open={idx >= 2 ? "true" : undefined}
            >
              <i />
              {idx >= 2 ? <span>€273</span> : null}
            </div>
            <div className="rx-rso-rate" data-on={idx >= 1 ? "true" : undefined} data-kind="invoice">
              <em>Invoice</em>
              <strong>€7.45/L</strong>
            </div>
          </div>

          <div
            className="rx-euro-chip rx-euro-chip-hero"
            data-sealed={sealed ? "true" : undefined}
            data-stage={stage.id}
            key={stage.id}
          >
            <strong>{stage.euro}</strong>
            <em>{stage.grade}</em>
          </div>

          <div className="rx-rso-face">
            <p className="rx-rso-stage">{stage.label}</p>
            <p className="rx-rso-body">{stage.body}</p>
          </div>

          {idx >= 3 ? (
            <p className="rx-rso-resolve" data-done={sealed ? "true" : undefined}>
              {sealed
                ? "€273 verified · matched to INV-88421"
                : idx >= 4
                  ? "Credit memo observed"
                  : "Evidence package prepared"}
            </p>
          ) : null}
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
