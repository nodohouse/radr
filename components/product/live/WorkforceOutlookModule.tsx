"use client";

/**
 * Workforce outlook — demand vs schedule + Decision-native Futures.
 */

import type { ScheduleGap } from "@/lib/radr/workforce";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export function WorkforceOutlookModule({
  gap,
  voice,
}: {
  gap: ScheduleGap;
  voice: "gm" | "cfo";
}) {
  return (
    <section className="rp-wf" aria-label="Workforce outlook">
      <header className="rp-wf-head">
        <p className="rp-live-k">Workforce · {gap.intervalLabel}</p>
        <p className="rp-wf-gap">
          Required <strong>{gap.requiredFte}</strong>
          <span aria-hidden="true">·</span>
          Scheduled <strong>{gap.scheduledFte}</strong>
          <span aria-hidden="true">·</span>
          Gap{" "}
          <strong data-semantic="warning">
            {gap.gapFte >= 0 ? "+" : ""}
            {gap.gapFte}
          </strong>
        </p>
      </header>

      <ul className="rp-wf-roles" aria-label="Role gaps">
        {gap.roleGaps.map((r) => (
          <li key={r.role} data-gap={r.gap < 0 ? "short" : "ok"}>
            <span>{r.role}</span>
            <em>
              {r.scheduled}/{r.required}
            </em>
          </li>
        ))}
      </ul>

      <p className="rp-wf-gm">
        {voice === "cfo" ? gap.cfoTranslation : gap.gmTranslation}
      </p>

      <ul className="rp-wf-futures">
        {gap.futures.map((f) => (
          <li
            key={f.id}
            data-rec={f.recommended ? "true" : undefined}
            data-risk={f.serviceRisk.toLowerCase()}
          >
            <strong>{f.label}</strong>
            <div className="rp-wf-fut-nums">
              <span>
                Labor{" "}
                {f.additionalLaborEuro === 0
                  ? "€0"
                  : `−${formatDecisionMoney(f.additionalLaborEuro)}`}
              </span>
              {f.contributionProtectedEuro > 0 ? (
                <span data-semantic="positive">
                  Protect +{formatDecisionMoney(f.contributionProtectedEuro)}
                </span>
              ) : f.revenueExposedEuro > 0 ? (
                <span data-semantic="warning">
                  Exposed {formatDecisionMoney(f.revenueExposedEuro)}
                </span>
              ) : (
                <span>No protect</span>
              )}
              <em>Risk {f.serviceRisk}</em>
            </div>
            {f.recommended ? <i>RADR recommends</i> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
