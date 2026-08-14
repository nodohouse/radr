"use client";

import Link from "next/link";
import { DEMO, SIGNALS, VALUE, formatEuro } from "../data/demo";
import { useRadrReveal } from "../motion/useRadrReveal";
import { ValueCounter } from "../primitives/ValueCounter";

/**
 * Verified value closure — transparent methodology, illustrative demo only.
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
        <p className="rx-kicker">Verified value</p>
        <h2 className="rx-display rx-display-sm">
          Prove the result.
        </h2>
        <p className="rx-lead-inv rx-lead-short">
          {DEMO.locations} locations · {DEMO.period} · {DEMO.signalCount}{" "}
          signals · illustrative demo
        </p>

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

        <div className="rx-outcome-method">
          <div>
            <em>{VALUE.annualizedLabel}</em>
            <strong className="rx-money">
              {formatEuro(VALUE.annualizedExposure)}
            </strong>
          </div>
          <div>
            <em>{VALUE.recoverableLabel}</em>
            <strong className="rx-money">
              {formatEuro(VALUE.recoverableNow)}
            </strong>
          </div>
        </div>

        <div className="rx-outcome-total">
          <ValueCounter
            value={active ? VALUE.totalOnRadr : 0}
            semantic={formatEuro(VALUE.totalOnRadr)}
            className="rx-outcome-num"
          />
          <em>{VALUE.totalLabel}</em>
          <small>{VALUE.methodNote}</small>
        </div>

        <div className="rx-ctas rx-ctas-center">
          <Link href="/how" className="rx-btn rx-btn-primary">
            See the full loop <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
