"use client";

import { formatMoney } from "@/lib/radr/money";
import type { PreShiftBrief } from "@/lib/radr/preShift";
import { WhyLine } from "@/components/product/WhyLine";

type Props = {
  brief: PreShiftBrief;
  onOpen: () => void;
};

/**
 * Zone A (pre-shift) - forecast signal; one dominant covers number.
 */
export function PreShiftPulse({ brief, onOpen }: Props) {
  const wx = brief.weatherImpact;
  const showTerrace = brief.hasTerrace && wx;
  const why =
    showTerrace && wx?.decision === "OPEN"
      ? "Warm dry weather historically lifts terrace covers at this venue"
      : "Bookings and walk-ins set the night before doors open";

  return (
    <button
      type="button"
      className="rp-live-strip rp-preshift-strip"
      data-tour-target="pre-shift"
      data-terrace={showTerrace ? "true" : undefined}
      onClick={onOpen}
      aria-label="Open pre-shift plan"
    >
      <div className="rp-live-strip-copy">
        <p className="rp-live-strip-kicker">
          <span className="rp-preshift-dot" aria-hidden="true" />
          Pre-shift · {brief.serviceLabel}
        </p>
        <p className="rp-live-strip-hero">
          <strong>{brief.expectedCovers}</strong>
          <span>expected covers</span>
        </p>
        <p
          className="rp-live-strip-pace"
          data-tone={
            showTerrace && wx?.decision === "OPEN" ? "good" : "watch"
          }
        >
          {showTerrace && wx?.decision === "OPEN"
            ? `Terrace open · +${wx.historicalTerraceLiftCovers} covers`
            : `Peak ${brief.peakWindow.start}-${brief.peakWindow.end}`}
        </p>
        <ul className="rp-live-strip-sats" aria-label="Pre-shift signal">
          <li>
            <strong>{brief.expectedWalkIns}</strong>
            <span>
              walk-ins · {brief.walkInRange.low}-{brief.walkInRange.high}
            </span>
          </li>
          <li>
            <strong>
              {formatMoney({
                amount: brief.fnb.beverageRevenue,
                currency: "EUR",
                locale: "de-DE",
              })}
            </strong>
            <span>drinks · {brief.fnb.beverageSharePct}% of plan</span>
          </li>
          <li>
            <strong>
              {formatMoney({
                amount: brief.expectedContribution,
                currency: "EUR",
                locale: "de-DE",
              })}
            </strong>
            <span>contribution</span>
          </li>
        </ul>
        <WhyLine as="span" why={why} className="rp-live-strip-why" />
        {showTerrace && wx ? (
          <p
            className="rp-preshift-wx"
            data-tone={wx.decision === "OPEN" ? "good" : "watch"}
          >
            {wx.weather.temperatureC}°C, {wx.weather.conditionLabel}
            {" → "}
            Terrace {brief.terraceOutlook}
            {wx.decision === "OPEN" ? (
              <>
                {" "}
                ·{" "}
                {formatMoney({
                  amount: wx.netExpectedContribution,
                  currency: "EUR",
                  locale: "de-DE",
                })}{" "}
                net
              </>
            ) : null}
          </p>
        ) : (
          <p className="rp-live-strip-meta">
            Demand {brief.areaDemand.level}
          </p>
        )}
        <span className="rp-live-strip-open">Open pre-shift plan</span>
      </div>
    </button>
  );
}
