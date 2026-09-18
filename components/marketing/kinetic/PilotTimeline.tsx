"use client";

/**
 * Pilot timeline — illustrative process, not promised calendar results.
 */

import { Link } from "@/i18n/navigation";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  scope: string;
  cta: string;
};

const STEPS = [
  { day: "Day 1", label: "Connect evidence" },
  { day: "First pass", label: "Anomalies surface" },
  { day: "Review", label: "RADR builds cases" },
  { day: "Action", label: "Finance approves" },
  { day: "Open cases", label: "Tracked until resolved" },
] as const;

export function PilotTimeline({ kicker, title, lead, scope, cta }: Props) {
  return (
    <div className="rx-pilot-tl">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>
      <p className="rx-rec-p rx-rec-muted">{scope}</p>

      <ol className="rx-pilot-days" aria-label="Illustrative pilot process">
        {STEPS.map((d) => (
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
        href="/contact?intent=recovery-pilot"
        className="rx-btn rx-btn-primary"
      >
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
