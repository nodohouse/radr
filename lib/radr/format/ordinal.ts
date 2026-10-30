/** English ordinal suffix — 1st, 2nd, 3rd, 4th, 11th, 21st, … */
export function ordinalSuffix(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (abs % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/** Format as `52nd`, `61st`, `72nd`, `91st`. */
export function formatOrdinal(n: number): string {
  return `${Math.trunc(n)}${ordinalSuffix(n)}`;
}
