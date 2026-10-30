"use client";

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { FloorOptimizationPlan } from "@/lib/radr/service/types";

type Props = {
  plan: FloorOptimizationPlan;
  compareOpen: boolean;
  onCompare: () => void;
  onCloseCompare: () => void;
};

export function FloorOptimizerPanel({
  plan,
  compareOpen,
  onCompare,
  onCloseCompare,
}: Props) {
  if (!plan.improved) {
    return (
      <aside className="rp-fopt" data-result="none" aria-label="Floor optimizer">
        <p className="rp-svc-kicker">Whole-floor optimization</p>
        <h2>No floor change</h2>
        <p>{plan.noChangeReason ?? "Current configuration is preferred."}</p>
        <dl className="rp-fopt-pressure">
          <div>
            <dt>Kitchen</dt>
            <dd>{plan.kitchenCurrentPct}%</dd>
          </div>
          <div>
            <dt>Protected unchanged</dt>
            <dd>{plan.protectedUnchanged}</dd>
          </div>
        </dl>
      </aside>
    );
  }

  return (
    <>
      <aside className="rp-fopt" data-result="better" aria-label="Floor optimizer">
        <p className="rp-svc-kicker">Whole-floor optimization</p>
        <h2>{plan.summary}</h2>
        <ul className="rp-fopt-results">
          <li>
            <strong>+{plan.deltaCovers}</strong>
            <span>covers</span>
          </li>
          <li data-tone="value">
            <strong>{formatDecisionMoney(plan.expectedContributionEuro)}</strong>
            <span>expected contribution</span>
          </li>
          <li>
            <strong className="rp-fopt-flow">
              <b>{plan.kitchenCurrentPct}%</b>
              <i aria-hidden="true">→</i>
              <b>{plan.kitchenOptimizedPct}%</b>
            </strong>
            <span>kitchen peak</span>
          </li>
          <li>
            <strong>{plan.guestDisruption}</strong>
            <span>guest disruption</span>
          </li>
          <li>
            <strong>{plan.moveCount}</strong>
            <span>booking moves</span>
          </li>
          <li>
            <strong>{plan.protectedUnchanged}</strong>
            <span>protected unchanged</span>
          </li>
        </ul>
        <button type="button" className="rp-svc-cta" onClick={onCompare}>
          Compare floor →
        </button>
      </aside>

      {compareOpen ? (
        <div className="rp-fopt-compare" role="dialog" aria-label="Floor comparison">
          <header>
            <h3>Current vs RADR optimized</h3>
            <button type="button" onClick={onCloseCompare}>
              Close
            </button>
          </header>
          <ul className="rp-fopt-compare-delta" aria-label="Expected lift">
            <li>
              <strong>+{plan.deltaCovers}</strong>
              <span>covers</span>
            </li>
            <li data-tone="value">
              <strong>{formatDecisionMoney(plan.expectedContributionEuro)}</strong>
              <span>contribution</span>
            </li>
            <li>
              <strong className="rp-fopt-flow">
                <b>{plan.kitchenCurrentPct}%</b>
                <i aria-hidden="true">→</i>
                <b>{plan.kitchenOptimizedPct}%</b>
              </strong>
              <span>kitchen peak</span>
            </li>
          </ul>
          <div className="rp-fopt-cols">
            <section>
              <h4>Current</h4>
              <ul>
                {plan.moves.map((m) => (
                  <li key={`cur-${m.reservationId}`}>
                    <strong>{m.partyLabel}</strong>
                    <span>
                      {m.fromTableIds.map((t) => t.replace(/^t/i, "T")).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section data-plan="true">
              <h4>RADR optimized</h4>
              <ul>
                {plan.moves.map((m) => (
                  <li key={`plan-${m.reservationId}`} data-changed="true">
                    <strong>{m.partyLabel}</strong>
                    <span>
                      {m.fromTableIds.map((t) => t.replace(/^t/i, "T")).join(" · ")}{" "}
                      → {m.toTableIds.map((t) => t.replace(/^t/i, "T")).join(" · ")}
                    </span>
                    <em>{m.reason}</em>
                  </li>
                ))}
              </ul>
              <p className="rp-fopt-effect">
                T10 opens 19:30–21:00 · 4-cover capacity recovered for waiting
                demand.
              </p>
            </section>
          </div>
          <footer>
            <span>Guest · {plan.guestDisruption} disruption</span>
            <span>{plan.moveCount} booking moves · {plan.protectedUnchanged} protected</span>
          </footer>
        </div>
      ) : null}
    </>
  );
}
