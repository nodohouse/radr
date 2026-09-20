import { describe, expect, it } from "vitest";
import { formatMoney, formatEuro } from "@/lib/radr/money";
import { formatCurrency } from "@/lib/radr/currency";
import {
  resolveServicePhase,
  demoServicePhaseAt,
} from "@/lib/radr/servicePhase";
import { composeBerlinPreShiftBrief } from "@/lib/radr/preShift";
import { composeWalkInForecast } from "@/lib/radr/forecast/walkInForecast";
import { composeAreaDemandIndex } from "@/lib/radr/forecast/areaDemand";
import { translateWeatherToOperations } from "@/lib/radr/preShift/weatherImpact";
import { demoFootfallProvider } from "@/lib/radr/ports/footfall";
import { computeForecastErrors } from "@/lib/radr/learning/forecastLearning";

describe("formatMoney", () => {
  it("always shows cents for European locale", () => {
    expect(formatEuro(9480)).toBe("€9.480,00");
    expect(formatEuro(730)).toBe("€730,00");
    expect(formatMoney({ amount: 6295, currency: "USD", locale: "en-US" })).toBe(
      "$6,295.00",
    );
  });

  it("formatCurrency defaults to cents, not silent compact", () => {
    expect(formatCurrency(1020, "EUR", { locale: "de-DE" })).toBe("€1.020,00");
  });
});

describe("service phase", () => {
  it("maps clock to PRE / LIVE / CLOSING / POST", () => {
    const period = {
      startTime: "2026-08-19T17:00:00+02:00",
      endTime: "2026-08-19T23:00:00+02:00",
      label: "Dinner",
      type: "DINNER",
    };
    expect(resolveServicePhase("2026-08-19T16:15:00+02:00", period).phase).toBe(
      "PRE_SHIFT",
    );
    expect(resolveServicePhase("2026-08-19T17:30:00+02:00", period).phase).toBe(
      "LIVE",
    );
    expect(resolveServicePhase("2026-08-19T22:15:00+02:00", period).phase).toBe(
      "CLOSING",
    );
    expect(resolveServicePhase("2026-08-19T23:15:00+02:00", period).phase).toBe(
      "POST_SHIFT",
    );
  });

  it("demo clock at 17:30 is LIVE", () => {
    expect(demoServicePhaseAt().phase).toBe("LIVE");
  });
});

describe("pre-shift brief", () => {
  it("composes coherent Berlin dinner forecast", () => {
    const b = composeBerlinPreShiftBrief();
    expect(b.expectedCovers).toBe(142);
    expect(b.expectedWalkIns).toBe(26);
    expect(b.projectedNetSales).toBe(9480);
    expect(b.expectedContribution).toBe(5860);
    expect(b.fixBeforeOpen).toHaveLength(2);
    expect(b.weatherImpact?.decision).toBe("OPEN");
    expect(b.areaDemand.level).toBe("HIGH");
    expect(b.opportunities[0]!.netExpectedContribution).toBeGreaterThan(0);
  });

  it("surfaces terrace × weather correlation for Berlin", () => {
    const b = composeBerlinPreShiftBrief();
    expect(b.hasTerrace).toBe(true);
    expect(b.weatherImpact?.incrementalRevenue).toBe(812);
    expect(b.weatherImpact?.netExpectedContribution).toBe(400);
    expect(b.terraceCorrelation?.sampleSize).toBe(19);
    expect(b.terraceCorrelation?.nights.length).toBeGreaterThan(2);
    expect(b.terraceCorrelation?.rainCounterfactual?.revenueAtRisk).toBe(340);
  });
});

describe("outdoor capability", () => {
  it("treats Berlin terrace as weather-elastic", async () => {
    const { outdoorCapabilityForVenue } = await import(
      "@/lib/radr/preShift/terraceCapability"
    );
    const ber = outdoorCapabilityForVenue("loc_ber");
    expect(ber.hasOutdoor).toBe(true);
    expect(ber.weatherElastic).toBe(true);
    expect(ber.seats).toBe(18);
  });

  it("does not treat indoor mezzanine as terrace weather", async () => {
    const { outdoorCapabilityForVenue } = await import(
      "@/lib/radr/preShift/terraceCapability"
    );
    const nyc = outdoorCapabilityForVenue("loc_nyc");
    expect(nyc.weatherElastic).toBe(false);
  });
});

describe("walk-in + area demand + weather", () => {
  it("walk-in forecast returns a range, not false precision", () => {
    const w = composeWalkInForecast({
      locationId: "loc_ber",
      serviceLabel: "Dinner",
      baseWalkIns: 14,
      weatherLift: 5,
      eventLift: 6,
      bookingPaceLift: 2,
      transitDrag: -1,
      avgPartySize: 2.1,
      spendPerCover: 66,
      peakWindow: { start: "19:30", end: "20:30" },
      footfall: demoFootfallProvider.estimateAreaFootfall({
        locationId: "loc_ber",
        asOf: "2026-08-19T16:15:00+02:00",
        serviceStartIso: "2026-08-19T17:00:00+02:00",
        serviceEndIso: "2026-08-19T23:00:00+02:00",
      }),
    });
    expect(w.expected).toBe(26);
    expect(w.rangeLow).toBeLessThan(w.expected);
    expect(w.rangeHigh).toBeGreaterThan(w.expected);
    expect(w.drivers.length).toBeGreaterThan(2);
  });

  it("area demand exposes explainable drivers", () => {
    const a = composeAreaDemandIndex("loc_ber", [
      { label: "Concert nearby", deltaPct: 9 },
      { label: "Dry terrace weather", deltaPct: 5 },
    ]);
    expect(a.level).toBe("HIGH");
    expect(a.drivers).toHaveLength(2);
  });

  it("translates weather into terrace economics", () => {
    const impact = translateWeatherToOperations({
      hasTerrace: true,
      weather: {
        temperatureC: 22,
        conditionLabel: "Dry",
        precipitationProbabilityPct: 10,
        windKph: 8,
      },
      dryWarmLiftCovers: 14,
      spendPerCover: 58,
      contributionRate: 0.618,
      fohCostToCapture: 96,
    });
    expect(impact?.decision).toBe("OPEN");
    expect(impact?.recommendation).toMatch(/terrace/i);
    expect(impact?.netExpectedContribution).toBeGreaterThan(0);
  });
});

describe("forecast learning", () => {
  it("computes predicted vs actual errors", () => {
    const errors = computeForecastErrors(
      { walkIns: 26, covers: 142, revenue: 9480, terraceLiftCovers: 14, staffingGapCovers: 14 },
      { walkIns: 29, covers: 149, revenue: 9740, terraceLiftCovers: 16, staffingGapCovers: 14 },
    );
    expect(errors.walkIns).toBe(3);
    expect(errors.covers).toBe(7);
    expect(errors.revenue).toBe(260);
  });
});
