/**
 * In-memory intervention outcome history.
 * Structures for future learning - does not run an ML update.
 */

import {
  buildRetainedOutcome,
  type InterventionOutcomeRecord,
} from "@/lib/radr/loop";

const g = globalThis as typeof globalThis & {
  __radrOutcomeHistory?: Map<string, InterventionOutcomeRecord>;
};

function store(): Map<string, InterventionOutcomeRecord> {
  if (!g.__radrOutcomeHistory) g.__radrOutcomeHistory = new Map();
  return g.__radrOutcomeHistory;
}

export function retainInterventionOutcome(
  record: InterventionOutcomeRecord,
): InterventionOutcomeRecord {
  store().set(record.findingId, record);
  return record;
}

export function getInterventionOutcome(
  findingId: string,
): InterventionOutcomeRecord | null {
  return store().get(findingId) ?? null;
}

export function listInterventionOutcomes(): InterventionOutcomeRecord[] {
  return [...store().values()];
}

export function retainCancellationRecoveryOutcome(input: {
  findingId: string;
  organizationId: string;
  locationId: string;
  expectedValueMajor: number;
  observedValueMajor: number;
  verifiedValueMajor: number;
  now?: string;
}): InterventionOutcomeRecord {
  const record = buildRetainedOutcome({
    id: `outcome_${input.findingId}`,
    findingId: input.findingId,
    organizationId: input.organizationId,
    locationId: input.locationId,
    territory: "RECOVER",
    contextSummary: "Late cancellation · waitlist recovery",
    predictionSummary: `Potential recovery ${input.expectedValueMajor}`,
    expectedValueMajor: input.expectedValueMajor,
    currency: "EUR",
    recommendedActionSummary: "Offer waitlist replacement",
    approvedActionSummary: "Waitlist offer approved",
    actualActionSummary: "Replacement seated and served",
    observedValueMajor: input.observedValueMajor,
    verifiedValueMajor: input.verifiedValueMajor,
    now: input.now,
  });
  return retainInterventionOutcome(record);
}
