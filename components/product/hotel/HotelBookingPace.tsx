"use client";

import { useMemo } from "react";
import {
  getHotelBookingPaceReport,
  type HotelBookingPaceReport,
} from "@/lib/radr/demo/hotelBookingPace";

type Props = {
  data?: HotelBookingPaceReport;
  compact?: boolean;
  onSelectDecision?: (decisionId: string) => void;
  className?: string;
};

export function HotelBookingPace({
  data: dataProp,
  compact = false,
  onSelectDecision,
  className = "",
}: Props) {
  const data = dataProp ?? getHotelBookingPaceReport();
  const { w, h, pad, paths, inventoryY, xScale, yScale, markerPts } =
    useMemo(() => buildGeometry(data, compact), [data, compact]);

  return (
    <section
      className={`rp-hotel-booking-pace ${className}`.trim()}
      data-compact={compact ? "true" : undefined}
      aria-label="Booking pace by days before arrival"
    >
      <header className="rp-hotel-booking-pace-head">
        <div>
          <p className="rp-hotel-viz-k">Booking pace · OTA &amp; direct</p>
          <p className="rp-hotel-viz-sub">{data.arrivalLabel} · nights on the books</p>
        </div>
        <div className="rp-hotel-booking-pace-deltas">
          <span data-tone="positive">
            +{data.deltaPctVsComparable}% vs comparable
          </span>
          <span>
            +{data.deltaPctVsForecast}% vs forecast
          </span>
        </div>
      </header>

      <div className="rp-hotel-booking-pace-legend" aria-hidden="true">
        <span data-series="current">Current pickup</span>
        <span data-series="comparable">Comparable</span>
        <span data-series="forecast">Forecast</span>
        <span data-series="inventory">Sellable inventory</span>
      </div>

      <svg
        className="rp-hotel-booking-pace-chart"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Rooms on the books versus comparable and forecast, ${data.sellableRooms} sellable`}
      >
        <line
          x1={pad}
          y1={inventoryY}
          x2={w - pad}
          y2={inventoryY}
          className="rp-hbp-inv-line"
        />
        <text
          x={w - pad}
          y={inventoryY - 6}
          textAnchor="end"
          className="rp-hbp-inv-label"
        >
          {data.sellableRooms} sellable
        </text>

        <path d={paths.forecast} className="rp-hbp-line rp-hbp-forecast" />
        <path d={paths.comparable} className="rp-hbp-line rp-hbp-comparable" />
        <path d={paths.current} className="rp-hbp-line rp-hbp-current" />

        {markerPts.map((m) => (
          <g
            key={m.displayId}
            className="rp-hbp-marker"
            role={onSelectDecision ? "button" : undefined}
            tabIndex={onSelectDecision ? 0 : undefined}
            onClick={
              onSelectDecision
                ? () => onSelectDecision(m.decisionId)
                : undefined
            }
            onKeyDown={
              onSelectDecision
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDecision(m.decisionId);
                    }
                  }
                : undefined
            }
            aria-label={`${m.displayId} · ${m.label}`}
          >
            <circle
              cx={m.x}
              cy={m.y}
              r={compact ? 5 : 6}
              className="rp-hbp-marker-dot"
            />
            {!compact ? (
              <text
                x={m.x}
                y={m.y - 10}
                textAnchor="middle"
                className="rp-hbp-marker-id"
              >
                {m.displayId}
              </text>
            ) : null}
          </g>
        ))}

        {data.points
          .filter((_, i) => i % (compact ? 4 : 2) === 0)
          .map((p) => (
            <text
              key={p.daysBeforeArrival}
              x={xScale(p.daysBeforeArrival)}
              y={h - 6}
              textAnchor="middle"
              className="rp-hbp-axis-x"
            >
              {p.daysBeforeArrival}d
            </text>
          ))}
        <text x={pad} y={pad - 4} className="rp-hbp-axis-y">
          Rooms booked
        </text>
        <text
          x={(pad + w - pad) / 2}
          y={h - 0}
          textAnchor="middle"
          className="rp-hbp-axis-x-title"
        >
          Days before arrival →
        </text>
      </svg>

      {!compact ? (
        <p className="rp-hotel-viz-read">{data.radrRead}</p>
      ) : null}
    </section>
  );
}

function buildGeometry(data: HotelBookingPaceReport, compact: boolean) {
  const w = compact ? 320 : 520;
  const h = compact ? 140 : 200;
  const pad = compact ? 28 : 36;
  const pts = data.points;
  const maxY = data.sellableRooms;
  const minDay = pts[pts.length - 1]!.daysBeforeArrival;
  const maxDay = pts[0]!.daysBeforeArrival;

  const xScale = (day: number) =>
    pad + ((maxDay - day) / Math.max(maxDay - minDay, 1)) * (w - pad * 2);
  const yScale = (rooms: number) =>
    h - pad - (rooms / maxY) * (h - pad * 2);

  const linePath = (key: "current" | "comparable" | "forecast") =>
    pts
      .map((p, i) => {
        const x = xScale(p.daysBeforeArrival);
        const y = yScale(p[key]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  const markerPts = data.markers.map((m) => {
    const pt = pts.find((p) => p.daysBeforeArrival === m.daysBeforeArrival);
    const rooms = pt?.current ?? 0;
    return {
      ...m,
      x: xScale(m.daysBeforeArrival),
      y: yScale(rooms),
    };
  });

  return {
    w,
    h,
    pad,
    paths: {
      current: linePath("current"),
      comparable: linePath("comparable"),
      forecast: linePath("forecast"),
    },
    inventoryY: yScale(data.sellableRooms),
    xScale,
    yScale,
    markerPts,
  };
}
