/**
 * Learning unit — one closed Decision as a learning opportunity.
 */

export type LearningHierarchy = "LOCATION" | "GROUP" | "VERTICAL_BENCHMARK";

export type LearningUnit = {
  id: string;
  decisionId: string;
  locationId: string;
  hierarchy: LearningHierarchy;
  context: string;
  prediction: string;
  optionsSummary: string[];
  chosenAction: string;
  actualOutcome: string;
  error?: string;
  lesson: string;
  modelUpdate?: string;
  playbookUpdate?: string;
  dnaUpdate?: string;
  /** Location-specific outweighs generic when justified */
  locationEvidence?: string;
};

export type LearningMoment = {
  id: string;
  title: string;
  predicted: string;
  actual: string;
  update: string;
  subtle: true;
};

export function buildTunaLearningUnit(): LearningUnit {
  return {
    id: "learn_tuna_1842",
    decisionId: "dec_tuna_berlin",
    locationId: "loc_berlin_mitte",
    hierarchy: "LOCATION",
    context:
      "Peak dinner · covers >135 · tuna demand >30 · delivery shortfall",
    prediction: "Feature-swap conversion 64% · expected protected €1,640",
    optionsSummary: [
      "Do nothing (−€1,840)",
      "Supplier-first (€1,520)",
      "Feature-swap-first (€1,640)",
    ],
    chosenAction: "Feature Truffle Pasta first · supplier fallback",
    actualOutcome: "€1,590 protected · stockout avoided · guest impact 0",
    error: "Expected €1,640 · actual €1,590 (−€50 · −3.0%)",
    lesson: "Feature-swap-first outperformed supplier-first under these conditions.",
    modelUpdate: "Substitution conversion prior updated toward location evidence.",
    playbookUpdate: "Playbook v1 supplier-first → v2 feature-swap-first",
    dnaUpdate: "Berlin Mitte stockoutSensitivity reinforced on peak bestsellers.",
    locationEvidence:
      "At Berlin Mitte, under peak demand, Truffle Pasta retained 71% of demand across 14 comparable events.",
  };
}

export function buildTunaLearningMoment(): LearningMoment {
  return {
    id: "moment_sub_conv",
    title: "RADR learned something",
    predicted: "Substitution conversion 64%",
    actual: "71%",
    update: "Berlin Mitte substitution behavior updated",
    subtle: true,
  };
}
