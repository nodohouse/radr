"use client";

/**
 * Ambient system rails for Control Center —
 * Handling · Watching · Verified · Location signals.
 * Not equal cards.
 */

import Link from "next/link";
import type {
  NeedsYouRow,
  OutlierRow,
} from "@/lib/radr/product/controlCenterMetrics";
import type { PilotLocationPulse } from "@/lib/radr/product/demoOperatingPulse";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { MetricDelta } from "@/components/product/ui/MetricDelta";
import { resolveSemantic } from "@/lib/radr/product/semantic";

export function AmbientHandlingRail({
  handling,
}: {
  handling: NeedsYouRow[];
}) {
  const items =
    handling.length > 0
      ? handling.slice(0, 4)
      : [
          {
            id: "ambient-quiet",
            recommendation: "No action required",
            displayId: "",
          } as NeedsYouRow,
        ];

  return (
    <section className="rp-cmd-ambient" aria-label="RADR is working">
      <p className="rp-cmd-ambient-k">RADR is working</p>
      <ul className="rp-cmd-ambient-list">
        {items.map((r) => (
          <li key={r.id}>
            <span className="rp-cmd-ambient-dot" data-live="true" aria-hidden="true" />
            {r.id === "ambient-quiet" ? (
              <span>{r.recommendation}</span>
            ) : (
              <Link href={`/app/decisions/${r.id}`}>
                {r.recommendation}
                {r.displayId ? <em>{r.displayId}</em> : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WatchingField({
  watching,
  outliers,
}: {
  watching: { id: string; text: string; reason: string }[];
  outliers: OutlierRow[];
}) {
  const signals =
    watching.length > 0
      ? watching.slice(0, 4).map((w) => ({
          id: w.id,
          label: w.text,
          detail: w.reason,
          href: undefined as string | undefined,
        }))
      : outliers.slice(0, 3).map((o) => ({
          id: o.id,
          label: o.what,
          detail: `${o.locationLabel} · ${o.amountFormatted}`,
          href: o.href,
        }));

  return (
    <section className="rp-cmd-watch" aria-label="Watching">
      <p className="rp-cmd-ambient-k">Watching</p>
      {signals.length === 0 ? (
        <p className="rp-cmd-quiet">No open watches</p>
      ) : (
        <ul className="rp-cmd-watch-list">
          {signals.map((s) => (
            <li key={s.id}>
              {s.href ? (
                <Link href={s.href}>
                  <strong>{s.label}</strong>
                  <span>{s.detail}</span>
                </Link>
              ) : (
                <>
                  <strong>{s.label}</strong>
                  <span>{s.detail}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="rp-cmd-watch-note">No Decision yet</p>
    </section>
  );
}

export function VerifiedChip({
  rows,
  totalFormatted,
}: {
  rows: NeedsYouRow[];
  totalFormatted: string;
}) {
  return (
    <section className="rp-cmd-verified" aria-label="Recently verified">
      <p className="rp-cmd-ambient-k">Verified</p>
      <p className="rp-cmd-verified-num" data-semantic="verified">
        {totalFormatted}
      </p>
      {rows[0] ? (
        <Link href={`/app/decisions/${rows[0].id}`} className="rp-cmd-verified-link">
          {rows[0].displayId} · {rows[0].economicFormatted}
        </Link>
      ) : (
        <p className="rp-cmd-quiet">None since last check</p>
      )}
      <Link href="/app/value" className="rp-cmd-verified-all">
        Ledger →
      </Link>
    </section>
  );
}

export function LocationSignalStrip({
  locations,
}: {
  locations: PilotLocationPulse[];
}) {
  return (
    <section className="rp-cmd-locs" aria-label="Location signals">
      <p className="rp-cmd-ambient-k">Locations</p>
      <ul className="rp-cmd-loc-signals">
        {locations.map((loc) => {
          const revDelta = loc.revenueActual - loc.revenuePlan;
          const contribDelta = loc.contributionActual - loc.contributionPlan;
          const revSem = resolveSemantic(revDelta, true);
          const contribSem = resolveSemantic(contribDelta, true);
          const short =
            loc.label.split("·")[0]?.trim() ?? loc.label;
          const within =
            Math.abs(revDelta) < 500 &&
            Math.abs(contribDelta) < 500 &&
            loc.activeExposure === 0 &&
            loc.needsYouCount === 0;

          return (
            <li key={loc.locationId}>
              <Link href={`/app/locations/${loc.locationId}`}>
                <strong>{short}</strong>
                {within ? (
                  <span data-semantic="neutral">Within range</span>
                ) : (
                  <span className="rp-cmd-loc-deltas">
                    <em data-semantic={revSem.semantic}>
                      {revSem.glyph} Rev
                    </em>
                    <em data-semantic={contribSem.semantic}>
                      {contribSem.glyph} Contrib
                    </em>
                    {loc.activeExposure > 0 ? (
                      <em data-semantic="warning">
                        △ {formatDecisionMoney(loc.activeExposure)}
                      </em>
                    ) : null}
                    {loc.needsYouCount > 0 ? (
                      <em data-semantic="warning">
                        {loc.needsYouCount} Decision
                        {loc.needsYouCount === 1 ? "" : "s"}
                      </em>
                    ) : null}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SystemHealthChip({
  live,
  stale,
  degraded,
  href = "/app/data-health",
}: {
  live: number;
  stale: number;
  degraded: number;
  href?: string;
}) {
  const total = live + stale + degraded;
  const ok = degraded === 0 && stale === 0;
  return (
    <Link
      href={href}
      className="rp-cmd-syshealth"
      data-ok={ok ? "true" : undefined}
      aria-label="System health"
    >
      <span className="rp-cmd-syshealth-dot" data-live={!ok ? undefined : "true"} />
      <strong>SYSTEM {ok ? "LIVE" : "WATCH"}</strong>
      <span>
        {live}/{total || 6} sources fresh
        {degraded > 0 ? ` · ${degraded} degraded` : ""}
      </span>
    </Link>
  );
}

/** @deprecated — prefer AmbientHandlingRail + WatchingField + VerifiedChip */
export function HandlingVerifiedWatching({
  handling,
  verified,
  watching,
}: {
  handling: NeedsYouRow[];
  verified: NeedsYouRow[];
  watching: { id: string; text: string; reason: string }[];
  bento?: boolean;
}) {
  return (
    <div className="rp-cmd-status-row" aria-label="Status">
      <AmbientHandlingRail handling={handling} />
      <VerifiedChip
        rows={verified}
        totalFormatted={verified[0]?.economicFormatted ?? "—"}
      />
      <WatchingField watching={watching} outliers={[]} />
    </div>
  );
}

/** Kept for Performance lens outliers */
export function OutlierPanel({
  rows,
  limit = 4,
}: {
  rows: OutlierRow[];
  visual?: boolean;
  limit?: number;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="rp-cin-outliers" aria-label="Outliers">
      <p className="rp-cmd-ambient-k">
        {limit === 1 ? "Material outlier" : "Outliers"}
      </p>
      <ul>
        {rows.slice(0, limit).map((r) => (
          <li key={r.id}>
            <Link href={r.href}>
              <strong>{r.what}</strong>
              <em>{r.amountFormatted}</em>
              <span>{r.locationLabel}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Legacy DecisionQueue — CommandLens owns the handoff now */
export function DecisionQueue({
  rows,
  onSelect,
  empty,
}: {
  rows: NeedsYouRow[];
  onSelect: (id: string) => void;
  empty: boolean;
  compact?: boolean;
}) {
  if (empty) {
    return (
      <p className="rp-cmd-quiet">Nothing needs you.</p>
    );
  }
  return (
    <ul className="rp-cmd-handoff-list">
      {rows.slice(0, 2).map((r) => (
        <li key={r.id}>
          <button type="button" className="rp-cmd-handoff-card" onClick={() => onSelect(r.id)}>
            <p className="rp-cmd-handoff-verb">{r.recommendation}</p>
            <MetricDelta
              value={r.economicFormatted}
              deltaSigned={1}
              semantic="positive"
              size="secondary"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
