"use client";

import type { LiveSignal } from "../data/liveScan";
import { formatEuro } from "../data/demo";

type Props = {
  signal: LiveSignal;
};

/** Hover detail — what happened / should / △ / impact / action. */
export function LiveSignalDetail({ signal }: Props) {
  const impact =
    signal.annualizedAdd > 0
      ? { label: "Annualized impact", value: formatEuro(signal.annualizedAdd) }
      : signal.recoverableAdd > 0
        ? {
            label: "Recoverable now",
            value: formatEuro(signal.recoverableAdd),
          }
        : { label: "Illustrative", value: signal.rawLabel };

  return (
    <aside className="rx-live-detail" aria-live="polite">
      <p className="rx-live-detail-kicker">
        {signal.channelLabel} · {signal.tag}
      </p>
      <h3>{signal.title}</h3>
      <dl>
        <div>
          <dt>What should have happened</dt>
          <dd>
            {signal.source.should.label}: {signal.source.should.value}
          </dd>
        </div>
        <div>
          <dt>What happened</dt>
          <dd>
            {signal.source.actual.label}: {signal.source.actual.value}
          </dd>
        </div>
        <div>
          <dt>△ Difference</dt>
          <dd>{signal.source.delta}</dd>
        </div>
        <div>
          <dt>{impact.label}</dt>
          <dd className="rx-money">{impact.value}</dd>
        </div>
      </dl>
      <p className="rx-live-detail-action">{signal.action}</p>
    </aside>
  );
}
