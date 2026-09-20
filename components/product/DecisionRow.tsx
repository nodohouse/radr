"use client";

import { WhyLine } from "@/components/product/WhyLine";
import type { DecisionObject } from "@/lib/radr/decision/types";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";

type Props = {
  decision?: DecisionObject;
  category?: string;
  title: string;
  context?: string;
  /** Short causal reason this is on the list. */
  why?: string;
  recommendation?: string;
  amount?: string;
  stakeLabel?: string;
  positive?: boolean;
  /** Cost of doing nothing */
  noActionLine?: string;
  deadline?: string;
  confidenceLabel?: string;
  onReview?: () => void;
  reviewLabel?: string;
  secondary?: React.ReactNode;
};

/**
 * Open decision row — WHAT / SO WHAT / NOW WHAT / money / review.
 * Deadline + do-nothing stay visible; confidence stays quiet.
 */
export function DecisionRow({
  decision,
  category,
  title,
  context,
  why,
  recommendation,
  amount,
  stakeLabel,
  positive,
  noActionLine,
  deadline,
  confidenceLabel,
  onReview,
  reviewLabel = "Review",
  secondary,
}: Props) {
  const cat = category ?? decision?.territory;
  const tit = decision?.situation ?? title;
  const ctx = decision?.context ?? context;
  const whyLine = decision?.whyMatters ?? why;
  const rec = decision?.recommendation ?? recommendation;
  const amt =
    amount ??
    (decision ? formatFindingEuro(decision.impactAmount) : undefined);
  const stake = stakeLabel ?? decision?.impactLabel;
  const pos = positive ?? decision?.impactPositive;
  const noAct =
    noActionLine ??
    (decision
      ? `Do nothing · ${formatFindingEuro(decision.noAction.expectedCostEuro)}`
      : undefined);
  const dead = deadline ?? decision?.decisionDeadline;
  const conf = confidenceLabel ?? decision?.confidenceLabel;

  return (
    <li className="rp-attention-row" data-decision="true">
      <div className="rp-attention-main">
        {cat ? <p className="rp-attention-terr">{cat}</p> : null}
        <h2 className="rp-attention-issue">{tit}</h2>
        {ctx ? <p className="rp-attention-meta">{ctx}</p> : null}
        <WhyLine why={whyLine} />
        {rec ? (
          <p className="rp-attention-rec">
            <em>RADR recommends</em>
            <span>{rec}</span>
          </p>
        ) : null}
        {(noAct || dead) && (
          <p className="rp-attention-econ">
            {noAct ? <span>{noAct}</span> : null}
            {noAct && dead ? <span aria-hidden="true"> · </span> : null}
            {dead ? <span>{dead}</span> : null}
            {conf ? (
              <>
                <span aria-hidden="true"> · </span>
                <span className="rp-attention-conf">
                  Confidence {conf}
                </span>
              </>
            ) : null}
          </p>
        )}
        {secondary}
      </div>
      {amt ? (
        <div
          className="rp-attention-money"
          data-positive={pos ? "true" : undefined}
        >
          <strong>{amt}</strong>
          {stake ? <span>{stake}</span> : null}
        </div>
      ) : (
        <div />
      )}
      <div className="rp-attention-cta">
        {onReview ? (
          <button type="button" className="rp-btn-secondary" onClick={onReview}>
            {reviewLabel}
          </button>
        ) : null}
      </div>
    </li>
  );
}
