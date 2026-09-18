/**
 * Value attribution — never double-count exposure + recovery.
 * Exposure = risk. Verified Value = proven outcome.
 */

import type { ValueKind } from "../core";

export type VerifiedBucket = "recovered" | "protected" | "created" | "avoided";

export type ValueLine = {
  id: string;
  decisionId: string;
  kind: VerifiedBucket;
  amountEuro: number;
  label: string;
  verified: boolean;
  verificationMethod?: string;
};

export type ValueUnderRadr = {
  periodLabel: string;
  identifiedEuro: number;
  actionableEuro: number;
  verifiedEuro: number;
  byKind: Record<VerifiedBucket, number>;
  lines: ValueLine[];
  demo: boolean;
};

/**
 * Sum verified lines only into Verified Value.
 * Identified may include open exposure; never add exposure + recovery for same event.
 */
export function attributeValue(lines: ValueLine[]): {
  verifiedEuro: number;
  byKind: Record<VerifiedBucket, number>;
} {
  const byKind: Record<VerifiedBucket, number> = {
    recovered: 0,
    protected: 0,
    created: 0,
    avoided: 0,
  };
  let verifiedEuro = 0;
  const seenDecisions = new Set<string>();

  for (const line of lines) {
    if (!line.verified) continue;
    // One verified amount per decision id (no double count)
    const key = `${line.decisionId}:${line.kind}`;
    if (seenDecisions.has(key)) continue;
    seenDecisions.add(key);
    byKind[line.kind] += line.amountEuro;
    verifiedEuro += line.amountEuro;
  }

  return { verifiedEuro, byKind };
}

export function moneyKindToBucket(
  kind: ValueKind,
): VerifiedBucket | "exposed" {
  if (kind === "exposed") return "exposed";
  return kind;
}

/** Demo CFO month — clearly labeled DEMO when shown. */
export function demoValueUnderRadr(): ValueUnderRadr {
  const lines: ValueLine[] = [
    {
      id: "vl_tuna",
      decisionId: "dec_tuna_berlin",
      kind: "protected",
      amountEuro: 1590,
      label: "Tuna shortfall · feature-swap",
      verified: true,
      verificationMethod: "POS_TRANSACTION",
    },
    {
      id: "vl_table",
      decisionId: "dec_table_recover_berlin",
      kind: "recovered",
      amountEuro: 184,
      label: "Table 8 waitlist fill",
      verified: true,
      verificationMethod: "POS_TRANSACTION",
    },
    {
      id: "vl_ota",
      decisionId: "dec_ota_canal",
      kind: "protected",
      amountEuro: 2960,
      label: "Direct hold · contribution protected",
      verified: true,
      verificationMethod: "PMS_BOOKING",
    },
    {
      id: "vl_orphan",
      decisionId: "dec_orphan_chiado",
      kind: "recovered",
      amountEuro:
        CANON_ORPHAN.verifiedIncrementalEuro ?? CANON_ORPHAN.actualProtectedEuro,
      label: "Orphan night · verified recovered vs take-now",
      verified: true,
      verificationMethod: "CHANNEL_BOOKING",
    },
  ];

  // Scale demo month totals to commercial narrative (DEMO)
  const { byKind } = attributeValue(lines);
  const verifiedEuro = 213420;
  const scale =
    verifiedEuro /
    Math.max(
      1,
      byKind.recovered + byKind.protected + byKind.created + byKind.avoided,
    );

  return {
    periodLabel: "This month · DEMO",
    identifiedEuro: 284120,
    actionableEuro: 241880,
    verifiedEuro,
    byKind: {
      recovered: 68420,
      protected: 94800,
      created: 30600,
      avoided: 19600,
    },
    lines: lines.map((l) => ({
      ...l,
      amountEuro: Math.round(l.amountEuro * scale),
    })),
    demo: true,
  };
}

import { CANON_ORPHAN, CANON_PEAK, CANON_TUNA, formatCanonVariance } from "../demo/canonical";

export function proofForVerifiedEuro(decisionId: string): {
  decisionId: string;
  displayId: string;
  exposureEuro: number;
  predictedEuro: number;
  actualEuro: number;
  verification: string[];
  varianceNote: string;
  chosenScenario: string;
  altScenario?: string;
} | null {
  if (decisionId === CANON_PEAK.id) {
    const alt = CANON_PEAK.scenarios.find((s) => s.id === "seat_now");
    return {
      decisionId: CANON_PEAK.id,
      displayId: CANON_PEAK.displayId,
      exposureEuro: CANON_PEAK.exposureEuro,
      predictedEuro: CANON_PEAK.expectedProtectedEuro,
      actualEuro: CANON_PEAK.actualProtectedEuro,
      verification: CANON_PEAK.verificationSources,
      varianceNote: formatCanonVariance(CANON_PEAK),
      chosenScenario: "Wait 12 min · throttle · feature",
      altScenario: alt ? `Seat-now ${alt.expectedContributionEuro}` : undefined,
    };
  }
  if (decisionId === CANON_TUNA.id) {
    const alt = CANON_TUNA.scenarios.find((s) => s.id === "supplier_first");
    return {
      decisionId: CANON_TUNA.id,
      displayId: CANON_TUNA.displayId,
      exposureEuro: CANON_TUNA.exposureEuro,
      predictedEuro: CANON_TUNA.expectedProtectedEuro,
      actualEuro: CANON_TUNA.actualProtectedEuro,
      verification: CANON_TUNA.verificationSources,
      varianceNote: formatCanonVariance(CANON_TUNA),
      chosenScenario: "Feature Truffle Pasta first",
      altScenario: alt
        ? `Supplier-first ${alt.expectedContributionEuro}`
        : undefined,
    };
  }
  return null;
}
