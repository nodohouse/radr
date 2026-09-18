"use client";

/**
 * Pilot timeline — typical process, not promised results.
 */

import { Link } from "@/i18n/navigation";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  scope: string;
  opts: string[];
  cta: string;
  ctaHref: "/contact" | string;
};

const DAYS = [
  { day: "Day 1", label: "Connect evidence" },
  { day: "Day 3", label: "First anomalies" },
  { day: "Day 5", label: "First prepared cases" },
  { day: "Day 14", label: "Recovery review" },
  { day: "Open", label: "Cases until resolved" },
] as const;

export function PilotTimeline({
  kicker,
  title,
  lead,
  scope,
  opts,
  cta,
}: Props) {
  void ctaHref;
  return (
    <div className="rx-pilot-tl">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>
      <p className="rx-rec-p">{scope}</p>
      <ul className="rx-rec-list">
        {opts.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>

      <ol className="rx-pilot-days" aria-label="Typical pilot process">
        {DAYS.map((d) => (
          <li key={d.day}>
            <em>{d.day}</em>
            <strong>{d.label}</strong>
          </li>
        ))}
      </ol>
      <p className="rx-pilot-note">
        Illustrative process — not a promise of results by day.
      </p>

      <Link
        href={"/contact?intent=recovery-pilot"}
        className="rx-btn rx-btn-primary"
      >
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
