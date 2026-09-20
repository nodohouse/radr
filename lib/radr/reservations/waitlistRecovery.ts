/**
 * Waitlist recovery: match released inventory to waitlist demand.
 */

import type { WaitlistEntry } from "@/lib/radr/domain";

export type WaitlistMatch = WaitlistEntry & {
  score: number;
};

/**
 * Score waitlist parties against released covers.
 * Prefer exact/near party size and higher convert probability × expected value.
 */
export function matchWaitlistToReleasedCovers(
  waitlist: WaitlistEntry[],
  releasedCovers: number,
): WaitlistMatch | null {
  if (releasedCovers <= 0 || waitlist.length === 0) return null;

  const candidates = waitlist
    .filter(
      (w) =>
        w.status === "waiting" ||
        w.status === "notified" ||
        w.status === "matched",
    )
    .filter((w) => w.partySize <= releasedCovers)
    .map((w) => {
      const sizeFit = 1 - Math.abs(w.partySize - releasedCovers) / releasedCovers;
      const convert = w.convertProbability ?? 0.5;
      const value = w.expectedValue ?? 0;
      const score = sizeFit * 40 + convert * 30 + Math.min(value / 20, 30);
      return { ...w, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidates[0] ?? null;
}

export function waitlistRecoveryEconomics(input: {
  bookingValue: number;
  waitlistMatchValue: number;
  naturalRebookExpected: number;
}): {
  currentlyAtRisk: number;
  recoverableNow: number;
  verifiedCeiling: number;
} {
  const afterWaitlist = Math.max(
    0,
    input.bookingValue - input.waitlistMatchValue,
  );
  const currentlyAtRisk = Math.max(0, afterWaitlist - input.naturalRebookExpected);
  return {
    currentlyAtRisk,
    recoverableNow: input.waitlistMatchValue,
    /** Never claim more than waitlist match until POS observes more. */
    verifiedCeiling: input.waitlistMatchValue,
  };
}
