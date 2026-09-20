"use client";

import type { LiveSignal } from "../data/liveScan";
import { formatEuro } from "../data/demo";

type Props = {
  signal: LiveSignal;
  active?: boolean;
  onEnter?: (s: LiveSignal) => void;
  onLeave?: () => void;
};

/** Compact live-feed row: channel, raw △, annualized, tag. */
export function LiveFeedRow({
  signal,
  active = false,
  onEnter,
  onLeave,
}: Props) {
  const annual =
    signal.annualizedAdd > 0
      ? formatEuro(signal.annualizedAdd)
      : signal.recoverableAdd > 0
        ? formatEuro(signal.recoverableAdd)
        : null;
  const annualLabel =
    signal.recoverableAdd > 0 && signal.annualizedAdd === 0
      ? "Recoverable now"
      : "Annualized";

  return (
    <article
      className="rx-money-signal rx-live-row"
      data-active={active ? "true" : "false"}
      onMouseEnter={() => onEnter?.(signal)}
      onMouseLeave={() => onLeave?.()}
      onFocus={() => onEnter?.(signal)}
      onBlur={() => onLeave?.()}
      tabIndex={0}
    >
      <span className="rx-money-signal-idx">{signal.id.replace(/\D/g, "").padStart(2, "0") || signal.id}</span>
      <div className="rx-money-signal-body">
        <p className="rx-money-signal-channel">{signal.channelLabel}</p>
        <p className="rx-money-signal-amt">
          <span className="rx-tri">△</span> {signal.rawLabel}
        </p>
        <p className="rx-money-signal-title">{signal.title}</p>
        {annual ? (
          <p className="rx-live-annual">
            <span>{annualLabel}</span>{" "}
            <strong className="rx-money">{annual}</strong>
          </p>
        ) : (
          <p className="rx-live-annual rx-live-annual--muted">
            Continuous
          </p>
        )}
        <p className="rx-money-signal-tag">{signal.tag}</p>
      </div>
    </article>
  );
}
