"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import {
  FLEET_SORT_LABEL,
  rankFleetRows,
  whyLeaderLine,
  type FleetBrief,
  type FleetSort,
} from "@/lib/radr/fleet";

type Props = {
  brief: FleetBrief;
  /** Drill from group view into one location. */
  onOpenLocation?: (id: string) => void;
};

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

function signedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

function signedPts(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)} pts`;
}

function metricForSort(row: FleetBrief["rows"][number], sort: FleetSort) {
  switch (sort) {
    case "contribution":
      return eur(row.contribution);
    case "margin":
      return `${row.marginPct.toFixed(1)}% · ${signedPts(row.marginVsPlan)}`;
    case "verified":
      return eur(row.verified);
    case "pace":
      return signedPct(row.paceVsExpectedPct);
    case "attention":
      return row.needsYou > 0
        ? `${row.needsYou} · ${eur(row.attentionEuro)}`
        : "Clear";
    default:
      return eur(row.contribution);
  }
}

const SORTS: FleetSort[] = [
  "contribution",
  "margin",
  "verified",
  "pace",
  "attention",
];

/**
 * Bird's-eye fleet ranking - compare locations, not one floor.
 */
export function LocationFleetBoard({ brief, onOpenLocation }: Props) {
  const [sort, setSort] = useState<FleetSort>(brief.defaultSort);
  const [openId, setOpenId] = useState<string | null>(brief.bestId);

  const rows = useMemo(
    () => rankFleetRows(brief.rows, sort),
    [brief.rows, sort],
  );
  const leader = rows[0]!;
  const leaderWhy = whyLeaderLine(leader, sort);

  const totals = useMemo(() => {
    const contribution = brief.rows.reduce((s, r) => s + r.contribution, 0);
    const verified = brief.rows.reduce((s, r) => s + r.verified, 0);
    const attentionEuro = brief.rows.reduce((s, r) => s + r.attentionEuro, 0);
    const avgPace =
      brief.rows.reduce((s, r) => s + r.paceVsExpectedPct, 0) /
      Math.max(1, brief.rows.length);
    return { contribution, verified, attentionEuro, avgPace };
  }, [brief.rows]);

  return (
    <section className="rp-fleet" aria-label="Location comparison">
      <header className="rp-fleet-head">
        <div>
          <p className="rp-fleet-kicker">Group · comparison</p>
          <h2 className="rp-fleet-title">
            {brief.locationCount} locations · side by side
          </h2>
          <p className="rp-fleet-headline">{brief.headline}</p>
        </div>
        <p className="rp-fleet-scope">
          {brief.scopeLabel}
          <span>{brief.periodLabel}</span>
        </p>
      </header>

      <div className="rp-fleet-summary" aria-label="Group totals">
        <article>
          <p className="rp-fleet-sum-label">Contribution</p>
          <p className="rp-fleet-sum-value">{eur(totals.contribution)}</p>
          <p className="rp-fleet-sum-meta">Across the group tonight</p>
        </article>
        <article>
          <p className="rp-fleet-sum-label">Needs you</p>
          <p
            className="rp-fleet-sum-value"
            data-tone={brief.needsYouCount > 0 ? "critical" : "ready"}
          >
            {brief.needsYouCount}
          </p>
          <p className="rp-fleet-sum-meta">
            {brief.needsYouCount > 0
              ? `${eur(totals.attentionEuro)} at stake`
              : "Nothing material open"}
          </p>
        </article>
        <article>
          <p className="rp-fleet-sum-label">Verified</p>
          <p className="rp-fleet-sum-value" data-tone="ready">
            {eur(totals.verified)}
          </p>
          <p className="rp-fleet-sum-meta">
            Pace {signedPct(totals.avgPace)} vs expected
          </p>
        </article>
      </div>

      <article className="rp-fleet-why" aria-label="What puts this location ahead">
        <p className="rp-fleet-why-kicker">Leading · {leader.name}</p>
        <p className="rp-fleet-why-lead">{leaderWhy}</p>
        <ul className="rp-fleet-why-drivers">
          {leader.drivers.map((d) => (
            <li key={d.practice}>
              <strong>{d.practice}</strong>
              <span>{d.effect}</span>
            </li>
          ))}
        </ul>
      </article>

      {brief.successCriteria.length > 0 ? (
        <div className="rp-fleet-learn" aria-label="Success criteria to apply">
          <p className="rp-fleet-learn-kicker">
            Copy what works · apply to lagging sites
          </p>
          <ul className="rp-fleet-learn-list">
            {brief.successCriteria.map((c) => (
              <li key={c.id}>
                <strong>{c.practice}</strong>
                <span>
                  Proven at {c.evidenceFrom} · {c.effect}
                  {c.applyTo.length > 0
                    ? ` · prepare at ${c.applyTo.slice(0, 2).join(", ")}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rp-fleet-sorts" role="tablist" aria-label="Compare by">
        {SORTS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={sort === s}
            className="rp-fleet-sort"
            data-active={sort === s ? "true" : undefined}
            onClick={() => {
              setSort(s);
              const next = rankFleetRows(brief.rows, s)[0];
              if (next) setOpenId(next.id);
            }}
          >
            {FLEET_SORT_LABEL[s]}
          </button>
        ))}
      </div>

      <ol
        className="rp-fleet-list"
        aria-label={`Compared by ${FLEET_SORT_LABEL[sort]}`}
      >
        {rows.map((row, i) => {
          const needs = row.status === "NEEDS_YOU" || row.needsYou > 0;
          const open = openId === row.id;
          return (
            <li
              key={row.id}
              className="rp-fleet-row"
              data-needs-you={needs ? "true" : undefined}
              data-rank={i + 1}
              data-open={open ? "true" : undefined}
            >
              <button
                type="button"
                className="rp-fleet-row-main"
                onClick={() => setOpenId(open ? null : row.id)}
                aria-expanded={open}
              >
                <span className="rp-fleet-rank" aria-label={`Rank ${i + 1}`}>
                  {i + 1}
                </span>
                <div className="rp-fleet-loc">
                  <strong>{row.name}</strong>
                  <span>
                    {row.city} · {row.region}
                  </span>
                </div>
                <div className="rp-fleet-metric">
                  <strong>{metricForSort(row, sort)}</strong>
                  <span className="rp-fleet-why-inline">{row.why}</span>
                </div>
                <div className="rp-fleet-status">
                  {needs ? (
                    <span data-tone="critical">Needs you</span>
                  ) : row.status === "WATCH" ? (
                    <span data-tone="watch">Watch</span>
                  ) : i === 0 ? (
                    <span data-tone="ready">Leading</span>
                  ) : (
                    <span data-tone="ready">On track</span>
                  )}
                </div>
              </button>

              {open ? (
                <div className="rp-fleet-detail">
                  <p className="rp-fleet-detail-label">
                    {i === 0
                      ? "What makes them best"
                      : "What’s driving this rank"}
                  </p>
                  <ul>
                    {row.drivers.map((d) => (
                      <li key={d.practice}>
                        <strong>{d.practice}</strong>
                        <em>{d.effect}</em>
                      </li>
                    ))}
                  </ul>
                  {onOpenLocation ? (
                    <button
                      type="button"
                      className="rp-ps-link"
                      onClick={() => onOpenLocation(row.id)}
                    >
                      Open this location
                    </button>
                  ) : (
                    <Link
                      href={`/app/locations/${row.id}`}
                      className="rp-ps-link"
                    >
                      Open location
                    </Link>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
