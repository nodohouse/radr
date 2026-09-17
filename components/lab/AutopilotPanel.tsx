"use client";

import { AUTOPILOT_LEVELS } from "@/lib/lab/autopilot";
import { formatEuro } from "@/lib/lab/format";
import type { DecisionHero } from "@/lib/lab/types";

type Props = {
  hero: DecisionHero;
  approved: boolean;
};

export function AutopilotPanel({ hero, approved }: Props) {
  const { autopilot } = hero;
  return (
    <div className="lab-auto" data-level={autopilot.level} data-approved={approved || undefined}>
      <p className="lab-k">Autopilot · progressive trust</p>
      <ol className="lab-auto-levels" aria-label="Autopilot level">
        {AUTOPILOT_LEVELS.map((lvl) => (
          <li key={lvl.level} data-on={autopilot.level === lvl.level ? "true" : undefined}>
            <em>{lvl.level}</em>
            <span>{lvl.label}</span>
          </li>
        ))}
      </ol>
      <p className="lab-auto-memory">{autopilot.memoryLine}</p>
      <div className="lab-auto-split">
        <div>
          <p className="lab-auto-h">RADR will…</p>
          <ul>
            {autopilot.radrWill.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="lab-auto-h">Needs you</p>
          <ul>
            {autopilot.needsYou.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lab-auto-policy">
        <span className="lab-chip" data-ok>
          Can auto · {autopilot.canAuto[0]}
        </span>
        <span className="lab-chip" data-ask>
          Always ask · {autopilot.alwaysAsk[0]}
        </span>
      </div>
      {approved ? (
        <div className="lab-auto-receipt">
          <p className="lab-k">Execution receipt</p>
          <p className="lab-auto-receipt-lead">
            Staged only — not written to systems of record. {formatEuro(hero.euro)} stays{" "}
            <strong>Expected</strong>.
          </p>
          <ol className="lab-auto-path">
            <li data-on="true">Staged</li>
            <li>Observed</li>
            <li>Verified</li>
          </ol>
          <ul className="lab-auto-actions">
            {hero.actions.map((a) => (
              <li key={a.title}>
                <em>{a.system}</em>
                <strong>{a.title}</strong>
                <span>
                  {a.detail} · {a.policy === "demo" ? "demo/policy" : a.policy === "auto" ? "policy auto" : "needs you"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
