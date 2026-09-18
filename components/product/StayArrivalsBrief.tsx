"use client";

import type { StayArrival } from "@/lib/radr/demo/stayGuests";
import {
  STAY_SIGNAL_LABEL,
  primaryStaySignals,
  stayRelationshipLine,
  stayUnitStatusLabel,
} from "@/lib/radr/demo/stayGuests";

type Props = {
  arrivals: StayArrival[];
  /** hotel vs residences copy */
  vertical: "boutique_hotel" | "serviced_apartments";
};

/**
 * Who's arriving today — accommodation-native guest continuity.
 * Not restaurant covers / allergies / walk-ins.
 */
export function StayArrivalsBrief({ arrivals, vertical }: Props) {
  const unitWord = vertical === "serviced_apartments" ? "unit" : "room";

  return (
    <section className="rp-stay-arrivals" aria-label="Arriving today">
      <header className="rp-stay-arrivals-head">
        <div>
          <p className="rp-hotel-sec-label">Arriving today</p>
          <p className="rp-hotel-glance-lead">
            Who · relationship · occasion · what to prepare — before they walk
            in
          </p>
        </div>
        <p className="rp-stay-arrivals-count">
          <strong>{arrivals.length}</strong>
          <span>arrivals</span>
        </p>
      </header>

      <ol className="rp-stay-arrivals-list">
        {arrivals.map((a) => {
          const signals = primaryStaySignals(a.signals).slice(0, 4);
          const unitLabel =
            a.unit === "TBD"
              ? `${unitWord} TBD`
              : `${unitWord === "unit" ? "Unit" : "Room"} ${a.unit}`;

          return (
            <li
              key={a.id}
              className="rp-stay-arrival"
              data-status={a.unitStatus}
              data-occasion={
                a.signals.some((s) =>
                  ["anniversary", "honeymoon", "birthday"].includes(s),
                )
                  ? "true"
                  : undefined
              }
            >
              <time dateTime={a.time}>{a.time}</time>
              <div className="rp-stay-arrival-main">
                <div className="rp-stay-arrival-top">
                  <h3>{a.guestName}</h3>
                  <em>{stayUnitStatusLabel(a.unitStatus)}</em>
                </div>
                <p className="rp-stay-arrival-meta">
                  {unitLabel} · {a.unitType} · {a.nights} night
                  {a.nights === 1 ? "" : "s"}
                  {a.partySize > 1 ? ` · party of ${a.partySize}` : ""}
                </p>
                <p className="rp-stay-arrival-rel">{stayRelationshipLine(a)}</p>
                <ul className="rp-stay-signals" aria-label="Guest signals">
                  {signals.map((s) => (
                    <li key={s} data-signal={s}>
                      {STAY_SIGNAL_LABEL[s]}
                    </li>
                  ))}
                </ul>
                {a.specialNote ? (
                  <p className="rp-stay-arrival-note">{a.specialNote}</p>
                ) : null}
                {a.prepare ? (
                  <p className="rp-stay-arrival-prep">
                    <span>Prepare</span> {a.prepare}
                  </p>
                ) : null}
                <p className="rp-stay-arrival-why">{a.whyItMatters}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Compact chips for a room/unit card. */
export function StayGuestChips({ arrival }: { arrival: StayArrival }) {
  const signals = primaryStaySignals(arrival.signals)
    .filter((s) => !["ota", "first_stay"].includes(s))
    .slice(0, 3);

  return (
    <div className="rp-stay-guest-chip">
      <p className="rp-hotel-room-guest">
        {arrival.guestName}
        {arrival.partySize > 1 ? ` · ${arrival.partySize}` : ""}
      </p>
      <p className="rp-stay-guest-chip-rel">{stayRelationshipLine(arrival)}</p>
      {signals.length > 0 ? (
        <ul className="rp-stay-signals rp-stay-signals-compact">
          {signals.map((s) => (
            <li key={s} data-signal={s}>
              {STAY_SIGNAL_LABEL[s]}
            </li>
          ))}
        </ul>
      ) : null}
      {arrival.specialNote ? (
        <p className="rp-stay-guest-chip-note">{arrival.specialNote}</p>
      ) : null}
    </div>
  );
}
