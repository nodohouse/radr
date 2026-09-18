/**
 * Playbook — repeated successful decision pattern under trigger conditions.
 */

export type PlaybookScope = "LOCAL" | "GROUP" | "GLOBAL_TEMPLATE";

export type PlaybookStep = {
  order: number;
  action: string;
  detail?: string;
};

export type Playbook = {
  id: string;
  title: string;
  decisionType: string;
  triggerConditions: string[];
  recommendedSequence: PlaybookStep[];
  fallbackSequence?: PlaybookStep[];
  historicalSuccessRate: number;
  expectedValueEuro: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  locationScope: string;
  groupScope?: string;
  scope: PlaybookScope;
  requiredApprovalLevel: 0 | 1 | 2 | 3 | 4 | 5;
  automationEligibility: boolean;
  nEvents: number;
  locked?: boolean;
};
