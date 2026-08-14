"use client";

import Link from "next/link";
import { DEMO, SIGNALS, formatEuro } from "../data/demo";
import { useRadrReveal } from "../motion/useRadrReveal";
import { ValueCounter } from "../primitives/ValueCounter";

/**
 * Narrative closure — same €176,740 from the four signals. No new totals.
 */
export function SectionOutcome() {
  const { ref, active } = useRadrReveal<HTMLElement>({ threshold: 0.25 });

  return (
    <section
      className="rx-outcome"
      id="group"
      ref={ref}
      data-nav-theme="dark"
      data-on={active ? "true" : "false"}
    >
      <div className="rx-shell rx-outcome-inner">
        <p className="rx-kicker">Demo scan complete</p>
        <h2 className="rx-display rx-display-sm">
          {DEMO.locations} locations.
          <br />
          Four signals.
        </h2>

        <ul className="rx-outcome-list">
          {SIGNALS.map((s) => (
            <li key={s.id}>
              <span>{s.channelLabel}</span>
              <strong className="rx-money">
                <span className="rx-tri">△</span> {s.amount}
                {s.period}
              </strong>
              <em>{s.title}</em>
            </li>
          ))}
        </ul>

        <div className="rx-outcome-total">
          <ValueCounter
            value={active ? DEMO.final : 0}
            semantic={formatEuro(DEMO.final)}
            className="rx-outcome-num"
          />
          <em>Total identified</em>
          <small>Illustrative demo · not a customer claim</small>
        </div>

        <div className="rx-ctas rx-ctas-center">
          <Link href="/signup" className="rx-btn rx-btn-primary">
            See what RADR finds for you <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
