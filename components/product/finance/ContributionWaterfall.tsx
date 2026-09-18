"use client";

import { formatMoney } from "@/lib/radr/money";
import type { WaterfallLine } from "@/lib/radr/finance";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  lines: WaterfallLine[];
  onSelect: (line: WaterfallLine) => void;
};

/**
 * Live contribution waterfall - answer first, click for Why.
 */
export function ContributionWaterfall({ lines, onSelect }: Props) {
  return (
    <section className="rp-fol-waterfall" aria-label="Live contribution waterfall">
      <header className="rp-fol-sec-head">
        <p className="rp-fol-sec-kicker">Waterfall</p>
        <p className="rp-fol-sec-title">From net sales to live contribution</p>
      </header>

      <ol className="rp-fol-waterfall-list">
        {lines.map((line) => {
          const isResult = line.kind === "result";
          const isMargin = line.kind === "margin";
          const isLess = line.kind === "less";
          return (
            <li key={line.id} data-kind={line.kind}>
              <button
                type="button"
                className="rp-fol-waterfall-row"
                onClick={() => onSelect(line)}
                data-kind={line.kind}
              >
                <span className="rp-fol-waterfall-label">
                  {isLess ? <em>less</em> : null}
                  {line.label}
                </span>
                <span className="rp-fol-waterfall-amount">
                  {isMargin ? (
                    <>
                      <strong>
                        {line.amount.toFixed(1).replace(".", ",")}%
                      </strong>
                      {line.variance ? (
                        <span
                          className="rp-fol-waterfall-var"
                          data-tone={
                            line.variance.variance >= 0 ? "good" : "watch"
                          }
                        >
                          {line.variance.variance >= 0 ? "+" : ""}
                          {line.variance.variance.toFixed(1).replace(".", ",")}{" "}
                          pts vs plan
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <strong>
                        {isLess ? "−" : ""}
                        {eur(line.amount)}
                      </strong>
                      {line.secondary ? (
                        <span className="rp-fol-waterfall-sec">
                          {line.secondary}
                        </span>
                      ) : null}
                      {line.variance && line.variance.unit === "EUR" ? (
                        <span
                          className="rp-fol-waterfall-var"
                          data-tone={
                            line.variance.variance > 0 ? "watch" : "good"
                          }
                        >
                          {line.variance.variance >= 0 ? "+" : "−"}
                          {eur(Math.abs(line.variance.variance))} vs plan
                        </span>
                      ) : null}
                    </>
                  )}
                </span>
                {isResult ? (
                  <span className="rp-fol-waterfall-tag">Live contribution</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
