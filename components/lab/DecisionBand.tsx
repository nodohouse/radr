"use client";

import { AUTOPILOT_LEVELS, labEuro } from "@/lib/lab/format";
import type { AutopilotLevelId, LabDecision } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";
import type { Receipt } from "./LabProvider";

const LEVELS: AutopilotLevelId[] = ["suggest", "stage", "auto", "verified"];

type Props = {
  decision: LabDecision;
  selectedFuture: string;
  onFuture: (id: string) => void;
  receipt: Receipt | null;
  onStage: () => void;
  onApprove: () => void;
};

export function DecisionBand({
  decision,
  selectedFuture,
  onFuture,
  receipt,
  onStage,
  onApprove,
}: Props) {
  const interrupt = Boolean(decision.policy.interruptReason);
  const needsYou = decision.status === "needs_you" || interrupt;
  const active = AUTOPILOT_LEVELS[decision.autopilot];

  return (
    <section className="lab-band lab-band-sand" aria-labelledby="decision-title">
      <div className="lab-decision-grid">
        <div className="lab-hero">
          <p className="lab-kicker">
            {needsYou ? "Needs you" : "RADR will…"} · {decision.wedge}
          </p>
          <p className="lab-hero-id">{decision.displayId}</p>
          <h2 id="decision-title">{decision.title}</h2>
          <p className="lab-hero-sub">{decision.sub}</p>
          <div className="lab-hero-row">
            <BecauseMoney
              euro={decision.euro}
              grade={decision.grade}
              because={decision.because}
              lineage={decision.lineage}
              demo={decision.demo}
            />
            <p className="lab-clock">{decision.clock}</p>
          </div>

          <div className="lab-auto">
            <div className="lab-auto-levels" aria-label="Autopilot level">
              {LEVELS.map((id) => {
                const meta = AUTOPILOT_LEVELS[id];
                return (
                  <span key={id} className="lab-auto-step" data-on={decision.autopilot === id}>
                    {meta.n} {meta.name}
                  </span>
                );
              })}
            </div>
            <p className="lab-h" style={{ fontSize: "1.02rem" }}>
              {needsYou ? "Needs you" : "RADR will…"} · {active.short}
            </p>
            <p className="lab-because">{decision.policy.memoryLine}</p>
            {decision.policy.interruptReason ? (
              <p className="lab-because">{decision.policy.interruptReason}</p>
            ) : (
              <p className="lab-because">Interrupt only for exceptions, first-time patterns, or high €.</p>
            )}
            <div className="lab-policy">
              {decision.policy.canAuto.map((x) => (
                <span key={x} className="lab-chip" data-kind="auto">
                  Auto · {x}
                </span>
              ))}
              {decision.policy.alwaysAsk.map((x) => (
                <span key={x} className="lab-chip" data-kind="ask">
                  Always-ask · {x}
                </span>
              ))}
            </div>
          </div>

          <div className="lab-actions">
            <button type="button" className="lab-btn" onClick={onStage}>
              Confirm prepare
            </button>
            <button type="button" className="lab-btn lab-btn-primary" onClick={onApprove}>
              {decision.autopilot === "auto" ? "Let RADR run policy" : "Approve"}
            </button>
          </div>

          {receipt && receipt.decisionId === decision.id ? (
            <div className="lab-receipt">
              <p className="lab-kicker" style={{ color: "#067a42" }}>
                Execution receipt
              </p>
              <p>
                <strong>{AUTOPILOT_LEVELS[receipt.level].name}</strong> · {receipt.note}
              </p>
              <p>Path: Observed → Verified. Demo actuators labeled — money stays Expected until lineage.</p>
            </div>
          ) : null}

          <ul style={{ margin: "1rem 0 0", padding: 0, listStyle: "none" }}>
            {decision.actuators.map((a) => (
              <li key={a.title} className="lab-brief-item">
                <p className="lab-kicker">
                  {a.system} · {a.policy === "demo" ? "demo / policy" : a.policy === "auto" ? "policy auto" : "confirm"}
                </p>
                <p style={{ margin: "0.15rem 0 0", fontWeight: 700 }}>{a.title}</p>
                <p className="lab-because">{a.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lab-futures">
          <p className="lab-kicker">Futures</p>
          <p className="lab-h" style={{ fontSize: "1.15rem", marginBottom: "0.7rem" }}>
            Three options. One Decision.
          </p>
          {decision.futures.map((f) => (
            <button
              key={f.id}
              type="button"
              className="lab-future"
              data-on={selectedFuture === f.id}
              onClick={() => onFuture(f.id)}
            >
              <div className="lab-future-t">
                <span>
                  {f.title}
                  {f.recommended ? " · REC" : ""}
                </span>
                <span className="lab-euro" data-grade="Expected">
                  {f.euroLabel ?? (f.euro == null ? "—" : labEuro(f.euro))}
                </span>
              </div>
              <p className="lab-future-n">{f.note}</p>
            </button>
          ))}
        </aside>
      </div>
    </section>
  );
}
