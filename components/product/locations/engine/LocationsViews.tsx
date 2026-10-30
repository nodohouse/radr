"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type {
  LocationRow,
  LocationsOverviewModel,
} from "@/lib/radr/product/locationsProofEngine";

type Common = {
  model: LocationsOverviewModel;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function RankTable({
  rows,
  selectedId,
  onSelect,
  columns,
}: {
  rows: LocationRow[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  columns: "performance" | "exposure" | "profitability" | "watchlist";
}) {
  return (
    <div className="le-table-wrap">
      <table className="le-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Location</th>
            {columns === "performance" ? (
              <>
                <th>Revenue</th>
                <th>vs Plan</th>
                <th>Contribution</th>
                <th>vs Plan</th>
                <th>Margin</th>
                <th>Trend</th>
              </>
            ) : null}
            {columns === "exposure" ? (
              <>
                <th>Exposure</th>
                <th>Covered</th>
                <th>Unmanaged</th>
                <th>Driver</th>
                <th>Attention</th>
              </>
            ) : null}
            {columns === "profitability" ? (
              <>
                <th>Contribution</th>
                <th>Margin</th>
                <th>Rev / cover*</th>
                <th>vs Plan</th>
                <th>Verified</th>
              </>
            ) : null}
            {columns === "watchlist" ? (
              <>
                <th>What changed</th>
                <th>State</th>
                <th>Driver</th>
                <th>Exposure</th>
                <th>Next</th>
              </>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const covered = Math.round(row.exposure * 0.72);
            const unmanaged = Math.max(0, row.exposure - covered);
            const revPerCover =
              row.revenue > 0
                ? Math.round(row.contribution / Math.max(1, row.revenue / 85))
                : 0;
            return (
              <tr
                key={row.id}
                data-state={row.state}
                data-active={selectedId === row.id ? "true" : undefined}
                onClick={() => onSelect(row.id)}
              >
                <td className="le-rank">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <strong>{row.name}</strong>
                  <span>{row.city}</span>
                </td>
                {columns === "performance" ? (
                  <>
                    <td className="le-num">{formatDecisionMoney(row.revenue)}</td>
                    <td
                      className="le-num"
                      data-tone={row.revenueVsPlanPct >= 0 ? "pos" : "neg"}
                    >
                      {row.revenueVsPlanPct >= 0 ? "+" : ""}
                      {row.revenueVsPlanPct}%
                    </td>
                    <td className="le-num">
                      {formatDecisionMoney(row.contribution)}
                    </td>
                    <td
                      className="le-num"
                      data-tone={row.contributionVsPlanPct >= 0 ? "pos" : "neg"}
                    >
                      {row.contributionVsPlanPct >= 0 ? "+" : ""}
                      {row.contributionVsPlanPct}%
                    </td>
                    <td className="le-num">{row.marginPct}%</td>
                    <td>
                      <span className="le-badge" data-state={row.state}>
                        {row.trendTone === "up"
                          ? "Improving"
                          : row.trendTone === "down"
                            ? "Deteriorating"
                            : "Flat"}
                      </span>
                    </td>
                  </>
                ) : null}
                {columns === "exposure" ? (
                  <>
                    <td className="le-num">{formatDecisionMoney(row.exposure)}</td>
                    <td className="le-num">{formatDecisionMoney(covered)}</td>
                    <td className="le-num" data-tone="neg">
                      {formatDecisionMoney(unmanaged)}
                    </td>
                    <td>{row.primaryDriver}</td>
                    <td>
                      <span className="le-badge" data-state={row.state}>
                        {row.attentionLabel}
                      </span>
                    </td>
                  </>
                ) : null}
                {columns === "profitability" ? (
                  <>
                    <td className="le-num">
                      {formatDecisionMoney(row.contribution)}
                    </td>
                    <td className="le-num">{row.marginPct}%</td>
                    <td className="le-num">€{revPerCover}</td>
                    <td
                      className="le-num"
                      data-tone={row.contributionVsPlanPct >= 0 ? "pos" : "neg"}
                    >
                      {row.contributionVsPlanPct >= 0 ? "+" : ""}
                      {row.contributionVsPlanPct}%
                    </td>
                    <td className="le-num">
                      {row.verified > 0
                        ? formatDecisionMoney(row.verified)
                        : "—"}
                    </td>
                  </>
                ) : null}
                {columns === "watchlist" ? (
                  <>
                    <td>{row.headline}</td>
                    <td>
                      <span className="le-badge" data-state={row.state}>
                        {row.attentionLabel}
                      </span>
                    </td>
                    <td>{row.primaryDriver}</td>
                    <td className="le-num">{formatDecisionMoney(row.exposure)}</td>
                    <td>
                      <Link
                        href={row.diagnosisHref}
                        onClick={(e) => e.stopPropagation()}
                        className="le-link"
                      >
                        {row.needsYou > 0 ? "Review Decision" : "View diagnosis"}{" "}
                        →
                      </Link>
                    </td>
                  </>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LocationsPerformance({ model, selectedId, onSelect }: Common) {
  const rows = [...model.rows].sort((a, b) => b.contribution - a.contribution);
  return (
    <div className="le-deep" data-locations-view="performance">
      <header className="le-deep-head">
        <div>
          <p className="le-k">Performance · {model.periodLabel}</p>
          <h2>Where contribution is created</h2>
          <p>
            Ranked by contribution. Revenue strength without contribution health
            is called out.
          </p>
        </div>
        <dl className="le-deep-kpis">
          <div>
            <dt>Revenue</dt>
            <dd>{model.revenueFormatted}</dd>
          </div>
          <div>
            <dt>Contribution</dt>
            <dd>{model.contributionFormatted}</dd>
          </div>
          <div>
            <dt>vs plan</dt>
            <dd data-tone={model.contributionVsPlanPct >= 0 ? "pos" : "neg"}>
              {model.contributionVsPlanPct >= 0 ? "+" : ""}
              {model.contributionVsPlanPct}%
            </dd>
          </div>
        </dl>
      </header>
      <section className="le-table-card">
        <RankTable
          rows={rows}
          selectedId={selectedId}
          onSelect={onSelect}
          columns="performance"
        />
      </section>
    </div>
  );
}

export function LocationsExposure({ model, selectedId, onSelect }: Common) {
  const rows = [...model.rows].sort((a, b) => b.exposure - a.exposure);
  const gross = rows.reduce((s, r) => s + r.exposure, 0);
  const covered = Math.round(gross * 0.72);
  const unmanaged = Math.max(0, gross - covered);
  const top = rows[0];
  const share =
    top && gross > 0 ? Math.round((top.exposure / gross) * 100) : 0;

  return (
    <div className="le-deep" data-locations-view="exposure">
      <header className="le-deep-head">
        <div>
          <p className="le-k">Exposure · {model.periodLabel}</p>
          <h2>Where risk concentrates</h2>
          <p>
            Same exposure model as Control Center. Unmanaged = not yet covered by
            an active Decision path.
          </p>
        </div>
        <dl className="le-deep-kpis">
          <div>
            <dt>Gross exposure</dt>
            <dd>{formatDecisionMoney(gross)}</dd>
          </div>
          <div>
            <dt>Decision-covered</dt>
            <dd>{formatDecisionMoney(covered)} · 72%</dd>
          </div>
          <div>
            <dt>Unmanaged</dt>
            <dd data-tone="neg">{formatDecisionMoney(unmanaged)}</dd>
          </div>
        </dl>
      </header>
      {top ? (
        <p className="le-deep-insight">
          <strong>{top.name}</strong> carries {share}% of current exposure ·{" "}
          {top.primaryDriver}.
        </p>
      ) : null}
      <section className="le-table-card">
        <RankTable
          rows={rows}
          selectedId={selectedId}
          onSelect={onSelect}
          columns="exposure"
        />
      </section>
      <div className="le-pb-links le-deep-links">
        <Link href="/app">Control Center →</Link>
        <Link href="/app/intelligence?finding=location-exposure">
          Intelligence · location exposure →
        </Link>
        <Link href="/app/data-health">Data Health →</Link>
      </div>
    </div>
  );
}

export function LocationsProfitability({ model, selectedId, onSelect }: Common) {
  const rows = [...model.rows].sort((a, b) => b.marginPct - a.marginPct);
  return (
    <div className="le-deep" data-locations-view="profitability">
      <header className="le-deep-head">
        <div>
          <p className="le-k">Profitability · {model.periodLabel}</p>
          <h2>Margin and contribution quality</h2>
          <p>
            Fair comparison: margin % and contribution density — not raw revenue
            size alone. *Illustrative per-cover proxy from estate economics.
          </p>
        </div>
        <dl className="le-deep-kpis">
          <div>
            <dt>Contribution</dt>
            <dd>{model.contributionFormatted}</dd>
          </div>
          <div>
            <dt>Avg / location</dt>
            <dd>{model.avgContributionFormatted}</dd>
          </div>
          <div>
            <dt>Verified (sum)</dt>
            <dd>
              {formatDecisionMoney(
                model.rows.reduce((s, r) => s + r.verified, 0),
              )}
            </dd>
          </div>
        </dl>
      </header>
      <section className="le-table-card">
        <RankTable
          rows={rows}
          selectedId={selectedId}
          onSelect={onSelect}
          columns="profitability"
        />
      </section>
      <div className="le-deep-links">
        <Link href="/app/value">Open Verified Value →</Link>
      </div>
    </div>
  );
}

export function LocationsWatchlist({ model, selectedId, onSelect }: Common) {
  const rows = model.rows
    .filter(
      (r) =>
        r.state === "needs_attention" ||
        r.state === "intervene" ||
        r.state === "watch" ||
        r.state === "data_degraded" ||
        r.needsYou > 0,
    )
    .sort(
      (a, b) =>
        b.needsYou - a.needsYou ||
        b.exposure - a.exposure ||
        a.contributionVsPlanPct - b.contributionVsPlanPct,
    );

  return (
    <div className="le-deep" data-locations-view="watchlist">
      <header className="le-deep-head">
        <div>
          <p className="le-k">Watchlist · {model.periodLabel}</p>
          <h2>What changed — and what needs a path</h2>
          <p>
            Not only red sites. Watch + Intervene + Needs judgment, each with a
            next action.
          </p>
        </div>
        <dl className="le-deep-kpis">
          <div>
            <dt>On watchlist</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>Need judgment</dt>
            <dd data-tone="neg">
              {rows.reduce((s, r) => s + r.needsYou, 0)}
            </dd>
          </div>
        </dl>
      </header>
      <section className="le-table-card">
        {rows.length ? (
          <RankTable
            rows={rows}
            selectedId={selectedId}
            onSelect={onSelect}
            columns="watchlist"
          />
        ) : (
          <p className="le-quiet">No locations currently on the watchlist.</p>
        )}
      </section>
    </div>
  );
}
