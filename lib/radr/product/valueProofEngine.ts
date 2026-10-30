/**
 * Value Proof Engine — Overview model for /app/value.
 * Headline Verified Value always equals deriveValueAggregate (Control Center SSOT).
 * Deterministic. No Math.random().
 */

import type { DecisionRecord } from "@/lib/radr/decision/record";
import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  recordAttention,
  scopedDecisionsForDemo,
} from "@/lib/radr/product/roleScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import {
  buildVerifiedValueTrend,
  priorMtdVerifiedTotal,
} from "@/lib/radr/product/demoValueHistory";
import { euroTraceForDecision, type EuroTrace } from "@/lib/radr/product/euroTrace";
import {
  TERRACE_DEMAND_FADE_MISS,
  listValueMisses,
} from "@/lib/radr/product/valueMiss";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";

export type ValueView = "overview" | "over-time" | "class" | "location";

export type ValueDriverId =
  | "service-capacity"
  | "procurement"
  | "operating-pattern"
  | "social-mix"
  | "supplier-ap"
  | "menu-economics";

export type ValueDriverCard = {
  id: ValueDriverId;
  label: string;
  euro: number;
  decisionCount: number;
  decisionIds: string[];
  spark: number[];
  tone: "green" | "blue" | "violet" | "amber";
};

export type ClosedValueRow = {
  decisionId: string;
  displayId: string;
  classLabel: string;
  title: string;
  expected: number;
  observed: number;
  verified: number;
  note: string;
  openHref: string;
};

import { moneyContext } from "./demoMoney";

export type ValueOverviewModel = {
  currency: import("@/lib/radr/demo/estateRegistry").DemoEstateCurrency;
  currencyLabel: string;
  hasMiss: boolean;
  verifiedTotal: number;
  verifiedFormatted: string;
  decisionCount: number;
  priorMtd: number;
  deltaPct: number | null;
  deltaFormatted: string;
  drivers: ValueDriverCard[];
  hiddenDrivers: ValueDriverCard[];
  driversSum: number;
  reconciles: boolean;
  miss: typeof TERRACE_DEMAND_FADE_MISS;
  proof: EuroTrace | null;
  closed: ClosedValueRow[];
  trend: ReturnType<typeof buildVerifiedValueTrend>;
};

const DRIVER_META: Record<
  string,
  { id: ValueDriverId; label: string; tone: ValueDriverCard["tone"]; spark: number[] }
> = {
  "Service capacity": {
    id: "service-capacity",
    label: "Service capacity",
    tone: "green",
    spark: [12, 18, 16, 22, 28, 26, 34],
  },
  Procurement: {
    id: "procurement",
    label: "Procurement",
    tone: "green",
    spark: [40, 38, 42, 48, 52, 55, 60],
  },
  "Operating pattern": {
    id: "operating-pattern",
    label: "Operating pattern",
    tone: "blue",
    spark: [8, 10, 9, 12, 11, 14, 13],
  },
  "Supplier / AP": {
    id: "supplier-ap",
    label: "Supplier / AP",
    tone: "amber",
    spark: [0, 0, 0, 4, 8, 10, 12],
  },
  "Menu economics": {
    id: "menu-economics",
    label: "Menu economics",
    tone: "violet",
    spark: [20, 22, 18, 24, 26, 25, 28],
  },
};

/** Mockup card 4 label; ledger class may be Operating pattern (social demand). */
const SOCIAL_AS_CARD: ValueDriverCard = {
  id: "social-mix",
  label: "Demand and mix",
  euro: 280,
  decisionCount: 1,
  decisionIds: [DECISION_IDS.socialDemand],
  spark: [6, 8, 7, 10, 9, 11, 12],
  tone: "violet",
};

const OVERVIEW_ORDER: ValueDriverId[] = [
  "service-capacity",
  "procurement",
  "operating-pattern",
  "social-mix",
  "supplier-ap",
];

function sparkFor(id: ValueDriverId): number[] {
  if (id === "social-mix") return SOCIAL_AS_CARD.spark;
  const hit = Object.values(DRIVER_META).find((m) => m.id === id);
  return hit?.spark ?? [4, 6, 5, 8, 7, 9, 10];
}

