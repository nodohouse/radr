"use client";

/**
 * Control Center Overview — premium modular command dashboard.
 * Architecture locked. This file executes distinct instrument design.
 */

import Link from "next/link";
import type { ExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import type {
  BridgeSegment,
  ContributionBridge,
} from "@/lib/radr/finance/contributionBridge";
import type { BusinessPulse } from "@/lib/radr/product/businessPulse";
import type {
  NeedsYouRow,
  OutlierRow,
} from "@/lib/radr/product/controlCenterMetrics";
import type { PilotLocationPulse } from "@/lib/radr/product/demoOperatingPulse";
import type { DataHealthRow } from "@/lib/radr/product/dataHealthCanonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { MetricDelta } from "@/components/product/ui/MetricDelta";
import {
  DashboardGrid,
  DashboardModule,
} from "@/components/product/ui/DashboardModule";
import { resolveSemantic } from "@/lib/radr/product/semantic";
import { VendorLogo } from "@/components/product/connections/VendorLogo";

type Props = {
  brief: ExecutiveBrief;
  bridge: ContributionBridge;
  pulse: BusinessPulse;
  needsYou: NeedsYouRow[];
  emptyNeedsYou: boolean;
  handling: NeedsYouRow[];
  verified: NeedsYouRow[];
  watching: { id: string; text: string; reason: string }[];
  outliers: OutlierRow[];
  locations: PilotLocationPulse[];
  healthRows: DataHealthRow[];
  healthSummary: { healthy: number; degraded: number; stale: number };
  verifiedFormatted: string;
  reviewed: number;
  handled: number;
  needJudgment: number;
  onSelectDecision: (id: string) => void;
};

const LOC_VERTICAL: Record<string, string> = {
  loc_berlin_mitte: "Restaurant",
  loc_canal_house: "Boutique hotel",
  loc_chiado_collective: "Serviced apartments",
};

function shortDriverLabel(label: string): string {
  return label
    .replace(/^Sales volume$/i, "Sales")
    .replace(/^Channel fees$/i, "Channel")
    .replace(/^Menu mix$/i, "Menu mix");
}

function ContributionBridgeViz({
  drivers,
}: {
  drivers: BridgeSegment[];
}) {
  const max = Math.max(...drivers.map((d) => Math.abs(d.amount)), 1);
  return (
    <div className="rp-inst-bridge" aria-label="Contribution drivers">
      <p className="rp-inst-bridge-kicker">Contribution drivers</p>
      <ul className="rp-inst-bridge-list">
        {drivers.map((d) => {
          const pct = Math.round((Math.abs(d.amount) / max) * 100);
          const sem =
            d.kind === "positive"
              ? "positive"
              : d.kind === "negative"
                ? "negative"
                : "neutral";
          return (
            <li key={d.id} data-semantic={sem}>
              <span className="rp-inst-bridge-label">
                {shortDriverLabel(d.label)}
              </span>
              <span className="rp-inst-bridge-track" aria-hidden="true">
                <i style={{ width: `${pct}%` }} />
              </span>
              <strong className="rp-inst-bridge-amt">
                {d.amount >= 0 ? "+" : "−"}
                {formatDecisionMoney(Math.abs(d.amount)).replace("€", "€")}
              </strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MicroSpark({
  trend,
  semantic,
}: {
  trend: number[];
  semantic: string;
}) {
  const w = 56;
  const h = 18;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const range = Math.max(max - min, 1);
  const pts = trend
    .map((v, i) => {
      const x = (i / Math.max(trend.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      className="rp-inst-spark"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      data-semantic={semantic}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

export function CcOverviewDashboard({
  brief,
  bridge,
  pulse,
  needsYou,
  emptyNeedsYou,
  handling,
  verified,
  watching,
  outliers,
  locations,
  healthRows,
  healthSummary,
  verifiedFormatted,
  reviewed,
  handled,
  needJudgment,
  onSelectDecision,
}: Props) {
  const revDelta = parseFloat(
    brief.revenueDeltaLabel.replace(/[^0-9.+-]/g, ""),
  );
  const contribNeg =
    brief.contributionDeltaLabel.includes("−") ||
    brief.contributionDeltaLabel.trim().startsWith("-");
  const contribAbs = parseFloat(
    brief.contributionDeltaLabel.replace(/[^0-9.]/g, ""),
  );
  const primary = shownNeeds(needsYou, emptyNeedsYou);
  const secondary = needsYou.slice(1, 2)[0];

  const watchSignals =
    watching.length > 0
      ? watching.slice(0, 3)
      : outliers.slice(0, 2).map((o) => ({
          id: o.id,
          text: o.what,
          reason: `${o.locationLabel} · ${o.amountFormatted}`,
        }));

  const activityBase = [
    ...handling.slice(0, 2).map((h) => ({
      id: h.id,
      label: h.recommendation,
      done: false,
    })),
    ...verified.slice(0, 2).map((v) => ({
      id: v.id,
      label: `${v.displayId} verified`,
      done: true,
    })),
  ].slice(0, 5);

  const activity =
    activityBase.length > 0
      ? activityBase
      : [{ id: "quiet", label: "No open actions", done: true }];

  const freshest =
    healthRows
      .filter((r) => r.status === "CONNECTED")
      .map((r) => r.lastSync)
      .sort((a, b) => syncSeconds(a) - syncSeconds(b))[0] ?? "40s ago";

  const lastData = freshest;
  const lastUpdate = (() => {
    const m = freshest.match(/^(\d+)\s*(s|m|h)\s*ago$/);
    if (!m) return "12s ago";
    const n = Number(m[1]);
    const u = m[2];
    if (u === "s") return `${Math.max(8, Math.round(n * 0.35))}s ago`;
    if (u === "m") return n <= 1 ? "18s ago" : `${Math.max(1, n - 1)}m ago`;
    return "2m ago";
  })();

  const drivers = bridge.segments.filter(
    (s) => s.kind === "positive" || s.kind === "negative",
  );

  const judgmentCount = emptyNeedsYou ? 0 : needsYou.length;
  const judgmentPad = String(judgmentCount).padStart(2, "0");

  const editorialTitle =
    Number.isFinite(revDelta) && revDelta > 0 && contribNeg
      ? "Revenue is ahead. Contribution isn't."
      : contribNeg
        ? "Contribution is under pressure."
        : brief.headline;

  return (
    <DashboardGrid className="rp-cc-overview" data-vs3="true">
      {/* ─── TIER 1 · Operating Situation ─── */}
      <DashboardModule
        type="hero"
        span={8}
        spanMd={8}
        tier={1}
        instrument="situation"
        hideHeader
        href="/app?view=performance"
      >
        <div className="rp-inst-situation">
          <div className="rp-inst-situation-main">
            <header className="rp-inst-situation-head">
              <p className="rp-dash-hero-kicker">Operating situation</p>
              <div className="rp-inst-situation-live">
                <span className="rp-dash-ticker-live">
                  <i aria-hidden="true" />
                  LIVE
                </span>
                <span className="rp-dash-ticker-stamp">
                  Update <time>{lastUpdate}</time>
                </span>
                <span className="rp-dash-ticker-stamp">
                  Data <time>{lastData}</time>
                </span>
              </div>
            </header>

            <div className="rp-cc-brief-editorial">
              <h2>{editorialTitle}</h2>
              <p>
                RADR reviewed the operation — {reviewed.toLocaleString("en-GB")}{" "}
                signals compressed to what needs judgment.
              </p>
            </div>

            <div className="rp-cc-compress" aria-label="Attention compression">
              <span>
                <strong>{reviewed}</strong> changes
              </span>
              <i aria-hidden="true" />
              <span>
                <strong>{handled}</strong> handled
              </span>
              <i aria-hidden="true" />
              <span data-need={needJudgment > 0 ? "true" : undefined}>
                <strong>{needJudgment}</strong> need judgment
              </span>
            </div>

            <div className="rp-inst-situation-metrics">
              <div className="rp-inst-situation-metric">
                <MetricDelta
                  value={brief.revenueDeltaLabel}
                  deltaSigned={Number.isFinite(revDelta) ? revDelta : 3.1}
                  higherIsBetter
                  size="hero"
                />
                <span>Revenue</span>
              </div>
              <div className="rp-inst-situation-metric">
                <MetricDelta
                  value={brief.contributionDeltaLabel}
                  deltaSigned={
                    Number.isFinite(contribAbs)
                      ? contribNeg
                        ? -contribAbs
                        : contribAbs
                      : -4780
                  }
                  higherIsBetter
                  size="hero"
                />
                <span>Contribution</span>
              </div>
            </div>
          </div>

          <ContributionBridgeViz drivers={drivers} />
        </div>
      </DashboardModule>

      {/* ─── TIER 1 · Needs Your Judgment ─── */}
      <DashboardModule
        type="decision"
        span={4}
        spanMd={8}
        tier={1}
        instrument="judgment"
        tone="decision"
        hideHeader
      >
        <div className="rp-inst-judgment">
          <header className="rp-inst-judgment-head">
            <span className="rp-inst-judgment-kicker">Needs your judgment</span>
            <strong className="rp-inst-judgment-count">{judgmentPad}</strong>
          </header>

          {judgmentCount === 0 || !primary ? (
            <p className="rp-dash-quiet">Everything within range.</p>
          ) : (
            <>
              <button
                type="button"
                className="rp-inst-judgment-primary"
                onClick={() => onSelectDecision(primary.id)}
              >
                <p className="rp-inst-judgment-verb">
                  {primary.recommendation}
                </p>
                <p className="rp-inst-judgment-where">
                  {primary.locationLabel}
                  {primary.classLabel ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      {primary.classLabel}
                    </>
                  ) : null}
                </p>
                <div className="rp-inst-judgment-econ">
                  <MetricDelta
                    value={primary.economicFormatted}
                    deltaSigned={1}
                    semantic="positive"
                    size="primary"
                  />
                  <span>expected contribution</span>
                </div>
                {primary.deadlineLabel ? (
                  <p className="rp-inst-judgment-deadline">
                    <em>{primary.deadlineLabel}</em>
                    <span>to decide</span>
                  </p>
                ) : null}
                <span className="rp-inst-judgment-cta">Compare futures →</span>
              </button>

              {secondary ? (
                <button
                  type="button"
                  className="rp-inst-judgment-secondary"
                  onClick={() => onSelectDecision(secondary.id)}
                >
                  <div>
                    <p className="rp-inst-judgment-verb-sm">
                      {secondary.recommendation}
                    </p>
                    <span className="rp-inst-judgment-meta">
                      {secondary.deadlineLabel ?? secondary.locationLabel}
                    </span>
                  </div>
                  <div className="rp-inst-judgment-sec-econ">
                    <MetricDelta
                      value={secondary.economicFormatted}
                      deltaSigned={1}
                      semantic="positive"
                      size="meta"
                    />
                    <em>Review →</em>
                  </div>
                </button>
              ) : null}
            </>
          )}
        </div>
      </DashboardModule>

      {/* ─── TIER 2 · Business Pulse ─── */}
      <DashboardModule
        type="intelligence"
        span={8}
        spanMd={8}
        tier={2}
        instrument="metric-rail"
        hideHeader
        href="/app?view=performance"
      >
        <div className="rp-inst-rail">
          <header className="rp-inst-rail-head">
            <h2 className="rp-dash-mod-title">Business pulse</h2>
            <span className="rp-inst-rail-period">MTD</span>
          </header>
          <div className="rp-inst-rail-primary">
            {pulse.primary.map((m) => (
              <div key={m.id} className="rp-inst-rail-cell" data-tier="primary">
                <em>{m.label}</em>
                <strong>{m.formatted}</strong>
                {m.comparisonFormatted && m.comparisonValue != null ? (
                  <MetricDelta
                    value={m.comparisonFormatted}
                    deltaSigned={m.comparisonValue}
                    higherIsBetter={m.higherIsBetter}
                    size="meta"
                  />
                ) : m.comparisonFormatted ? (
                  <span className="rp-inst-rail-note" data-semantic="verified">
                    {m.comparisonFormatted}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="rp-inst-rail-support">
            {pulse.support.map((m) => (
              <div key={m.id} className="rp-inst-rail-cell" data-tier="support">
                <em>{m.label}</em>
                <strong>{m.formatted}</strong>
                {m.comparisonFormatted && m.comparisonValue != null ? (
                  <MetricDelta
                    value={m.comparisonFormatted}
                    deltaSigned={m.comparisonValue}
                    higherIsBetter={m.higherIsBetter}
                    size="meta"
                  />
                ) : null}
                {m.comparisonValue != null ? (
                  <MicroSpark
                    trend={sparkFromDelta(m.comparisonValue)}
                    semantic={
                      resolveSemantic(m.comparisonValue, m.higherIsBetter)
                        .semantic
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </DashboardModule>

      {/* ─── TIER 3 · RADR Activity ─── */}
      <DashboardModule
        type="system"
        span={4}
        spanMd={8}
        tier={3}
        instrument="activity"
        hideHeader
      >
        <div className="rp-inst-activity">
          <header className="rp-inst-activity-head">
            <h2 className="rp-dash-mod-title">RADR activity</h2>
            <span className="rp-dash-ticker-live">
              <i aria-hidden="true" />
              LIVE
            </span>
          </header>
          <div className="rp-inst-activity-counts">
            <div>
              <strong>{reviewed}</strong>
              <span>Changes seen</span>
            </div>
            <div>
              <strong>{handled}</strong>
              <span>Handled by RADR</span>
            </div>
            <div data-need={needJudgment > 0 ? "true" : undefined}>
              <strong>{String(needJudgment).padStart(2, "0")}</strong>
              <span>Need judgment</span>
            </div>
          </div>
          <ul className="rp-inst-activity-feed">
            {activity.map((a) => (
              <li key={a.id} data-done={a.done ? "true" : undefined}>
                <span aria-hidden="true">{a.done ? "✓" : "●"}</span>
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </DashboardModule>

      {/* ─── TIER 2 · Location Pulse ─── */}
      <DashboardModule
        type="intelligence"
        span={7}
        spanMd={8}
        tier={2}
        instrument="location"
        title="Location pulse"
        action={{ label: "All →", href: "/app/locations" }}
      >
        <ul className="rp-inst-loc-grid">
          {locations.map((loc) => {
            const revDeltaLoc = loc.revenueActual - loc.revenuePlan;
            const contribDeltaLoc =
              loc.contributionActual - loc.contributionPlan;
            const revSem = resolveSemantic(revDeltaLoc, true);
            const contribSem = resolveSemantic(contribDeltaLoc, true);
            const within =
              Math.abs(revDeltaLoc) < 800 &&
              Math.abs(contribDeltaLoc) < 800 &&
              loc.activeExposure === 0 &&
              loc.needsYouCount === 0;
            const name = loc.label.split("·")[0]?.trim() ?? loc.label;
            const vertical =
              LOC_VERTICAL[loc.locationId] ?? "Hospitality";
            return (
              <li key={loc.locationId}>
                <Link
                  href={`/app/locations/${loc.locationId}`}
                  className="rp-inst-loc-panel"
                  data-state={
                    loc.needsYouCount > 0
                      ? "attention"
                      : within
                        ? "calm"
                        : "watch"
                  }
                >
                  <header>
                    <strong>{name}</strong>
                    <em>{vertical}</em>
                  </header>
                  <MicroSpark
                    trend={locSpark(revDeltaLoc, contribDeltaLoc)}
                    semantic={contribSem.semantic}
                  />
                  <div className="rp-inst-loc-signals">
                    <span data-semantic={revSem.semantic}>
                      {revSem.glyph}{" "}
                      {formatDecisionMoney(Math.abs(revDeltaLoc))} revenue
                    </span>
                    <span data-semantic={contribSem.semantic}>
                      {contribSem.glyph}{" "}
                      {formatDecisionMoney(Math.abs(contribDeltaLoc))}{" "}
                      contribution
                    </span>
                    {loc.activeExposure > 0 ? (
                      <span data-semantic="warning">
                        △ {formatDecisionMoney(loc.activeExposure)} exposure
                      </span>
                    ) : null}
                  </div>
                  <footer>
                    {loc.needsYouCount > 0
                      ? `${loc.needsYouCount} need you`
                      : within
                        ? "Within threshold"
                        : "No intervention"}
                  </footer>
                </Link>
              </li>
            );
          })}
        </ul>
      </DashboardModule>

      {/* ─── TIER 3 · Watching ─── */}
      <DashboardModule
        type="system"
        span={5}
        spanMd={8}
        tier={3}
        instrument="watch"
        tone="warning"
        hideHeader
      >
        <div className="rp-inst-watch">
          <header className="rp-inst-watch-head">
            <h2 className="rp-dash-mod-title">Watching</h2>
            <span className="rp-inst-watch-mark" aria-hidden="true" />
          </header>
          {watchSignals.length === 0 ? (
            <p className="rp-dash-quiet">No open watches</p>
          ) : (
            <ul className="rp-inst-watch-list">
              {watchSignals.map((w) => (
                <li key={w.id}>
                  <details className="rp-inst-watch-item">
                    <summary>
                      <strong>{shortWatchTitle(w.text)}</strong>
                      <div className="rp-inst-watch-range" aria-hidden="true">
                        <span>83%</span>
                        <em>→</em>
                        <span>91%</span>
                      </div>
                      <span className="rp-inst-watch-status">
                        Watching · No action
                      </span>
                    </summary>
                    <div className="rp-inst-watch-why">
                      <p>Why no Decision?</p>
                      <ul>
                        <li>Below materiality threshold</li>
                        <li>Service still recoverable</li>
                        <li>No economic exposure yet</li>
                      </ul>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DashboardModule>

      {/* ─── TIER 3 · Recently Verified ─── */}
      <DashboardModule
        type="system"
        span={6}
        spanMd={8}
        tier={3}
        instrument="verification"
        tone="verified"
        hideHeader
      >
        <div className="rp-inst-verify">
          <header className="rp-inst-verify-head">
            <div>
              <p className="rp-inst-verify-total" data-semantic="verified">
                {verifiedFormatted}
              </p>
              <span>Verified MTD</span>
            </div>
            <Link href="/app/value" className="rp-dash-mod-action">
              Ledger →
            </Link>
          </header>
          <div className="rp-inst-verify-bar" aria-hidden="true">
            {verified.slice(0, 3).map((v, i) => (
              <i
                key={v.id}
                style={{
                  flex: Math.max(
                    1,
                    Math.round(
                      parseFloat(v.economicFormatted.replace(/[^0-9.]/g, "")) ||
                        1,
                    ),
                  ),
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
          </div>
          <ul className="rp-inst-verify-list">
            {verified.slice(0, 3).map((v) => (
              <li key={v.id}>
                <Link href={`/app/decisions/${v.id}`}>
                  <em>{v.displayId}</em>
                  <strong data-semantic="verified">{v.economicFormatted}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DashboardModule>

      {/* ─── TIER 3 · Data Health ─── */}
      <DashboardModule
        type="system"
        span={6}
        spanMd={8}
        tier={3}
        instrument="health"
        hideHeader
        href="/app/data-health"
      >
        <div className="rp-inst-health">
          <header className="rp-inst-health-head">
            <h2 className="rp-dash-mod-title">Data health</h2>
          </header>
          <div className="rp-inst-health-counts">
            <div data-semantic="verified">
              <strong>{healthSummary.healthy}</strong>
              <span>Healthy</span>
            </div>
            <div data-semantic="warning">
              <strong>{healthSummary.degraded}</strong>
              <span>Degraded</span>
            </div>
            <div data-semantic="negative">
              <strong>{healthSummary.stale}</strong>
              <span>Stale</span>
            </div>
          </div>
          <ul className="rp-inst-health-dots">
            {healthRows.slice(0, 6).map((r) => (
              <li key={r.id} data-status={r.status}>
                <VendorLogo id={r.id} name={r.name} size={16} />
                <span>{r.name}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </DashboardModule>
    </DashboardGrid>
  );
}

function shownNeeds(
  needsYou: NeedsYouRow[],
  emptyNeedsYou: boolean,
): NeedsYouRow | null {
  if (emptyNeedsYou || needsYou.length === 0) return null;
  return needsYou[0] ?? null;
}

function syncSeconds(s: string): number {
  const m = s.match(/(\d+)\s*(s|m|h)/);
  if (!m) return 999999;
  const n = Number(m[1]);
  const u = m[2];
  return u === "s" ? n : u === "m" ? n * 60 : n * 3600;
}

function shortWatchTitle(text: string): string {
  if (/kitchen|pressure|ticket/i.test(text)) return "Kitchen pressure";
  if (/labor|roster/i.test(text)) return "Labor load";
  if (/channel|delivery/i.test(text)) return "Channel mix";
  const first = text.split(/[·.—–]/)[0]?.trim() ?? text;
  return first.length > 28 ? `${first.slice(0, 26)}…` : first;
}

function sparkFromDelta(delta: number): number[] {
  const base = 40;
  const end = base + Math.max(-18, Math.min(18, delta * 4));
  return [base, base + (end - base) * 0.35, base + (end - base) * 0.7, end];
}

function locSpark(rev: number, contrib: number): number[] {
  const a = 50;
  return [
    a,
    a + Math.sign(rev) * 8,
    a + Math.sign(rev) * 12 + Math.sign(contrib) * 4,
    a + Math.sign(contrib) * 10,
  ];
}
