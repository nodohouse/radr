/**
 * Canonical demo locations — one Decision ID → one property.
 * Import from here or from decisions.ts; do not hardcode location strings.
 */

export {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_LABOR,
  CANON_SUPPLIER,
  CANON_PLAYBOOK,
  CANON_BESTSELLER,
  CANON_TUNA,
} from "@/lib/radr/decision/demo/canonical";

/** Demo world map — property names are owned by each CanonDecision. */
export const DEMO_LOCATIONS = {
  berlinMitte: "Berlin Mitte",
  canalHouse: "Canal House · Amsterdam",
  chiadoCollective: "Chiado Collective · Lisbon",
} as const;
