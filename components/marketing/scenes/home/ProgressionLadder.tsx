"use client";

/**
 * Recover → Prevent → Optimize → Autopilot
 * One evolving operating state — not four equal cards.
 */

import { useState } from "react";
import { PROGRESSION, type ProgressionStage } from "@/lib/radr/problemFamilies";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  titles: Record<ProgressionStage, string>;
  bodies: Record<ProgressionStage, string>;
};

export function ProgressionLadder({
  kicker,
  title,
  lead,
  titles,
  bodies,
}: Props) {
  const [active, setActive] = useState<ProgressionStage>("RECOVER");
  const idx = PROGRESSION.findIndex((p) => p.stage === active);

  return (
    <div className="rx-prog">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>

      <div className="rx-prog-track" role="tablist" aria-label="Progression">
        {PROGRESSION.map((step, i) => (
          <button
            key={step.stage}
            type="button"
            role="tab"
            aria-selected={active === step.stage}
            data-on={active === step.stage ? "true" : undefined}
            data-past={i < idx ? "true" : undefined}
            className="rx-prog-step"
            onClick={() => setActive(step.stage)}
          >
            <em>{titles[step.stage]}</em>
          </button>
        ))}
      </div>

      <article className="rx-prog-panel" data-stage={active}>
        <h3>{titles[active]}</h3>
        <p>{bodies[active]}</p>
        {active === "AUTOPILOT" ? (
          <div className="rx-prog-trust">
            <div>
              <p className="rx-intel-class-k">Permission</p>
              <ol>
                <li>Suggest</li>
                <li>Stage</li>
                <li>Auto within policy</li>
              </ol>
            </div>
            <div>
              <p className="rx-intel-class-k">Lifecycle</p>
              <ol>
                <li>Executed</li>
                <li>Observed</li>
                <li>Verified</li>
              </ol>
            </div>
          </div>
        ) : null}
      </article>
    </div>
  );
}
