"use client";

import { formatEuro } from "@/lib/lab/format";
import { pinsFor } from "@/lib/lab/modules";
import { HEALTH } from "@/lib/lab/roles";
import { VERIFIED_TOTAL } from "@/lib/lab/value";
import { useLab } from "@/lib/lab/store";

export function RightRail() {
  const { hero, state, nav, goValue, togglePin } = useLab();
  const recent = pinsFor(nav.pinnedIds).slice(0, 3);
  const issues = HEALTH[state.seed];

  return (
    <aside className="lab-aside" aria-label="Decide-by, health, recent">
      <div className="lab-aside-card lab-aside-clock">
        <em>Decide by</em>
        <strong>{hero.deadlineLabel}</strong>
        <span>{hero.clockLabel}</span>
      </div>
      <div className="lab-aside-card">
        <em>Verified Value</em>
        <strong className="lab-aside-verified">{formatEuro(VERIFIED_TOTAL)}</strong>
        <p className="lab-aside-because">because ledger-matched · Trace sealed</p>
        <button type="button" className="lab-aside-link" onClick={() => goValue("verified")}>
          Open ledger
        </button>
      </div>
      <div className="lab-aside-card">
        <em>Active decision</em>
        <strong>{hero.displayId}</strong>
        <p>
          {formatEuro(hero.euro)} · {hero.grade}
        </p>
        <p className="lab-aside-because">because {hero.because}</p>
        <div className="lab-aside-pins">
          {recent.map((m) => (
            <button key={m.id} type="button" className="lab-aside-unpin" onClick={() => togglePin(m.id)} title="Unpin">
              {m.displayId}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-aside-card">
        <em>Data health</em>
        <p className="lab-aside-health">1 degraded · 1 stale</p>
        <p className="lab-aside-health-note">
          {issues[0]?.detail} € claim grade unchanged — still Expected until verified.
        </p>
      </div>
    </aside>
  );
}
