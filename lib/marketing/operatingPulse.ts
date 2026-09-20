/**
 * RADR Operating Pulse — site-wide brand/device.
 * RADR-level interpretation only. Not raw POS/weather/cover noise.
 * Canonical fixtures only.
 */

import {
  LIVE_D7021,
  LIVE_D7022,
  ROUTINE_SIGNALS_SUPPRESSED,
} from "@/lib/marketing/publicLiveDecisions";
import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";

export type OperatingPulseItem = {
  id: string;
  text: string;
};

export const OPERATING_PULSE_ITEMS: OperatingPulseItem[] = [
  {
    id: "d7021",
    text: `DECISION · BERLIN · ${euro(LIVE_D7021.economics.exposed)} settlement gap requires review`,
  },
  {
    id: "d7022",
    text: `REVIEW READY · AMSTERDAM · ${euro(LIVE_D7022.economics.exposed)} supplier variance`,
  },
  {
    id: "d4102",
    text: `VERIFIED · ${ECON_D4102.displayId} · ${euro(ECON_D4102.verified)} credit matched`,
  },
  {
    id: "handling",
    text: "RADR HANDLING · supplier dispute package prepared",
  },
  {
    id: "memory",
    text: "MEMORY · 18 comparable nights · forecast error 6.8%",
  },
  {
    id: "quiet",
    text: `WITHIN EXPECTATIONS · ${ROUTINE_SIGNALS_SUPPRESSED} routine changes suppressed`,
  },
  {
    id: "action",
    text: "ACTION · evidence package ready",
  },
  {
    id: "verify",
    text: `VERIFIED RECOVERY · ${ECON_D4102.displayId} · ${euro(ECON_D4102.verified)} sealed`,
  },
];
