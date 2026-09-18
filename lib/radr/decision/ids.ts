/** Shared Decision IDs — homepage, platform, /app, Decision Record. */

export const DECISION_IDS = {
  tuna: "dec_tuna_berlin",
  ota: "dec_ota_canal",
  orphan: "dec_orphan_chiado",
  rain: "dec_rain_berlin",
  peak: "dec_peak_berlin",
  hiddenMenu: "dec_hidden_menu_berlin",
  /** Cross-domain peak bestseller (BUY × LABOR × SELL) — Intelligence flagship. */
  bestsellerPeak: "dec_bestseller_peak_berlin",
  /** Product: signature dish profitable but destroying peak contribution. */
  menuPeak: "dec_menu_peak_berlin",
  /** Social demand signal changing tonight's product mix. */
  socialDemand: "dec_social_demand_berlin",
  /** Guest sentiment rooted in kitchen bottleneck, not FOH labor. */
  guestVoice: "dec_guest_voice_berlin",
  /** Margin Response — beverage cost shock (Coca-Cola). Not auto-reprice. */
  marginCoke: "dec_margin_coke_berlin",
  hiddenMix: "dec_hidden_mix_canal",
  hiddenOrphanRule: "dec_hidden_orphan_chiado",
  tableRecover: "dec_table_recover_berlin",
  tunaStructural: "dec_tuna_structural_berlin",
  labor: "dec_labor_berlin",
  supplier: "dec_supplier_berlin",
  playbook: "dec_playbook_group",
  created: "dec_created_terrace",
} as const;

/** Human-facing Decision numbers (System of Decision Record). */
export const DECISION_DISPLAY_IDS: Record<string, string> = {
  [DECISION_IDS.tuna]: "D-1842",
  [DECISION_IDS.tunaStructural]: "D-1842-S",
  [DECISION_IDS.ota]: "D-2201",
  [DECISION_IDS.orphan]: "D-3104",
  [DECISION_IDS.peak]: "D-1911",
  [DECISION_IDS.rain]: "D-1908",
  [DECISION_IDS.hiddenMenu]: "D-1849",
  [DECISION_IDS.bestsellerPeak]: "D-1855",
  [DECISION_IDS.menuPeak]: "D-7110",
  [DECISION_IDS.socialDemand]: "D-7302",
  [DECISION_IDS.guestVoice]: "D-7401",
  [DECISION_IDS.marginCoke]: "D-7501",
  [DECISION_IDS.labor]: "D-1920",
  [DECISION_IDS.supplier]: "D-4102",
  [DECISION_IDS.playbook]: "D-5208",
  [DECISION_IDS.created]: "D-4410",
  [DECISION_IDS.tableRecover]: "D-6671",
};

export function displayDecisionId(id: string): string {
  return DECISION_DISPLAY_IDS[id] ?? id;
}

export type DecisionIdKey = keyof typeof DECISION_IDS;
