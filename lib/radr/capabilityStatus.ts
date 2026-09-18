/**
 * Internal product truth - capability honesty for every meaningful surface.
 * Customer UI need not show this everywhere; never imply more than the status.
 */

export type CapabilityStatus =
  | "IMPLEMENTED"
  | "DEMO"
  | "PROTOTYPE"
  | "PLANNED";

export type CapabilityRecord = {
  id: string;
  name: string;
  status: CapabilityStatus;
  notes: string;
};

/**
 * Canonical capability table for the operating intelligence product.
 * Keep aligned with docs/RADR_PRODUCT_REALITY_AUDIT.md.
 */
export const RADR_CAPABILITIES: readonly CapabilityRecord[] = [
  {
    id: "control_center",
    name: "Control Center",
    status: "DEMO",
    notes: "Attention-first brief on canonical Northstar fixture.",
  },
  {
    id: "findings_engine",
    name: "Finding detection rules",
    status: "DEMO",
    notes: "Deterministic detectors over demo operating context.",
  },
  {
    id: "cancellation_recovery",
    name: "Cancellation recovery loop",
    status: "DEMO",
    notes: "Full OBSERVE→LEARN story; simulated connectors only.",
  },
  {
    id: "supplier_recovery",
    name: "Supplier invoice variance",
    status: "DEMO",
    notes: "Prepared claim; no live supplier send.",
  },
  {
    id: "prepared_actions",
    name: "Prepared Actions",
    status: "DEMO",
    notes: "In-memory + scenario store; DRAFT_ONLY by default.",
  },
  {
    id: "verified_value",
    name: "Verified Value ledger",
    status: "DEMO",
    notes: "Conservative min(expected, observed) with strength gate.",
  },
  {
    id: "verified_work",
    name: "Verified Work",
    status: "PROTOTYPE",
    notes: "Structured work events; no fabricated hours saved.",
  },
  {
    id: "ask_radr",
    name: "Ask RADR",
    status: "DEMO",
    notes: "Tool-grounded; LLM never invents money.",
  },
  {
    id: "operating_memory",
    name: "Operating Memory",
    status: "PROTOTYPE",
    notes: "Retained outcomes; no automatic model learning claimed.",
  },
  {
    id: "service_period",
    name: "Service Period",
    status: "PROTOTYPE",
    notes: "Foundational domain type; not full Service Twin.",
  },
  {
    id: "data_health",
    name: "Data Health",
    status: "DEMO",
    notes: "Simulated freshness on /app/data; live upload on /sources.",
  },
  {
    id: "connectors_commercial",
    name: "Commercial connectors",
    status: "PLANNED",
    notes: "Only Demo Reservations + Files are available.",
  },
  {
    id: "shadow_mode",
    name: "Shadow Mode",
    status: "PROTOTYPE",
    notes: "Detect/prepare without execute; records would-have.",
  },
  {
    id: "document_upload",
    name: "Document upload",
    status: "IMPLEMENTED",
    notes: "Auth-gated org-scoped intake.",
  },
  {
    id: "auth_onboarding",
    name: "Auth + org onboarding",
    status: "IMPLEMENTED",
    notes: "Creates real organization and location.",
  },
] as const;

export function capabilityById(
  id: string,
): CapabilityRecord | undefined {
  return RADR_CAPABILITIES.find((c) => c.id === id);
}

export function capabilitiesByStatus(
  status: CapabilityStatus,
): CapabilityRecord[] {
  return RADR_CAPABILITIES.filter((c) => c.status === status);
}

export function assertNotImpliedLive(status: CapabilityStatus): boolean {
  return status === "IMPLEMENTED";
}
