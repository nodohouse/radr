"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import {
  findingToDecision,
  type DecisionObject,
} from "@/lib/radr/decision/types";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import { WhyLine } from "@/components/product/WhyLine";

type Props = {
  finding?: Finding | null;
  decision?: DecisionObject | null;
  roleView?: RoleView;
  onClose: () => void;
};

/**
 * Level 2 decision surface — WHAT / SO WHAT / NOW WHAT / WHY / WHAT IF.
 */
export function AttentionReviewSheet({
  finding,
  decision: decisionProp,
  roleView = "gm",
  onClose,
}: Props) {
  const titleId = useId();
  const decision = useMemo(() => {
    if (decisionProp) return decisionProp;
    if (finding) return findingToDecision(finding, roleView);
    return null;
  }, [decisionProp, finding, roleView]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOptionId(decision?.recommendedOptionId ?? null);
  }, [decision?.id, decision?.recommendedOptionId]);

  useEffect(() => {
    if (!decision) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [decision, onClose]);

  if (!decision) return null;

  const activeId = selectedOptionId ?? decision.recommendedOptionId;
  const active =
    decision.options.find((o) => o.id === activeId) ??
    decision.options.find((o) => o.recommended) ??
    decision.options[0];

  return (
    <div className="rp-review" role="presentation">
      <button
        type="button"
        className="rp-review-scrim"
        aria-label="Close review"
        onClick={onClose}
      />
      <aside
        className="rp-review-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="rp-review-head">
          <p className="rp-review-terr" data-terr={decision.territory}>
            {decision.territory}
            <span className="rp-review-state">{decision.epistemicState}</span>
          </p>
          <button
            type="button"
            className="rp-review-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="rp-review-kicker">WHAT</p>
        <h2 id={titleId} className="rp-review-title">
          {decision.situation}
        </h2>
        <p className="rp-review-meta">{decision.context}</p>

        <p className="rp-review-kicker">SO WHAT</p>
        <WhyLine why={decision.whyMatters} />
        <p
          className="rp-review-money"
          data-positive={decision.impactPositive ? "true" : undefined}
        >
          <strong>{formatFindingEuro(decision.impactAmount)}</strong>
          <span>{decision.impactLabel}</span>
        </p>
        <p className="rp-review-noop">
          <em>If you do nothing</em>
          <span>
            {formatFindingEuro(decision.noAction.expectedCostEuro)} ·{" "}
            {decision.noAction.detail}
          </span>
        </p>

        <p className="rp-review-kicker">NOW WHAT</p>
        <ul className="rp-review-options" aria-label="Options">
          {decision.options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="rp-review-option"
                data-active={o.id === activeId ? "true" : "false"}
                data-recommended={o.recommended ? "true" : undefined}
                onClick={() => setSelectedOptionId(o.id)}
              >
                <strong>{o.label}</strong>
                <span>{o.detail}</span>
                {o.expectedNetEuro != null ? (
                  <em>
                    {o.id === "do_nothing"
                      ? "Net €0"
                      : `Net ${formatFindingEuro(o.expectedNetEuro)}`}
                    {o.costEuro != null && o.costEuro > 0
                      ? ` · cost ${formatFindingEuro(o.costEuro)}`
                      : ""}
                  </em>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <p className="rp-review-deadline">{decision.decisionDeadline}</p>
        <p className="rp-review-conf">
          Confidence {decision.confidenceLabel}
          {decision.expectedNetEuro != null && active?.recommended
            ? ` · expected net ${formatFindingEuro(decision.expectedNetEuro)}`
            : ""}
        </p>

        <div className="rp-review-actions">
          <Link
            href={decision.proofHref}
            className="rp-btn-primary"
            onClick={onClose}
          >
            {active?.recommended
              ? "Approve plan"
              : active?.id === "do_nothing"
                ? "Confirm no action"
                : "Continue with option"}
          </Link>
          <button type="button" className="rp-btn-secondary" onClick={onClose}>
            Later
          </button>
        </div>

        <details className="rp-review-why">
          <summary>Why · What if · Evidence</summary>
          <p className="rp-review-why-lead">{decision.why}</p>
          <p className="rp-review-why-lead">{decision.confidenceExplanation}</p>
          <dl>
            {decision.evidence.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
            <div>
              <dt>Reversibility</dt>
              <dd>{decision.reversibility}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{decision.ownerLabel}</dd>
            </div>
          </dl>
          <Link
            href={`/app/findings/${decision.findingId}`}
            className="rp-review-evidence"
            onClick={onClose}
          >
            See full evidence
          </Link>
        </details>
      </aside>
    </div>
  );
}
