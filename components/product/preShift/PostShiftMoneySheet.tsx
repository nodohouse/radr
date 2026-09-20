"use client";

import { formatMoney } from "@/lib/radr/money";
import type {
  PostShiftMoneyLine,
  PostShiftNextAction,
} from "@/lib/radr/preShift";

function eur(amount: number) {
  return formatMoney({ amount, currency: "EUR", locale: "de-DE" });
}

function modeLabel(mode: PostShiftNextAction["mode"]) {
  if (mode === "prepared") return "Prepared for next shift";
  if (mode === "watching") return "RADR is watching";
  return "Needs a decision";
}

type Props = {
  line: PostShiftMoneyLine;
  onClose: () => void;
};

/**
 * Dig-deeper for one evening money category - evidence + what we do with it.
 */
export function PostShiftMoneySheet({ line, onClose }: Props) {
  const isOut = line.side === "out";

  return (
    <div
      className="rp-ps-money-sheet"
      role="dialog"
      aria-label={`${line.label} detail`}
    >
      <button
        type="button"
        className="rp-ps-money-sheet-scrim"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="rp-ps-money-sheet-card" data-side={line.side}>
        <header className="rp-ps-money-sheet-head">
          <div>
            <p className="rp-ps-money-sheet-kicker">
              {isOut ? "Money out" : "Money in"} · tonight
            </p>
            <h2 className="rp-ps-money-sheet-title">{line.label}</h2>
            <p className="rp-ps-money-sheet-amount" data-side={line.side}>
              {isOut ? "−" : ""}
              {eur(line.amount)}
              {line.sharePct != null ? (
                <span>{line.sharePct}% of net</span>
              ) : null}
              {line.vsTypicalPct != null ? (
                <em data-dir={line.vsTypicalPct >= 0 ? "up" : "down"}>
                  {line.vsTypicalPct > 0 ? "+" : ""}
                  {line.vsTypicalPct}% vs typical
                </em>
              ) : null}
            </p>
          </div>
          <button type="button" className="rp-btn-secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="rp-ps-money-sheet-sowhat">{line.soWhat}</p>

        <p className="rp-cc3-zone-label">Evidence</p>
        <ul className="rp-ps-money-sheet-evidence">
          {line.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>

        <p className="rp-cc3-zone-label">What we do with this</p>
        <ul className="rp-ps-money-sheet-actions">
          {line.actions.map((a) => (
            <li key={a.id} data-mode={a.mode}>
              <div>
                <strong>{a.label}</strong>
                <span>{a.reason}</span>
              </div>
              <em>{modeLabel(a.mode)}</em>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
