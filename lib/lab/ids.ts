/** Stable Decision ids. Display ids are operator-facing; internal ids stay canonical. */

export const DECISION = {
  peak: { id: "dec_peak_berlin", displayId: "D-1911" },
  labor: { id: "dec_labor_berlin", displayId: "D-1920" },
  menuPeak: { id: "dec_menu_peak", displayId: "D-7110" },
  supplier: { id: "dec_supplier_berlin", displayId: "D-4102" },
  tuna: { id: "dec_tuna_berlin", displayId: "D-1842" },
  margin: { id: "dec_margin_coke", displayId: "D-7501" },
  hotelOrphan: { id: "dec_hotel_orphan", displayId: "D-3301" },
  hotelOta: { id: "dec_hotel_ota", displayId: "D-3308" },
  playbook: { id: "dec_playbook_friday", displayId: "PLAYBOOK" },
} as const;

export type DecisionKey = keyof typeof DECISION;

export const PROPERTY = {
  restaurant: "Berlin Mitte",
  hotel: "Canal House",
} as const;

export function displayIdFor(id: string): string {
  const hit = Object.values(DECISION).find((d) => d.id === id);
  return hit?.displayId ?? id.toUpperCase();
}

export function seedForDecision(id: string): "service" | "hotel" | "recover" | null {
  if (id === DECISION.peak.id || id === DECISION.labor.id || id === DECISION.menuPeak.id) {
    return "service";
  }
  if (id === DECISION.supplier.id) return "recover";
  if (id === DECISION.hotelOrphan.id || id === DECISION.hotelOta.id) return "hotel";
  return null;
}
