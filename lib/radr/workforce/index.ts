/**
 * Workforce / demand-led scheduling — Decision-native model.
 * Integrate before replacing (Planday / Deputy / 7shifts / …).
 */

export type WorkforceDemand = {
  locationId: string;
  intervalStart: string;
  intervalEnd: string;
  role: string;
  requiredHeadcount: number;
  requiredHours: number;
  confidence: number;
  demandDrivers: string[];
};

export type RoleGap = {
  role: string;
  required: number;
  scheduled: number;
  gap: number;
};

export type ScheduleFuture = {
  id: string;
  label: string;
  additionalLaborEuro: number;
  contributionProtectedEuro: number;
  revenueExposedEuro: number;
  serviceRisk: "LOW" | "MEDIUM" | "HIGH";
  note: string;
  recommended?: boolean;
};

export type ScheduleGap = {
  locationId: string;
  intervalLabel: string;
  requiredFte: number;
  scheduledFte: number;
  gapFte: number;
  roleGaps: RoleGap[];
  futures: ScheduleFuture[];
  recommendedId: string;
  gmTranslation: string;
  cfoTranslation: string;
};

/** Berlin 19:00–20:00 staffing gap — Decision-native schedule Futures. */
export function berlinPeakStaffingGap(): ScheduleGap {
  return {
    locationId: "loc_berlin_mitte",
    intervalLabel: "19:00–20:00",
    requiredFte: 12.4,
    scheduledFte: 10,
    gapFte: -2.4,
    roleGaps: [
      { role: "FOH", required: 4, scheduled: 4, gap: 0 },
      { role: "Runner", required: 2, scheduled: 1, gap: -1 },
      { role: "Bar", required: 2, scheduled: 2, gap: 0 },
      { role: "Line", required: 3.4, scheduled: 2, gap: -1.4 },
      { role: "Expo", required: 1, scheduled: 1, gap: 0 },
    ],
    futures: [
      {
        id: "keep",
        label: "Keep schedule",
        additionalLaborEuro: 0,
        contributionProtectedEuro: 0,
        revenueExposedEuro: 1240,
        serviceRisk: "HIGH",
        note: "€0 labor · €1,240 revenue exposed",
      },
      {
        id: "add",
        label: "Add runner + line cook",
        additionalLaborEuro: 74,
        contributionProtectedEuro: 810,
        revenueExposedEuro: 0,
        serviceRisk: "LOW",
        note: "Labor −€74 · contribution protected +€810",
        recommended: true,
      },
      {
        id: "move",
        label: "Move prep cook",
        additionalLaborEuro: 0,
        contributionProtectedEuro: 510,
        revenueExposedEuro: 0,
        serviceRisk: "MEDIUM",
        note: "€0 labor · +€510 protected · prep +18m risk",
      },
    ],
    recommendedId: "add",
    gmTranslation:
      "Spend €74 to protect about €810. Add a runner and line cook 19:00–21:00.",
    cfoTranslation:
      "Labor +€74 · expected contribution protected +€810 · service risk LOW vs HIGH baseline.",
  };
}

export const WORKFORCE_CONNECTORS = [
  { id: "planday", label: "Planday", status: "planned" as const },
  { id: "deputy", label: "Deputy", status: "planned" as const },
  { id: "7shifts", label: "7shifts", status: "planned" as const },
  { id: "personio", label: "Personio", status: "planned" as const },
  { id: "homebase", label: "Homebase", status: "planned" as const },
] as const;
