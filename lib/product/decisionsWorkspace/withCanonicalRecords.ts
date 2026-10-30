/**
 * Merge Decision Record flagships into the Decisions workspace ledger
 * so ledger IDs === Record IDs (D-1911, D-H-9201, peers).
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";
import {
  detailFromRecord,
  judgmentRowFromRecord,
  motionRowFromRecord,
  resolvedRowFromRecord,
} from "./fromDecisionRecord";
import type {
  DecisionDetail,
  DecisionsWorkspaceModel,
  JudgmentRow,
} from "./types";

function take(id: string): DecisionRecord | null {
  return getDecisionRecord(id) ?? null;
}

function stripIds(
  model: DecisionsWorkspaceModel,
  ids: string[],
): DecisionsWorkspaceModel {
  const drop = new Set(ids);
  const details = { ...model.details };
  for (const id of ids) delete details[id];
  return {
    ...model,
    judgment: model.judgment.filter((r) => !drop.has(r.id)),
    motion: model.motion.filter((r) => !drop.has(r.id)),
    resolved: model.resolved.filter((r) => !drop.has(r.id)),
    details,
  };
}

function injectRecord(
  model: DecisionsWorkspaceModel,
  rec: DecisionRecord,
  replaceIds: string[] = [],
): DecisionsWorkspaceModel {
  let next = stripIds(model, [rec.id, ...replaceIds]);
  const band = attentionBandOf(rec.status);
  const detail = detailFromRecord(rec);

  if (band === "needs_you" || band === "watching") {
    next = {
      ...next,
      judgment: [judgmentRowFromRecord(rec), ...next.judgment],
      details: { ...next.details, [rec.id]: detail },
    };
  } else if (band === "handling") {
    next = {
      ...next,
      motion: [motionRowFromRecord(rec), ...next.motion],
      details: { ...next.details, [rec.id]: detail },
    };
  } else {
    next = {
      ...next,
      resolved: [resolvedRowFromRecord(rec), ...next.resolved],
      details: { ...next.details, [rec.id]: detail },
    };
  }
  return next;
}

/** Remap a ledger row id in-place (keeps order / local copy). */
function remapJudgmentId(
  rows: JudgmentRow[],
  fromId: string,
  toId: string,
  patch?: Partial<JudgmentRow>,
): JudgmentRow[] {
  return rows.map((r) =>
    r.id === fromId ? { ...r, id: toId, ...patch } : r,
  );
}

function ensureDetail(
  details: Record<string, DecisionDetail>,
  id: string,
): Record<string, DecisionDetail> {
  if (details[id]) return details;
  const rec = take(id);
  if (!rec) return details;
  return { ...details, [id]: detailFromRecord(rec) };
}

export function withCanonicalRestaurantRecords(
  base: DecisionsWorkspaceModel,
): DecisionsWorkspaceModel {
  let model: DecisionsWorkspaceModel = {
    ...base,
    judgment: [...base.judgment],
    motion: [...base.motion],
    resolved: [...base.resolved],
    details: { ...base.details },
  };

  const peak = take(DECISION_IDS.peak);
  if (peak) {
    model = injectRecord(model, peak, [
      "dec_labor_schedule",
      "dec_service_capacity",
    ]);
    model = { ...model, defaultDecisionId: DECISION_IDS.peak };
  }

  const labor = take(DECISION_IDS.labor);
  if (labor) model = injectRecord(model, labor);

  const table = take(DECISION_IDS.tableRecover);
  if (table) model = injectRecord(model, table, ["dec_cancel_recovery"]);

  const supplier = take(DECISION_IDS.supplier);
  if (supplier) model = injectRecord(model, supplier, ["dec_proc_group"]);

  const menuPeak = take(DECISION_IDS.menuPeak);
  if (menuPeak) model = injectRecord(model, menuPeak, ["dec_menu_mix"]);

  return model;
}

/**
 * Hotel workspace already has D-H-9201 UX copy — keep it.
 * Only remap near-miss IDs and fill missing Record-backed details.
 */
export function withCanonicalHotelRecords(
  base: DecisionsWorkspaceModel,
): DecisionsWorkspaceModel {
  let model: DecisionsWorkspaceModel = {
    ...base,
    judgment: [...base.judgment],
    motion: [...base.motion],
    resolved: [...base.resolved],
    details: { ...base.details },
    defaultDecisionId: DECISION_IDS.hotelReadiness,
  };

  // Near-miss: ledger ota_close → Record dec_ota_canal
  const ota = take(DECISION_IDS.ota);
  if (ota) {
    const had = model.judgment.some((r) => r.id === "dec_hotel_ota_close_canal");
    model = {
      ...model,
      judgment: remapJudgmentId(
        model.judgment,
        "dec_hotel_ota_close_canal",
        DECISION_IDS.ota,
        {
          title: ota.title,
          impact: `+€${Math.abs(ota.expectedContributionImpact).toLocaleString("en-GB")}`,
        },
      ),
    };
    if (had || !model.details[DECISION_IDS.ota]) {
      const { dec_hotel_ota_close_canal: _drop, ...rest } = model.details as Record<
        string,
        DecisionDetail
      > & { dec_hotel_ota_close_canal?: DecisionDetail };
      model = {
        ...model,
        details: {
          ...rest,
          [DECISION_IDS.ota]: detailFromRecord(ota),
        },
      };
    }
  }

  // Ensure motion rows that share Record IDs have inspector details
  model = {
    ...model,
    details: ensureDetail(
      ensureDetail(model.details, "dec_hotel_ooo_canal"),
      "dec_hotel_rate_canal",
    ),
  };

  // Ensure flagship detail exists (prefer fixture; fall back to Record)
  if (!model.details[DECISION_IDS.hotelReadiness]) {
    const readiness = take(DECISION_IDS.hotelReadiness);
    if (readiness) {
      model = {
        ...model,
        details: {
          ...model.details,
          [DECISION_IDS.hotelReadiness]: detailFromRecord(readiness),
        },
      };
    }
  }

  return model;
}
