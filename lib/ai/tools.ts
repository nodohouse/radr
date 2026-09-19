/**
 * Ask RADR tools - production-shaped interfaces, demo adapters today.
 * Tenant/scope checks happen before any data is read.
 */

import { getOperatingSnapshot } from "@/lib/radr/operatingSnapshot";
import { findingsForScope, valueAtRiskFromFindings } from "@/lib/radr/findings";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { buildLocationTonightPulse } from "@/lib/radr/servicePulse";
import { DAILY_PULSE, TONIGHT } from "@/lib/radr/operatingPulse";
import { getLocation } from "@/lib/radr/operatingHero";
import { locationLabel } from "@/lib/product/demo/dashboard";
import type { DashPeriod, LocationScope } from "@/lib/product/demo/dashboard";
import { getVerifiedValueFromScenarios, getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import { demoDataHealth } from "@/lib/platform/dataHealth";
import {
  canAccessLocation,
  hasPermission,
  type AccessContext,
  type RadrRole,
} from "@/lib/platform/rbac";
import type { ButlerContext, ButlerRole } from "@/lib/radr/butler/types";
import { dashPeriodOf, type ResolvedContext } from "./context";
import { calculateStaffingRisk } from "@/lib/radr/findingIntelligence";
import {
  BERLIN_TONIGHT_FORECAST,
  BERLIN_TONIGHT_OPS,
} from "@/lib/radr/venueProfiles";
import { BERLIN_TERRACE_WEATHER, berlinTerraceOpportunity } from "@/lib/radr/weather/calc";
import {
  berlinTomorrowWeather,
  berlinWeatherLocation,
  demoWeatherProvider,
} from "@/lib/radr/weather/demoProvider";
import { composeBerlinPreShiftBrief } from "@/lib/radr/preShift";
import {
  composeGuestTonightBrief,
  formatGuestTiers,
} from "@/lib/radr/guest";
import {
  composeHospitalityTonightBrief,
  menuGuidanceForAllergy,
} from "@/lib/radr/hospitality";
import type { RoleView } from "@/lib/product/types";
import { attentionNowFindings, currentExposureFromFindings } from "@/lib/radr/valueSemantics";
import { composeBerlinChannelEconomics } from "@/lib/radr/channels";
import { composeBerlinActiveRevenue, materialRecoveries } from "@/lib/radr/activeRevenue";

function roleViewFromButler(role: ButlerRole): RoleView {
  switch (role) {
    case "group_cfo":
      return "cfo";
    case "regional_manager":
      return "regional";
    default:
      return "gm";
  }
}

export type ToolAuth = {
  organizationId: string;
  userId: string;
  role: ButlerRole;
  allowedLocationIds: string[] | "all";
};

export type ToolResult = {
  tool: string;
  ok: boolean;
  data?: unknown;
  error?: string;
  unavailable?: boolean;
};

function toAccess(auth: ToolAuth): AccessContext {
  const roleMap: Record<ButlerRole, RadrRole> = {
    location_manager: "GENERAL_MANAGER",
    regional_manager: "REGIONAL_MANAGER",
    group_cfo: "CFO",
  };
  return {
    userId: auth.userId,
    organizationId: auth.organizationId,
    role: roleMap[auth.role],
    locationIds: auth.allowedLocationIds,
  };
}

function assertLoc(auth: ToolAuth, locationId: string): string | null {
  if (locationId === "all") {
    if (auth.allowedLocationIds !== "all") {
      return "Permission denied for group scope.";
    }
    return null;
  }
  if (!canAccessLocation(toAccess(auth), locationId)) {
    return `Permission denied for ${locationId}.`;
  }
  if (!hasPermission(toAccess(auth), "butler:read")) {
    return "Permission denied for Ask RADR read.";
  }
  return null;
}

function euro(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function locName(id: string): string {
  try {
    return getLocation(id)?.venueName ?? locationLabel(id as LocationScope);
  } catch {
    return locationLabel(id as LocationScope);
  }
}

export type LaborRequirementLocation = {
  needAdditionalStaff: boolean;
  locationId: string;
  location: string;
  timeframe: { start: string; end: string };
  role: "FOH" | "BOH";
  additionalHeadcount: number;
  scheduledCapacity: number;
  expectedDemand: number;
  demandGap: number;
  expectedAdditionalCost: number;
  estimatedRevenueProtected: number;
  confidence: number;
  drivers: string[];
  demandCurve: number[];
  capacityCurve: number[];
  times: string[];
};

function berlinLaborRequirement(): LaborRequirementLocation {
  const rs = BERLIN_RESERVATION_SUMMARY;
  const calc = calculateStaffingRisk({
    expectedCovers: BERLIN_TONIGHT_FORECAST.covers,
    capacityCovers: BERLIN_TONIGHT_OPS.peakServiceCapacity,
    revenueAtRisk: 290,
    contributionRate: 105 / 290,
    fohCost: 68,
    bookingLiftPct: BERLIN_TONIGHT_OPS.bookingPaceVsComparable,
    walkInLiftPct: 4.1,
    localEvent: false,
  });
  return {
    needAdditionalStaff: true,
    locationId: "loc_ber",
    location: "Berlin Mitte",
    timeframe: { start: "19:15", end: "20:30" },
    role: "FOH",
    additionalHeadcount: 1,
    scheduledCapacity: rs.peakCapacity,
    expectedDemand: rs.peakCovers,
    demandGap: rs.peakGap,
    expectedAdditionalCost: calc.actionCost,
    estimatedRevenueProtected: calc.expectedRevenueProtected,
    confidence: 0.91,
    drivers: [
      `${rs.bookedCovers} booked covers`,
      `${rs.forecastCovers} forecast covers`,
      `${rs.groupBookingCount} large parties`,
      "Peak arrival concentration 19:00-20:30",
    ],
    times: ["19:00", "19:30", "20:00", "20:30"],
    demandCurve: [0.55, 0.92, 1, 0.7],
    capacityCurve: [0.55, 0.72, 0.72, 0.65],
  };
}

function buildLaborRequirement(locationId: string, ctx: ResolvedContext) {
  const berlin = berlinLaborRequirement();
  const needsStaff: LaborRequirementLocation[] = [];

  if (locationId === "all" || locationId === "loc_ber" || ctx.isGroup) {
    needsStaff.push(berlin);
  } else if (locationId === "loc_ber") {
    needsStaff.push(berlin);
  }

  // Demo: only Berlin has an open staffing gap. Other scopes report adequate.
  if (locationId !== "all" && locationId !== "loc_ber" && !ctx.isGroup) {
    return {
      scope: locationId,
      scopeLabel: locName(locationId),
      period: "Tonight",
      needAdditionalStaff: false,
      locationsNeedingStaff: [] as LaborRequirementLocation[],
      adequatelyStaffedNote: `${locName(locationId)} is adequately staffed for tonight in the demo dataset.`,
      primary: null as LaborRequirementLocation | null,
    };
  }

  return {
    scope: locationId === "all" || ctx.isGroup ? "all" : "loc_ber",
    scopeLabel:
      locationId === "all" || ctx.isGroup ? "All locations" : "Berlin Mitte",
    period: "Tonight",
    needAdditionalStaff: needsStaff.length > 0,
    locationsNeedingStaff: needsStaff,
    adequatelyStaffedNote:
      locationId === "all" || ctx.isGroup
        ? "All other locations are adequately staffed tonight."
        : null,
    primary: needsStaff[0] ?? null,
  };
}

export const ASK_TOOL_DEFS = [
  {
    name: "get_location_summary",
    description: "Operating summary for one location: margin, revenue, attention, narrative.",
  },
  {
    name: "get_group_summary",
    description: "Group-level attention and trading snapshot.",
  },
  {
    name: "get_revenue",
    description: "Revenue and forecast variance for a location/period.",
  },
  {
    name: "get_margin",
    description: "Operating margin and plan variance. Does not invent causal drivers.",
  },
  {
    name: "get_channel_economics",
    description:
      "Channel revenue quality: dine-in vs delivery vs takeaway, provider contribution, pause recommendation. Not profit.",
  },
  {
    name: "get_active_revenue",
    description:
      "Active revenue: cancellation recovery opportunities and ranked guest hospitality suggestions. Not a sales quota.",
  },
  {
    name: "get_reservations",
    description: "Tonight reservations, covers, occupancy, peak window.",
  },
  {
    name: "get_waitlist",
    description: "Waitlist guests and parties when the reservation source provides waitlist.",
  },
  {
    name: "get_cancellations",
    description: "Late cancellations, booking value, recoverable exposure.",
  },
  {
    name: "get_service_status",
    description: "Service pulse: peak pressure, groups, floor notes.",
  },
  {
    name: "get_labor_status",
    description: "Labor % and peak staffing risk.",
  },
  {
    name: "get_labor_requirement",
    description:
      "Deterministic staffing requirement: demand vs capacity, headcount, cost, revenue protected. Prefer for call-in / understaffed questions.",
  },
  {
    name: "get_supplier_variances",
    description: "Open supplier invoice vs contract variances.",
  },
  {
    name: "get_findings",
    description: "Open material findings with euro impact.",
  },
  {
    name: "get_verified_value",
    description: "RADR verified value ledger for the period.",
  },
  {
    name: "get_forecast",
    description: "Near-term forecast covers and revenue expectation.",
  },
  {
    name: "get_weather",
    description:
      "Deterministic weather forecast for a location. Not an insight until connected to demand, labor, or money.",
  },
  {
    name: "get_guest_value",
    description:
      "Tonight guest value: returning revenue, high-value returners, service notes, menu affinity. Role-aware; aggregates for finance roles.",
  },
  {
    name: "get_hospitality",
    description:
      "Tonight hospitality: occasions, seating requirements, allergy/dietary safety. Never invents allergen safety. Role-aware.",
  },
  {
    name: "compare_locations",
    description: "Deterministic margin/labor comparison between two locations.",
  },
  {
    name: "get_data_freshness",
    description: "Source health and last sync ages.",
  },
] as const;

export type AskToolName = (typeof ASK_TOOL_DEFS)[number]["name"];

export function executeAskTool(
  name: AskToolName,
  auth: ToolAuth,
  ctx: ResolvedContext,
  args: Record<string, string | undefined> = {},
): ToolResult {
  const locationId = args.locationId ?? ctx.locationId;
  const period = dashPeriodOf(ctx.period) as DashPeriod;

  const deny = assertLoc(auth, locationId === "all" ? "all" : locationId);
  if (deny) return { tool: name, ok: false, error: deny };

  try {
    switch (name) {
      case "get_location_summary": {
        const snap = getOperatingSnapshot(locationId as LocationScope, period);
        return {
          tool: name,
          ok: true,
          data: {
            locationId: snap.scope,
            locationName: snap.locationName,
            narrative: snap.narrative,
            attention: snap.attention,
            trading: snap.trading,
            tonight: snap.tonight,
          },
        };
      }
      case "get_group_summary": {
        const snap = getOperatingSnapshot("all", period);
        return {
          tool: name,
          ok: true,
          data: {
            locationName: snap.locationName,
            narrative: snap.narrative,
            attention: snap.attention,
            trading: snap.trading,
          },
        };
      }
      case "get_revenue": {
        if (locationId === "loc_ber" || locationId === "all") {
          return {
            tool: name,
            ok: true,
            data: {
              locationId: "loc_ber",
              locationName: "Berlin Mitte",
              period: ctx.periodLabel,
              revenue: DAILY_PULSE.revenue,
              revenueDisplay: DAILY_PULSE.revenueDisplay,
              vsForecastPct: DAILY_PULSE.revenueVsForecast,
              covers: DAILY_PULSE.covers,
              avgSpend: DAILY_PULSE.revenuePerCover,
              drivers: DAILY_PULSE.why,
            },
          };
        }
        const snap = getOperatingSnapshot(locationId as LocationScope, period);
        return {
          tool: name,
          ok: true,
          data: {
            locationId,
            locationName: snap.locationName,
            period: ctx.periodLabel,
            revenue: snap.trading.revenue,
            revenueDisplay: snap.trading.revenueDisplay,
            vsForecastPct: snap.trading.revenueVsForecast,
          },
        };
      }
      case "get_margin": {
        if (locationId === "loc_ber" || (locationId === "all" && ctx.period === "yesterday")) {
          return {
            tool: name,
            ok: true,
            data: {
              locationId: "loc_ber",
              locationName: "Berlin Mitte",
              period: ctx.periodLabel,
              marginPct: DAILY_PULSE.margin,
              vsPlanPts: DAILY_PULSE.marginVsPlanPts,
              direction: DAILY_PULSE.marginVsPlanPts >= 0 ? "above_plan" : "below_plan",
              laborPct: DAILY_PULSE.laborPct,
              laborVsPlanPts: DAILY_PULSE.laborVsPlanPts,
              note:
                DAILY_PULSE.marginVsPlanPts >= 0
                  ? "Margin was not down vs plan for this period."
                  : "Margin finished below plan.",
              // Only evidence-backed composition notes - no invented causal split
              evidenceNotes: [
                `Labor cost ${DAILY_PULSE.laborPct}% of revenue (${DAILY_PULSE.laborVsPlanPts >= 0 ? "+" : ""}${DAILY_PULSE.laborVsPlanPts} pts vs plan).`,
                `Revenue ${DAILY_PULSE.revenueVsForecast >= 0 ? "+" : ""}${DAILY_PULSE.revenueVsForecast}% vs forecast.`,
                `Covers ${DAILY_PULSE.why.covers >= 0 ? "+" : ""}${DAILY_PULSE.why.covers}% · avg spend ${DAILY_PULSE.why.avgSpend >= 0 ? "+" : ""}${DAILY_PULSE.why.avgSpend}%.`,
              ],
            },
          };
        }
        const snap = getOperatingSnapshot(locationId as LocationScope, period);
        return {
          tool: name,
          ok: true,
          data: {
            locationId,
            locationName: snap.locationName,
            period: ctx.periodLabel,
            marginPct: snap.trading.margin,
            vsPlanPts: snap.trading.marginVsPlan,
            direction: snap.trading.marginVsPlan >= 0 ? "above_plan" : "below_plan",
            laborPct: snap.trading.laborPct,
            laborVsPlanPts: snap.trading.laborVsPlan,
            evidenceNotes: [
              `Labor ${snap.trading.laborPct.toFixed(1)}% of revenue.`,
              `Revenue vs forecast ${snap.trading.revenueVsForecast >= 0 ? "+" : ""}${snap.trading.revenueVsForecast.toFixed(1)}%.`,
            ],
          },
        };
      }
      case "get_reservations": {
        if (locationId !== "loc_ber" && locationId !== "all") {
          return {
            tool: name,
            ok: false,
            unavailable: true,
            error: `Reservation detail for ${locName(locationId)} is not connected in this demo environment.`,
          };
        }
        const rs = BERLIN_RESERVATION_SUMMARY;
        const pulse = buildLocationTonightPulse();
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            locationName: "Berlin Mitte",
            period: "Tonight",
            reservations: rs.reservationCount,
            bookedCovers: rs.bookedCovers,
            forecastCovers: rs.forecastCovers,
            expectedOccupancyPct: TONIGHT.expectedOccupancy,
            peakWindow: rs.peakWindowLabel,
            groupBookings: rs.groupBookingCount,
            groupCovers: rs.groupCovers,
            expectedRevenue: TONIGHT.expectedRevenue,
            peakPressure: pulse.peakService,
          },
        };
      }
      case "get_waitlist": {
        if (locationId !== "loc_ber" && locationId !== "all") {
          return {
            tool: name,
            ok: false,
            unavailable: true,
            error: `Your current reservation source does not provide waitlist data for ${locName(locationId)}.`,
          };
        }
        const pulse = buildLocationTonightPulse();
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            guests: pulse.waitlistGuests,
            parties: pulse.waitlistParties,
            top: pulse.waitlistDetail.slice(0, 3),
            highestOpportunity: pulse.waitlistOpportunity,
            potentialEuro: pulse.waitlistPotentialEuro,
          },
        };
      }
      case "get_cancellations": {
        if (locationId !== "loc_ber" && locationId !== "all") {
          return {
            tool: name,
            ok: false,
            unavailable: true,
            error: `Cancellation recovery detail is not available for ${locName(locationId)} in demo.`,
          };
        }
        const scenario = getCancellationRecoveryScenario();
        const verified = scenario.verification?.verifiedValue ?? 0;
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            cancelledReservations: 1,
            cancelledCovers: scenario.reservation.partySize,
            bookingValue: scenario.reservation.expectedBookingValueMajor,
            potentialRecovery: scenario.potentialRecoverableMajor,
            observedPos: scenario.pos.observedRevenueMajor,
            verifiedValue: verified,
            expectedNaturalRecovery: 0,
            currentlyAtRisk: 0,
            status: scenario.actionStatus,
            note:
              scenario.actionStatus === "VERIFIED"
                ? `Table 14 late cancellation is verified. Potential recovery was €${scenario.potentialRecoverableMajor}. Observed POS €${scenario.pos.observedRevenueMajor}. RADR claims verified value €${verified} only.`
                : "Late cancellation released Table 14. Waitlist match available.",
            recoverableStill: scenario.actionStatus !== "VERIFIED",
            tableHint: `Table ${scenario.reservation.tableId} · ${scenario.reservation.serviceTime}`,
          },
        };
      }
      case "get_service_status": {
        if (locationId !== "loc_ber" && locationId !== "all") {
          return {
            tool: name,
            ok: true,
            data: {
              locationId,
              locationName: locName(locationId),
              note: "Detailed floor pulse is demo-connected for Berlin Mitte only.",
            },
          };
        }
        const pulse = buildLocationTonightPulse();
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            peakService: pulse.peakService,
            groupBookings: pulse.groupBookings,
            groupPotentialEuro: pulse.groupPotentialEuro,
            serviceCurve: pulse.serviceCurve,
            openTablesHint: "Floor map shows covers by section; open Service Map for 19:00-21:00 availability.",
          },
        };
      }
      case "get_labor_status": {
        const findings = findingsForScope(locationId === "all" ? "loc_ber" : locationId);
        const labor = findings.find((f) => f.territory === "LABOR");
        const snap = getOperatingSnapshot(
          (locationId === "all" ? "loc_ber" : locationId) as LocationScope,
          period,
        );
        return {
          tool: name,
          ok: true,
          data: {
            locationId: locationId === "all" ? "loc_ber" : locationId,
            locationName: snap.locationName,
            laborPct: snap.trading.laborPct,
            laborVsPlanPts: snap.trading.laborVsPlan,
            understaffed: Boolean(labor),
            finding: labor
              ? {
                  id: labor.id,
                  title: labor.title,
                  impactEuro: labor.financialImpact.primaryValue,
                  recommendation: labor.recommendation.title,
                  timeframe: labor.timeframe.label,
                }
              : null,
            peakHint: TONIGHT.signal,
          },
        };
      }
      case "get_labor_requirement": {
        return {
          tool: name,
          ok: true,
          data: buildLaborRequirement(locationId, ctx),
        };
      }
      case "get_supplier_variances": {
        const findings = findingsForScope(locationId === "all" ? "loc_ber" : locationId);
        const buy = findings.filter((f) => f.territory === "BUY");
        if (!buy.length) {
          return {
            tool: name,
            ok: true,
            data: {
              locationId,
              variances: [],
              note: "No open supplier variances in this scope.",
            },
          };
        }
        return {
          tool: name,
          ok: true,
          data: {
            locationId: buy[0]!.locationId,
            variances: buy.map((f) => ({
              id: f.id,
              title: f.title,
              euro: f.financialImpact.primaryValue,
              label: f.financialImpact.primaryLabel,
              drivers: f.drivers,
            })),
            largest: buy.sort(
              (a, b) => b.financialImpact.primaryValue - a.financialImpact.primaryValue,
            )[0]!.financialImpact.primaryValue,
          },
        };
      }
      case "get_findings": {
        const scope = locationId === "all" ? "loc_ber" : locationId;
        const findings = findingsForScope(scope);
        const shown = attentionNowFindings(findings);
        const atRisk = currentExposureFromFindings(findings);
        return {
          tool: name,
          ok: true,
          data: {
            locationId: scope,
            open: shown.length,
            atRiskEuro: atRisk,
            items: shown.slice(0, 5).map((f) => ({
              id: f.id,
              territory: f.territory,
              title: f.title,
              urgency: f.urgency,
              euro: f.financialImpact.primaryValue,
              label: f.financialImpact.primaryLabel,
              recommendation: f.recommendation.title,
            })),
          },
        };
      }
      case "get_verified_value": {
        const scenario = getVerifiedValueFromScenarios();
        return {
          tool: name,
          ok: true,
          data: {
            /** Scenario SoT only - never the illustrative catalog YTD. */
            monthVerifiedCatalog: scenario.verified,
            scenarioVerified: scenario.verified,
            scenarioIdentified: scenario.identified,
            byTerritory: scenario.byTerritory,
            currency: "EUR",
            attribution: scenario.attribution,
            sources: scenario.sources,
            demo: true,
          },
        };
      }
      case "get_forecast": {
        if (locationId !== "loc_ber" && locationId !== "all") {
          const snap = getOperatingSnapshot(locationId as LocationScope, period);
          return {
            tool: name,
            ok: true,
            data: {
              locationId,
              locationName: snap.locationName,
              revenue: snap.trading.revenue,
              vsForecastPct: snap.trading.revenueVsForecast,
            },
          };
        }
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            locationName: "Berlin Mitte",
            tonightExpectedRevenue: TONIGHT.expectedRevenue,
            tonightExpectedOccupancy: TONIGHT.expectedOccupancy,
            bookedCovers: TONIGHT.bookedCovers,
            vsComparablePct: TONIGHT.vsComparable,
            signal: TONIGHT.signal,
            tomorrow: {
              date: berlinTomorrowWeather().date,
              weather: berlinTomorrowWeather(),
              terraceOpportunity: berlinTerraceOpportunity(),
            },
          },
        };
      }
      case "get_weather": {
        const loc = berlinWeatherLocation();
        const wx = demoWeatherProvider.getCurrentConditions(loc);
        const daily = demoWeatherProvider.getDailyForecast(loc, 2);
        const hourly = demoWeatherProvider.getHourlyForecast(loc, 8);
        const opp = berlinTerraceOpportunity();
        const tomorrow = berlinTomorrowWeather();
        const pre = composeBerlinPreShiftBrief();
        const tonight = pre.weatherImpact;
        return {
          tool: name,
          ok: true,
          data: {
            locationId: loc.locationId,
            hasTerrace: pre.hasTerrace,
            current: wx,
            daily,
            hourly,
            tomorrow,
            terrace: {
              ...opp,
              scheduledCapacity: BERLIN_TERRACE_WEATHER.scheduledTerraceCapacity,
              expectedDemand: BERLIN_TERRACE_WEATHER.expectedDemandCovers,
              fohPlan: BERLIN_TERRACE_WEATHER.fohPlanCovers,
              contributionPerCover: BERLIN_TERRACE_WEATHER.contributionPerCover,
              comparableLiftPct: BERLIN_TERRACE_WEATHER.comparableWarmDryLiftPct,
              comparableSampleSize: BERLIN_TERRACE_WEATHER.comparableSampleSize,
              laborCostToCapture: opp.laborCostToCapture,
              netOpportunity: opp.netOpportunity,
              doNothingValue: opp.doNothingValue,
              grossOpportunity: opp.grossOpportunity,
              estimatedImpact: opp.grossOpportunity,
              calc: opp.calc,
              netCalc: opp.netCalc,
              doNothingCalc: opp.doNothingCalc,
              peak: `${BERLIN_TERRACE_WEATHER.lunchPeakStart}-${BERLIN_TERRACE_WEATHER.lunchPeakEnd}`,
              findingId: "fnd_weather_terrace_loc_ber",
              service: "lunch_tomorrow",
            },
            terraceTonight: tonight
              ? {
                  service: "dinner_tonight",
                  decision: tonight.decision,
                  temperatureC: tonight.weather.temperatureC,
                  conditionLabel: tonight.weather.conditionLabel,
                  precipitationProbabilityPct:
                    tonight.weather.precipitationProbabilityPct,
                  windKph: tonight.weather.windKph,
                  additionalExpectedCovers: tonight.historicalTerraceLiftCovers,
                  incrementalRevenue: tonight.incrementalRevenue,
                  grossOpportunity: tonight.incrementalContribution,
                  laborCostToCapture: tonight.fohCostToCapture,
                  netOpportunity: tonight.netExpectedContribution,
                  recommendation: tonight.recommendation,
                  comparableLiftPct: tonight.comparableLiftPct,
                  comparableSampleSize: tonight.comparableSampleSize,
                  outdoorLabel: tonight.outdoorLabel,
                  outdoorSeats: tonight.outdoorSeats,
                  confidence: tonight.confidence,
                  calc: `+${tonight.historicalTerraceLiftCovers} covers → ${tonight.incrementalRevenue} revenue → ${tonight.incrementalContribution} contribution − ${tonight.fohCostToCapture} FOH = ${tonight.netExpectedContribution} net`,
                  netCalc: `${tonight.incrementalContribution} contribution − ${tonight.fohCostToCapture} FOH = ${tonight.netExpectedContribution} net`,
                  rainCounterfactual: pre.terraceCorrelation?.rainCounterfactual ?? null,
                }
              : null,
          },
        };
      }
      case "get_guest_value": {
        const roleView = roleViewFromButler(auth.role);
        const brief = composeGuestTonightBrief(roleView);
        const top = brief.spotlight?.[0] ?? null;
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            locationName: "Berlin Mitte",
            aggregatesOnly: brief.access.aggregatesOnly,
            reservedCovers: brief.reservedCovers,
            returningGuests: brief.returningGuests,
            firstTimeGuests: brief.firstTimeGuests,
            expectedReturningRevenue: brief.expectedReturningRevenue,
            expectedFirstTimeRevenue: brief.expectedFirstTimeRevenue,
            returningRevenueSharePct: brief.returningRevenueSharePct,
            highValueReturning: brief.highValueReturning,
            lapsedReturning90d: brief.lapsedReturning90d,
            serviceNotesNeedingAttention: brief.serviceNotesNeedingAttention,
            bluefinAffinityGuests: brief.bluefinAffinityGuests,
            bluefinAffinityExpectedValue: brief.bluefinAffinityExpectedValue,
            topRelationship: top
              ? {
                  name: top.identity.displayName,
                  tiers: formatGuestTiers(top.value.tiers),
                  why: top.value.why,
                  tonight: `${top.booking.tableLabel ?? "Table TBD"} · ${top.booking.time} · party of ${top.booking.partySize}`,
                  expectedTonight: `${euro(top.value.expectedSpendTonightLow)}-${euro(top.value.expectedSpendTonightHigh)}`,
                  serviceNote: top.notes[0]?.note ?? null,
                  identityConfidence: top.identity.identityConfidence,
                }
              : null,
            attentionNotes: brief.attentionNotes,
            spotlight: brief.spotlight?.slice(0, 5).map((g) => ({
              name: g.identity.displayName,
              tiers: formatGuestTiers(g.value.tiers),
              lifetimeSpend: g.value.lifetimeSpend,
              visits: g.value.visitCount,
              tonight: `${g.booking.time} · party of ${g.booking.partySize}`,
              topDishes: g.value.topDishes,
            })),
          },
        };
      }
      case "get_hospitality": {
        const roleView = roleViewFromButler(auth.role);
        const brief = composeHospitalityTonightBrief(roleView);
        const allergies = brief.allergies ?? [];
        return {
          tool: name,
          ok: true,
          data: {
            locationId: "loc_ber",
            locationName: "Berlin Mitte",
            aggregatesOnly: brief.access.aggregatesOnly,
            canSeeAllergyDetail: brief.access.canSeeAllergyDetail,
            reservedCovers: brief.reservedCovers,
            returningGuests: brief.returningGuests,
            birthdays: brief.birthdays,
            engagements: brief.engagements,
            anniversaries: brief.anniversaries,
            terraceRequests: brief.terraceRequests,
            quietTableRequests: brief.quietTableRequests,
            privateDiningSetups: brief.privateDiningSetups,
            dietaryNotes: brief.dietaryNotes,
            allergyAlerts: brief.allergyAlerts,
            kitchenCritical: brief.kitchenCritical,
            safety: brief.safety,
            needsAction: brief.needsAction,
            allergies: allergies.map((a) => ({
              id: a.id,
              tableLabel: a.tableLabel,
              time: a.time,
              allergenLabel: a.allergenLabel,
              severityExplicit: a.severityExplicit,
              needsClarification: a.needsClarification,
              clarificationHint: a.clarificationHint,
              fohInstruction: a.fohInstruction,
              kitchenInstruction: brief.access.canSeeKitchenSafety
                ? a.kitchenInstruction
                : null,
              kitchenAcknowledged: a.kitchenAcknowledged,
              fohAcknowledged: a.fohAcknowledged,
              menuContainsCount: a.menuContainsCount,
              menuCrossContactCount: a.menuCrossContactCount,
              originalText: a.source.originalText,
              sourceSystem: a.source.system,
              menuGuidance: brief.access.canSeeAllergyDetail
                ? menuGuidanceForAllergy(a).map((l) => ({
                    name: l.name,
                    containment: l.containment,
                    detail: l.detail,
                  }))
                : [],
            })),
            moments: brief.moments?.slice(0, 8).map((m) => ({
              tableLabel: m.tableLabel,
              time: m.time,
              label: m.label,
            })),
            requirements: brief.requirements?.slice(0, 8).map((r) => ({
              tableLabel: r.tableLabel,
              time: r.time,
              label: r.label,
            })),
          },
        };
      }
      case "compare_locations": {
        const aId = args.a ?? locationId;
        const bId = args.b ?? ctx.compareWith;
        if (!bId) {
          return { tool: name, ok: false, error: "Need two locations to compare." };
        }
        const denyB = assertLoc(auth, bId);
        if (denyB) return { tool: name, ok: false, error: denyB };
        const a = getOperatingSnapshot(aId as LocationScope, period);
        const b = getOperatingSnapshot(bId as LocationScope, period);
        const marginDelta = a.trading.margin - b.trading.margin;
        const laborDelta = b.trading.laborPct - a.trading.laborPct;
        return {
          tool: name,
          ok: true,
          data: {
            a: {
              id: a.scope,
              name: a.locationName,
              margin: a.trading.margin,
              laborPct: a.trading.laborPct,
              revenue: a.trading.revenue,
            },
            b: {
              id: b.scope,
              name: b.locationName,
              margin: b.trading.margin,
              laborPct: b.trading.laborPct,
              revenue: b.trading.revenue,
            },
            marginDeltaPts: Number(marginDelta.toFixed(1)),
            laborDeltaPts: Number(laborDelta.toFixed(1)),
            ahead: marginDelta >= 0 ? a.locationName : b.locationName,
            explainedBy: [
              {
                label: "Labor efficiency",
                pts: Number((laborDelta * 0.5).toFixed(1)),
                note: "Supported by labor % gap between locations.",
              },
              {
                label: "Margin gap",
                pts: Number(Math.abs(marginDelta).toFixed(1)),
                note: "Observed operating margin difference.",
              },
            ],
          },
        };
      }
      case "get_data_freshness": {
        const report = demoDataHealth(locationId === "all" ? "loc_ber" : locationId);
        return {
          tool: name,
          ok: true,
          data: {
            overall: report.overall,
            sources: report.sources.map((s) => ({
              label: s.label,
              status: s.status,
              ageMinutes: s.ageMinutes,
            })),
            userMessage: report.userMessage,
            demo: true,
          },
        };
      }
      case "get_channel_economics": {
        const ch = composeBerlinChannelEconomics();
        const delivery = ch.channels.find((c) => c.kind === "delivery");
        const dineIn = ch.channels.find((c) => c.kind === "dine_in");
        const bestProvider = [...(delivery?.providers ?? [])].sort(
          (a, b) => b.contribution - a.contribution,
        )[0];
        return {
          tool: name,
          ok: true,
          data: {
            locationName: ch.locationName,
            netSales: ch.netSales,
            channels: ch.channels.map((c) => ({
              kind: c.kind,
              label: c.label,
              netSales: c.netSales,
              revenueSharePct: c.revenueSharePct,
              contribution: c.contribution,
              contributionSharePct: c.contributionSharePct,
              contributionMarginPct: c.contributionMarginPct,
            })),
            deliveryMarginPct: ch.comparison.deliveryMarginPct,
            dineInMarginPct: ch.comparison.dineInMarginPct,
            marginDifferencePts: ch.comparison.differencePts,
            marginWhy: ch.comparison.why,
            topProvider: bestProvider
              ? {
                  name: bestProvider.providerName,
                  contribution: bestProvider.contribution,
                  marginPct: bestProvider.contributionMarginPct,
                }
              : null,
            pause: {
              window: ch.pauseDecision.windowLabel,
              netExpectedValue: ch.pauseDecision.netExpectedValue,
              recommendation: ch.pauseDecision.recommendation,
              requiresApproval: ch.pauseDecision.requiresApproval,
            },
            commissionVariances: ch.reconciliation
              .filter((r) => r.status === "variance" || r.status === "mismatch")
              .map((r) => ({
                provider: r.providerName,
                amount: r.amount,
                label: r.amountLabel,
              })),
            note: "Live contribution by channel - not accounting profit. Orders deduped POS↔aggregator.",
          },
        };
      }
      case "get_active_revenue": {
        const ar = composeBerlinActiveRevenue();
        const open = materialRecoveries(ar);
        return {
          tool: name,
          ok: true,
          data: {
            locationName: ar.locationName,
            tonightPotential: ar.rollup.tonightPotential,
            recoveryCount: ar.rollup.recoveryCount,
            guestOpportunityCount: ar.rollup.guestOpportunityCount,
            recoveries: open.map((r) => ({
              table: r.tableLabel,
              time: r.reservationTime,
              partySize: r.partySize,
              atRisk: r.remainingRevenueExposure,
              strategy: r.recommendedStrategy,
              trigger: r.trigger,
              waitlistMatches: r.waitlistMatches.length,
              bestAcceptance: r.waitlistMatches[0]?.acceptanceProbabilityPct,
              why: r.strategyWhy[0],
              requiresApproval: r.requiresApproval,
              socialEscalation: r.plan.socialEscalation,
              planHeadline: r.plan.headline,
            })),
            guestOpportunities: ar.guestOpportunities.map((g) => ({
              table: g.tableLabel,
              suggestion: g.suggestion,
              occasion: g.occasionLabel,
              timing: g.timingLabel,
              contribution: g.expectedIncrementalContribution,
              why: g.reason[0],
            })),
            month: {
              cancellationRecovered: ar.rollup.monthCancellationRecovered,
              recoveryRatePct: ar.rollup.monthRecoveryRatePct,
              guestVerified: ar.rollup.monthGuestVerified,
              combinedVerified: ar.rollup.monthCombinedVerified,
            },
            socialRoi: {
              posts: ar.socialRoi.posts,
              tablesFilled: ar.socialRoi.tablesFilled,
              recoveryRatePct: ar.socialRoi.recoveryRatePct,
              verifiedRecoveredRevenue: ar.socialRoi.verifiedRecoveredRevenue,
              topChannel: ar.socialRoi.topChannel,
              topTemplate: ar.socialRoi.topTemplate,
            },
            templates: ar.templates.map((t) => ({
              name: t.name,
              fillRatePct: t.fillRatePct,
              favorite: t.favorite,
            })),
            note: "Waitlist first. Social requires approval. Grace periods are policy-configured.",
          },
        };
      }
      default:
        return { tool: name, ok: false, error: `Unknown tool ${name}` };
    }
  } catch (e) {
    return {
      tool: name,
      ok: false,
      error: e instanceof Error ? e.message : "Tool failed",
    };
  }
}

export function authFromButlerContext(ctx: ButlerContext): ToolAuth {
  return {
    organizationId: ctx.organizationId ?? "org_northstar",
    userId: ctx.userId ?? "butler_demo",
    role: ctx.role,
    allowedLocationIds: ctx.allowedLocationIds,
  };
}

export { euro, locName, valueAtRiskFromFindings };
