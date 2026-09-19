"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import { getTerm, type TermId } from "@/lib/radr/terminology";
import type { WaterfallLine } from "@/lib/radr/finance";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({
    amount: n,
    currency: "EUR",
    locale: "de-DE",
  });
}

type Props = {
  line: WaterfallLine | null;
  onClose: () => void;
};

/**
 * Level 2-4: definition, variance, Why, sources.
 */
export function FinanceExplainSheet({ line, onClose }: Props) {
  if (!line) return null;

  const def = getTerm(line.definitionId as TermId);
  const isPct = line.kind === "margin";

  return (
    <div className="rp-fol-sheet" role="presentation">
      <button
        type="button"
        className="rp-fol-sheet-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        className="rp-fol-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={line.label}
      >
        <header className="rp-fol-sheet-head">
          <p className="rp-fol-sheet-kicker">{line.label}</p>
          <button
            type="button"
            className="rp-fol-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="rp-fol-sheet-amount">
          <strong>
            {isPct
              ? `${line.amount.toFixed(1).replace(".", ",")}%`
              : eur(line.amount)}
          </strong>
          <span data-confidence={line.confidence}>{line.confidence}</span>
        </p>

        {def ? (
          <p className="rp-fol-sheet-def">{def.shortDefinition}</p>
        ) : null}

        {line.variance ? (
          <div className="rp-fol-sheet-var">
            <p className="rp-fol-sheet-sec-label">Actual / plan</p>
            <dl className="rp-fol-sheet-dl">
              <div>
                <dt>Actual</dt>
                <dd>
                  {line.variance.unit === "pts" || line.variance.unit === "pct"
                    ? `${line.variance.actual.toFixed(1).replace(".", ",")}%`
                    : eur(line.variance.actual)}
                </dd>
              </div>
              <div>
                <dt>Plan</dt>
                <dd>
                  {line.variance.unit === "pts" || line.variance.unit === "pct"
                    ? `${line.variance.plan.toFixed(1).replace(".", ",")}%`
                    : eur(line.variance.plan)}
                </dd>
              </div>
              <div>
                <dt>Variance</dt>
                <dd data-tone={line.variance.variance >= 0 ? "watch" : "good"}>
                  {line.variance.unit === "pts"
                    ? `${line.variance.variance >= 0 ? "+" : ""}${line.variance.variance.toFixed(1).replace(".", ",")} pts`
                    : `${line.variance.variance >= 0 ? "+" : "−"}${eur(Math.abs(line.variance.variance))}`}
                </dd>
              </div>
            </dl>
            {line.variance.why.map((w) => (
              <WhyLine key={w} why={w} />
            ))}
          </div>
        ) : null}

        <div className="rp-fol-sheet-why">
          <p className="rp-fol-sheet-sec-label">Reading</p>
          {line.why.map((w) => (
            <WhyLine key={w} why={w} />
          ))}
        </div>

        <div className="rp-fol-sheet-sources">
          <p className="rp-fol-sheet-sec-label">Sources</p>
          <ul>
            {line.sources.map((s) => (
              <li key={s.key}>
                <strong>{s.label}</strong>
                <span data-confidence={s.status}>
                  {s.status} · {s.lastSyncLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {line.evidenceHref ? (
          <Link
            href={line.evidenceHref}
            className="rp-btn-secondary"
            onClick={onClose}
          >
            See evidence
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
