"use client";

/**
 * CommandLens — Control Center as one spatial command surface.
 * LEFT: operating story · RIGHT: human handoff · not a card stack.
 */

import Link from "next/link";
import type { ExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import type { ContributionBridge } from "@/lib/radr/finance/contributionBridge";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import { MetricDelta } from "@/components/product/ui/MetricDelta";
import { OperatingField } from "./OperatingField";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";

type Props = {
  brief: ExecutiveBrief;
  bridge: ContributionBridge;
  needsYou: NeedsYouRow[];
  emptyNeedsYou: boolean;
  reviewed: number;
  handled: number;
  needJudgment: number;
  systemLine: string;
  onSelectDecision: (id: string) => void;
  onOpenSystemProof?: () => void;
};

export function CommandLens({
  brief,
  bridge,
  needsYou,
  emptyNeedsYou,
  reviewed,
  handled,
  needJudgment,
  onSelectDecision,
  onOpenSystemProof,
}: Props) {
  const revDelta = parseFloat(
    brief.revenueDeltaLabel.replace(/[^0-9.+-]/g, ""),
  );
  const contribNeg =
    brief.contributionDeltaLabel.includes("−") ||
    brief.contributionDeltaLabel.trim().startsWith("-");
  const contribAbs = parseFloat(
    brief.contributionDeltaLabel.replace(/[^0-9.]/g, ""),
  );
  const shown = needsYou.slice(0, 2);
  const n = needsYou.length;

  return (
    <section className="rp-cmd-surface" aria-label="Command surface">
      <div className="rp-cmd-stage">
        <header className="rp-cmd-stage-head">
          <h1 className="rp-cmd-situation">{brief.headline}</h1>
          <div className="rp-cmd-situation-metrics">
            <div>
              <MetricDelta
                value={brief.revenueDeltaLabel}
                deltaSigned={Number.isFinite(revDelta) ? revDelta : 3.1}
                higherIsBetter
                size="hero"
              />
              <span>Revenue</span>
            </div>
            <div>
              <MetricDelta
                value={brief.contributionDeltaLabel}
                deltaSigned={
                  Number.isFinite(contribAbs)
                    ? contribNeg
                      ? -contribAbs
                      : contribAbs
                    : -4780
                }
                higherIsBetter
                size="hero"
              />
              <span>Contribution</span>
            </div>
          </div>
        </header>

        <OperatingField
          bridge={bridge}
          decisionMarker={{
            id: DECISION_IDS.peak,
            label: displayDecisionId(DECISION_IDS.peak),
            at: "NOW",
          }}
        />

        <button
          type="button"
          className="rp-cmd-awareness"
          onClick={onOpenSystemProof}
          aria-label="System awareness"
        >
          <span>
            <strong>{reviewed}</strong>
            reviewed
          </span>
          <span>
            <strong>{handled}</strong>
            handled
          </span>
          <span data-need={needJudgment > 0 ? "true" : undefined}>
            <strong>{String(needJudgment).padStart(2, "0")}</strong>
            need judgment
          </span>
        </button>
      </div>

      <aside className="rp-cmd-handoff-zone" aria-label="Human handoff">
        <p className="rp-cmd-handoff-k">System handoff</p>
        {emptyNeedsYou || n === 0 ? (
          <div className="rp-cmd-handoff-calm">
            <p className="rp-cmd-handoff-count">
              <strong>00</strong>
              need you
            </p>
            <p className="rp-cmd-handoff-calm-copy">Everything within range.</p>
          </div>
        ) : (
          <>
            <p className="rp-cmd-handoff-count">
              <strong>{String(n).padStart(2, "0")}</strong>
              need you
            </p>
            <ul className="rp-cmd-handoff-list">
              {shown.map((r) => {
                const urgent = /wait|min|urgent|now/i.test(
                  `${r.deadlineLabel ?? ""} ${r.recommendation}`,
                );
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="rp-cmd-handoff-card"
                      data-urgent={urgent ? "true" : undefined}
                      onClick={() => onSelectDecision(r.id)}
                    >
                      <p className="rp-cmd-handoff-verb">{r.recommendation}</p>
                      <p className="rp-cmd-handoff-where">{r.locationLabel}</p>
                      <div className="rp-cmd-handoff-econ">
                        <MetricDelta
                          value={r.economicFormatted}
                          deltaSigned={1}
                          higherIsBetter
                          size="primary"
                          semantic="positive"
                        />
                        {r.deadlineLabel ? <em>{r.deadlineLabel}</em> : null}
                      </div>
                      <span className="rp-cmd-handoff-cta">
                        {urgent ? "Compare futures" : "Review"} →
                      </span>
                    </button>
                    <Link
                      href={`/app/decisions/${r.id}`}
                      className="rp-cmd-handoff-open"
                      aria-label={`Open ${r.displayId}`}
                    >
                      →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>
    </section>
  );
}
