"use client";

/**
 * Pilot — one elegant progression. Qualification lives in FAQ.
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
  { mark: "01", label: "Connect" },
  { mark: "02", label: "Find" },
  { mark: "03", label: "Review" },
  { mark: "04", label: "Act" },
  { mark: "05", label: "Follow" },
] as const;

export function PilotTimeline({ kicker, title, lead, scope, cta }: Props) {
  return (
    <div className="rx-pilot-tl rx-pilot-tl-quiet">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      {lead ? <p className="rx-rec-p">{lead}</p> : null}
      {scope ? <p className="rx-rec-p rx-rec-muted">{scope}</p> : null}

      <ol className="rx-pilot-flow" aria-label="Illustrative pilot path">
        {STEPS.map((d, i) => (
          <li key={d.label}>
            <em>{d.mark}</em>
            <strong>{d.label}</strong>
            {i < STEPS.length - 1 ? (
              <span className="rx-pilot-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <Link
        href="/contact?intent=recovery-pilot"
        className="rx-btn rx-btn-primary"
      >
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
