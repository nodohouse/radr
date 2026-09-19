"use client";

import type { HospitalityTonightBrief } from "@/lib/radr/hospitality";

type Props = {
  brief: HospitalityTonightBrief;
  onOpen: () => void;
};

/**
 * Material hospitality signal - quiet when safety is ready and nothing special.
 */
export function HospitalityTonightCallout({ brief, onOpen }: Props) {
  if (!brief.material) return null;

  const chips: string[] = [];
  if (brief.birthdays > 0) chips.push(`${brief.birthdays} birthdays`);
  if (brief.engagements > 0) chips.push(`${brief.engagements} engagement`);
  if (brief.anniversaries > 0) chips.push(`${brief.anniversaries} anniversary`);
  if (brief.allergyAlerts > 0) {
    chips.push(`${brief.allergyAlerts} allergy reservations`);
  }
  if (brief.needsAction && brief.safety.actionSummary) {
    chips.push(`Needs action: ${brief.safety.actionSummary}`);
  } else if (brief.allergyAlerts > 0 && !brief.needsAction) {
    chips.push("Safety ready");
  }
  if (brief.quietTableRequests > 0) {
    chips.push(`${brief.quietTableRequests} quiet-table`);
  }
  if (brief.privateDiningSetups > 0) {
    chips.push(`${brief.privateDiningSetups} private dining`);
  }

  return (
    <article
      className="rp-hosp-callout"
      data-needs-action={brief.needsAction ? "true" : undefined}
      data-tour-target="hospitality-tonight"
      aria-label="Hospitality tonight"
    >
      <div className="rp-hosp-callout-main">
        <p className="rp-hosp-kicker">Hospitality tonight</p>
        <h2>
          {brief.returningGuests} returning · {brief.reservedCovers} covers
        </h2>
        <ul className="rp-hosp-chips">
          {chips.slice(0, 6).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <div className="rp-hosp-callout-side">
        {brief.needsAction ? (
          <p className="rp-hosp-flag" data-tone="critical">
            <strong>Needs action</strong>
            <span>Safety / confirmation</span>
          </p>
        ) : (
          <p className="rp-hosp-flag" data-tone="ready">
            <strong>{brief.allergyAlerts}</strong>
            <span>
              {brief.allergyAlerts === 1
                ? "allergy reservation"
                : "allergy reservations"}
            </span>
          </p>
        )}
        <button type="button" className="rp-btn-secondary" onClick={onOpen}>
          Open hospitality brief
        </button>
      </div>
    </article>
  );
}
