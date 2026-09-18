/**
 * In-memory Decision Record store — NODO portfolio demo.
 * Source of truth for /app Control Center + Decision Record.
 */

import type { DecisionVertical } from "./core";
import type {
  DecisionRecord,
  SinceLastCheckItem,
  WatchingSignal,
} from "./record";
import type { DecisionLifecycleStatus } from "./lifecycle";
import { attentionBandOf, canTransition } from "./lifecycle";
import type { DecisionRecordHorizon } from "./horizon";
import { DECISION_IDS } from "./ids";
import { buildPeakDecisionRecord, applyPeakVipContext } from "./demos/peak";
import {
  buildTableRecoverDecisionRecord,
  buildSupplierDecisionRecord,
  buildPlaybookDecisionRecord,
  buildArchivedTuna,
  buildVerifiedOta,
  buildVerifiedOrphan,
} from "./demos/portfolio";
import {
  buildMenuPeakDecisionRecord,
  buildSocialDemandDecisionRecord,
  buildGuestVoiceDecisionRecord,
} from "./demos/intelligenceDepth";
import { buildMarginCokeDecisionRecord } from "./demos/marginCoke";
import {
  buildOtaDecisionRecord,
} from "./demos/ota";
import { buildOrphanDecisionRecord } from "./demos/orphan";
import {
  buildTunaDecisionRecord,
  applySupplierFailure,
} from "./demos/tuna";

export type DecisionStoreState = {
  records: Record<string, DecisionRecord>;
  watching: WatchingSignal[];
  lastCheckAt: string;
  /** @deprecated Prefer location/role filters; kept for legacy sync. */
  vertical: DecisionVertical;
};

const KITCHEN_WATCH: WatchingSignal = {
  id: "watch_kitchen_berlin",
  locationId: "loc_berlin_mitte",
  property: "Berlin Mitte",
  title: "Kitchen pressure",
  detail: "Modeled load rising — below Decision threshold.",
  metricLabel: "Kitchen load",
  metricValue: "83% → projected 91%",
  reason: "Not yet material / actionable enough to require intervention.",
};

function seedPortfolio(): Record<string, DecisionRecord> {
  return {
    [DECISION_IDS.peak]: buildPeakDecisionRecord("AWAITING_APPROVAL"),
    [DECISION_IDS.tableRecover]: buildTableRecoverDecisionRecord("APPROVED"),
    [DECISION_IDS.ota]: buildVerifiedOta(),
    [DECISION_IDS.orphan]: buildVerifiedOrphan(),
    [DECISION_IDS.supplier]: buildSupplierDecisionRecord("AWAITING_APPROVAL"),
    [DECISION_IDS.playbook]: buildPlaybookDecisionRecord("SIMULATED"),
    [DECISION_IDS.tuna]: buildArchivedTuna(),
    /** Intelligence depth — learned, not urgent clutter. */
    [DECISION_IDS.menuPeak]: buildMenuPeakDecisionRecord("LEARNED"),
    [DECISION_IDS.socialDemand]: buildSocialDemandDecisionRecord("LEARNED"),
    [DECISION_IDS.guestVoice]: buildGuestVoiceDecisionRecord("LEARNED"),
    [DECISION_IDS.marginCoke]: buildMarginCokeDecisionRecord("AWAITING_APPROVAL"),
  };
}

