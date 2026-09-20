/**
 * OperatingMemory — first-class compounding intelligence for a location.
 * DNA × Decision history × playbooks × outcomes × calibration.
 */

import type { OperatingDNAProfile } from "../dna";
import type { Playbook } from "../playbook";
import type { DecisionMemoryEntry } from "../memory";
import type { PatternEscalation, DecisionDebt } from "../pattern";
import type { KnowledgeSnapshot } from "./knowledge";
import {
  deriveKnowledgeLevel,
  knowledgeLabel,
  knowledgeSummary,
} from "./knowledge";
import type { IngestionProfile } from "./ingestion";
import { berlinIngestionProfile } from "./ingestion";
import type { LearningUnit, LearningMoment } from "./learningUnit";
import {
  buildTunaLearningUnit,
  buildTunaLearningMoment,
} from "./learningUnit";
import { buildTunaDecisionRecord } from "../demos/tuna";
import { buildRainFutures, RAIN_FUTURES_ACTUAL } from "../futures/rainDinner";

export type PlaybookEvolution = {
  id: string;
  title: string;
  v1: { sequence: string; n: number };
  v2: { sequence: string; n: number; avgProtectedLiftPct: number };
};

export type CompoundingStats = {
  signalsProcessed: number;
  decisions: number;
  verifiedOutcomes: number;
  learnedPlaybooks: number;
  recurringIssuesPrevented?: number;
};

export type PerformanceWindow = {
  label: string;
  verifiedValueEuro: number;
  forecastErrorPct: number;
  humanDecisionShare: number;
  recurringIssuesPrevented?: number;
};

export type OperatingMemory = {
  locationId: string;
  locationLabel: string;
  knowledge: KnowledgeSnapshot;
  ingestion: IngestionProfile;
  dna?: OperatingDNAProfile;
  decisionMemory: DecisionMemoryEntry[];
  playbooks: Playbook[];
  playbookEvolutions: PlaybookEvolution[];
  patterns: PatternEscalation[];
  debts: DecisionDebt[];
  learningUnits: LearningUnit[];
  recentMoments: LearningMoment[];
  stats: CompoundingStats;
  /** Executive flywheel windows — not a vanity dashboard */
  performance?: {
    first30: PerformanceWindow;
    last30: PerformanceWindow;
  };
  flywheelLine: string;
};

export function buildBerlinOperatingMemory(): OperatingMemory {
  const tuna = buildTunaDecisionRecord("LEARNED");
  const rain = buildRainFutures();
  const verifiedCount = 221;
  const decisionCount = 284;
  const playbookCount = 17;
  const forecastErrorPct = 6.8;
  const level = deriveKnowledgeLevel({
    verifiedDecisionCount: verifiedCount,
    decisionCount,
    playbookCount,
    forecastErrorPct,
    automationEligiblePlaybooks: 4,
  });

  return {
    locationId: "loc_berlin_mitte",
    locationLabel: "Berlin Mitte",
    knowledge: {
      level,
      label: knowledgeLabel(level),
      summary: knowledgeSummary(level),
      verifiedDecisionCount: verifiedCount,
      decisionCount,
      playbookCount,
      humanDecisionShare: 0.19,
      forecastErrorPct,
    },
    ingestion: berlinIngestionProfile(),
    dna: tuna.operatingDna,
    decisionMemory: tuna.memory ? [tuna.memory] : [],
    playbooks: tuna.playbook ? [tuna.playbook] : [],
    playbookEvolutions: [
      {
        id: "evo_tuna",
        title: "Tuna shortfall response",
        v1: { sequence: "Supplier first → substitute fallback", n: 5 },
        v2: {
          sequence: "Feature swap first → supplier fallback",
          n: 14,
          avgProtectedLiftPct: 12,
        },
      },
      {
        id: "evo_rain",
        title: "Rain / Thursday / Dinner",
        v1: { sequence: "Absorb indoors only", n: 4 },
        v2: {
          sequence: "Move FOH · feature substitute · keep delivery",
          n: rain.scenarios[0] ? 14 : 14,
          avgProtectedLiftPct: 9,
        },
      },
    ],
    patterns: tuna.pattern ? [tuna.pattern] : [],
    debts: tuna.debt ? [tuna.debt] : [],
    learningUnits: [buildTunaLearningUnit()],
    recentMoments: [
      buildTunaLearningMoment(),
      {
        id: "moment_rain",
        title: "RADR learned something",
        predicted: `Contribution ${RAIN_FUTURES_ACTUAL.simulatedEuro}`,
        actual: `${RAIN_FUTURES_ACTUAL.actualEuro}`,
        update: RAIN_FUTURES_ACTUAL.dnaUpdates[0]!,
        subtle: true,
      },
    ],
    stats: {
      signalsProcessed: 18420,
      decisions: decisionCount,
      verifiedOutcomes: verifiedCount,
      learnedPlaybooks: playbookCount,
      recurringIssuesPrevented: 17,
    },
    performance: {
      first30: {
        label: "First 30 days",
        verifiedValueEuro: 21420,
        forecastErrorPct: 14.2,
        humanDecisionShare: 0.38,
      },
      last30: {
        label: "Last 30 days",
        verifiedValueEuro: 48760,
        forecastErrorPct: 6.8,
        humanDecisionShare: 0.19,
        recurringIssuesPrevented: 17,
      },
    },
    flywheelLine:
      "More context → better predictions → better decisions → verified outcomes → trust → more learning.",
  };
}

/** First-value story: one useful source set → one useful Decision. */
export function firstValueDecisionExample() {
  return {
    sources: ["Reservations", "Sales history", "Staff schedule"],
    finding:
      "Tomorrow dinner demand is tracking +21% above comparable Tuesdays.",
    pattern:
      "Current staffing historically creates slower turns under similar demand.",
    recommendation: "Add one FOH 18:30–21:00.",
    expectedProtectedEuro: 186,
    nextConnects: [
      "Connect POS to improve live demand confidence.",
      "Connect labor to improve exact cost.",
      "Connect inventory to detect menu risk.",
    ],
  };
}
