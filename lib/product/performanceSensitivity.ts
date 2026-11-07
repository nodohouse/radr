/** A user-controlled what-if range. Never a calibrated prediction interval. */
export function projectedSensitivity(
  recorded: number,
  projected: number,
  variation: number,
) {
  if (
    ![recorded, projected, variation].every(Number.isFinite) ||
    variation < 0 ||
    variation > 30
  )
    throw new Error("Use finite amounts and a variation from 0 to 30 percent.");
  const change = (Math.abs(projected - recorded) * variation) / 100;
  return {
    low: projected - change,
    baseline: projected,
    high: projected + change,
  };
}
