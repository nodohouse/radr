/**
 * Canonical money representation for RADR domain.
 * Prefer amountMinor for persisted / calculated values.
 */

import { z } from "zod";

export const moneySchema = z.object({
  amountMinor: z.number().int(),
  currency: z.string().min(3).max(3),
});

export type Money = z.infer<typeof moneySchema>;

/** Convert major units (e.g. euros) to minor. Demo UI still speaks major. */
export function moneyFromMajor(amountMajor: number, currency: string): Money {
  return {
    amountMinor: Math.round(amountMajor * 100),
    currency: currency.toUpperCase(),
  };
}

export function moneyToMajor(money: Money): number {
  return money.amountMinor / 100;
}

export function optionalMajorToMoney(
  amountMajor: number | undefined,
  currency: string,
): Money | undefined {
  if (amountMajor == null) return undefined;
  return moneyFromMajor(amountMajor, currency);
}
