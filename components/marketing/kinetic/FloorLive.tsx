"use client";

/**
 * FloorLive — compact embed (home/moment). Full Floor page uses FloorPage chapters.
 */

import { useState } from "react";

type Phase = "now" | "why" | "learn";

export function FloorLive({ compact = false }: { compact?: boolean }) {
  const [phase, setPhase] = useState<Phase>("now");

  return (
    <div className="rx-floor-live" data-compact={compact ? "true" : undefined}>
      {!compact ? (
        <>
          <p className="rx-rec-k">RADR Floor</p>
          <h2 className="rx-rec-h">What this person needs right now.</h2>
        </>
      ) : null}

      <div className="rx-floor-live-toggle" role="tablist" aria-label="Floor chapters">
        {(
          [
            ["now", "Now"],
            ["why", "Why"],
            ["learn", "Learn"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-on={phase === id ? "true" : undefined}
            onClick={() => setPhase(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {phase === "now" ? (
        <div className="rx-floor-companion" aria-label="Now">
          <header className="rx-floor-companion-head">
            <div>
              <em>NOW</em>
              <strong>19:04</strong>
            </div>
            <div>
              <em>Table 12</em>
              <strong>VIP · allergy</strong>
            </div>
            <div data-hot="true">
              <em>Cold</em>
              <strong>92%</strong>
            </div>
          </header>
          <div className="rx-floor-action">
            <em>Guidance</em>
            <strong>MENTION RIBEYE</strong>
          </div>
        </div>
      ) : null}

      {phase === "why" ? (
        <div className="rx-floor-companion" aria-label="Why">
          <div className="rx-floor-causality">
            <span>Reservation</span>
            <i>+</i>
            <span>Kitchen</span>
            <i>+</i>
            <span data-hot>Guest</span>
            <i>+</i>
            <span>Menu</span>
            <i>→</i>
            <strong>Mention Ribeye</strong>
          </div>
        </div>
      ) : null}

      {phase === "learn" ? (
        <div className="rx-floor-companion" data-phase="after" aria-label="Learn">
          <p className="rx-floor-memory-tag">
            Recommendation followed · pattern added to memory
          </p>
        </div>
      ) : null}
    </div>
  );
}
