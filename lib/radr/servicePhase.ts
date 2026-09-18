/**
 * Operating service phase - PLAN → OPERATE → VERIFY cycle.
 */

import { demoBerlinDinnerPeriod } from "@/lib/radr/domain/servicePeriod";
import { DEMO_AS_OF_ISO } from "@/lib/radr/demoClock";

export type ServicePhase =
  | "PRE_SHIFT"
  | "LIVE"
  | "CLOSING"
  | "POST_SHIFT";

export type ServicePhaseContext = {
  phase: ServicePhase;
  serviceLabel: string;
  serviceType: string;
  startIso: string;
  endIso: string;
  asOfIso: string;
  /** Minutes until service start (PRE) or since start (LIVE+). */
  minutesToStart: number;
  minutesIntoService: number;
};

const CLOSING_WINDOW_MS = 60 * 60 * 1000;

/**
 * Derive phase from operating clock vs service window.
 */
export function resolveServicePhase(
  asOfIso: string,
  period: { startTime: string; endTime: string; label?: string; type?: string },
): ServicePhaseContext {
  const asOf = new Date(asOfIso).getTime();
  const start = new Date(period.startTime).getTime();
  const end = new Date(period.endTime).getTime();
  const closingFrom = end - CLOSING_WINDOW_MS;

  let phase: ServicePhase;
  if (asOf < start) phase = "PRE_SHIFT";
  else if (asOf >= end) phase = "POST_SHIFT";
  else if (asOf >= closingFrom) phase = "CLOSING";
  else phase = "LIVE";

  return {
    phase,
    serviceLabel: period.label ?? "Service",
    serviceType: period.type ?? "DINNER",
    startIso: period.startTime,
    endIso: period.endTime,
    asOfIso,
    minutesToStart: Math.max(0, Math.round((start - asOf) / 60_000)),
    minutesIntoService: Math.max(0, Math.round((asOf - start) / 60_000)),
  };
}

/** Berlin dinner phase at the canonical demo clock. */
export function demoServicePhaseAt(
  asOfIso: string = DEMO_AS_OF_ISO,
): ServicePhaseContext {
  const period = demoBerlinDinnerPeriod();
  return resolveServicePhase(asOfIso, period);
}

export function phaseHeadline(phase: ServicePhase): string {
  switch (phase) {
    case "PRE_SHIFT":
      return "Pre-shift";
    case "LIVE":
      return "Live";
    case "CLOSING":
      return "Closing";
    case "POST_SHIFT":
      return "Shift complete";
  }
}
