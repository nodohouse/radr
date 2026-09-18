"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/radr/money";
import type { PreShiftBrief } from "@/lib/radr/preShift";
import { composeMenuDecisionBrief } from "@/lib/radr/preShift/menuDecisionBrief";
import type { GuestTonightBrief } from "@/lib/radr/guest";
import type { HospitalityTonightBrief } from "@/lib/radr/hospitality";

type Props = {
  brief: PreShiftBrief;
  guestBrief?: GuestTonightBrief | null;
  hospitalityBrief?: HospitalityTonightBrief | null;
  onOpenGuestBrief?: () => void;
  onOpenHospitalityBrief?: () => void;
  onClose: () => void;
};

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

/**
 * Pre-shift drawer - scarce attention.
 * Default ≈ decisions only. Context + evidence on demand.
 */
export function PreShiftPlanPanel({
  brief,
  guestBrief,
  hospitalityBrief,
  onOpenGuestBrief,
  onOpenHospitalityBrief,
  onClose,
}: Props) {
  const [showWhy, setShowWhy] = useState(false);
  const [showMenuWhy, setShowMenuWhy] = useState(false);
  const [showSourcing, setShowSourcing] = useState(false);
  const [showEventWhy, setShowEventWhy] = useState(false);

  const menu = useMemo(() => composeMenuDecisionBrief(), []);
  const w = brief.weatherImpact;
  const d = brief.coverDrivers;
  const staffFix = brief.fixBeforeOpen.find((f) => f.id === "fix_staff");
  const actionCount = (menu ? 1 : 0) + (staffFix ? 1 : 0);
  const recommended = menu?.sourcing.options.find((o) => o.recommended);
  const isEmergency = Boolean(
    recommended && recommended.kind === "EMERGENCY_SOURCE",
  );

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

  return (
    <div className="rp-review" role="presentation">
      <button
        type="button"
        className="rp-review-scrim"
        aria-label="Close pre-shift plan"
        onClick={onClose}
      />
      <aside
        className="rp-review-panel rp-preshift-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Pre-shift plan"
      >
        <header className="rp-review-head">
          <p className="rp-review-terr">Pre-shift</p>
          <button
            type="button"
            className="rp-review-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* 1. One-line context - not a dashboard */}
        <section className="rp-ps-sec rp-ps-sec-tight">
          <p className="rp-ps-kicker">Tonight · {brief.locationName}</p>
          <h2 className="rp-ps-hero">
            {brief.outlook} demand · {brief.expectedCovers} covers
          </h2>
          <p className="rp-ps-peak">
            Peak {brief.peakWindow.start}-{brief.peakWindow.end}
            <span aria-hidden="true"> · </span>
            {eur(brief.projectedNetSales)} projected
            <span aria-hidden="true"> · </span>
            {actionCount === 0
              ? "No decisions before open"
              : actionCount === 1
                ? "1 decision before open"
                : `${actionCount} decisions before open`}
          </p>
        </section>

        {/* 2. Needs action - ranked, default thin */}
        <section className="rp-ps-sec" aria-label="Needs action">
          <p className="rp-ps-sec-label">Needs action</p>

          {menu ? (
            <article
              className="rp-ps-issue"
              data-priority={isEmergency ? "CRITICAL" : menu.criticality.level}
            >
              <div className="rp-ps-issue-head">
                <h3>
                  {menu.criticality.topDish?.name ?? menu.ingredientName} will
                  sell out
                </h3>
                <span
                  className="rp-ps-pill"
                  data-tone={isEmergency ? "emergency" : "risk"}
                >
                  {isEmergency ? "Emergency" : "High"}
                </span>
              </div>

              <p className="rp-ps-so-what">
                {menu.portionsAvailable} of {menu.portionsExpected} portions
                left · sell-out ~{menu.runOutBy}
                {menu.guestAffinity.bluefinGuestsTonight > 0
                  ? ` · ${menu.guestAffinity.bluefinGuestsTonight} returning guests often order it`
                  : null}
              </p>

              <p className="rp-ps-money-lg" data-tone="risk">
                <strong>{eur(menu.contributionAtRisk)}</strong>
                <span>contribution at risk</span>
              </p>

              <p className="rp-ps-rec">
                RADR recommends{" "}
                <strong>{recommended?.title ?? "Review sourcing"}</strong>
                {recommended ? (
                  <>
                    {" "}
                    · +{eur(recommended.netExpectedValue)} net
                  </>
                ) : null}
              </p>
              <p className="rp-ps-deadline">
                Decide by <strong>{menu.sourcing.decideBy}</strong>
                <span> - {menu.sourcing.decideByWhy}</span>
              </p>

              <div className="rp-ps-actions">
                <button
                  type="button"
                  className="rp-cc3-cta"
                  onClick={() => setShowSourcing((v) => !v)}
                >
                  {showSourcing ? "Hide options" : "Review options"}
                </button>
                <button
                  type="button"
                  className="rp-ps-link"
                  onClick={() => setShowMenuWhy((v) => !v)}
                >
                  {showMenuWhy ? "Hide detail" : "See reading"}
                </button>
              </div>

              {showMenuWhy ? (
                <div className="rp-ps-trace">
                  <ul>
                    <li>
                      {menu.ingredientName} · #
                      {menu.criticality.topDish?.salesRank} dinner seller
                      {menu.criticality.topDish?.signatureFlag
                        ? " · signature"
                        : null}
                    </li>
                    <li>
                      Affects {menu.dishes.map((x) => x.name).join(", ")}
                    </li>
                    <li>
                      Guest impact {menu.criticality.guestImpact} - {" "}
                      {menu.criticality.guestImpactReason}
                    </li>
                    <li>{menu.guestAffinity.line}</li>
                    <li>
                      {menu.criticality.reasons.join(" · ")}
                    </li>
                  </ul>
                </div>
              ) : null}

              {showSourcing ? (
                <div className="rp-ps-sourcing">
                  <ol className="rp-ps-options">
                    {menu.sourcing.options.map((o) => (
                      <li
                        key={o.id}
                        data-recommended={o.recommended ? "true" : undefined}
                      >
                        <div className="rp-ps-opt-head">
                          <strong>{o.title}</strong>
                          {o.recommended ? (
                            <span className="rp-ps-pill" data-tone="good">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <p>
                          Net {o.netExpectedValue >= 0 ? "+" : "−"}
                          {eur(Math.abs(o.netExpectedValue))}
                          {o.deliveryLabel ? ` · ${o.deliveryLabel}` : null}
                        </p>
                        <p className="rp-ps-opt-detail">{o.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </article>
          ) : null}

          {staffFix ? (
            <article className="rp-ps-issue">
              <div className="rp-ps-issue-head">
                <h3>{staffFix.title}</h3>
                <span className="rp-ps-pill" data-tone="risk">
                  High
                </span>
              </div>
              <p className="rp-ps-so-what">
                {staffFix.detail?.summary ??
                  "Peak demand exceeds FOH (Front of House) capacity."}
              </p>
              <p className="rp-ps-money-lg" data-tone="risk">
                <strong>{eur(staffFix.amount)}</strong>
                <span>{staffFix.amountLabel ?? "at risk"}</span>
              </p>
              {staffFix.detail?.recommendation ? (
                <p className="rp-ps-rec">
                  RADR recommends{" "}
                  <strong>{staffFix.detail.recommendation}</strong>
                </p>
              ) : null}
              {staffFix.detail?.deadline ? (
                <p className="rp-ps-deadline">{staffFix.detail.deadline}</p>
              ) : null}
            </article>
          ) : null}
        </section>

        {/* 3. Context - one line each, not metric grids */}
        {(hospitalityBrief?.material ||
          guestBrief?.material ||
          w?.decision === "OPEN") && (
          <section className="rp-ps-sec" aria-label="Also tonight">
            <p className="rp-ps-sec-label">Also tonight</p>
            <ul className="rp-ps-context">
              {w?.decision === "OPEN" ? (
                <li>
                  <div>
                    <strong>Terrace</strong>
                    <span>
                      {w.weather.temperatureC}°C · open full · +
                      {eur(w.netExpectedContribution)} net
                    </span>
                  </div>
                </li>
              ) : null}
              {hospitalityBrief?.material ? (
                <li>
                  <div>
                    <strong>Hospitality</strong>
                    <span>
                      {hospitalityBrief.birthdays} birthdays
                      {hospitalityBrief.engagements > 0
                        ? ` · ${hospitalityBrief.engagements} engagement`
                        : ""}
                      {hospitalityBrief.allergyAlerts > 0
                        ? ` · ${hospitalityBrief.allergyAlerts} allergy`
                        : ""}
                      {hospitalityBrief.needsAction
                        ? " · needs action"
                        : hospitalityBrief.allergyAlerts > 0
                          ? " · safety ready"
                          : ""}
                    </span>
                  </div>
                  {onOpenHospitalityBrief ? (
                    <button
                      type="button"
                      className="rp-ps-link"
                      onClick={onOpenHospitalityBrief}
                    >
                      Brief
                    </button>
                  ) : null}
                </li>
              ) : guestBrief?.material ? (
                <li>
                  <div>
                    <strong>Guests</strong>
                    <span>
                      {guestBrief.returningGuests} returning ·{" "}
                      {eur(guestBrief.expectedReturningRevenue)} expected
                      returning revenue
                    </span>
                  </div>
                  {onOpenGuestBrief ? (
                    <button
                      type="button"
                      className="rp-ps-link"
                      onClick={onOpenGuestBrief}
                    >
                      Brief
                    </button>
                  ) : null}
                </li>
              ) : null}
            </ul>
          </section>
        )}

        {/* 4. Why - collapsed */}
        <section className="rp-ps-sec rp-ps-sec-tight">
          <button
            type="button"
            className="rp-ps-link rp-ps-why-toggle"
            onClick={() => setShowWhy((v) => !v)}
          >
            {showWhy ? "Hide basis" : "Forecast basis"}
          </button>
          {showWhy ? (
            <div className="rp-ps-evidence">
              <p>
                {d.reservations} reservations · +{d.walkIns} walk-ins
                {brief.hasTerrace ? ` · +${d.weatherTerrace} terrace` : null}
                {d.localEvent > 0 ? ` · +${d.localEvent} event` : null}
                {" · "}
                {d.expectedCancellations} expected cancellations →{" "}
                {brief.expectedCovers} covers
              </p>
              <p>
                Booking pace +{brief.bookingPacePct}% vs comparable Thursdays
              </p>
              {brief.event ? (
                <>
                  <button
                    type="button"
                    className="rp-ps-link"
                    onClick={() => setShowEventWhy((v) => !v)}
                  >
                    Local event · +{brief.event.preEventWalkIns} / +
                    {brief.event.postEventDemand}
                    {showEventWhy ? " ▴" : " - basis"}
                  </button>
                  {showEventWhy ? (
                    <ul>
                      <li>
                        {brief.event.kind} · {brief.event.distanceLabel}
                      </li>
                      <li>
                        {brief.event.attendance.toLocaleString("de-DE")} attendees
                      </li>
                      <li>
                        Doors {brief.event.doors} · ends ~
                        {brief.event.endsApprox}
                      </li>
                    </ul>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
