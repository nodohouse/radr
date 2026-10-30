"use client";

/**
 * RADR loop — Observe → Learn (public compression).
 * One idea per viewport. Concrete stage lines. No abstract AI copy.
 */

import { PUBLIC_LOOP } from "@/lib/marketing/publicCanon";

const STAGE_BODIES: Record<(typeof PUBLIC_LOOP)[number]["id"], string> = {
  observe: "Connected systems and operational evidence.",
  understand: "What matters · why · with confidence.",
  decide: "Compare futures · expected outcomes · approval.",
  act: "Prepare, approve, execute within policy.",
  verify: "Expected ≠ Observed ≠ Verified — with evidence.",
  learn: "Calibration, patterns, and playbooks after enough evidence.",
};

const STAGES = PUBLIC_LOOP.map((s) => ({
  id: s.id,
  label: s.label,
  body: STAGE_BODIES[s.id],
}));

export function RadrLoopStrip() {
  return (
    <section
      className="rx-loop"
      data-nav-theme="light"
      aria-labelledby="rx-loop-title"
    >
      <div className="rx-shell">
        <p className="rx-rec-k">System of Decision Record</p>
        <h2 id="rx-loop-title" className="rx-rec-h">
          How RADR works.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "34rem" }}>
          Connect what the operation already knows. Decide what deserves
          intervention. Prove the result. Remember what worked.
        </p>

        <ol className="rx-loop-track" aria-label="RADR loop">
          {STAGES.map((s, i) => (
            <li key={s.id} className="rx-loop-stage">
              <em aria-hidden="true">{String(i + 1).padStart(2, "0")}</em>
              <strong>{s.label}</strong>
              <span>{s.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
