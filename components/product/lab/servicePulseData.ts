/**
 * Service Pulse series for Berlin Mitte dinner — D-1911 grounded.
 * Observed left of NOW · modeled right of NOW.
 */

export type PulsePoint = {
  t: string;
  /** Minutes from 18:00 */
  m: number;
  actualCovers: number | null;
  forecastCovers: number;
  arrivalDensity: number;
  kitchenSeat: number;
  kitchenWait: number;
  deliveryPressure: number;
  ticketSeat: number;
  ticketWait: number;
  turnsExposed: number;
  contributionDelta: number;
  isNow?: boolean;
};

/** 18:00 = 0 … NOW 18:42 = 42 */
export const PULSE: PulsePoint[] = [
  {
    t: "18:00",
    m: 0,
    actualCovers: 22,
    forecastCovers: 24,
    arrivalDensity: 4,
    kitchenSeat: 62,
    kitchenWait: 62,
    deliveryPressure: 12,
    ticketSeat: 9,
    ticketWait: 9,
    turnsExposed: 0,
    contributionDelta: 0,
  },
  {
    t: "18:15",
    m: 15,
    actualCovers: 34,
    forecastCovers: 36,
    arrivalDensity: 8,
    kitchenSeat: 74,
    kitchenWait: 74,
    deliveryPressure: 18,
    ticketSeat: 11,
    ticketWait: 11,
    turnsExposed: 1,
    contributionDelta: 0,
  },
  {
    t: "18:30",
    m: 30,
    actualCovers: 48,
    forecastCovers: 50,
    arrivalDensity: 12,
    kitchenSeat: 86,
    kitchenWait: 86,
    deliveryPressure: 26,
    ticketSeat: 13,
    ticketWait: 13,
    turnsExposed: 4,
    contributionDelta: 0,
  },
  {
    t: "18:42",
    m: 42,
    actualCovers: 56,
    forecastCovers: 56,
    arrivalDensity: 14,
    kitchenSeat: 92,
    kitchenWait: 92,
    deliveryPressure: 31,
    ticketSeat: 14,
    ticketWait: 14,
    turnsExposed: 9,
    contributionDelta: 0,
    isNow: true,
  },
  {
    t: "19:00",
    m: 60,
    actualCovers: null,
    forecastCovers: 68,
    arrivalDensity: 18,
    kitchenSeat: 97,
    kitchenWait: 89,
    deliveryPressure: 34,
    ticketSeat: 18,
    ticketWait: 13,
    turnsExposed: 9,
    contributionDelta: 620,
  },
  {
    t: "19:15",
    m: 75,
    actualCovers: null,
    forecastCovers: 72,
    arrivalDensity: 10,
    kitchenSeat: 96,
    kitchenWait: 88,
    deliveryPressure: 28,
    ticketSeat: 17,
    ticketWait: 12,
    turnsExposed: 7,
    contributionDelta: 480,
  },
  {
    t: "19:30",
    m: 90,
    actualCovers: null,
    forecastCovers: 70,
    arrivalDensity: 6,
    kitchenSeat: 94,
    kitchenWait: 86,
    deliveryPressure: 22,
    ticketSeat: 16,
    ticketWait: 12,
    turnsExposed: 5,
    contributionDelta: 320,
  },
  {
    t: "19:45",
    m: 105,
    actualCovers: null,
    forecastCovers: 64,
    arrivalDensity: 4,
    kitchenSeat: 90,
    kitchenWait: 84,
    deliveryPressure: 18,
    ticketSeat: 14,
    ticketWait: 11,
    turnsExposed: 3,
    contributionDelta: 180,
  },
];

export const NOW_INDEX = PULSE.findIndex((p) => p.isNow);
export const NOW_M = 42;
export const M_MAX = 105;

export type PulseFocus =
  | "covers"
  | "kitchen"
  | "inbound"
  | "delivery"
  | "turns"
  | null;

export type PulseFuture = "seat_now" | "wait_12" | "hard_stop";
