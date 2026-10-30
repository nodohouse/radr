/**
 * Tool call observability — sanitized, demo-safe. No secrets / PII payloads.
 */

export type ToolObservation = {
  requestId: string;
  tool: string;
  principal: string;
  tenant: string;
  locationScope: string;
  status: "ok" | "error" | "gated" | "denied";
  latencyMs: number;
  at: string;
};

const ring: ToolObservation[] = [];
const MAX = 200;

export function recordToolObservation(obs: ToolObservation): void {
  ring.push(obs);
  if (ring.length > MAX) ring.shift();
}

export function listToolObservations(limit = 50): ToolObservation[] {
  return ring.slice(-limit);
}

export function newRequestId(): string {
  return `tg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
