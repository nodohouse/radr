"use client";

import { formatMoney } from "@/lib/radr/money";
import type { ShiftEconomicState } from "@/lib/radr/live";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { WhyLine } from "@/components/product/WhyLine";
import { LivePaceSpark } from "@/components/product/live/LivePaceSpark";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  state: ShiftEconomicState;
  pulse?: boolean;
  illustrative?: boolean;
  onOpen: () => void;
};

/**
 * Zone A - Live. One dominant number + pace + unmissable satellites.
 */
export function LiveShiftPulse({
  state,
  pulse,
  illustrative,
  onOpen,
}: Props) {
  const ahead = state.vsExpectedPct >= 0;
  const coversExpected = BERLIN_RESERVATION_SUMMARY.forecastCovers;
  const coversPct =
    coversExpected > 0
      ? Math.min(100, Math.round((state.covers / coversExpected) * 100))
      : 0;
  const why = ahead
    ? "Covers and ticket mix are running ahead of the expected pace for this hour"
    : "Sales are behind the expected pace for this hour of service";

  return (
    <button
      type="button"
      className="rp-live-strip"
      data-pulse={pulse ? "true" : undefined}
      data-tour-target="live-shift"
      onClick={onOpen}
      aria-label="Open live shift"
    >
      <div className="rp-live-strip-copy">
        <p className="rp-live-strip-kicker">
          <span className="rp-live-pulse-dot" aria-hidden="true" />
          Live {state.serviceLabel}
          {illustrative ? <em>Illustrative</em> : null}
        </p>
        <p className="rp-live-strip-hero">
          <strong>{eur(state.netSales)}</strong>
          <span>net sales</span>
        </p>
        <p
          className="rp-live-strip-pace"
          data-tone={ahead ? "good" : "watch"}
        >
          {ahead ? "+" : "−"}
          {Math.abs(state.vsExpectedPct)}% vs expected
        </p>
        <ul className="rp-live-strip-sats" aria-label="Live signal">
          <li>
            <strong>{state.covers}</strong>
            <span>covers · {coversPct}% of plan</span>
          </li>
          <li>
            <strong>{eur(state.fnb.beverageRevenue)}</strong>
            <span>drinks · {state.fnb.beverageSharePct}%</span>
          </li>
          <li>
            <strong>{eur(state.forecastClose)}</strong>
            <span>projected close</span>
          </li>
        </ul>
        <WhyLine as="span" why={why} className="rp-live-strip-why" />
        <span className="rp-live-strip-open">Open live shift</span>
      </div>
      <LivePaceSpark state={state} size="strip" />
    </button>
  );
}
