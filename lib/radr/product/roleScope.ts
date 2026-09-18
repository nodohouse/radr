/**
 * Role/scope filtering over the Decision store — one object, many views.
 */

import type { RoleView } from "@/lib/product/types";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { normalizeLocationId } from "./demoOrg";
import {
  roleContextFor,
  type PresentationPriority,
  type RoleContext,
} from "./personas";

export function recordAttention(r: DecisionRecord) {
  return r.attentionOverride ?? attentionBandOf(r.status);
}

export function decisionInScope(
  r: DecisionRecord,
  ctx: RoleContext,
): boolean {
  if (ctx.denyDecisionIds?.includes(r.id)) return false;
  if (ctx.allowDecisionIds?.includes(r.id)) return true;

  const loc = normalizeLocationId(r.locationId);
  if (loc === "loc_group") return ctx.includeGroup;
  return ctx.allowedLocationIds.includes(loc as (typeof ctx.allowedLocationIds)[number]);
}

export function filterDecisionsForRole(
  records: DecisionRecord[],
  role: RoleView,
): DecisionRecord[] {
  const ctx = roleContextFor(role);
  return records.filter((r) => decisionInScope(r, ctx));
}

function priorityScore(
  r: DecisionRecord,
  priorities: PresentationPriority[],
): number {
  const band = recordAttention(r);
  let s = 0;
  if (band === "needs_you") s += 200;
  if (band === "handling") s += 80;
  if (band === "verified") s += 40;
  if (band === "learned") s += 10;

  // Urgent NOW vs THIS_WEEK
  if (r.decisionHorizon === "NOW") s += 60;
  else if (r.decisionHorizon === "TODAY") s += 40;
  else if (r.decisionHorizon === "THIS_WEEK") s += 15;
  else if (r.decisionHorizon === "STRUCTURAL") s += 5;

  for (const p of priorities) {
    switch (p) {
      case "deadline":
        if (r.decisionHorizon === "NOW") s += 50;
        break;
      case "ops":
        if (r.id === DECISION_IDS.peak || r.id === DECISION_IDS.tableRecover)
          s += 40;
        break;
      case "economics":
      case "verification":
      case "attribution":
        if (r.verifiedValue) s += 35;
        if (r.exposedContribution && r.exposedContribution > 500) s += 20;
        break;
      case "pattern":
      case "group":
        if (r.decisionHorizon === "STRUCTURAL" || r.id === DECISION_IDS.playbook)
          s += 55;
        break;
      case "inventory":
      case "channel":
        if (r.id === DECISION_IDS.ota) s += 70;
        if (r.vertical === "hotel") s += 25;
        break;
    }
  }

  // Peak always beats weekly supplier for GM
  if (r.id === DECISION_IDS.peak) s += 30;
  if (r.id === DECISION_IDS.supplier) s -= 10;

  return s;
}

export function sortDecisionsForRole(
  records: DecisionRecord[],
  role: RoleView,
): DecisionRecord[] {
  const ctx = roleContextFor(role);
  return [...records].sort(
    (a, b) =>
      priorityScore(b, ctx.presentationPriority) -
      priorityScore(a, ctx.presentationPriority),
  );
}

export function scopedDecisions(
  records: DecisionRecord[],
  role: RoleView,
): DecisionRecord[] {
  return sortDecisionsForRole(filterDecisionsForRole(records, role), role);
}

/** Urgent (NOW) vs needs review (slower horizon) within needs_you. */
export function splitNeedsYou(records: DecisionRecord[]): {
  urgent: DecisionRecord[];
  review: DecisionRecord[];
} {
  const needs = records.filter((r) => recordAttention(r) === "needs_you");
  const urgent = needs.filter(
    (r) => r.decisionHorizon === "NOW" || r.decisionHorizon === "TODAY",
  );
  const review = needs.filter(
    (r) => r.decisionHorizon !== "NOW" && r.decisionHorizon !== "TODAY",
  );
  return { urgent, review };
}

export function memoryInScope(
  records: DecisionRecord[],
  role: RoleView,
): DecisionRecord[] {
  return scopedDecisions(records, role).filter(
    (r) =>
      r.lesson ||
      r.playbookImpact ||
      r.patternsUpdated?.length ||
      recordAttention(r) === "learned" ||
      recordAttention(r) === "verified",
  );
}
