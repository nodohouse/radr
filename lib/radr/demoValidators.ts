/**
 * Demo-data consistency validators: run in tests / build.
 * Prevents incoherent hospitality economics from shipping.
 */

import { BERLIN_FLOOR, SECTION_REVENUE_TONIGHT } from "./berlinFloor";
import { BERLIN_RESERVATION_SUMMARY } from "./reservationDemo";
import {
  BERLIN_TONIGHT_FORECAST,
  BERLIN_TONIGHT_OPS,
  BERLIN_YESTERDAY,
  VENUE_PROFILES,
  venueSeatTotal,
} from "./venueProfiles";
import { DAILY_PULSE, TONIGHT } from "./operatingPulse";

export type ValidationIssue = { code: string; message: string };

export function validateDemoConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const v of Object.values(VENUE_PROFILES)) {
    if (venueSeatTotal(v) !== v.seats) {
      issues.push({
        code: "venue_seats",
        message: `${v.id}: section seats ${venueSeatTotal(v)} ≠ profile ${v.seats}`,
      });
    }
  }

  const tableSeats = BERLIN_FLOOR.tables.reduce((s, t) => s + t.seats, 0);
  if (tableSeats !== BERLIN_FLOOR.seats) {
    issues.push({
      code: "floor_seats",
      message: `Floor table seats ${tableSeats} ≠ plan ${BERLIN_FLOOR.seats}`,
    });
  }
  const sectionCap = BERLIN_FLOOR.sections.reduce((s, sec) => s + sec.capacity, 0);
  if (sectionCap !== BERLIN_FLOOR.seats) {
    issues.push({
      code: "floor_sections",
      message: `Section capacity ${sectionCap} ≠ plan ${BERLIN_FLOOR.seats}`,
    });
  }

  const y = BERLIN_YESTERDAY;
  const implied = Math.round(y.covers * y.avgSpend);
  if (Math.abs(implied - y.revenue) > 2) {
    issues.push({
      code: "yesterday_revenue",
      message: `Yesterday revenue ${y.revenue} ≠ covers×spend ${implied}`,
    });
  }
  if (DAILY_PULSE.revenue !== y.revenue || DAILY_PULSE.covers !== y.covers) {
    issues.push({
      code: "pulse_sync",
      message: "DAILY_PULSE does not match BERLIN_YESTERDAY",
    });
  }

  const s = BERLIN_RESERVATION_SUMMARY;
  if (s.bookedCovers > 0 && s.reservationCount <= 0) {
    issues.push({
      code: "reservations",
      message: "bookedCovers > 0 but reservationCount is 0",
    });
  }
  if (s.groupCovers > s.bookedCovers) {
    issues.push({
      code: "group_covers",
      message: "groupCovers exceed bookedCovers",
    });
  }
  if (s.forecastCovers < s.bookedCovers) {
    issues.push({
      code: "forecast_covers",
      message: "forecastCovers < bookedCovers",
    });
  }
  if (s.expectedRecoveredValue > s.cancelledBookingValue) {
    issues.push({
      code: "cancel_recovery",
      message: "expected recovery exceeds cancelled booking value",
    });
  }
  const atRisk = s.cancelledBookingValue - s.expectedRecoveredValue;
  if (s.revenueAtRisk !== atRisk || s.revenueAtRisk < 0) {
    issues.push({
      code: "cancel_at_risk",
      message: `revenueAtRisk ${s.revenueAtRisk} ≠ ${atRisk}`,
    });
  }

  if (
    s.bookedCovers !== BERLIN_TONIGHT_OPS.bookedCovers ||
    s.forecastCovers !== BERLIN_TONIGHT_FORECAST.covers
  ) {
    issues.push({
      code: "ops_sync",
      message: "Reservation summary out of sync with venue tonight ops",
    });
  }
  if (TONIGHT.bookedCovers !== s.bookedCovers) {
    issues.push({
      code: "tonight_sync",
      message: "TONIGHT.bookedCovers ≠ reservation summary",
    });
  }
  if (TONIGHT.expectedRevenue !== BERLIN_TONIGHT_FORECAST.revenue) {
    issues.push({
      code: "tonight_revenue",
      message: "TONIGHT revenue ≠ BERLIN_TONIGHT_FORECAST.revenue",
    });
  }

  const floorRev =
    SECTION_REVENUE_TONIGHT.main +
    SECTION_REVENUE_TONIGHT.bar +
    SECTION_REVENUE_TONIGHT.terrace;
  if (floorRev !== BERLIN_TONIGHT_FORECAST.revenue) {
    issues.push({
      code: "floor_revenue",
      message: `Section revenue ${floorRev} ≠ forecast ${BERLIN_TONIGHT_FORECAST.revenue}`,
    });
  }

  return issues;
}

export function assertDemoConsistency() {
  const issues = validateDemoConsistency();
  if (issues.length) {
    throw new Error(
      `Demo consistency failed:\n${issues.map((i) => `- ${i.code}: ${i.message}`).join("\n")}`,
    );
  }
}
