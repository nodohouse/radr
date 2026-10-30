/**
 * RADR Operating Pulse — quiet live system feel.
 * Labeled ILLUSTRATIVE RADR SIGNALS in the UI.
 */

import { PUBLIC_PULSE_ROWS } from "@/lib/marketing/publicCanon";

export type OperatingPulseItem = {
  id: string;
  text: string;
};

export const OPERATING_PULSE_LABEL = "ILLUSTRATIVE RADR SIGNALS";

export const OPERATING_PULSE_ITEMS: OperatingPulseItem[] = [
  ...PUBLIC_PULSE_ROWS,
];