export function buildValueOverview(
  role: RoleView = "cfo",
  vertical: DemoVerticalFamily = "restaurant",
  recordsOverride?: DecisionRecord[],
): ValueOverviewModel {
  const agg = deriveValueAggregate(role, vertical, recordsOverride);
  const prior = priorMtdVerifiedTotal(role, vertical, recordsOverride);
  const deltaPct =
    prior > 0 ? Math.round(((agg.verifiedTotal - prior) / prior) * 100) : null;

  const verified = scopedDecisionsForDemo(
    recordsOverride ?? listDecisionRecords(),
    role,
    vertical,
  ).filter(
    (r) =>
      r.verifiedValue &&
      (r.verifiedValue.amount ?? 0) > 0 &&
      (recordAttention(r) === "verified" || recordAttention(r) === "learned"),
  );

  const money = moneyContext(scopedDecisionsForDemo(recordsOverride ?? listDecisionRecords(),role,vertical),role);
  const byClass = new Map<string, { euro: number; ids: string[] }>();
  for (const r of verified) {
    const c = customerDecisionClass(r);
    const cur = byClass.get(c) ?? { euro: 0, ids: [] };
    cur.euro += money.toDisplay(r, r.verifiedValue!.amount);
    cur.ids.push(r.id);
    byClass.set(c, cur);
  }

  const allDrivers: ValueDriverCard[] = [];
  for (const [classLabel, bucket] of byClass) {
    if (classLabel === "Operating pattern") {
      // Split guest-voice vs social for mockup composition
      const guest = bucket.ids.filter((id) => id === DECISION_IDS.guestVoice);
      const social = bucket.ids.filter((id) => id === DECISION_IDS.socialDemand);
      const other = bucket.ids.filter(
        (id) => id !== DECISION_IDS.guestVoice && id !== DECISION_IDS.socialDemand,
      );
      if (guest.length) {
        const euro = guest.reduce((s, id) => {
          const r = verified.find(record=>record.id===id);
          return s + (r ? money.toDisplay(r,r.verifiedValue?.amount??0) : 0);
        }, 0);
        allDrivers.push({
          id: "operating-pattern",
          label: "Operating pattern",
          euro,
          decisionCount: guest.length,
          decisionIds: guest,
          spark: sparkFor("operating-pattern"),
          tone: "blue",
        });
      }
      if (social.length) {
        const euro = social.reduce((s, id) => {
          const r = verified.find(record=>record.id===id);
          return s + (r ? money.toDisplay(r,r.verifiedValue?.amount??0) : 0);
        }, 0);
        allDrivers.push({
          ...SOCIAL_AS_CARD,
          euro,
          decisionCount: social.length,
          decisionIds: social,
        });
      }
      if (other.length) {
        const euro = other.reduce((s, id) => {
          const r = verified.find(record=>record.id===id);
          return s + (r ? money.toDisplay(r,r.verifiedValue?.amount??0) : 0);
        }, 0);
        allDrivers.push({
          id: "operating-pattern",
          label: "Operating pattern",
          euro,
          decisionCount: other.length,
          decisionIds: other,
          spark: sparkFor("operating-pattern"),
          tone: "blue",
        });
      }
      continue;
    }
    const meta = DRIVER_META[classLabel] ?? {
      id: "operating-pattern" as ValueDriverId,
      label: classLabel,
      tone: "green" as const,
      spark: sparkFor("operating-pattern"),
    };
    allDrivers.push({
      id: meta.id,
      label: meta.label,
      euro: bucket.euro,
      decisionCount: bucket.ids.length,
      decisionIds: bucket.ids,
      spark: meta.spark,
      tone: meta.tone,
    });
  }

  const uniqueDrivers = [...allDrivers.reduce((map, driver) => {
    const previous=map.get(driver.id);
    map.set(driver.id,previous?{...previous,euro:previous.euro+driver.euro,decisionCount:previous.decisionCount+driver.decisionCount,decisionIds:[...previous.decisionIds,...driver.decisionIds]}:driver);
    return map;
  },new Map<ValueDriverId,ValueDriverCard>()).values()];
  const drivers = OVERVIEW_ORDER.map((id) =>
    uniqueDrivers.find((d) => d.id === id),
  ).filter(Boolean) as ValueDriverCard[];

  const hiddenDrivers = uniqueDrivers.filter(
    (d) => !OVERVIEW_ORDER.includes(d.id),
  );

  const driversSum =
    drivers.reduce((s, d) => s + d.euro, 0) +
    hiddenDrivers.reduce((s, d) => s + d.euro, 0);

  const closedIds = [
    DECISION_IDS.labor,
    DECISION_IDS.tuna,
  ];
  const closed: ClosedValueRow[] = closedIds
    .map((id) => {
      const r = verified.find(record=>record.id===id);
      if (!r?.verifiedValue) return null;
      const verifiedAmt = money.toDisplay(r,r.verifiedValue.amount);
      const expected = money.toDisplay(r,r.expectedContributionImpact ?? r.verifiedValue.amount);
      const observed = money.toDisplay(r,r.actualContributionImpact ?? r.verifiedValue.amount);
      return {
        decisionId: id,
        displayId: displayDecisionId(id),
        classLabel: customerDecisionClass(r),
        title: r.title,
        expected,
        observed,
        verified: verifiedAmt,
        note: r.verifiedValue.note ?? "",
        openHref: `/app/decisions/${id}`,
      } satisfies ClosedValueRow;
    })
    .filter(Boolean) as ClosedValueRow[];

  const misses = listValueMisses(vertical);
  const miss = misses[0] ?? TERRACE_DEMAND_FADE_MISS;

  return {
    currency: agg.currency,
    currencyLabel: agg.currencyLabel,
    verifiedTotal: agg.verifiedTotal,
    verifiedFormatted: formatDecisionMoney(agg.verifiedTotal, agg.currency),
    decisionCount: agg.decisionIdsVerified.length,
    priorMtd: prior,
    deltaPct,
    deltaFormatted:
      deltaPct == null ? "—" : `${deltaPct >= 0 ? "+" : ""}${deltaPct}% vs prior MTD`,
    drivers,
    hiddenDrivers,
    driversSum,
    reconciles: driversSum === agg.verifiedTotal,
    miss,
    hasMiss: scopedDecisionsForDemo(recordsOverride ?? listDecisionRecords(),role,vertical).some(record=>record.id===miss.decisionId),
    proof: recordsOverride ? (verified[0] ? euroTraceForDecision(verified[0].id) : null) : euroTraceForDecision(DECISION_IDS.supplier),
    closed,
    trend: buildVerifiedValueTrend(role, vertical, recordsOverride),
  };
}

export function parseValueView(raw: string | null): ValueView {
  if (raw === "over-time" || raw === "time") return "over-time";
  if (raw === "class") return "class";
  if (raw === "location") return "location";
  return "overview";
}

export { formatDecisionMoney as formatValueMoney };
