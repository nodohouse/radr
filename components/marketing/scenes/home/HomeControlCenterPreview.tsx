"use client";

/**
 * Homepage Control Center — LIVE open Decisions only.
 * Sealed D-4102 never appears as Needs You.
 */

import { Link } from "@/i18n/navigation";
import { euro } from "@/lib/marketing/publicDecisionEconomics";
import {
  MORNING_BRIEF_LIVE,
  ROUTINE_SIGNALS_SUPPRESSED,
  type PublicLiveDecision,
} from "@/lib/marketing/publicLiveDecisions";
import { AttentionBrief } from "@/components/marketing/primitives/AttentionBrief";
import "@/app/radr-public.css";

function LiveRow({ d }: { d: PublicLiveDecision }) {
  const amount = d.economics.exposed;
  return (
    <li>
      <div className="rx-hcc-row-meta">
        <em>
          {d.location} · {d.classLabel}
        </em>
        <span className="rx-hcc-id">{d.displayId}</span>
      </div>
      <p className="rx-hcc-euro">
        <strong>{euro(amount)}</strong>
        <span>
          {d.state === "investigate" ? "unexplained" : "at risk"}
        </span>
      </p>
      <p className="rx-hcc-line">{d.line}</p>
      <p className="rx-hcc-detail">{d.detail}</p>
      <Link href={d.ctaHref} className="rx-hcc-cta">
        {d.cta} <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

export function HomeControlCenterPreview() {
  return (
    <div className="rx-hcc">
      <header className="rx-hcc-head">
        <p className="rx-rec-k">Control Center</p>
        <h2 className="rx-hcc-h rx-pub-statement">
          Your operation does not need another dashboard.
          <span>It needs to know what needs intervention.</span>
        </h2>
      </header>

      <div className="rx-hcc-stage" aria-label="Morning brief">
        <p className="rx-hcc-greet">Good morning.</p>
        <AttentionBrief count={MORNING_BRIEF_LIVE.length} />

        <ul className="rx-hcc-rows">
          {MORNING_BRIEF_LIVE.map((d) => (
            <LiveRow key={d.displayId} d={d} />
          ))}
        </ul>

        <p className="rx-hcc-quiet">
          {ROUTINE_SIGNALS_SUPPRESSED} routine changes suppressed
        </p>
      </div>
    </div>
  );
}
