"use client";

/**
 * Pilot — one elegant progression. Qualification lives in FAQ.
 */

import { Link } from "@/i18n/navigation";
import { PILOT_SUCCESS_MEASURES } from "@/lib/marketing/brand";

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

      <p className="rx-rec-p" style={{ marginTop: "1rem", maxWidth: "42rem" }}>
        The first pilot does not require a large API project. Start with secure
        exports and documents — invoices, contracts, credit memos, payments,
        supplier statements, CSV / accounting exports. Connect APIs later where
        useful.
      </p>

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

      <div className="rx-pilot-success" style={{ marginTop: "1.75rem" }}>
        <p className="rx-rec-k">What a successful pilot measures</p>
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "1.25rem",
            maxWidth: "36rem",
          }}
        >
          {PILOT_SUCCESS_MEASURES.map((m) => (
            <li key={m} style={{ marginBottom: "0.35rem" }}>
              {m}
            </li>
          ))}
        </ul>
        <p className="rx-pilot-note" style={{ marginTop: "0.75rem" }}>
          No promised minimum recovery.
        </p>
      </div>

      <Link
        href="/contact?intent=recovery-pilot"
        className="rx-btn rx-btn-primary"
        style={{ marginTop: "1.25rem" }}
      >
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
