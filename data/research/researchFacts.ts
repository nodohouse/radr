/**
 * Canonical research facts for public RADR surfaces.
 * Evidence before claim — never invent industry statistics.
 * Every numeric claim on marketing pages must resolve through this repository.
 */

export type ResearchFact = {
  id: string;
  metric: string;
  statement: string;
  publisher: string;
  report: string;
  publicationDate: string;
  geography: string;
  population: string;
  methodologyNote: string;
  sourceUrl: string;
  /** Short UI label under the number */
  displayLabel: string;
  /** Grouping for /research */
  category:
    | "restaurants"
    | "hotels"
    | "european_hospitality"
    | "finance_ap"
    | "food_waste";
  lastVerifiedAt: string;
};

export const RESEARCH_FACTS = {
  otelierManualReporting2026: {
    id: "otelier-manual-reporting-2026",
    metric: "91%",
    statement:
      "of surveyed hotel owners/operators still rely on some level of manual reporting.",
    publisher: "Otelier",
    report: "2026 Hotel Operations Index",
    publicationDate: "2026-01",
    geography: "Multi-market survey",
    population: "Surveyed hotel owners & operators",
    methodologyNote:
      "Survey of hotel owners/operators. Not a global hospitality census.",
    sourceUrl:
      "https://resources.otelier.io/whitepapers/the-2026-hotel-operations-index-progress-pressure-and-the-path-forward",
    displayLabel: "Manual reporting remains",
    category: "hotels",
    lastVerifiedAt: "2026-09-19",
  },
  otelierIntegratedStack2026: {
    id: "otelier-integrated-stack-2026",
    metric: "11%",
    statement: "report a fully integrated technology stack.",
    publisher: "Otelier",
    report: "2026 Hotel Operations Index",
    publicationDate: "2026-01",
    geography: "Multi-market survey",
    population: "Surveyed hotel owners & operators",
    methodologyNote: "Same Otelier 2026 Hotel Operations Index survey sample.",
    sourceUrl:
      "https://resources.otelier.io/whitepapers/the-2026-hotel-operations-index-progress-pressure-and-the-path-forward",
    displayLabel: "Fully integrated stack",
    category: "hotels",
    lastVerifiedAt: "2026-09-19",
  },
  otelierReconcileHours2026: {
    id: "otelier-reconcile-hours-2026",
    metric: "27%",
    statement:
      "spend more than 11 hours per week consolidating or reconciling data.",
    publisher: "Otelier",
    report: "2026 Hotel Operations Index",
    publicationDate: "2026-01",
    geography: "Multi-market survey",
    population: "Surveyed hotel owners & operators",
    methodologyNote: "Same Otelier 2026 Hotel Operations Index survey sample.",
    sourceUrl:
      "https://resources.otelier.io/whitepapers/the-2026-hotel-operations-index-progress-pressure-and-the-path-forward",
    displayLabel: "11+ hours/week reconciling data",
    category: "hotels",
    lastVerifiedAt: "2026-09-19",
  },
  otelierDataConfidence2026: {
    id: "otelier-data-confidence-2026",
    metric: "15%",
    statement:
      "are very confident in the accuracy and timeliness of their operational data.",
    publisher: "Otelier",
    report: "2026 Hotel Operations Index",
    publicationDate: "2026-01",
    geography: "Multi-market survey",
    population: "Surveyed hotel owners & operators",
    methodologyNote: "Same Otelier 2026 Hotel Operations Index survey sample.",
    sourceUrl:
      "https://resources.otelier.io/whitepapers/the-2026-hotel-operations-index-progress-pressure-and-the-path-forward",
    displayLabel: "Very confident in operational data",
    category: "hotels",
    lastVerifiedAt: "2026-09-19",
  },
  ahlaHtngInterop2026: {
    id: "ahla-htng-interop-2026",
    metric: "—",
    statement:
      "Lack of standardization and interoperability across hotel systems creates costly complexity, slows innovation, and burdens teams with non-value-added work — including heterogeneous systems, proprietary APIs, and inconsistent integration patterns.",
    publisher: "AHLA / HTNG",
    report: "Top Industry Technology Challenges",
    publicationDate: "2026-03",
    geography: "U.S. / industry association framing",
    population: "Hotel technology industry challenge framing",
    methodologyNote:
      "Qualitative industry challenge framing. No percentage invented.",
    sourceUrl: "https://www.ahla.com/",
    displayLabel: "Interoperability remains an industry challenge",
    category: "hotels",
    lastVerifiedAt: "2026-09-19",
  },
  nraExpenseRise2019to2026: {
    id: "nra-expense-rise-2019-2026",
    metric: "~36%",
    statement:
      "Total expenses for an average restaurant increased approximately 36% between 2019 and 2026.",
    publisher: "National Restaurant Association",
    report: "2026 State of the Restaurant Industry / 2026 economic research",
    publicationDate: "2026",
    geography: "United States",
    population: "U.S. restaurant industry · average restaurant expenses",
    methodologyNote: "NRA industry research. U.S. only.",
    sourceUrl:
      "https://www.restaurant.org/education-and-resources/resource-library/report-sales-to-hit-$1-55t-in-2026-despite-challenging-business-environment/",
    displayLabel: "Restaurant expenses vs 2019",
    category: "restaurants",
    lastVerifiedAt: "2026-09-19",
  },
  nraFoodLaborShare2026: {
    id: "nra-food-labor-share-2026",
    metric: "~33¢",
    statement:
      "Food and labor: approximately 33 cents each of every sales dollar.",
    publisher: "National Restaurant Association",
    report: "2026 State of the Restaurant Industry / 2026 economic research",
    publicationDate: "2026",
    geography: "United States",
    population: "U.S. restaurant industry cost structure",
    methodologyNote: "NRA industry research. U.S. only.",
    sourceUrl:
      "https://www.restaurant.org/education-and-resources/resource-library/report-sales-to-hit-$1-55t-in-2026-despite-challenging-business-environment/",
    displayLabel: "Food / labor per sales dollar",
    category: "restaurants",
    lastVerifiedAt: "2026-09-19",
  },
  nraNotProfitableH12026: {
    id: "nra-not-profitable-h1-2026",
    metric: "33%",
    statement:
      "of surveyed restaurant operators said their restaurant was not profitable during H1 2026.",
    publisher: "National Restaurant Association",
    report: "2026 State of the Restaurant Industry / 2026 economic research",
    publicationDate: "2026",
    geography: "United States",
    population: "Surveyed U.S. restaurant operators · H1 2026",
    methodologyNote:
      "Operator survey. Not “33% of restaurants worldwide.” Prefer over older 2025 profitability figures when citing current conditions.",
    sourceUrl:
      "https://www.restaurant.org/education-and-resources/resource-library/report-sales-to-hit-$1-55t-in-2026-despite-challenging-business-environment/",
    displayLabel: "Not profitable · H1 2026",
    category: "restaurants",
    lastVerifiedAt: "2026-09-19",
  },
  hotrecWorkforceGap2026: {
    id: "hotrec-workforce-gap-2026",
    metric: "~10%",
    statement:
      "European hospitality is still missing around 10% of its workforce on average.",
    publisher: "HOTREC",
    report: "Skills and Labour Shortages — A Roadmap for Action",
    publicationDate: "2026-01",
    geography: "Europe",
    population:
      "European hospitality · ~10 million people · ~2 million businesses",
    methodologyNote:
      "HOTREC sector estimate. Distinct from Eurostat job vacancy rates.",
    sourceUrl: "https://www.hotrec.eu/",
    displayLabel: "Hospitality workforce gap",
    category: "european_hospitality",
    lastVerifiedAt: "2026-09-19",
  },
  eurostatVacancyQ12026: {
    id: "eurostat-vacancy-q1-2026",
    metric: "3.0%",
    statement:
      "EU job vacancy rate in accommodation and food service activities (3.2% euro area) — among sectors with higher reported vacancy rates.",
    publisher: "Eurostat",
    report: "Job vacancy statistics · Q1 2026",
    publicationDate: "2026-Q1",
    geography: "European Union / euro area",
    population: "Accommodation and food service activities (NACE)",
    methodologyNote:
      "Job vacancy rate ≠ HOTREC ~10% workforce missing. Do not mix concepts.",
    sourceUrl: "https://ec.europa.eu/eurostat/",
    displayLabel: "EU job vacancy rate · AFS",
    category: "european_hospitality",
    lastVerifiedAt: "2026-09-19",
  },
  unepFoodServiceWaste2022: {
    id: "unep-food-service-waste-2022",
    metric: "290Mt",
    statement:
      "Food service generated approximately 290 million tonnes of food waste globally in 2022.",
    publisher: "UN Environment Programme",
    report: "Food Waste Index Report 2024",
    publicationDate: "2024",
    geography: "Global",
    population: "Global food service · 2022",
    methodologyNote:
      "Food service sector aggregate. Not all restaurant waste. Use only for cost / yield / waste context.",
    sourceUrl: "https://www.unep.org/resources/publication/food-waste-index-report-2024",
    displayLabel: "Food service waste · 2022",
    category: "food_waste",
    lastVerifiedAt: "2026-09-19",
  },
  apqcManualInvoiceKeying2026: {
    id: "apqc-manual-invoice-keying-2026",
    metric: "60%",
    statement:
      "median share of supplier invoices manually keyed into the financial system.",
    publisher: "APQC",
    report: "Accounts payable process benchmark",
    publicationDate: "2026",
    geography: "Cross-industry",
    population: "469 companies · cross-industry APQC sample",
    methodologyNote:
      "CROSS-INDUSTRY. Never label as “60% of hospitality invoices.”",
    sourceUrl: "https://www.apqc.org/",
    displayLabel: "Invoices manually keyed · median",
    category: "finance_ap",
    lastVerifiedAt: "2026-09-19",
  },
} as const satisfies Record<string, ResearchFact>;

export type ResearchFactId = keyof typeof RESEARCH_FACTS;

export function researchFact(id: ResearchFactId): ResearchFact {
  return RESEARCH_FACTS[id];
}

/** Home evidence — three editorial proofs */
export const HOME_RESEARCH_FACTS: ResearchFactId[] = [
  "nraExpenseRise2019to2026",
  "otelierManualReporting2026",
  "otelierReconcileHours2026",
];

/** Why RADR — Why now strip */
export const WHY_NOW_RESEARCH: ResearchFactId[] = [
  "nraNotProfitableH12026",
  "otelierReconcileHours2026",
  "hotrecWorkforceGap2026",
];
