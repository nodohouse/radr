/**
 * Decision lifecycle — persistent states for the System of Decision Record.
 * Public UI labels map to the 8-step Decision lifecycle.
 */

export const DECISION_LIFECYCLE = [
  "DETECTED",
  "UNDERSTANDING",
  "PREDICTED",
  "SIMULATED",
  "RECOMMENDED",
  "AWAITING_APPROVAL",
  "APPROVED",
  "EXECUTING",
  "OBSERVING",
  "VERIFIED",
  "LEARNED",
  "CLOSED",
] as const;

export type DecisionLifecycleStatus = (typeof DECISION_LIFECYCLE)[number];

export const PUBLIC_DECISION_LIFECYCLE = [
  "DETECTED",
  "UNDERSTOOD",
  "SIMULATED",
  "RECOMMENDED",
  "APPROVED",
  "OBSERVED",
  "VERIFIED",
  "LEARNED",
] as const;

export type PublicDecisionLifecycle =
  (typeof PUBLIC_DECISION_LIFECYCLE)[number];

export type AttentionBand =
  | "needs_you"
  | "handling"
  | "watching"
  | "verified"
  | "learned";

const ORDER = new Map(
  DECISION_LIFECYCLE.map((s, i) => [s, i] as const),
);

export function lifecycleIndex(status: DecisionLifecycleStatus): number {
  return ORDER.get(status) ?? 0;
}

export function canTransition(
  from: DecisionLifecycleStatus,
  to: DecisionLifecycleStatus,
): boolean {
  const a = lifecycleIndex(from);
  const b = lifecycleIndex(to);
  if (b === a) return true;
  if (b > a) return true;
  if (
    (from === "APPROVED" ||
      from === "AWAITING_APPROVAL" ||
      from === "RECOMMENDED") &&
    (to === "SIMULATED" || to === "RECOMMENDED" || to === "AWAITING_APPROVAL")
  ) {
    return true;
  }
  if (from === "APPROVED" && to === "AWAITING_APPROVAL") return true;
  return false;
}

export function attentionBandOf(
  status: DecisionLifecycleStatus,
): AttentionBand {
  switch (status) {
    case "RECOMMENDED":
    case "AWAITING_APPROVAL":
      return "needs_you";
    case "APPROVED":
    case "EXECUTING":
    case "OBSERVING":
      return "handling";
    case "VERIFIED":
      return "verified";
    case "LEARNED":
    case "CLOSED":
      return "learned";
    default:
      return "watching";
  }
}

export function toPublicLifecycle(
  status: DecisionLifecycleStatus,
): PublicDecisionLifecycle {
  switch (status) {
    case "DETECTED":
      return "DETECTED";
    case "UNDERSTANDING":
    case "PREDICTED":
      return "UNDERSTOOD";
    case "SIMULATED":
      return "SIMULATED";
    case "RECOMMENDED":
    case "AWAITING_APPROVAL":
      return "RECOMMENDED";
    case "APPROVED":
    case "EXECUTING":
      return "APPROVED";
    case "OBSERVING":
      return "OBSERVED";
    case "VERIFIED":
      return "VERIFIED";
    case "LEARNED":
    case "CLOSED":
      return "LEARNED";
  }
}

export function lifecycleLabel(status: DecisionLifecycleStatus): string {
  switch (toPublicLifecycle(status)) {
    case "DETECTED":
      return "Detected";
    case "UNDERSTOOD":
      return "Understood";
    case "SIMULATED":
      return "Simulated";
    case "RECOMMENDED":
      return "Recommended";
    case "APPROVED":
      return "Approved";
    case "OBSERVED":
      return "Observed";
    case "VERIFIED":
      return "Verified";
    case "LEARNED":
      return "Learned";
  }
}

export function cardStateFromLifecycle(
  status: DecisionLifecycleStatus,
): "DECIDE" | "SIMULATE" | "APPROVED" | "VERIFIED" {
  const band = attentionBandOf(status);
  if (band === "verified" || band === "learned") return "VERIFIED";
  if (band === "handling") return "APPROVED";
  if (status === "SIMULATED") return "SIMULATE";
  return "DECIDE";
}
