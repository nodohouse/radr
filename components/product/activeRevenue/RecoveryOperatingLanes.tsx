"use client";

import { formatMoney } from "@/lib/radr/money";
import type { ActiveRevenueBrief } from "@/lib/radr/activeRevenue";
import {
  portfolioRecoveryRollup,
  portfolioRecoverySummary,
  recoveryAltitudeForRole,
} from "@/lib/radr/activeRevenue";
import {
  handledRecoveries,
  handlingRecoveries,
  recoveryOperatingCounts,
} from "@/lib/radr/glance";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  brief: ActiveRevenueBrief;
  onOpenRecovery: (id: string) => void;
  onOpenHandled: () => void;
};

/**
 * Compact operating lanes - needs you · RADR handling · handled.
 * Not three giant sections.
 */
export function RecoveryOperatingLanes({
  brief,
  onOpenRecovery,
  onOpenHandled,
}: Props) {
  const counts = recoveryOperatingCounts(brief);
  const handling = handlingRecoveries(brief).slice(0, 2);
  if (counts.needsYou === 0 && counts.handling === 0 && counts.handled === 0) {
    return null;
  }

  return (
    <div className="rp-lrr-lanes" aria-label="Recovery operating state">
      <p className="rp-lrr-lanes-summary">
        <strong>{counts.needsYou}</strong> need you
        <span aria-hidden="true"> · </span>
        <strong>{counts.handling}</strong> being handled
        <span aria-hidden="true"> · </span>
        <button type="button" className="rp-lrr-lanes-handled" onClick={onOpenHandled}>
          <strong>{counts.handled}</strong> handled
        </button>
      </p>

      {handling.length > 0 ? (
        <ul className="rp-lrr-lanes-handling">
          {handling.map((r) => (
            <li key={r.id}>
              <span className="rp-ari-kicker">RADR is handling</span>
              <strong>
                {r.tableLabel} · {r.reservationTime}
              </strong>
              <em>{r.strategyWhy[0]}</em>
              <button
                type="button"
                className="rp-ari-link"
                onClick={() => onOpenRecovery(r.id)}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ProofProps = {
  brief: ActiveRevenueBrief;
  roleView?: string;
  onClose: () => void;
};

/**
 * Proof chain for top-bar "handled by RADR" / verified recovery.
 * Portfolio altitude: totals only - no table list.
 */
export function HandledByRadrSheet({ brief, roleView, onClose }: ProofProps) {
  const handled = handledRecoveries(brief);
  const portfolio = recoveryAltitudeForRole(roleView) === "portfolio";
  const rollup = portfolioRecoveryRollup(brief);

  return (
    <div className="rp-lrr-drawer" role="dialog" aria-label="Handled by RADR">
      <button
        type="button"
        className="rp-lrr-drawer-scrim"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="rp-lrr-drawer-card">
        <header className="rp-lrr-drawer-head">
          <div>
            <p className="rp-ari-kicker">Handled today</p>
            <h2 className="rp-lrr-drawer-title">
              {portfolio ? "Verified recovery" : "Verified recovery"}
            </h2>
            <p className="rp-ari-meta">
              {portfolio
                ? `${eur(rollup.verifiedValue)} proved · floor absorbed table work`
                : "Proof chain from cancellation to POS"}
            </p>
          </div>
          <button type="button" className="rp-btn-secondary" onClick={onClose}>
            Close
          </button>
        </header>

        {portfolio ? (
          <ul className="rp-ari-month-grid">
            <li data-signal="true">
              <span>Verified</span>
              <strong>{eur(rollup.verifiedValue)}</strong>
            </li>
            <li>
              <span>Recoveries</span>
              <strong>{rollup.verifiedCount}</strong>
            </li>
            <li>
              <span>Still open</span>
              <strong>{eur(rollup.atRisk)}</strong>
            </li>
            <li>
              <span>Guest upside</span>
              <strong>{eur(rollup.guestContrib)}</strong>
            </li>
          </ul>
        ) : (
          <ul className="rp-ari-list">
            {handled.map((r) => {
              const summary = portfolioRecoverySummary(r);
              return (
                <li key={r.id}>
                  <p className="rp-ari-row-kicker">
                    {r.tableLabel} ·{" "}
                    {r.trigger === "NO_SHOW" ? "No-show" : "Cancellation"}
                  </p>
                  <p className="rp-ari-row-title">
                    {summary.title}
                  </p>
                  <p className="rp-ari-row-money">
                    <strong>{eur(r.verifiedRecoveredValue ?? 0)}</strong>
                    <span>verified POS</span>
                  </p>
                  <ul className="rp-lrr-proof">
                    <li>
                      Detected: {r.cancelledAt ?? r.reservationTime}
                    </li>
                    <li>
                      Recovery:{" "}
                      {r.recoveryChannel?.replace(/_/g, " ") ?? "Waitlist"}
                    </li>
                    {r.recoveredInMinutes != null ? (
                      <li>Rebooked in {r.recoveredInMinutes} min</li>
                    ) : null}
                    <li>
                      POS spend:{" "}
                      {eur(
                        r.replacementActualSpend ??
                          r.verifiedRecoveredValue ??
                          0,
                      )}
                    </li>
                    <li>
                      Verified: {eur(r.verifiedRecoveredValue ?? 0)}
                    </li>
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
