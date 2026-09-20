/**
 * Reservation economics - bookings as financial events, not counts only.
 */

export type ReservationEconomics = {
  bookingValue: number;
  expectedSpend: number;
  cancellationExposure: number;
  waitlistRecovery: number;
  noShowExposure: number;
  groupConcentrationCovers: number;
  covers: number;
  currency: string;
};

export function computeReservationEconomics(input: {
  covers: number;
  spendPerCover: number;
  cancelledCovers: number;
  cancelledGross: number;
  waitlistMatchValue: number;
  naturalRebookExpected: number;
  noShowCovers: number;
  noShowGross: number;
  groupCovers: number;
  currency: string;
}): ReservationEconomics {
  const bookingValue = Math.round(input.covers * input.spendPerCover);
  const cancellationExposure = Math.max(
    0,
    input.cancelledGross - input.waitlistMatchValue - input.naturalRebookExpected,
  );
  return {
    bookingValue,
    expectedSpend: bookingValue,
    cancellationExposure,
    waitlistRecovery: input.waitlistMatchValue,
    noShowExposure: input.noShowGross,
    groupConcentrationCovers: input.groupCovers,
    covers: input.covers,
    currency: input.currency,
  };
}
