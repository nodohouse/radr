"use client";

/**
 * Recover → Prevent → Optimize → Autopilot
 * Quiet conceptual path — not four huge product cards.
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

  return (
    <div className="rx-prog rx-prog-quiet">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      {lead ? <p className="rx-rec-p">{lead}</p> : null}

      <ol className="rx-prog-quiet-list">
        {PROGRESSION.map((step) => (
          <li key={step.stage}>
            <button
              type="button"
              data-on={active === step.stage ? "true" : undefined}
              onClick={() => setActive(step.stage)}
              onMouseEnter={() => setActive(step.stage)}
            >
              <strong>{titles[step.stage]}</strong>
              <span>{bodies[step.stage]}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
