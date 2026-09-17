import type { AutopilotLevelId, MoneyGrade } from "./types";

export function labEuro(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    const k = value / 1000;
    const shown = Math.abs(k) >= 10 ? Math.round(k).toString() : k.toFixed(1).replace(/\.0$/, "");
    return `${value < 0 ? "−" : ""}€${shown}k`;
  }
  const abs = Math.abs(Math.round(value)).toLocaleString("en-IE");
  return `${value < 0 ? "−" : ""}€${abs}`;
}

export function gradeLabel(grade: MoneyGrade): string {
  return grade;
}

export const AUTOPILOT_LEVELS: Record<
  AutopilotLevelId,
  { n: 1 | 2 | 3 | 4; name: string; short: string }
> = {
  suggest: { n: 1, name: "Suggest", short: "RADR will…" },
  stage: { n: 2, name: "Stage", short: "Confirm prepare" },
  auto: { n: 3, name: "Auto within policy", short: "RADR will…" },
  verified: { n: 4, name: "Verified", short: "€ sealed" },
};

export function isVerifiedAllowed(grade: MoneyGrade, lineage?: string): boolean {
  return grade !== "Verified" || Boolean(lineage);
}
