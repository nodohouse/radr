"use client";

import { useMemo } from "react";
import {
  canalChannelEconomics,
  type ChannelEconomics,
  type HotelChannel,
} from "@/lib/radr/demo/hotelDataset";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";

const CHANNEL_LABEL: Record<HotelChannel, string> = {
  direct: "Direct",
  booking_com: "Booking.com",
  expedia: "Expedia",
  corporate: "Corporate",
  gds: "GDS",
  wholesale: "Wholesale",
};

const FEATURED: HotelChannel[] = [
  "direct",
  "booking_com",
  "expedia",
  "corporate",
];

type Props = {
  channels?: ChannelEconomics[];
  compact?: boolean;
  onSelectDecision?: (decisionId: string) => void;
  className?: string;
};

export function HotelDistributionViz({
  channels: channelsProp,
  compact = false,
  onSelectDecision,
  className = "",
}: Props) {
  const channels = useMemo(() => {
    const all = channelsProp ?? canalChannelEconomics();
    return FEATURED.map(
      (id) => all.find((c) => c.channel === id)!,
    ).filter(Boolean);
  }, [channelsProp]);

  const direct = channels.find((c) => c.channel === "direct") ?? channels[0]!;
  const totalPickup = channels.reduce((s, c) => s + c.pickupTonight, 0);

  return (
    <section
      className={`rp-hotel-distribution ${className}`.trim()}
      data-compact={compact ? "true" : undefined}
      aria-label="Distribution economics and channel mix"
    >
      <header className="rp-hotel-distribution-head">
        <p className="rp-hotel-viz-k">Distribution</p>
        {!compact ? (
          <button
            type="button"
            className="rp-hotel-distribution-dec"
            onClick={() => onSelectDecision?.(HOTEL_DECISION_IDS.channel)}
          >
            D-2201 · hold direct 72h
          </button>
        ) : null}
      </header>

      <div className="rp-hotel-adr-flow" role="img" aria-label="Direct ADR economics">
        <AdrFlowStrip channel={direct} compact={compact} />
      </div>

      <div className="rp-hotel-channel-mix">
        <p className="rp-hotel-viz-sub">Tonight pickup · room nights</p>
        <ul className="rp-hotel-channel-bars">
          {channels.map((c) => {
            const pct = totalPickup
              ? Math.round((c.pickupTonight / totalPickup) * 100)
              : 0;
            return (
              <li key={c.channel} data-channel={c.channel}>
                <div className="rp-hotel-channel-bar-head">
                  <strong>{CHANNEL_LABEL[c.channel]}</strong>
                  <span>
                    {c.pickupTonight} rn · net €{c.netAdr}
                  </span>
                </div>
                <div className="rp-hotel-channel-bar-track" aria-hidden="true">
                  <i style={{ width: `${pct}%` }} />
                </div>
                <div className="rp-hotel-channel-econ">
                  <span>Gross €{c.grossAdr}</span>
                  {c.commissionPct > 0 ? (
                    <span>−{c.commissionPct}% comm</span>
                  ) : (
                    <span>No commission</span>
                  )}
                  <span>Contrib €{c.netContribution}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function AdrFlowStrip({
  channel,
  compact,
}: {
  channel: ChannelEconomics;
  compact: boolean;
}) {
  const commissionEuro = channel.grossAdr * (channel.commissionPct / 100);
  const steps = [
    { id: "gross", label: "Gross ADR", value: channel.grossAdr },
    {
      id: "comm",
      label: "Commission",
      value: -commissionEuro,
      display:
        commissionEuro > 0 ? `−€${Math.round(commissionEuro)}` : "€0",
    },
    { id: "net", label: "Net ADR", value: channel.netAdr },
    {
      id: "contrib",
      label: "Contribution",
      value: channel.netContribution,
    },
  ];

  return (
    <div className="rp-hotel-adr-steps" data-compact={compact ? "true" : undefined}>
      {steps.map((step, i) => (
        <div key={step.id} className="rp-hotel-adr-step" data-step={step.id}>
          <em>{step.label}</em>
          <strong>
            {step.display ??
              `€${Math.round(Math.abs(step.value))}`}
          </strong>
          {i < steps.length - 1 ? (
            <span className="rp-hotel-adr-arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </div>
      ))}
      <p className="rp-hotel-adr-flow-note">
        Direct flagship · {channel.pickupTonight} rooms tonight
      </p>
    </div>
  );
}
