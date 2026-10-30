/**
 * Shared ledger search / sort / filter helpers for Decisions workspace.
 */

import type { JudgmentRow, MotionRow, ResolvedRow } from "./types";

export type LedgerSort =
  | "value"
  | "urgency"
  | "deadline"
  | "confidence"
  | "newest"
  | "oldest"
  | "location"
  | "progress";

export type PropertyFilter = "canal" | "all";
export type DriverFilter =
  | "all"
  | "housekeeping"
  | "labor"
  | "channel"
  | "guests"
  | "maintenance"
  | "revenue"
  | "cancellations";
export type StatusFilter = "all" | "judgment" | "motion" | "resolved";

/** Parse impact strings like +€1,840 / €12.4k / +€1.8M → euro number. */
export function impactEuro(raw: string): number {
  const s = raw.replace(/\s/g, "");
  const k = s.match(/([\d]+(?:\.\d+)?)[kK]/);
  if (k) return parseFloat(k[1]!) * 1_000;
  const mil = s.match(/([\d]+(?:\.\d+)?)[mM]/);
  if (mil) return parseFloat(mil[1]!) * 1_000_000;
  const digits = s.match(/[\d,.]+/);
  if (!digits) return 0;
  return parseFloat(digits[0]!.replace(/,/g, ""));
}

export function matchesQuery(
  query: string,
  parts: { title: string; subtitle: string; driver: string; id?: string; location?: string },
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    parts.title.toLowerCase().includes(q) ||
    parts.subtitle.toLowerCase().includes(q) ||
    parts.driver.toLowerCase().includes(q) ||
    (parts.id?.toLowerCase().includes(q) ?? false) ||
    (parts.location?.toLowerCase().includes(q) ?? false)
  );
}

export function matchesProperty(filter: PropertyFilter, locationsShort: string): boolean {
  if (filter === "all") return true;
  return /canal/i.test(locationsShort);
}

export function matchesDriver(filter: DriverFilter, driverKind: string, driverLabel: string): boolean {
  if (filter === "all") return true;
  if (driverKind === filter) return true;
  // Channel mix label → channel
  if (filter === "channel" && /channel/i.test(driverLabel)) return true;
  if (filter === "cancellations" && /cancel/i.test(driverLabel)) return true;
  return false;
}

const DEADLINE_RANK: Record<string, number> = {
  today: 0,
  week: 1,
  future: 2,
};

function deadlineUrgency(deadline: string, tone?: string): number {
  const t = tone ?? "";
  if (t in DEADLINE_RANK) return DEADLINE_RANK[t]!;
  if (/before|today|tonight|\d{1,2}:\d{2}/i.test(deadline)) return 0;
  if (/tomorrow|this week/i.test(deadline)) return 1;
  return 2;
}

/** Clock-ish strings sort earlier for urgency (14:35 before 15:00 before Tonight). */
function deadlineClockScore(deadline: string): number {
  const m = deadline.match(/(\d{1,2}):(\d{2})/);
  if (m) return parseInt(m[1]!, 10) * 60 + parseInt(m[2]!, 10);
  if (/before/i.test(deadline)) return 0;
  if (/tonight/i.test(deadline)) return 22 * 60;
  if (/tomorrow/i.test(deadline)) return 30 * 60;
  return 40 * 60;
}

export function sortJudgment(rows: JudgmentRow[], sort: LedgerSort): JudgmentRow[] {
  const next = [...rows];
  next.sort((a, b) => {
    switch (sort) {
      case "urgency":
      case "deadline": {
        const ua = deadlineUrgency(a.deadline, a.deadlineTone);
        const ub = deadlineUrgency(b.deadline, b.deadlineTone);
        if (ua !== ub) return ua - ub;
        const ca = deadlineClockScore(a.deadline);
        const cb = deadlineClockScore(b.deadline);
        if (ca !== cb) return ca - cb;
        return impactEuro(b.impact) - impactEuro(a.impact);
      }
      case "confidence":
        return b.confidence - a.confidence;
      case "newest":
        return deadlineClockScore(a.deadline) - deadlineClockScore(b.deadline);
      case "oldest":
        return deadlineClockScore(b.deadline) - deadlineClockScore(a.deadline);
      case "location":
        return a.locationsShort.localeCompare(b.locationsShort);
      case "value":
      default:
        return impactEuro(b.impact) - impactEuro(a.impact);
    }
  });
  return next;
}

export function sortMotion(rows: MotionRow[], sort: LedgerSort): MotionRow[] {
  const next = [...rows];
  next.sort((a, b) => {
    switch (sort) {
      case "progress":
        return a.progress - b.progress; // anomaly / lag first
      case "urgency":
      case "deadline": {
        const ca = deadlineClockScore(a.expectedDate);
        const cb = deadlineClockScore(b.expectedDate);
        if (ca !== cb) return ca - cb;
        return impactEuro(b.impact) - impactEuro(a.impact);
      }
      case "location":
        return a.locationsShort.localeCompare(b.locationsShort);
      case "newest":
        return b.progress - a.progress;
      case "value":
      default:
        return impactEuro(b.impact) - impactEuro(a.impact);
    }
  });
  return next;
}

export function sortResolved(rows: ResolvedRow[], sort: LedgerSort): ResolvedRow[] {
  const next = [...rows];
  next.sort((a, b) => {
    switch (sort) {
      case "newest":
      case "urgency":
        return a.completed.localeCompare(b.completed) * -1;
      case "oldest":
        return a.completed.localeCompare(b.completed);
      case "location":
        return a.locationsShort.localeCompare(b.locationsShort);
      case "confidence": {
        const aa = parseFloat(a.accuracy);
        const ab = parseFloat(b.accuracy);
        return ab - aa;
      }
      case "value":
      default:
        return impactEuro(b.actual) - impactEuro(a.actual);
    }
  });
  return next;
}
