/**
 * Hotel booking pace curve — days-before-arrival pickup vs comparable / forecast.
 * Canal House · trade-show week (demo SSOT).
 */

import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";

export type HotelBookingPacePoint = {
  daysBeforeArrival: number;
  current: number;
  comparable: number;
  forecast: number;
};

export type HotelBookingPaceMarker = {
  daysBeforeArrival: number;
  displayId: string;
  decisionId: string;
  label: string;
};

export type HotelBookingPaceReport = {
  arrivalLabel: string;
  sellableRooms: number;
  /** Days before arrival, high → low (30 … 0). */
  points: HotelBookingPacePoint[];
  markers: HotelBookingPaceMarker[];
  deltaPctVsComparable: number;
  deltaPctVsForecast: number;
  radrRead: string;
};

const DAYS = [30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0] as const;

/** Cumulative rooms on the books by lead time (Saturday arrival). */
export function getHotelBookingPaceReport(): HotelBookingPaceReport {
  const sellableRooms = 90;
  const points: HotelBookingPacePoint[] = DAYS.map((d, i) => {
    const t = i / (DAYS.length - 1);
    const forecast = Math.round(18 + t * 62);
    const comparable = Math.round(16 + t * 54);
    const current =
      d >= 14
        ? Math.round(comparable + (d === 14 ? 4 : 0) + t * 8)
        : Math.round(forecast + (d <= 4 ? 3 : 0) + t * 4);
    return {
      daysBeforeArrival: d,
      current: Math.min(current, sellableRooms),
      comparable: Math.min(comparable, sellableRooms),
      forecast: Math.min(forecast, sellableRooms),
    };
  });

  return {
    arrivalLabel: "Sat 28 Sep · Canal House",
    sellableRooms,
    points,
    deltaPctVsComparable: 11,
    deltaPctVsForecast: 4.2,
    radrRead:
      "Pickup firm vs same week last year. Readiness — not demand — is the material Decision before tonight's wave.",
    markers: [
      {
        daysBeforeArrival: 14,
        displayId: "D-2201",
        decisionId: HOTEL_DECISION_IDS.channel,
        label: "Hold direct · Canal View",
      },
      // D-H-9201 (housekeeping readiness) is not a pickup driver — omit from pace chart.
    ],
  };
}
