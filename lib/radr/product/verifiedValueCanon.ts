/**
 * Canonical Verified Value — every displayed Verified € equals
 * SUM(verifiedValueRecords in current scope). No hardcoded portfolio totals.
 */

import type { RoleView } from "@/lib/product/types";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  deriveValueAggregate,
  type ValueAggregate,
} from "@/lib/radr/product/valueAggregate";
import { recordAttention } from "@/lib/radr/product/roleScope";

/** Lab Center roles map onto RoleView scopes for aggregate math. */
export function roleViewForLabRole(
  role: "gm" | "cfo" | "clevel",
): RoleView {
  if (role === "gm") return "gm";
  if (role === "cfo") return "cfo";
  return "coo";
}

export function canonicalVerifiedAggregate(
  role: RoleView = "cfo",
): ValueAggregate {
  return deriveValueAggregate(role);
}

export function canonicalVerifiedTotal(role: RoleView = "cfo"): number {
  return deriveValueAggregate(role).verifiedTotal;
}

export function formatCanonicalVerified(role: RoleView = "cfo"): string {
  return formatDecisionMoney(canonicalVerifiedTotal(role));
}

/** Independent check: aggregate total === sum of in-scope verified amounts. */
export function sumVerifiedRecordsInScope(role: RoleView): number {
  const agg = deriveValueAggregate(role);
  const scoped = listDecisionRecords().filter((r) =>
    agg.decisionIdsVerified.includes(r.id),
  );
  return scoped.reduce((s, r) => s + (r.verifiedValue?.amount ?? 0), 0);
}

export function assertVerifiedReconciles(role: RoleView): {
  ok: boolean;
  aggregate: number;
  sum: number;
} {
  const aggregate = canonicalVerifiedTotal(role);
  const sum = sumVerifiedRecordsInScope(role);
  return { ok: aggregate === sum, aggregate, sum };
}

/** Single Decision Verified amount — never use as portfolio total. */
export function decisionVerifiedAmount(decisionId: string): number | null {
  const r = listDecisionRecords().find((d) => d.id === decisionId);
  if (!r?.verifiedValue) return null;
  const band = recordAttention(r);
  if (band !== "verified" && band !== "learned") return null;
  return r.verifiedValue.amount;
}
