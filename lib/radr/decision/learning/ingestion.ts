/**
 * Ingestion maturity — progressive intelligence.
 * RADR works WITH / WITHOUT / BEFORE / AFTER sophisticated stacks.
 * One useful source → one useful decision.
 */

export const INGESTION_LEVELS = [
  "MANUAL_FILE",
  "CORE_SYSTEMS",
  "RICH_CONTEXT",
  "ENTERPRISE",
] as const;

export type IngestionLevel = (typeof INGESTION_LEVELS)[number];

export type IngestionSource = {
  id: string;
  label: string;
  level: IngestionLevel;
  connected: boolean;
  /** What connecting this improves */
  unlocks?: string;
};

export type IngestionProfile = {
  level: IngestionLevel;
  sources: IngestionSource[];
  firstValuePath: string;
  nextConnectAsk: string[];
};

export function ingestionLabel(level: IngestionLevel): string {
  switch (level) {
    case "MANUAL_FILE":
      return "Manual / file";
    case "CORE_SYSTEMS":
      return "Core systems";
    case "RICH_CONTEXT":
      return "Rich operating context";
    case "ENTERPRISE":
      return "Enterprise";
  }
}

export function deriveIngestionLevel(
  sources: IngestionSource[],
): IngestionLevel {
  const connected = sources.filter((s) => s.connected);
  if (connected.some((s) => s.level === "ENTERPRISE")) return "ENTERPRISE";
  if (connected.some((s) => s.level === "RICH_CONTEXT")) return "RICH_CONTEXT";
  if (connected.some((s) => s.level === "CORE_SYSTEMS")) return "CORE_SYSTEMS";
  return "MANUAL_FILE";
}

/** Demo: restaurant that started with files, then connected core. */
export function berlinIngestionProfile(): IngestionProfile {
  const sources: IngestionSource[] = [
    {
      id: "csv_reservations",
      label: "Reservations export",
      level: "MANUAL_FILE",
      connected: true,
      unlocks: "Demand pace vs comparable days",
    },
    {
      id: "csv_sales",
      label: "Sales history",
      level: "MANUAL_FILE",
      connected: true,
      unlocks: "Menu mix & contribution",
    },
    {
      id: "xlsx_labor",
      label: "Staff schedule",
      level: "MANUAL_FILE",
      connected: true,
      unlocks: "Staffing under demand pressure",
    },
    {
      id: "pos",
      label: "POS",
      level: "CORE_SYSTEMS",
      connected: false,
      unlocks: "Live demand confidence",
    },
    {
      id: "labor",
      label: "Labor system",
      level: "CORE_SYSTEMS",
      connected: false,
      unlocks: "Exact labor cost of interventions",
    },
    {
      id: "inventory",
      label: "Inventory",
      level: "CORE_SYSTEMS",
      connected: false,
      unlocks: "Menu stockout risk",
    },
    {
      id: "weather",
      label: "Weather",
      level: "RICH_CONTEXT",
      connected: true,
      unlocks: "Terrace / walk-in elasticity",
    },
  ];

  return {
    level: deriveIngestionLevel(sources),
    sources,
    firstValuePath:
      "Reservations + sales history + schedule → one staffing Decision for tomorrow’s dinner.",
    nextConnectAsk: [
      "Connect POS to improve live demand confidence.",
      "Connect labor to improve exact cost.",
      "Connect inventory to detect menu risk.",
    ],
  };
}
