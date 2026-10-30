import type { DecisionRecord } from "@/lib/radr/decision/record";
import { recordAttention } from "./roleScope";

/** A disjoint partition of one selected record set, reused by cards and filters. */
export function decisionSummary(records: DecisionRecord[]) {
  const unique = [...new Map(records.map(record=>[record.id,record])).values()];
  const groups = {
    needs_you: unique.filter(record=>recordAttention(record)==="needs_you"),
    handling: unique.filter(record=>recordAttention(record)==="handling"),
    resolved: unique.filter(record=>["verified","learned"].includes(recordAttention(record))),
    watching: unique.filter(record=>recordAttention(record)==="watching"),
  };
  return { decisions:unique, groups, counts:{ all:unique.length, needs_you:groups.needs_you.length, handling:groups.handling.length, resolved:groups.resolved.length, watching:groups.watching.length } };
}
