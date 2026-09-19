"use client";

import { useEffect, useState } from "react";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import type { MenuAvailabilityRisk } from "@/lib/radr/menuAvailability";

type Props = {
  risk: MenuAvailabilityRisk;
  /** Open the detail sheet immediately (from Control Center queue). */
  forceOpen?: boolean;
  onClose?: () => void;
};

/**
 * Menu risk detail sheet. Compact card only when not force-opened.
 */
export function MenuAvailabilityCard({
  risk,
  forceOpen = false,
  onClose,
}: Props) {
  const [open, setOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  function close() {
    setOpen(false);
    onClose?.();
  }

  const sheet = open ? (
    <div
      className="rp-menu-risk-sheet"
      role="dialog"
      aria-label="Menu risk options"
    >
      <div className="rp-menu-risk-scrim" onClick={close} aria-hidden="true" />
      <div className="rp-menu-risk-panel">
        <header>
          <p className="rp-intel-label">Protect contribution</p>
          <h3>{risk.headline}</h3>
          <p className="rp-intel-line">
            {formatFindingEuro(risk.exposure.grossRevenueAtRisk)} gross exposed
            · {formatFindingEuro(risk.exposure.expectedRevenueLoss)} expected
            loss · {formatFindingEuro(risk.exposure.contributionAtRisk)}{" "}
            contribution
          </p>
        </header>
        <ul className="rp-menu-risk-affected">
          {risk.affected.map((a) => (
            <li key={a.menuItemId}>
              <strong>{a.menuItemName}</strong>
              <span>
                {a.portionsPossible}/{a.expectedPortions} · {a.shortfallPortions}{" "}
                short
              </span>
            </li>
          ))}
        </ul>
        <ol className="rp-menu-risk-option-list">
          {risk.options.map((o) => (
            <li key={o.id}>
              <strong>{o.title}</strong>
              <p>{o.detail}</p>
              {o.valueProtected > 0 ? (
                <p className="rp-menu-risk-protected">
                  Value protected: {formatFindingEuro(o.valueProtected)}
                </p>
              ) : null}
              <p className="rp-menu-risk-approval">
                Requires approval · not executed automatically
              </p>
            </li>
          ))}
        </ol>
        <button type="button" className="rp-btn-secondary" onClick={close}>
          Close
        </button>
      </div>
    </div>
  ) : null;

  if (forceOpen) return sheet;

  return (
    <article className="rp-intel-card" data-tour-target="menu-risk">
      <p className="rp-intel-label">Menu risk</p>
      <h2 className="rp-intel-title">{risk.headline}</h2>
      <p className="rp-intel-money">
        <strong>{formatFindingEuro(risk.exposure.contributionAtRisk)}</strong>
        <span>contribution at risk</span>
      </p>
      <p className="rp-intel-line">
        {risk.portionsExpected} expected · {risk.portionsAvailable} available
      </p>
      <button
        type="button"
        className="rp-intel-cta"
        onClick={() => setOpen(true)}
      >
        Review options
      </button>
      {sheet}
    </article>
  );
}
