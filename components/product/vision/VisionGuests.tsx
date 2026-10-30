"use client";

import Link from "next/link";
import { DEMO_GUEST_TONIGHT_AGG } from "@/lib/radr/guest/demoTonight";
import { formatEuro } from "@/lib/radr/money";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

const agg = DEMO_GUEST_TONIGHT_AGG;

const returnSharePct = Math.round(
  (agg.returningGuests / agg.reservedCovers) * 100,
);

const expectedCheckTonight = Math.round(
  (agg.expectedReturningRevenue + agg.expectedFirstTimeRevenue) /
    agg.reservedCovers,
);

const SEGMENTS = [
  {
    name: "Regulars & loyalty",
    share: "38%",
    sat: "4.8",
    spend: formatEuro(433, { compact: true }),
    conclusion:
      "Return inside three weeks · tasting-menu and wine attachment · protect quiet seating.",
  },
  {
    name: "Walk-in & first visit",
    share: "14%",
    sat: "4.2",
    spend: formatEuro(196, { compact: true }),
    conclusion:
      "Ticket time drives satisfaction here — kitchen load from delivery is the lever.",
  },
  {
    name: "Corporate & groups",
    share: "21%",
    sat: "4.6",
    spend: formatEuro(589, { compact: true }),
    conclusion:
      "Higher cover count · allergy protocols must be confirmed before service.",
  },
  {
    name: "Tourist & transient",
    share: "27%",
    sat: "4.4",
    spend: formatEuro(357, { compact: true }),
    conclusion:
      "Terrace and wine pairings · weather-sensitive — hold recovery when regulars arrive.",
  },
];

const FEEDBACK = [
  {
    id: "f1",
    text: "Shellfish allergy · Table 3 · tasting menu — kitchen protocol pending confirmation.",
    tone: "watch" as const,
  },
  {
    id: "f2",
    text: "Terrace noise complaint resolved · guest stayed for dessert.",
    tone: "pos" as const,
  },
  {
    id: "f3",
    text: "Wait time cited twice since 19:30 · hot line at 91% load.",
    tone: "watch" as const,
  },
];

export function VisionGuests() {
  return (
    <div className="rv-page rv-guests-composed">
      <header className="rv-page-head">
        <h1>Guests</h1>
        <p>
          Soho · New York · who is on the floor tonight, what they spend, and
          whether service is keeping pace.
        </p>
      </header>

      <div className="rv-guest-pulse rv-metric-band">
        {[
          {
            label: "Guest satisfaction",
            value: "4.6/5",
            delta: "Stable vs last 4 weeks",
            tone: "pos" as const,
          },
          {
            label: "Covers tonight",
            value: String(agg.reservedCovers),
            delta: `${agg.returningGuests} returning · ${agg.firstTimeGuests} first visit`,
            tone: "neutral" as const,
          },
          {
            label: "Return on the books",
            value: `${returnSharePct}%`,
            delta: "Share of tonight’s covers from returning guests",
            tone: "pos" as const,
          },
          {
            label: "Expected check / cover",
            value: formatEuro(expectedCheckTonight, { compact: true }),
            delta: `${agg.returningRevenueSharePct}% of expected revenue from returners`,
            tone: "pos" as const,
          },
        ].map((m) => (
          <div key={m.label} className="rv-metric">
            <span className="rv-label">{m.label}</span>
            <strong className="rv-num">{m.value}</strong>
            <em data-tone={m.tone}>{m.delta}</em>
          </div>
        ))}
      </div>

      <div className="rv-guest-triptych" aria-label="Guest floor composition">
        <section className="rv-panel rv-guest-col-segments">
          <div className="rv-panel-head">
            <h2>Segments</h2>
            <p className="rv-panel-sub">Share · satisfaction · operating conclusion.</p>
          </div>
          <ul className="rv-guest-segment-list">
            {SEGMENTS.map((s) => (
              <li key={s.name}>
                <div className="rv-guest-segment-top">
                  <strong>{s.name}</strong>
                  <span className="rv-num">
                    {s.sat} · {s.share}
                  </span>
                </div>
                <p className="rv-guest-segment-conclusion">{s.conclusion}</p>
                <em className="rv-guest-segment-spend">Avg historical {s.spend}</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="rv-panel rv-guest-col-feedback">
          <div className="rv-panel-head">
            <h2>Feedback</h2>
            <p className="rv-panel-sub">Live guest signals from tonight.</p>
          </div>
          <ul className="rv-need-list">
            {FEEDBACK.map((f) => (
              <li key={f.id}>
                <button type="button">
                  <strong>{f.text}</strong>
                  <span>
                    {f.tone === "pos"
                      ? "Handled"
                      : agg.serviceNotesNeedingAttention > 0
                        ? "Needs you"
                        : "Watching"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rv-guest-col-insight">
          <div className="rv-rail-block rv-guest-insight">
            <p className="rv-label">RADR read</p>
            <p className="rv-display">
              Regulars and terrace covers are converging 20:10–20:40 — ticket
              time is the constraint, not covers.
            </p>
          </div>
          <div className="rv-decision-card">
            <p className="rv-label">Prepared judgment</p>
            <h3>
              Hold terrace recovery for regulars arriving 20:10–20:40 on clear
              nights.
            </h3>
            <p>
              Historically followed by {formatEuro(460, { compact: true })}{" "}
              recoverable contribution when FOH can turn terrace without
              compressing ticket time.
            </p>
            <div className="rv-decision-actions">
              <Link
                className="rv-btn"
                data-primary="true"
                href={`/app/decisions/${DECISION_IDS.guestVoice}`}
              >
                Open judgment
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
