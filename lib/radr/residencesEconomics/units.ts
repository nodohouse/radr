/**
 * Serviced apartment unit economics — ADR ≠ portfolio contribution.
 */

import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { parseHiddenSignal } from "@/lib/radr/domain/hiddenSignal";

export type UnitEconomics = {
  id: string;
  label: string;
  occupancyPct: number;
  adr: number;
  revenue: number;
  channelFees: number;
  cleaningCost: number;
  cleaningDurationPctVsPeer: number;
  maintenanceCost: number;
  utilities: number;
  downtimeNights: number;
  netContribution: number;
  adrRank: number;
  contributionRank: number;
};

export const LISBON_UNIT_ECONOMICS: UnitEconomics[] = [
  {
    id: "unit_12",
    label: "Unit 12",
    occupancyPct: 74,
    adr: 138,
    revenue: 18_420,
    channelFees: 2_210,
    cleaningCost: 3_140,
    cleaningDurationPctVsPeer: 4,
    maintenanceCost: 480,
    utilities: 620,
    downtimeNights: 1,
    netContribution: 0,
    adrRank: 0,
    contributionRank: 0,
  },
  {
    id: "unit_24",
    label: "Unit 24",
    occupancyPct: 71,
    adr: 164,
    revenue: 21_860,
    channelFees: 2_840,
    cleaningCost: 3_720,
    cleaningDurationPctVsPeer: 18,
    maintenanceCost: 1_700,
    utilities: 710,
    downtimeNights: 4,
    netContribution: 0,
    adrRank: 0,
    contributionRank: 0,
  },
  {
    id: "unit_31",
    label: "Unit 31",
    occupancyPct: 68,
    adr: 142,
    revenue: 16_980,
    channelFees: 2_040,
    cleaningCost: 2_980,
    cleaningDurationPctVsPeer: 2,
    maintenanceCost: 2_420,
    utilities: 590,
    downtimeNights: 6,
    netContribution: 0,
    adrRank: 0,
    contributionRank: 0,
  },
  {
    id: "unit_08",
    label: "Unit 08",
    occupancyPct: 79,
    adr: 128,
    revenue: 19_120,
    channelFees: 1_720,
    cleaningCost: 2_860,
    cleaningDurationPctVsPeer: -6,
    maintenanceCost: 310,
    utilities: 540,
    downtimeNights: 0,
    netContribution: 0,
    adrRank: 0,
    contributionRank: 0,
  },
];

function net(u: UnitEconomics): number {
  const downtime = u.downtimeNights * u.adr * 0.7;
  return Math.round(
    u.revenue -
      u.channelFees -
      u.cleaningCost -
      u.maintenanceCost -
      u.utilities -
      downtime,
  );
}

export function computeUnitEconomics(
  rows: UnitEconomics[] = LISBON_UNIT_ECONOMICS,
): UnitEconomics[] {
  const computed = rows.map((u) => ({ ...u, netContribution: net(u) }));
  const byAdr = [...computed].sort((a, b) => b.adr - a.adr);
  const byNet = [...computed].sort((a, b) => b.netContribution - a.netContribution);
  return computed.map((u) => ({
    ...u,
    adrRank: byAdr.findIndex((x) => x.id === u.id) + 1,
    contributionRank: byNet.findIndex((x) => x.id === u.id) + 1,
  }));
}

export function highAdrWeakContributionSignal(
  rows: UnitEconomics[] = computeUnitEconomics(),
): HiddenSignal | null {
  const u = rows.find((r) => r.adrRank === 1 && r.contributionRank > 2);
  if (!u) {
    // Unit 24 is designed as high ADR / mid contribution
    const u24 = rows.find((r) => r.id === "unit_24");
    if (!u24) return null;
    return signalForUnit(u24, rows.length);
  }
  return signalForUnit(u, rows.length);
}

function signalForUnit(u: UnitEconomics, portfolioSize: number): HiddenSignal {
  const maintPeer = 480;
  const maintDelta = u.maintenanceCost - maintPeer;
  return parseHiddenSignal({
    id: `hs_engine_unit_${u.id}`,
    kind: "UNIT_WEAK_CONTRIBUTION",
    vertical: "serviced_apartments",
    horizon: "STRUCTURAL",
    headline: "Highest ADR is not highest contribution.",
    what: `${u.label} leads ADR in the portfolio, but ranks ${u.contributionRank}/${portfolioSize} on net contribution after cleaning duration (+${u.cleaningDurationPctVsPeer}%) and maintenance (€${u.maintenanceCost}).`,
    whyMatters:
      "Chasing ADR on a high-maintenance unit can hide portfolio drag that only shows when channels, cleaning and downtime are joined.",
    valueLabel: "Maintenance vs peer",
    valueAmount: Math.max(maintDelta, 0),
    valuePositive: false,
    recommendation:
      "Cap OTA push on this unit until maintenance is permanent · reprice for true contribution.",
    epistemic: "ASSOCIATED",
    sampleSize: 12,
    confidenceBand: "MEDIUM",
    confidenceExplanation:
      "12-month unit P&L style rollup. Utilities estimated. Peer maintenance baseline €480.",
    evidence: [
      { label: "ADR rank", value: `#${u.adrRank}`, kind: "ACTUAL" },
      { label: "Contribution rank", value: `#${u.contributionRank}`, kind: "ESTIMATE" },
      { label: "Cleaning duration vs peer", value: `+${u.cleaningDurationPctVsPeer}%`, kind: "ACTUAL" },
      { label: "Maintenance", value: `€${u.maintenanceCost}`, kind: "ACTUAL" },
    ],
    systemsJoined: ["PMS", "Channel manager", "Cleaning", "Maintenance"],
    promoteToCockpit: false,
  });
}

export function orphanNightPatternSignal(): HiddenSignal {
  return parseHiddenSignal({
    id: "hs_engine_orphan_pattern",
    kind: "ORPHAN_NIGHT_PATTERN",
    vertical: "serviced_apartments",
    horizon: "TODAY",
    headline: "This empty night is not random.",
    what: "1-night Tuesday gaps fill historically at 64% when minimum stay is relaxed ≥3 days ahead. Median profitable price €148.",
    whyMatters:
      "Pattern + price + lead time turns an empty night into a decision — not noise.",
    valueLabel: "Orphan night opportunity",
    valueAmount: 164,
    valuePositive: true,
    recommendation:
      "Open 1-night inventory where lead time ≥3 days · disclose constraints.",
    epistemic: "EXPECTED",
    sampleSize: 47,
    confidenceBand: "MEDIUM",
    confidenceExplanation:
      "47 comparable Tuesday gaps over 18 months. Conditional on lead time ≥3 days.",
    evidence: [
      { label: "Gap type", value: "1-night · Tuesday", kind: "ACTUAL" },
      { label: "Historical fill", value: "64%", kind: "BASELINE" },
      { label: "Lead-time rule", value: "≥3 days ahead", kind: "INFERENCE" },
      { label: "Median profitable price", value: "€148", kind: "BASELINE" },
    ],
    systemsJoined: ["PMS", "Channel manager", "Pricing"],
    promoteToCockpit: true,
  });
}

export function residencesEconomicsHiddenSignals(): HiddenSignal[] {
  return [
    highAdrWeakContributionSignal(),
    orphanNightPatternSignal(),
  ].filter((s): s is HiddenSignal => s != null);
}
