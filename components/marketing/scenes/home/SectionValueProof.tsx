"use client";

import { useEffect, useState } from "react";
import { useRadrReveal } from "@/components/marketing/motion/useRadrReveal";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

const STEPS = [
  { id: "id", label: "Identified", value: "€14.2K" },
  { id: "act", label: "Actionable", value: "€9.7K" },
  { id: "obs", label: "Observed", value: "€8.2K" },
  { id: "ver", label: "Verified", value: "€7.86K", verified: true },
] as const;

const KINDS = [
  { id: "protected", label: "Protected", value: "€4.2K" },
  { id: "recovered", label: "Recovered", value: "€1.1K" },
  { id: "created", label: "Created", value: "€1.8K" },
  { id: "avoided", label: "Avoided", value: "€0.76K" },
] as const;

/**
 * How RADR proves value — illustrative until real customers exist.
 * Never fabricate case-study logos or outcomes.
 */
export function SectionValueProof() {
  const { ref, active } = useRadrReveal<HTMLElement>();
  const reduced = useReducedMotionSafe();
  const [step, setStep] = useState(reduced ? STEPS.length - 1 : -1);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setStep(STEPS.length - 1);
      return;
    }
    setStep(0);
    const timers = STEPS.map((_, i) =>
      window.setTimeout(() => setStep(i), i * 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [active, reduced]);

  return (
    <section
      ref={ref}
      className="rx-proof"
      data-nav-theme="light"
      aria-label="How RADR proves value"
    >
      <div className="rx-proof-shell">
        <p className="rx-proof-kicker">Proof · Illustrative</p>
        <h2 className="rx-proof-title">How RADR proves value</h2>
        <p className="rx-proof-note">
          Until live customer outcomes exist, RADR shows Decision quality —
          not fabricated case studies. This portfolio is illustrative product
          data from the demo Decision Record.
        </p>

        <div className="rx-proof-flow" aria-live="polite">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="rx-proof-step"
              data-on={step >= i ? "true" : undefined}
              data-verified={"verified" in s && s.verified ? "true" : undefined}
            >
              <em>{s.label}</em>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>

        <div className="rx-proof-kinds">
          {KINDS.map((k) => (
            <div key={k.id} className="rx-proof-kind">
              <em>{k.label}</em>
              <strong>{k.value}</strong>
            </div>
          ))}
        </div>

        <p className="rx-proof-honesty">
          RADR only calls value Verified after reality — expected → observed →
          attributed → verified. Never combine exposure with verified euros.
        </p>
      </div>
    </section>
  );
}
