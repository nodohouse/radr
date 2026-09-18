"use client";

import { formatMoney } from "@/lib/radr/money";
import type { MoneyFlowColumn } from "@/lib/radr/finance";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  columns: MoneyFlowColumn[];
};

/**
 * Money in / money out / money left - CFO mental model.
 */
export function MoneyFlowBoard({ columns }: Props) {
  return (
    <section className="rp-fol-money" aria-label="Money in, out, left">
      <header className="rp-fol-sec-head">
        <p className="rp-fol-sec-kicker">Flow</p>
        <p className="rp-fol-sec-title">Money in · out · left</p>
      </header>

      <div className="rp-fol-money-grid">
        {columns.map((col) => (
          <div key={col.kind} className="rp-fol-money-col" data-kind={col.kind}>
            <p className="rp-fol-money-title">{col.title}</p>
            <ul>
              {col.items.map((item) => (
                <li key={item.id}>
                  <span>{item.label}</span>
                  <strong>{eur(item.amount)}</strong>
                  {item.why[0] ? <WhyLine why={item.why[0]} /> : null}
                </li>
              ))}
            </ul>
            <p className="rp-fol-money-total">
              <span>{col.totalLabel}</span>
              <strong>{eur(col.total)}</strong>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
