"use client";

import type { Action } from "@/lib/radr/domain";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";

type Props = {
  action: Action;
  /** What RADR will do - overrides title when present. */
  willDo?: string;
  why?: string;
  confidenceLabel?: string;
  onApprove?: () => void;
  onReject?: () => void;
  primaryLabel?: string;
  showActions?: boolean;
};

/**
 * Prepared Action review surface.
 * Automate preparation. Govern execution. Never hide economics.
 */
export function PreparedActionCard({
  action,
  willDo,
  why,
  confidenceLabel,
  onApprove,
  onReject,
  primaryLabel = "Approve",
  showActions = true,
}: Props) {
  const capability = action.executionCapability ?? "DRAFT_ONLY";
  const statusLabel =
    action.status === "PROPOSED"
      ? "Ready for approval"
      : action.status === "ACCEPTED"
        ? "Approved"
        : action.status === "IN_PROGRESS"
          ? "In progress"
          : action.status === "COMPLETED"
            ? "Completed"
            : action.status;

  return (
    <section className="rp-prepared" aria-label="Prepared action">
      <header className="rp-prepared-head">
        <p className="rp-prepared-kicker">Prepared action</p>
        <p className="rp-prepared-status" data-status={action.status}>
          {statusLabel}
        </p>
      </header>

      <dl className="rp-prepared-grid">
        <div>
          <dt>What RADR will do</dt>
          <dd>{willDo ?? action.title}</dd>
        </div>
        {why || action.preparedSummary ? (
          <div>
            <dt>Reading</dt>
            <dd>{why ?? action.preparedSummary}</dd>
          </div>
        ) : null}
        {action.expectedBenefit != null ? (
          <div>
            <dt>Expected value</dt>
            <dd>{formatFindingEuro(action.expectedBenefit)}</dd>
          </div>
        ) : null}
        {action.expectedCost != null ? (
          <div>
            <dt>Expected cost</dt>
            <dd>{formatFindingEuro(action.expectedCost)}</dd>
          </div>
        ) : null}
        {action.expectedNetBenefit != null ? (
          <div data-emphasize="true">
            <dt>Expected net value</dt>
            <dd>{formatFindingEuro(action.expectedNetBenefit)}</dd>
          </div>
        ) : null}
        {confidenceLabel ? (
          <div>
            <dt>Confidence</dt>
            <dd>{confidenceLabel}</dd>
          </div>
        ) : null}
        {action.requiredApproverRole ? (
          <div>
            <dt>Approver</dt>
            <dd>{action.requiredApproverRole}</dd>
          </div>
        ) : null}
        {action.reversible != null ? (
          <div>
            <dt>Reversibility</dt>
            <dd>{action.reversible ? "Reversible" : "Not reversible"}</dd>
          </div>
        ) : null}
        <div>
          <dt>Execution</dt>
          <dd>
            {capability === "SUPPORTED"
              ? "Supported after approval"
              : capability === "DRAFT_ONLY"
                ? "Draft only · no live send"
                : "Preparation only"}
          </dd>
        </div>
      </dl>

      {showActions && action.status === "PROPOSED" ? (
        <footer className="rp-prepared-actions">
          {onApprove ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={onApprove}
            >
              {primaryLabel}
            </button>
          ) : null}
          {onReject ? (
            <button
              type="button"
              className="rp-btn rp-btn-ghost"
              onClick={onReject}
            >
              Reject
            </button>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
