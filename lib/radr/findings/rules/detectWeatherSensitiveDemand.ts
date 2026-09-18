import type { Finding } from "@/lib/radr/domain";
import type { OperatingContext } from "@/lib/radr/ports/operatingContext";
import { DEMO_TOMORROW_DATE, isoOnDemoDate } from "@/lib/radr/demoClock";
import { scoreFinding } from "../priority";
import {
  BERLIN_TERRACE_WEATHER,
  calculateTerraceWeatherOpportunity,
} from "@/lib/radr/weather/calc";
import { berlinTomorrowWeather } from "@/lib/radr/weather/demoProvider";

export const WEATHER_TERRACE_FINDING_ID = "fnd_weather_terrace_loc_ber";

export function detectWeatherSensitiveDemand(
  ctx: OperatingContext,
): Finding | null {
  const terrace = ctx.terrace;
  const weather = ctx.weatherTomorrow;
  if (!terrace || !weather) return null;
  if (weather.precipitationProbabilityPct > 25) return null;
  if (weather.highC < 24) return null;

  const opp = calculateTerraceWeatherOpportunity({
    scheduledTerraceCapacity: terrace.scheduledTerraceCapacity,
    comparableWarmDryLiftPct: terrace.comparableWarmDryLiftPct,
    expectedDemandCovers: terrace.expectedDemandCovers,
    fohPlanCovers: terrace.fohPlanCovers,
    contributionPerCover: terrace.contributionPerCover,
    fohCostToCapture:
      terrace.fohCostToCapture ?? BERLIN_TERRACE_WEATHER.fohCostToCapture,
    comparableSampleSize:
      terrace.comparableSampleSize ?? BERLIN_TERRACE_WEATHER.comparableSampleSize,
  });
  if (opp.grossOpportunity <= 0) return null;

  const wx = berlinTomorrowWeather();
  const now = isoOnDemoDate();
  const urgency = "WATCH" as const;
  const sample =
    terrace.comparableSampleSize ?? BERLIN_TERRACE_WEATHER.comparableSampleSize;
  const confidenceBand = sample >= 15 ? ("HIGH" as const) : ("MEDIUM" as const);
  const pace =
    terrace.reservationPaceLabel ?? BERLIN_TERRACE_WEATHER.reservationPaceLabel;

  return {
    id: WEATHER_TERRACE_FINDING_ID,
    organizationId: ctx.organizationId,
    locationId: ctx.locationId,
    locationName: ctx.locationName,
    territory: "SELL",
    category: "weather_sensitive_demand",
    subtype: "Terrace demand",
    title: "Terrace demand likely to exceed the Thursday lunch plan",
    summary:
      "Warm, dry conditions are expected during lunch. Comparable days show materially higher terrace demand than the current operating plan assumes.",
    explanation:
      "Weather is operating context, not a guarantee. RADR connected tomorrow's forecast to comparable warm and dry Thursdays at this location, then compared expected terrace demand with scheduled terrace and FOH capacity.",
    status: "OPEN",
    urgency,
    priorityScore: scoreFinding({
      urgency,
      primaryValue: opp.netOpportunity,
      confidenceBand,
      timeSensitive: true,
      actionable: true,
      recoverability: 0.45,
      operationalSeverity: 0.5,
    }),
    confidenceScore: confidenceBand === "HIGH" ? 78 : 62,
    confidenceBand,
    confidenceExplanation: `${sample} comparable warm, dry service periods · forecast dry and warm · reservation and labor feeds current · relationship is correlation, not certainty`,
    timeframe: {
      start: isoOnDemoDate(DEMO_TOMORROW_DATE, terrace.peakStart),
      end: isoOnDemoDate(DEMO_TOMORROW_DATE, terrace.peakEnd),
      label: `Thursday · ${terrace.lunchPeakStart}-${terrace.lunchPeakEnd}`,
    },
    financialImpact: {
      contributionAtRisk: opp.grossOpportunity,
      primaryValue: opp.grossOpportunity,
      primaryLabel: "Gross opportunity",
      currency: ctx.currency,
    },
    drivers: [
      {
        label: "Forecast",
        value: `${wx.highC}°C · Dry · ${wx.precipitationProbabilityPct}% precipitation · 12:00-16:00`,
      },
      {
        label: "Comparable warm dry Thursdays",
        value: `Terrace covers +${terrace.comparableWarmDryLiftPct}% · n=${sample}`,
      },
      {
        label: "Reservation pace",
        value: pace,
      },
      {
        label: "Scheduled terrace capacity",
        value: `${terrace.scheduledTerraceCapacity} covers`,
      },
      {
        label: "Expected terrace demand",
        value: `${terrace.expectedDemandCovers} covers`,
      },
      {
        label: "FOH plan supports",
        value: `${terrace.fohPlanCovers} covers`,
      },
      {
        label: "Gross opportunity",
        value: opp.calc,
      },
      {
        label: "Cost to capture",
        value: `€${opp.laborCostToCapture} additional FOH`,
      },
      {
        label: "Expected net opportunity",
        value: opp.netCalc,
      },
      {
        label: "If you do nothing",
        value: opp.doNothingCalc,
      },
    ],
    recommendation: {
      title: "Prepare full terrace capacity and add one FOH",
      description: `${terrace.peakStart}-${terrace.peakEnd} · confirm outdoor setup before service`,
      expectedCost: opp.laborCostToCapture,
      expectedBenefit: opp.grossOpportunity,
      expectedNetBenefit: opp.netOpportunity,
      expectedContributionProtected: opp.grossOpportunity,
    },
    evidence: [
      {
        id: "ev_wx",
        label: "Tomorrow forecast",
        value: `${wx.highC}°C · ${wx.summary} · ${wx.precipitationProbabilityPct}% rain · lunch 12:00-16:00`,
        sourceId: "weather",
      },
      {
        id: "ev_hist",
        label: "Comparable service periods",
        value: `${sample} warm dry Thursdays · terrace covers +${terrace.comparableWarmDryLiftPct}%`,
        sourceId: "pos_history",
      },
      {
        id: "ev_pace",
        label: "Current reservation pace",
        value: pace,
        sourceId: "bookings",
      },
      {
        id: "ev_plan",
        label: "Scheduled terrace capacity",
        value: String(terrace.scheduledTerraceCapacity),
        sourceId: "labor",
      },
      {
        id: "ev_demand",
        label: "Expected terrace demand",
        value: String(terrace.expectedDemandCovers),
        sourceId: "forecast",
      },
      {
        id: "ev_foh",
        label: "FOH plan capacity",
        value: String(terrace.fohPlanCovers),
        sourceId: "labor",
      },
      {
        id: "ev_calc",
        label: "Gross opportunity calculation",
        value: opp.calc,
        sourceId: "radr",
      },
      {
        id: "ev_net",
        label: "Net opportunity calculation",
        value: opp.netCalc,
        sourceId: "radr",
      },
      {
        id: "ev_nothing",
        label: "Do nothing estimate",
        value: opp.doNothingCalc,
        sourceId: "radr",
      },
    ],
    sourceIds: ["weather", "pos_history", "labor", "forecast", "bookings"],
    dedupeKey: `${ctx.locationId}:SELL:weather_terrace:${DEMO_TOMORROW_DATE}`,
    presentation: {
      kindLabel: "Terrace demand",
      headline: "Terrace demand likely exceeds the Thursday lunch plan.",
      recommendShort: `Full terrace +1 FOH ${terrace.peakStart}-${terrace.peakEnd}`,
      ctaLabel: "Review plan",
      financialNote: `Gross €${opp.grossOpportunity} contribution opportunity · €${opp.laborCostToCapture} to capture · €${opp.netOpportunity} expected net. Not verified value.`,
      primaryAction: {
        kind: "review",
        label: "Open finding",
        href: `/app/findings/${WEATHER_TERRACE_FINDING_ID}`,
      },
      secondaryHref: "/app/forecast",
      secondaryLabel: "Forecast",
      verificationStatus: "IDENTIFIED",
      verificationMethod:
        "After service, compare actual terrace covers and contribution with this estimate. Only observed incremental contribution becomes verified value.",
      dataSources: [
        ...ctx.dataFreshness,
        {
          key: "weather",
          label: "Weather forecast",
          lastSyncLabel: "18m ago",
          ageMinutes: 18,
        },
      ],
    },
    createdAt: now,
    updatedAt: now,
  };
}
