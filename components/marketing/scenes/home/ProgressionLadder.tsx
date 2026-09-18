"use client";

/**
 * Recover → Prevent → Optimize → Autopilot
 * One evolving scene — same leak object transforms.
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

      <div className="rx-prog-scene" data-stage={active} aria-hidden="true">
        <div className="rx-prog-scene-obj">
          <span>
            {active === "RECOVER"
              ? "Leak · €273 exposed"
              : active === "PREVENT"
                ? "Same pattern · caught earlier"
                : active === "OPTIMIZE"
                  ? "Compare responses"
                  : "Trusted response · within policy"}
          </span>
          <div className="rx-euro-chip" data-sealed={active === "AUTOPILOT" ? "true" : undefined}>
            <strong>€273</strong>
            <em>{active === "AUTOPILOT" ? "auto" : "in play"}</em>
          </div>
        </div>
        <div className="rx-prog-forks">
          <i />
          <i data-rec="true" />
          <i />
        </div>
        <div className="rx-prog-auto">
          <span data-on={active === "AUTOPILOT" ? undefined : "true"}>Suggest</span>
          <span data-on="true">Stage</span>
          <span data-on={active === "AUTOPILOT" ? "true" : undefined}>
            Auto within policy
          </span>
        </div>
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
