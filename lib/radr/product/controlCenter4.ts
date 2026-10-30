/**
 * Control Center 4.0 — architecture notes (product SSOT).
 * Full docs: docs/CONTROL_CENTER_4_ARCHITECTURE.md
 */

export type CcFocus =
  | "live"
  | "performance"
  | "history"
  | "pulse"
  | "location"
  | "intel"
  | null;

export function parseCcFocus(raw: string | null): CcFocus {
  if (
    raw === "live" ||
    raw === "performance" ||
    raw === "history" ||
    raw === "pulse" ||
    raw === "location" ||
    raw === "intel"
  ) {
    return raw;
  }
  return null;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

/** Demo clock Berlin 19:48 → evening greeting still works; override for scenario. */
export function controlCenterGreeting(opts?: {
  scenarioHour?: number;
}): string {
  const h = opts?.scenarioHour ?? new Date().getHours();
  return greetingForHour(h);
}
