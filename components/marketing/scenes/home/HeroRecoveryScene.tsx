"use client";

/**
 * Hero product moment — D-4102 as a financial instrument.
 * Large euro + restrained provenance. Green only on sealed VERIFIED.
 */

import { useEffect, useState } from "react";
import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { EvidenceProvenance } from "@/components/marketing/primitives/EvidenceProvenance";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import "@/app/radr-public.css";

const EUR = euro(ECON_D4102.verified);

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
      className="rx-fin"
      data-sealed={sealed ? "true" : undefined}
      aria-label={`Verified recovery ${ECON_D4102.displayId}`}
    >
      <header>
        <p className="rx-fin-eye">
          Verified recovery · {ECON_D4102.displayId}
        </p>
        <p className="rx-fin-place">Berlin Mitte · Supplier / AP</p>
        <div style={{ marginTop: "0.65rem" }}>
          <VerifiedStamp verified={sealed} label="Verified recovered" />
        </div>
      </header>

      <div className="rx-fin-hero">
        <strong>{EUR}</strong>
        <em>{sealed ? "Verified recovered" : "Contract variance"}</em>
      </div>

      <EvidenceProvenance
        steps={[
          { label: "Contract", value: "€6.80" },
          { label: "Invoice", value: "€7.45" },
          { label: "Credit", value: EUR },
          { label: "Verified", value: EUR, verified: sealed },
        ]}
      />

      <ol className="rx-fin-ladder" aria-hidden="true">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            data-on={i <= active ? "true" : undefined}
            data-active={i === active ? "true" : undefined}
            data-seal={s.id === "verified" && sealed ? "true" : undefined}
          >
            <em>{s.kicker}</em>
            <strong>{s.value}</strong>
          </li>
        ))}
      </ol>

      <a href="#verified-recovery" className="rx-fin-cta">
        {sealed ? "Open verified recovery" : "See a verified recovery"}{" "}
        <span aria-hidden="true">→</span>
      </a>
      <p className="rx-fin-note">Illustrative demo · not customer results</p>
    </aside>
  );
}
