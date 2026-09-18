"use client";

import { useState } from "react";
import { RESTAURANT_ZONES } from "@/lib/radr/demo/facilityCatalog";
import { FacilityCard } from "@/components/product/FacilityCard";
import {
  berlinWeatherForDate,
  type TerraceWeatherDecision,
} from "@/lib/radr/weather/berlinWeekWeather";
import { BERLIN_DEMO_TONIGHT } from "@/lib/radr/berlinWeekRoster";

type Props = {
  dateIso?: string;
};

function terraceStatusLabel(decision: TerraceWeatherDecision): string {
  switch (decision) {
    case "OPEN":
      return "Open";
    case "LIMITED":
      return "Limited · weather";
    case "CLOSED":
      return "Closed · weather";
  }
}

/**
 * Restaurant zones with photos + weather-aware terrace status.
 */
export function RestaurantZoneStrip({ dateIso = BERLIN_DEMO_TONIGHT }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const wx = berlinWeatherForDate(dateIso);

  return (
    <section className="rp-zone-primer" aria-label="Floor zones">
      <div className="rp-zone-primer-head">
        <p className="rp-hotel-sec-label">Zones · equipment · weather</p>
        {wx.terrace !== "OPEN" ? (
          <p className="rp-zone-wx-banner" data-terrace={wx.terrace.toLowerCase()}>
            {wx.opsCue}
          </p>
        ) : null}
      </div>
      <div className="rp-zone-strip">
        {RESTAURANT_ZONES.map((z) => {
          const isTerrace = z.id === "terrace";
          const statusLabel = isTerrace
            ? terraceStatusLabel(wx.terrace)
            : z.id === "bar" && wx.terrace === "CLOSED"
              ? "Absorbing walk-ins"
              : z.id === "main_dining" && wx.terrace === "CLOSED"
                ? "Indoor pressure"
                : undefined;
          const radarNote = isTerrace
            ? wx.reason
            : z.id === "bar" && wx.terrace === "CLOSED"
              ? "Bar picks up terrace walk-ins while outdoor is closed"
              : undefined;
          const sizeHint =
            isTerrace && wx.terrace === "CLOSED"
              ? "0 covers tonight · weather"
              : isTerrace && wx.terrace === "LIMITED"
                ? `${wx.terraceExpectedCovers} covers · half set`
                : isTerrace
                  ? `${wx.terraceExpectedCovers} covers expected`
                  : undefined;

          const facility = sizeHint
            ? { ...z, sizeHint, differentiator: isTerrace ? wx.opsCue : z.differentiator }
            : z;

          return (
            <FacilityCard
              key={z.id}
              facility={facility}
              statusLabel={statusLabel}
              radarNote={radarNote}
              expanded={expandedId === z.id}
              onToggle={() =>
                setExpandedId((id) => (id === z.id ? null : z.id))
              }
            />
          );
        })}
      </div>
    </section>
  );
}
