/**
 * Hotel room-type economics — ADR ≠ contribution.
 */

import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { parseHiddenSignal } from "@/lib/radr/domain/hiddenSignal";

export type RoomTypeEconomics = {
  id: string;
  label: string;
  occupancyPct: number;
  adr: number;
  revpar: number;
  roomRevenue: number;
  distributionCost: number;
  housekeepingMinutes: number;
  housekeepingCost: number;
  amenityCostPerStay: number;
  maintenanceDowntimeNights: number;
  ancillaryRevenue: number;
  /** Room revenue − distribution − HK − amenity − maint allocation + ancillary */
  netContribution: number;
  adrPremiumPct: number;
  netPremiumPct: number;
};

/** Canal House demo room-type economics (monthly illustrative). */
export const CANAL_HOUSE_ROOM_ECONOMICS: RoomTypeEconomics[] = [
  {
    id: "classic_queen",
    label: "Classic Queen",
    occupancyPct: 78,
    adr: 248,
    revpar: 193,
    roomRevenue: 42_160,
    distributionCost: 3_180,
    housekeepingMinutes: 28,
    housekeepingCost: 4_920,
    amenityCostPerStay: 9,
    maintenanceDowntimeNights: 2,
    ancillaryRevenue: 3_420,
    netContribution: 0,
    adrPremiumPct: 0,
    netPremiumPct: 0,
  },
  {
    id: "deluxe_king",
    label: "Deluxe King",
    occupancyPct: 81,
    adr: 292,
    revpar: 237,
    roomRevenue: 51_840,
    distributionCost: 4_960,
    housekeepingMinutes: 35,
    housekeepingCost: 6_180,
    amenityCostPerStay: 18,
    maintenanceDowntimeNights: 5,
    ancillaryRevenue: 5_120,
    netContribution: 0,
    adrPremiumPct: 18,
    netPremiumPct: 0,
  },
  {
    id: "canal_suite",
    label: "Canal Suite",
    occupancyPct: 72,
    adr: 410,
    revpar: 295,
    roomRevenue: 38_940,
    distributionCost: 5_840,
    housekeepingMinutes: 48,
    housekeepingCost: 5_640,
    amenityCostPerStay: 32,
    maintenanceDowntimeNights: 3,
    ancillaryRevenue: 8_260,
    netContribution: 0,
    adrPremiumPct: 65,
    netPremiumPct: 0,
  },
];

function netContribution(r: RoomTypeEconomics): number {
  const amenityTotal = Math.round(
    (r.roomRevenue / Math.max(r.adr, 1)) * r.amenityCostPerStay,
  );
  const maintAlloc = r.maintenanceDowntimeNights * r.adr * 0.65;
  return Math.round(
    r.roomRevenue -
      r.distributionCost -
      r.housekeepingCost -
      amenityTotal -
      maintAlloc +
      r.ancillaryRevenue,
  );
}

export function computeRoomTypeEconomics(
  rows: RoomTypeEconomics[] = CANAL_HOUSE_ROOM_ECONOMICS,
): RoomTypeEconomics[] {
  const computed = rows.map((r) => ({
    ...r,
    netContribution: netContribution(r),
  }));
  const base = computed.find((r) => r.id === "classic_queen");
  const baseNet = base?.netContribution ?? 1;
  return computed.map((r) => ({
    ...r,
    adrPremiumPct:
      base && base.adr > 0
        ? Math.round(((r.adr - base.adr) / base.adr) * 100)
        : r.adrPremiumPct,
    netPremiumPct: Math.round(((r.netContribution - baseNet) / baseNet) * 100),
  }));
}

