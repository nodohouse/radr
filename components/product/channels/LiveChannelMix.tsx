"use client";

import { formatMoney } from "@/lib/radr/money";
import type { ChannelEconomicsState } from "@/lib/radr/channels";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  state: ChannelEconomicsState;
  onOpenFinance?: () => void;
};

/**
 * Compact live channel mix - click through to full economics.
 */
export function LiveChannelMix({ state, onOpenFinance }: Props) {
  return (
    <div className="rp-ch-live" data-tour-target="live-channel-mix">
      <p className="rp-ch-live-kicker">Channels</p>
      <ul className="rp-ch-live-list">
        {state.liveMix.map((row) => (
          <li key={row.kind}>
            <span>{row.label}</span>
            <strong>{eur(row.amount)}</strong>
            <em>{row.sharePct.toFixed(0)}%</em>
          </li>
        ))}
      </ul>
      {onOpenFinance ? (
        <button type="button" className="rp-ch-live-open" onClick={onOpenFinance}>
          Channel economics
        </button>
      ) : null}
    </div>
  );
}
