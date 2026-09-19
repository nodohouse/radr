"use client";

/**
 * Living €273 recovery — one object evolves through the loop.
 * CONTRACT → INVOICE → EXPOSURE → DECISION → CREDIT → VERIFIED.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";

const EUR = `€${CANON_SUPPLIER.exposureEuro.toLocaleString("en-US")}`;

const STAGES = [
  { id: "contract", label: "Contract", line: "€6.80/L", grade: "CONTRACT" },
  { id: "invoice", label: "Invoice", line: "€7.45/L", grade: "INVOICE" },
  { id: "exposed", label: "Difference", line: EUR, grade: "DIFFERENCE" },
  {
    id: "dispute",
    label: "Decision",
    line: "DISPUTE VARIANCE",
    grade: "DECISION",
  },
  {
    id: "credit",
    label: "Action",
    line: "Evidence package prepared",
    grade: "ACTION",
  },
  {
    id: "observed",
    label: "Observed",
    line: `${EUR} credit issued`,
    grade: "OBSERVED",
  },
  {
    id: "verified",
    label: "Verified",
    line: `${EUR} RECOVERED`,
    grade: "VERIFIED VALUE",
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
      style={reduced ? undefined : { minHeight: "160vh" }}
    >
      <div className="rx-rso-pin">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
        {lead ? <p className="rx-rec-p">{lead}</p> : null}

        <div
          className="rx-rso-cinema"
          data-stage={stage.id}
          data-sealed={sealed ? "true" : undefined}
        >
          <ol className="rx-rso-evolve" aria-live="polite">
            {STAGES.map((s, i) => (
              <li key={s.id}>
                <div
                  className="rx-rso-node"
                  data-on={i <= idx ? "true" : undefined}
                  data-active={i === idx ? "true" : undefined}
                  data-kind={s.id}
                  data-sealed={s.id === "verified" && sealed ? "true" : undefined}
                >
                  <em>{s.grade}</em>
                  <strong>{s.line}</strong>
                </div>
                {i < STAGES.length - 1 ? (
                  <span
                    className="rx-rso-vlink"
                    data-on={i < idx ? "true" : undefined}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ol>
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