export function occupancyVsEconomicsSignal(input?: {
  occupancyLiftPts?: number;
  otaMixLiftPts?: number;
  distributionCostEuro?: number;
  contributionChangePct?: number;
}): HiddenSignal {
  const occupancyLiftPts = input?.occupancyLiftPts ?? 6;
  const otaMixLiftPts = input?.otaMixLiftPts ?? 11;
  const distributionCostEuro = input?.distributionCostEuro ?? 8420;
  const contributionChangePct = input?.contributionChangePct ?? -2.1;

  return parseHiddenSignal({
    id: "hs_engine_hotel_occ_quality",
    kind: "OCCUPANCY_WEAK_ECONOMICS",
    vertical: "hotel",
    horizon: "THIS_MONTH",
    headline: "Occupancy is up. Economics are weaker.",
    what: `Occupancy +${occupancyLiftPts} pts. OTA mix +${otaMixLiftPts} pts. Distribution cost +€${distributionCostEuro.toLocaleString("en-IE")}. Contribution ${contributionChangePct}%.`,
    whyMatters:
      "Filling rooms through high-fee channels can raise occupancy while eroding contribution.",
    valueLabel: "Distribution cost swing",
    valueAmount: distributionCostEuro,
    valuePositive: false,
    recommendation:
      "Protect direct / corporate share on shoulder dates · review OTA promotions that fill without contribution.",
    epistemic: "ASSOCIATED",
    sampleSize: 28,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "PMS occupancy + channel fees + accounting contribution over 28 comparable nights.",
    evidence: [
      { label: "Occupancy vs prior", value: `+${occupancyLiftPts} pts`, kind: "ACTUAL" },
      { label: "OTA mix shift", value: `+${otaMixLiftPts} pts`, kind: "ACTUAL" },
      {
        label: "Distribution cost",
        value: `+€${distributionCostEuro.toLocaleString("en-IE")}`,
        kind: "ACTUAL",
      },
      { label: "Contribution", value: `${contributionChangePct}%`, kind: "ACTUAL" },
    ],
    systemsJoined: ["PMS", "Channel manager", "Accounting"],
    promoteToCockpit: false,
  });
}

export function deluxeNetPremiumSignal(
  rows: RoomTypeEconomics[] = computeRoomTypeEconomics(),
): HiddenSignal | null {
  const deluxe = rows.find((r) => r.id === "deluxe_king");
  if (!deluxe) return null;
  return parseHiddenSignal({
    id: "hs_engine_deluxe_net",
    kind: "ROOM_TYPE_HIDDEN_VALUE",
    vertical: "hotel",
    horizon: "STRUCTURAL",
    headline: "Deluxe ADR premium shrinks in contribution.",
    what: `${deluxe.label} ADR +${deluxe.adrPremiumPct}% vs Classic Queen, but net contribution advantage only +${deluxe.netPremiumPct}% after housekeeping, amenities and downtime.`,
    whyMatters:
      "Upsell strategy that chases ADR without net contribution can over-invest in rooms that look premium on the PMS.",
    valueLabel: "Net contribution premium",
    valueAmount: deluxe.netContribution,
    valuePositive: deluxe.netPremiumPct > 0,
    recommendation:
      "Price and upsell Deluxe on total-stay contribution — not ADR alone.",
    epistemic: "ASSOCIATED",
    sampleSize: 90,
    confidenceBand: "MEDIUM",
    confidenceExplanation:
      "Room revenue − distribution − HK − amenities − maintenance allocation + ancillary. HK minutes estimated.",
    evidence: [
      { label: "ADR premium", value: `+${deluxe.adrPremiumPct}%`, kind: "ACTUAL" },
      { label: "Net contribution premium", value: `+${deluxe.netPremiumPct}%`, kind: "ESTIMATE" },
      { label: "HK minutes", value: `${deluxe.housekeepingMinutes} vs 28`, kind: "ACTUAL" },
      { label: "Amenity / stay", value: `€${deluxe.amenityCostPerStay}`, kind: "ACTUAL" },
    ],
    systemsJoined: ["PMS", "Housekeeping", "Accounting", "Maintenance"],
    promoteToCockpit: false,
  });
}

export function hotelEconomicsHiddenSignals(): HiddenSignal[] {
  return [
    occupancyVsEconomicsSignal(),
    deluxeNetPremiumSignal(),
  ].filter((s): s is HiddenSignal => s != null);
}
