"use client";

import {
  RADR_LOOP_LABELS,
  RADR_LOOP_STAGES,
  loopStageIndexFromFinding,
  loopStageStates,
  type LoopStageState,
} from "@/lib/radr/loop";
import type { Finding } from "@/lib/radr/domain";
import { TextSep } from "@/components/TextSep";

/**
 * Restrained Finding lifecycle rail - THE RADR LOOP stages.
 * Not a delivery tracker. Highlights current stage only.
 */
export function RadrLoopRail({ finding }: { finding: Finding }) {
  const current = loopStageIndexFromFinding(finding);
  const states = loopStageStates(current);

  return (
    <div className="rp-loop-rail" aria-label="RADR Loop stage">
      <p className="rp-loop-rail-label">RADR Loop</p>
      <ol className="rp-loop-rail-list">
        {RADR_LOOP_STAGES.map((stage) => {
          const state: LoopStageState = states[stage];
          return (
            <li key={stage} data-state={state}>
              <span>{RADR_LOOP_LABELS[stage]}</span>
              <TextSep srOnly>: </TextSep>
              <em>
                {state === "complete"
                  ? "complete"
                  : state === "current"
                    ? "current"
                    : "pending"}
              </em>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
