"use client";

import { formatMoney } from "@/lib/radr/money";
import type { CancellationOpportunity } from "@/lib/radr/activeRevenue";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  opportunity: CancellationOpportunity;
  onRecover: (id: string) => void;
  onDismiss?: () => void;
};

/**
 * Temporary high-visibility strip - settles into the priority queue.
 * Not a modal.
 */
export function JustNowCancellationStrip({
  opportunity: r,
  onRecover,
  onDismiss,
}: Props) {
  const atRisk = r.remainingRevenueExposure || r.originalExpectedRevenue;

  return (
    <div className="rp-lrr-justnow" role="status" aria-live="polite">
      <div className="rp-lrr-justnow-copy">
        <p className="rp-lrr-justnow-kicker">Just now</p>
        <p className="rp-lrr-justnow-title">
          {r.partySize}-GUEST TABLE CANCELLED · {r.reservationTime}
        </p>
        <p className="rp-lrr-justnow-money">
          <strong>{eur(atRisk)}</strong>
          <span>expected revenue at risk</span>
        </p>
      </div>
      <div className="rp-lrr-justnow-actions">
        <button
          type="button"
          className="rp-os-cta rp-os-cta-recovery"
          onClick={() => onRecover(r.id)}
        >
          Recover
        </button>
        {onDismiss ? (
          <button
            type="button"
            className="rp-btn-secondary"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
