"use client";

/**
 * Pattern capability strip — you don't teach RADR what to look for.
 */

import { PATTERN_STRIP } from "@/lib/marketing/economicRail";
import { EconomicRail } from "./EconomicRail";

const PATH = ["Signal", "Evidence", "Decision", "Verification"] as const;

type Props = {
  kicker: string;
  title: string;
  lead: string;
  flow: string;
  diff: string;
  close: string;
};

export function PatternCapabilityStrip({
  kicker,
  title,
  lead,
  flow,
  diff,
  close,
}: Props) {
  const items = PATTERN_STRIP.map((label, i) => ({
    id: `pat-${i}`,
    euro: "·",
    label,
    tone: "neutral" as const,
    detail: PATH.join(" → "),
  }));

  return (
    <div className="rx-pat">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-path">{flow}</p>
      <p className="rx-rec-p">{lead}</p>
      <p className="rx-rec-diff">{diff}</p>

      <div className="rx-pat-rail-wrap">
        <EconomicRail
          items={items}
          durationSec={56}
          variant="compact"
          ariaLabel="Economic patterns RADR already understands"
        />
      </div>

      <div className="rx-pat-path" aria-hidden="true">
        {PATH.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
      <p className="rx-rec-p">{close}</p>
    </div>
  );
}