let state: DecisionStoreState = {
  records: seedPortfolio(),
  watching: [KITCHEN_WATCH],
  lastCheckAt: "2026-09-17T17:55:00+02:00",
  vertical: "restaurant",
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribeDecisionStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDecisionStoreSnapshot(): DecisionStoreState {
  return state;
}

export function resetDecisionStore(_vertical?: DecisionVertical) {
  state = {
    records: seedPortfolio(),
    watching: [KITCHEN_WATCH],
    lastCheckAt: new Date().toISOString(),
    vertical: _vertical ?? "restaurant",
  };
  emit();
}

/** Location/role filter only — does not wipe portfolio. */
export function setDecisionStoreVertical(vertical: DecisionVertical) {
  if (state.vertical === vertical) return;
  state = { ...state, vertical };
  emit();
}

export function getDecisionRecord(id: string): DecisionRecord | undefined {
  return state.records[id];
}

export function getWatchingSignals(): WatchingSignal[] {
  return state.watching;
}

export function recordAttentionBand(r: DecisionRecord) {
  return r.attentionOverride ?? attentionBandOf(r.status);
}

export function listDecisionRecords(opts?: {
  band?: ReturnType<typeof attentionBandOf> | "learned" | "all";
  horizon?: DecisionRecordHorizon | "ALL";
  locationId?: string | "all";
}): DecisionRecord[] {
  return Object.values(state.records).filter((r) => {
    if (opts?.band && opts.band !== "all") {
      if (recordAttentionBand(r) !== opts.band) return false;
    }
    if (
      opts?.horizon &&
      opts.horizon !== "ALL" &&
      r.decisionHorizon !== opts.horizon
    ) {
      return false;
    }
    if (
      opts?.locationId &&
      opts.locationId !== "all" &&
      r.locationId !== opts.locationId &&
      r.locationId !== "loc_group"
    ) {
      return false;
    }
    return true;
  });
}

function patchRecord(id: string, next: DecisionRecord) {
  state = {
    ...state,
    records: { ...state.records, [id]: next },
  };
  emit();
}

const BUILDERS: Partial<
  Record<string, (s: DecisionRecord["status"]) => DecisionRecord>
> = {
  [DECISION_IDS.peak]: buildPeakDecisionRecord,
  [DECISION_IDS.tableRecover]: buildTableRecoverDecisionRecord,
  [DECISION_IDS.supplier]: buildSupplierDecisionRecord,
  [DECISION_IDS.playbook]: buildPlaybookDecisionRecord,
  [DECISION_IDS.menuPeak]: buildMenuPeakDecisionRecord,
  [DECISION_IDS.socialDemand]: buildSocialDemandDecisionRecord,
  [DECISION_IDS.guestVoice]: buildGuestVoiceDecisionRecord,
  [DECISION_IDS.ota]: (s) => ({
    ...buildOtaDecisionRecord(s),
    territories: ["SELL"],
  }),
  [DECISION_IDS.orphan]: (s) => ({
    ...buildOrphanDecisionRecord(s),
    territories: ["RECOVER", "SELL"],
  }),
  [DECISION_IDS.tuna]: (s) => ({
    ...buildTunaDecisionRecord(s),
    territories: ["BUY", "SELL"],
  }),
};

function preserveOperatorFields(
  cur: DecisionRecord,
  next: DecisionRecord,
): DecisionRecord {
  return {
    ...next,
    operatorContext: cur.operatorContext,
    recommendationHeadline:
      cur.recommendationHeadline ?? next.recommendationHeadline,
    recommendationReasoning:
      cur.recommendationReasoning ?? next.recommendationReasoning,
  };
}

export function approveDecision(
  id: string,
  optionId?: string,
  approver = "GM",
): DecisionRecord | undefined {
  const cur = state.records[id];
  if (!cur) return undefined;
  if (!canTransition(cur.status, "APPROVED")) return cur;

  const chosen = optionId ?? cur.recommendedOptionId;
  const builder = BUILDERS[id];
  if (builder) {
    const next = preserveOperatorFields(cur, builder("APPROVED"));
    next.chosenOptionId = chosen;
    next.approver = approver;
    patchRecord(id, next);
    return next;
  }

  const next: DecisionRecord = {
    ...cur,
    status: "APPROVED",
    chosenOptionId: chosen,
    approver,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actionPlan: {
      ...cur.actionPlan,
      status: "APPROVED",
      steps: cur.actionPlan.steps.map((s) => ({
        ...s,
        status: "APPROVED" as const,
      })),
    },
    ledger: [
      ...cur.ledger,
      {
        id: `le_approve_${Date.now()}`,
        at: new Date().toISOString().slice(11, 16),
        kind: "approve",
        title: `${approver} approved`,
        statusAfter: "APPROVED",
      },
    ],
  };
  patchRecord(id, next);
  return next;
}

export function advanceDecision(
  id: string,
  to: DecisionLifecycleStatus,
): DecisionRecord | undefined {
  const cur = state.records[id];
  if (!cur) return undefined;
  if (!canTransition(cur.status, to)) return cur;

  const builder = BUILDERS[id];
  if (
    builder &&
    (to === "VERIFIED" ||
      to === "LEARNED" ||
      to === "CLOSED" ||
      to === "EXECUTING" ||
      to === "OBSERVING" ||
      to === "APPROVED" ||
      to === "AWAITING_APPROVAL" ||
      to === "SIMULATED" ||
      to === "RECOMMENDED")
  ) {
    const mapped = to === "CLOSED" ? "LEARNED" : to;
    const next = preserveOperatorFields(cur, builder(mapped));
    patchRecord(id, next);
    return next;
  }

  const next = { ...cur, status: to, updatedAt: new Date().toISOString() };
  patchRecord(id, next);
  return next;
}

export function verifyDecision(id: string): DecisionRecord | undefined {
  return advanceDecision(id, "VERIFIED");
}

export function learnDecision(id: string): DecisionRecord | undefined {
  return advanceDecision(id, "LEARNED");
}

export function addOperatorContext(
  id: string,
  text?: string,
): DecisionRecord | undefined {
  const cur = state.records[id];
  if (!cur) return undefined;
  if (id === DECISION_IDS.peak) {
    const next = applyPeakVipContext(cur);
    if (text && next.operatorContext?.length) {
      const last = next.operatorContext[next.operatorContext.length - 1];
      if (last) last.text = text;
    }
    patchRecord(id, next);
    return next;
  }
  const entry = {
    id: `ctx_${Date.now()}`,
    author: "Operator",
    role: cur.roleContext,
    timestamp: new Date().toISOString(),
    text: text ?? "Additional operating context.",
  };
  const next: DecisionRecord = {
    ...cur,
    status: "AWAITING_APPROVAL",
    operatorContext: [...(cur.operatorContext ?? []), entry],
    updatedAt: new Date().toISOString(),
  };
  patchRecord(id, next);
  return next;
}

export function sinceLastCheck(): SinceLastCheckItem[] {
  const items: SinceLastCheckItem[] = [];
  for (const r of Object.values(state.records)) {
    const band = recordAttentionBand(r);
    if (band === "needs_you") {
      items.push({
        id: r.id,
        kind: "needs_you",
        title: r.title,
        detail: r.decisionDeadline,
        amountEuro: r.exposedContribution,
      });
    } else if (band === "handling") {
      items.push({
        id: r.id,
        kind: "handled",
        title: r.title,
        detail: "RADR is handling",
        amountEuro: r.expectedContributionImpact,
      });
    } else if (band === "verified" && r.verifiedValue) {
      items.push({
        id: r.id,
        kind: "verified",
        title: r.title,
        detail: r.verifiedValue.note,
        amountEuro: r.verifiedValue.amount,
      });
    }
  }
  return items.slice(0, 8);
}

export function structuralDebtForVertical(
  _vertical?: DecisionVertical,
): DecisionRecord | undefined {
  return state.records[DECISION_IDS.playbook];
}

export function heroRecordId(_vertical?: DecisionVertical): string {
  return DECISION_IDS.peak;
}

export function failSupplierAndFallback(
  id: string,
): DecisionRecord | undefined {
  const cur = state.records[id];
  if (!cur) return undefined;
  const next = applySupplierFailure(cur);
  patchRecord(id, next);
  return next;
}
