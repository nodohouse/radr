"use client";

import Link from "next/link";
import { HEALTH } from "@/lib/lab/world";
import type { LabDecision, LabWorld } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";

type Props = {
  world: LabWorld;
  decision: LabDecision;
  recent: LabDecision[];
};

export function RightRail({ world, decision, recent }: Props) {
  const degraded = HEALTH.filter((h) => h.status !== "ok");
  return (
    <aside className="lab-aside" aria-label="Decide-by, health, recent">
      <div className="lab-aside-card lab-aside-clock">
        <p className="lab-kicker">Decide by</p>
        <h3>{decision.decideBy ?? decision.clock}</h3>
        <p className="lab-because">{decision.because}</p>
      </div>
      <div className="lab-aside-card">
        <p className="lab-kicker">Active decision</p>
        <h3>
          {decision.displayId} · {decision.title}
        </h3>
        <BecauseMoney euro={decision.euro} grade={decision.grade} because={decision.because} />
      </div>
      <div className="lab-aside-card">
        <p className="lab-kicker">Verified Value</p>
        <BecauseMoney {...world.verifiedBank} />
        <Link className="lab-aside-link" href="/app/lab/value?band=verified">
          Open ledger →
        </Link>
      </div>
      <div className="lab-aside-card">
        <p className="lab-kicker">Recent</p>
        <ul>
          {recent.map((d) => (
            <li key={d.id}>
              <Link href={`/app/lab/decisions/${d.id}`}>
                {d.displayId} · {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="lab-aside-card">
        <p className="lab-kicker">Data health</p>
        <h3>
          {degraded.length} {degraded.length === 1 ? "exception" : "exceptions"}
        </h3>
        <ul>
          {HEALTH.map((h) => (
            <li key={h.id} className="lab-health" data-status={h.status}>
              {h.name} · {h.status} · {h.freshness}
              {h.impact ? <span className="lab-because">{h.impact}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
