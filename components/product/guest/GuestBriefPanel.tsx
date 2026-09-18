"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/radr/money";
import {
  formatGuestTiers,
  type GuestTonightBrief,
} from "@/lib/radr/guest";

type Props = {
  brief: GuestTonightBrief;
  onClose: () => void;
};

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

/**
 * Guest brief drawer - service / relationship context, not CRM dump.
 */
export function GuestBriefPanel({ brief, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
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
  }, [onClose]);

  const top = brief.spotlight?.[0] ?? null;

  return (
    <div className="rp-review" role="presentation">
      <button
        type="button"
        className="rp-review-scrim"
        aria-label="Close guest brief"
        onClick={onClose}
      />
      <aside
        className="rp-review-panel rp-guest-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Guest brief"
      >
        <header className="rp-review-head">
          <p className="rp-review-terr">Guest brief</p>
          <button
            type="button"
            className="rp-review-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <section className="rp-ps-sec">
          <h2 className="rp-ps-hero">Guests tonight</h2>
          <div className="rp-ps-pulse">
            <div>
              <strong>{brief.returningGuests}</strong>
              <span>returning</span>
            </div>
            <div>
              <strong>{brief.firstTimeGuests}</strong>
              <span>first-time</span>
            </div>
            <div>
              <strong>{eur(brief.expectedReturningRevenue)}</strong>
              <span>returning revenue (expected)</span>
            </div>
            <div>
              <strong>{brief.returningRevenueSharePct}%</strong>
              <span>of reservation revenue</span>
            </div>
          </div>
          <p className="rp-ps-peak">
            {brief.reservedCovers} reserved covers ·{" "}
            {brief.highValueReturning} high-value returners
            {brief.lapsedReturning90d > 0
              ? ` · ${brief.lapsedReturning90d} after 90+ days`
              : null}
          </p>
        </section>

        {brief.access.aggregatesOnly ? (
          <section className="rp-ps-sec">
            <p className="rp-ps-sec-label">Returning revenue</p>
            <p className="rp-ps-so-what">
              Named guest detail is hidden for this role. Aggregates only - 
              repeat economics without personal guest profiles.
            </p>
            <p className="rp-ps-money-lg">
              <strong>{eur(brief.expectedReturningRevenue)}</strong>
              <span>expected tonight from returning guests</span>
            </p>
            <p className="rp-ps-meta-line">
              First-time expected {eur(brief.expectedFirstTimeRevenue)}
            </p>
            {brief.bluefinAffinityGuests > 0 ? (
              <p className="rp-ps-meta-line">
                {brief.bluefinAffinityGuests} booked guests historically order
                Bluefin · affinity context {eur(brief.bluefinAffinityExpectedValue)}{" "}
                (not a guarantee they will order it tonight)
              </p>
            ) : null}
          </section>
        ) : (
          <>
            {top ? (
              <section className="rp-ps-sec">
                <p className="rp-ps-sec-label">Top relationship</p>
                <article className="rp-guest-card">
                  <h3>{top.identity.displayName}</h3>
                  <p className="rp-guest-tiers">
                    {formatGuestTiers(top.value.tiers)}
                  </p>
                  <ul className="rp-guest-why">
                    {top.value.why.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <p className="rp-ps-meta-line">
                    Tonight: {top.booking.tableLabel} · {top.booking.time} ·
                    party of {top.booking.partySize}
                  </p>
                  <p className="rp-ps-meta-line">
                    Expected tonight: {eur(top.value.expectedSpendTonightLow)}-
                    {eur(top.value.expectedSpendTonightHigh)}
                  </p>
                  {top.notes[0] ? (
                    <p className="rp-guest-note">
                      Service note: {top.notes[0].note}
                    </p>
                  ) : null}
                  <p className="rp-ps-peak">
                    Identity match: {top.identity.identityConfidence}
                  </p>
                </article>
              </section>
            ) : null}

            {brief.attentionNotes && brief.attentionNotes.length > 0 ? (
              <section className="rp-ps-sec">
                <p className="rp-ps-sec-label">Needs attention</p>
                <ul className="rp-guest-notes">
                  {brief.attentionNotes.map((n) => (
                    <li key={`${n.guestLabel}-${n.note}`}>
                      <strong>{n.guestLabel}</strong>
                      <span>{n.note}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {brief.spotlight && brief.spotlight.length > 1 ? (
              <section className="rp-ps-sec">
                <p className="rp-ps-sec-label">
                  High-value returning · {brief.highValueReturning}
                </p>
                <ul className="rp-guest-list">
                  {brief.spotlight.map((g) => {
                    const open = expandedId === g.identity.id;
                    return (
                      <li key={g.identity.id}>
                        <button
                          type="button"
                          className="rp-guest-list-btn"
                          onClick={() =>
                            setExpandedId(open ? null : g.identity.id)
                          }
                        >
                          <span>
                            <strong>{g.identity.displayName}</strong>
                            <em>
                              {g.booking.time} · party of {g.booking.partySize}
                              {g.booking.tableLabel
                                ? ` · ${g.booking.tableLabel}`
                                : ""}
                            </em>
                          </span>
                          <span>{eur(g.value.lifetimeSpend)}</span>
                        </button>
                        {open ? (
                          <div className="rp-guest-expand">
                            <p>{formatGuestTiers(g.value.tiers)}</p>
                            <ul>
                              {g.value.why.map((w) => (
                                <li key={w}>{w}</li>
                              ))}
                            </ul>
                            {g.value.topDishes.length > 0 ? (
                              <p>
                                Often orders: {g.value.topDishes.join(", ")}
                              </p>
                            ) : null}
                            <p>
                              Reliability: {g.value.reliability} ·{" "}
                              {g.value.completedVisits} completed ·{" "}
                              {g.value.noShows} no-shows
                            </p>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {brief.bluefinAffinityGuests > 0 ? (
              <section className="rp-ps-sec">
                <p className="rp-ps-sec-label">Menu affinity</p>
                <p className="rp-ps-so-what">
                  {brief.bluefinAffinityGuests} high-value returning guests
                  tonight historically order Bluefin dishes. Affinity context{" "}
                  {eur(brief.bluefinAffinityExpectedValue)} - not a prediction
                  they will order it tonight. Raises guest-impact on the tuna
                  shortage.
                </p>
              </section>
            ) : null}
          </>
        )}
      </aside>
    </div>
  );
}
