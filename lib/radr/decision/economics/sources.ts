/**
 * Sourced industry evidence — never unsourced on the website.
 */

export type EvidenceClaim = {
  id: string;
  claim: string;
  value: string;
  population: string;
  region: string;
  period: string;
  sourceName: string;
  sourceUrl?: string;
  publicationDate: string;
  footnote: string;
};

export const FSR_LABOR_2024: EvidenceClaim = {
  id: "nra_fsr_labor_2024",
  claim: "Full-service restaurant median labor cost as % of sales",
  value: "36.5%",
  population: "U.S. full-service restaurants",
  region: "United States",
  period: "2024",
  sourceName: "National Restaurant Association, 2025 Operations Data Abstract",
  publicationDate: "2025",
  footnote:
    "U.S. full-service restaurants · 2024 data · National Restaurant Association, 2025 Operations Data Abstract. Not a global benchmark.",
};

export const FSR_FOOD_2024: EvidenceClaim = {
  id: "nra_fsr_food_2024",
  claim: "Full-service restaurant median food/non-alcohol beverage cost as % of sales",
  value: "32.0%",
  population: "U.S. full-service restaurants",
  region: "United States",
  period: "2024",
  sourceName: "National Restaurant Association, 2025 Operations Data Abstract",
  publicationDate: "2025",
  footnote:
    "U.S. full-service restaurants · 2024 data · National Restaurant Association, 2025 Operations Data Abstract. Not a global benchmark.",
};

export const FSR_PRETAX_2024: EvidenceClaim = {
  id: "nra_fsr_pretax_2024",
  claim: "Full-service restaurant median pre-tax income as % of sales",
  value: "2.8%",
  population: "U.S. full-service restaurants",
  region: "United States",
  period: "2024",
  sourceName: "National Restaurant Association, 2025 Operations Data Abstract",
  publicationDate: "2025",
  footnote:
    "U.S. full-service restaurants · 2024 data · National Restaurant Association, 2025 Operations Data Abstract. Not a global benchmark.",
};

export type IllustrativeEconomics = {
  label: string;
  annualRevenueEuro: number;
  marginPct: number;
  profitEuro: number;
  onePointEuro: number;
  disclaimer: string;
};

/** Clearly labeled illustrative — not a universal claim. */
export function illustrativeOnePoint(): IllustrativeEconomics {
  return {
    label: "Illustrative economics",
    annualRevenueEuro: 10_000_000,
    marginPct: 3,
    profitEuro: 300_000,
    onePointEuro: 100_000,
    disclaimer:
      "Illustrative only. Shows why a 1-point operating improvement can matter when margins are thin — not a promise of results.",
  };
}

/** Expense pressure — use as context, not doom. */
export const FSR_EXPENSE_RISE_2019_2026: EvidenceClaim = {
  id: "nra_expense_rise_2019_2026",
  claim: "Estimated total restaurant expense increase 2019–2026",
  value: "+36%",
  population: "U.S. restaurants (NRA estimate)",
  region: "United States",
  period: "2019–2026",
  sourceName: "National Restaurant Association",
  publicationDate: "2025",
  footnote:
    "National Restaurant Association estimate · total restaurant expenses +36% between 2019 and 2026. Contextual — not a venue-specific forecast.",
};

export const FSR_NOT_PROFITABLE_2025: EvidenceClaim = {
  id: "nra_not_profitable_2025",
  claim: "Share of operators reporting not profitable in 2025",
  value: "42%",
  population: "U.S. restaurant operators (NRA)",
  region: "United States",
  period: "2025",
  sourceName: "National Restaurant Association",
  publicationDate: "2025",
  footnote:
    "National Restaurant Association · 42% of operators said they were not profitable in 2025. Sample-based — not universal.",
};

/** Hotel distribution — labeled sample, not universal. */
export const DEDGE_DIRECT_COST_2025: EvidenceClaim = {
  id: "dedge_direct_cost_2025",
  claim: "Average direct distribution cost for D-EDGE customers",
  value: "~3.5%",
  population: "D-EDGE hotel customers",
  region: "D-EDGE reported sample",
  period: "2025",
  sourceName: "D-EDGE 2025 Hotel Direct Distribution Report",
  publicationDate: "2025",
  footnote:
    "D-EDGE reports average direct distribution cost around 3.5% for its customers vs typical OTA commissions of 12–28%. Sample-specific — not a universal hotel benchmark.",
};

export const INDUSTRY_CLAIMS = [
  FSR_LABOR_2024,
  FSR_FOOD_2024,
  FSR_PRETAX_2024,
  FSR_EXPENSE_RISE_2019_2026,
  FSR_NOT_PROFITABLE_2025,
  DEDGE_DIRECT_COST_2025,
] as const;
