"use client";

/**
 * Hero product moment — complete D-4102 micro-recovery.
 * ROI-first vertical ladder. Reduced-motion shows sealed state.
 */

import { useEffect, useState } from "react";
import { CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const VARIANCE = CANON_SUPPLIER.exposureEuro;
const EUR = `€${VARIANCE.toLocaleString("en-US")}`;

const STEPS = [
  { id: "contract", kicker: "Contract", value: "€6.80 / L" },
  { id: "invoice", kicker: "Invoice", value: "€7.45 / L" },
  { id: "variance", kicker: "Variance found", value: EUR },
  { id: "decision", kicker: "Decision", value: "Dispute variance" },
  { id: "credit", kicker: "Credit applied", value: EUR },
  { id: "verified", kicker: "Verified Value", value: `${EUR} recovered` },
] as const;

const STEP_MS = 850;
const HOLD_MS = 2800;
const LAST = STEPS.length - 1;

export function HeroRecoveryScene() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(reduced ? LAST : 0);

  useEffect(() => {
    if (reduced) {
      setActive(LAST);
      return;
    }

    let step = 0;
    let timer = 0;
    setActive(0);

    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(fn, ms);
    };

    const advance = () => {
      if (step < LAST) {
        step += 1;
        setActive(step);
        schedule(advance, step === LAST ? HOLD_MS : STEP_MS);
        return;
      }
      step = 0;
      setActive(0);
      schedule(advance, STEP_MS);
    };

    schedule(advance, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  const sealed = active >= LAST;

  return (
    <aside
      className="rx-hvr"
      data-sealed={sealed ? "true" : undefined}
      aria-label={`Verified recovery ${CANON_SUPPLIER.displayId}`}
    >
      <header className="rx-hvr-head">
        <p className="rx-hvr-eye">
          Verified recovery · {CANON_SUPPLIER.displayId}
        </p>
        <p className="rx-hvr-place">
          {CANON_SUPPLIER.property} · Supplier / AP
        </p>
      </header>

      <ol className="rx-hvr-ladder">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            data-on={i <= active ? "true" : undefined}
            data-active={i === active ? "true" : undefined}
            data-seal={s.id === "verified" && sealed ? "true" : undefined}
          >
            <em>{s.kicker}</em>
            <strong>{s.value}</strong>
            {i < LAST ? (
              <span className="rx-hvr-arrow" aria-hidden="true">
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <a href="#verified-recovery" className="rx-hvr-cta">
        {sealed ? "Open verified recovery" : "See a verified recovery"}{" "}
        <span aria-hidden="true">→</span>
      </a>
      <p className="rx-hvr-note">Illustrative demo · not customer results</p>
    </aside>
  );
}
