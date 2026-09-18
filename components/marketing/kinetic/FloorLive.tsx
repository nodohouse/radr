"use client";

/**
 * FloorLive — live service companion.
 * Guest + pressure + economics + capacity → recommendation → learning.
 * Not a POS. Not recommendation cards without context.
 */

import { useState } from "react";
import {
  DEFAULT_ROLE_CARDS,
  RoleProjection,
  type RoleId,
} from "./RoleProjection";

type Phase = "now" | "after";

export function FloorLive({ compact = false }: { compact?: boolean }) {
  const [phase, setPhase] = useState<Phase>("now");
  const [role, setRole] = useState<RoleId>("foh");

  return (
    <div className="rx-floor-live" data-compact={compact ? "true" : undefined}>
      {!compact ? (
        <>
          <p className="rx-rec-k">RADR Floor</p>
          <h2 className="rx-rec-h">The Decision layer reaches the floor.</h2>
          <p className="rx-rec-p rx-rec-muted">
            Context for FOH — without replacing the POS.
          </p>
        </>
      ) : null}

      <div className="rx-floor-live-toggle" role="tablist" aria-label="Service state">
        <button
          type="button"
          role="tab"
          data-on={phase === "now" ? "true" : undefined}
          onClick={() => setPhase("now")}
        >
          Now
        </button>
        <button
          type="button"
          role="tab"
          data-on={phase === "after" ? "true" : undefined}
          onClick={() => setPhase("after")}
        >
          After service
        </button>
      </div>

      {phase === "now" ? <LiveNow /> : <LiveAfter />}

      <RoleProjection
        cards={DEFAULT_ROLE_CARDS}
        active={role}
        onSelect={setRole}
      />

      <p className="rx-pilot-note">
        POS remains system of execution for orders and payments. RADR Floor:
        context · guidance · brief · exception · recommendation · learning.
      </p>
    </div>
  );
}

function LiveNow() {
  return (
    <div className="rx-floor-companion" aria-label="Live service state">
      <header className="rx-floor-companion-head">
        <div>
          <em>NOW</em>
          <strong>19:04</strong>
        </div>
        <div>
          <em>Berlin Mitte</em>
          <strong>Dinner service</strong>
        </div>
        <div data-hot="true">
          <em>Cold station</em>
          <strong>92%</strong>
        </div>
      </header>

      <div className="rx-floor-companion-table">
        <em>Table 12</em>
        <strong>VIP · nut allergy</strong>
        <span>Last visit: Ribeye + Malbec</span>
      </div>

      <div className="rx-floor-causality" aria-label="Why this recommendation">
        <span>Nut allergy</span>
        <i>+</i>
        <span data-hot>Cold 92%</span>
        <i>+</i>
        <span>Last: Ribeye</span>
        <i>+</i>
        <span>Lower station load</span>
        <i>→</i>
        <strong>Mention Ribeye</strong>
      </div>

      <div className="rx-floor-foh-compare">
        <div>
          <em>Current lean</em>
          <strong>Tuna Tataki</strong>
          <em>€14.20 · 11m constrained prep</em>
        </div>
        <span>RADR</span>
        <div data-rec="true">
          <em>Recommend</em>
          <strong>Ribeye</strong>
          <em>Guest match · lower constrained load</em>
        </div>
      </div>

      <div className="rx-floor-action">
        <em>Action</em>
        <strong>MENTION RIBEYE</strong>
      </div>
    </div>
  );
}

function LiveAfter() {
  return (
    <div className="rx-floor-companion" data-phase="after" aria-label="After service">
      <header className="rx-floor-companion-head">
        <div data-hot="true">
          <em>Outcome</em>
          <strong>Recommendation followed</strong>
        </div>
        <div>
          <em>Table 12</em>
          <strong>Ribeye ordered</strong>
        </div>
      </header>

      <ul className="rx-floor-loop-metrics">
        <li>
          <em>Basket contribution</em>
          <strong>Improved</strong>
        </li>
        <li>
          <em>Kitchen pressure</em>
          <strong>No material increase</strong>
        </li>
        <li>
          <em>Guest substitution</em>
          <strong>Successful</strong>
        </li>
        <li>
          <em>Turn time</em>
          <strong>Within expectation</strong>
        </li>
      </ul>

      <p className="rx-floor-memory-tag">Pattern added to Operating Memory</p>
    </div>
  );
}
