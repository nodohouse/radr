"use client";

import { memo } from "react";
import { BEAM_PERIOD_MS } from "@/lib/radr/deltaFieldData";

/**
 * Narrow scanning light: single CSS compositor layer.
 * One conic-gradient (leading edge + trailing wake). No blur stacks.
 * Hit detection uses the same BEAM_PERIOD_MS / BEAM_START_DEG clock.
 */
function RadarBeamImpl({ reduced = false }: { reduced?: boolean }) {
  return (
    <div
      className="rx-beam-wrap"
      aria-hidden="true"
      data-static={reduced ? "true" : "false"}
      style={{
        left: "var(--radar-origin-x)",
        top: "var(--radar-origin-y)",
        animationDuration: `${BEAM_PERIOD_MS}ms`,
      }}
    >
      <div className="rx-beam-sweep" />
    </div>
  );
}

export const RadarBeam = memo(RadarBeamImpl);
