"use client";

import { formatMoney } from "@/lib/radr/money";
import type { GuestTonightBrief } from "@/lib/radr/guest";

type Props = {
  brief: GuestTonightBrief;
  onOpen: () => void;
};

/**
 * Material guest signal on Control Center - quiet when nothing matters.
 */
export function GuestsTonightCallout({ brief, onOpen }: Props) {
  if (!brief.material) return null;

  return (
    <article
      className="rp-guests-callout"
      data-tour-target="guests-tonight"
      aria-label="Guests tonight"
    >
      <div className="rp-guests-callout-main">
        <p className="rp-guests-kicker">Guests tonight</p>
        <h2>
          {brief.returningGuests} returning guests
        </h2>
        <p className="rp-guests-lead">
          {formatMoney({
            amount: brief.expectedReturningRevenue,
            currency: "EUR",
            locale: "de-DE",
          })}{" "}
          expected returning revenue · {brief.returningRevenueSharePct}% of
          reservation revenue
        </p>
        <ul className="rp-guests-chips">
          <li>{brief.highValueReturning} high-value returners</li>
          {brief.lapsedReturning90d > 0 ? (
            <li>{brief.lapsedReturning90d} returning after 90+ days</li>
          ) : null}
          {brief.serviceNotesNeedingAttention > 0 ? (
            <li>
              {brief.serviceNotesNeedingAttention} service notes need attention
            </li>
          ) : null}
          {brief.bluefinAffinityGuests > 0 ? (
            <li>
              {brief.bluefinAffinityGuests} often order Bluefin dishes
            </li>
          ) : null}
        </ul>
      </div>
      <div className="rp-guests-callout-side">
        <p>
          <strong>
            {formatMoney({
              amount: brief.expectedReturningRevenue,
              currency: "EUR",
              locale: "de-DE",
            })}
          </strong>
          <span>returning revenue (expected)</span>
        </p>
        <button type="button" className="rp-btn-secondary" onClick={onOpen}>
          Open guest brief
        </button>
      </div>
    </article>
  );
}
