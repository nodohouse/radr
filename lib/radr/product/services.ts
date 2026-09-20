/**
 * Demo product services — scoped by persona; euros from Canon/store only.
 */

import {
  getDecisionRecord,
  listDecisionRecords,
  getWatchingSignals,
  sinceLastCheck,
  recordAttentionBand,
  approveDecision,
  advanceDecision,
  addOperatorContext,
  verifyDecision,
  learnDecision,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import type { DecisionRecord, WatchingSignal } from "@/lib/radr/decision/record";
import type { AttentionBand } from "@/lib/radr/decision/lifecycle";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { RoleView } from "@/lib/product/types";
import { roleContextFor } from "./personas";
import {
  scopedDecisions,
  splitNeedsYou,
  memoryInScope,
  recordAttention,
} from "./roleScope";
import { formatPrimaryMetric, primaryMetricOf } from "./primaryMetric";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import {
  CANON_PEAK,
  CANON_MENU_PEAK,
  CANON_SOCIAL_DEMAND,
  CANON_GUEST_VOICE,
} from "@/lib/radr/decision/demo/canonical";
import {
  COKE_MARGIN_SHOCK,
  simulateCokePriceRaise,
} from "@/lib/radr/product/marginResponse";

export { IntegrationHealthService } from "./integrations";
export {
  MenuIntelligenceService,
  DemandSignalService,
  GuestVoiceService,
  DecisionDiscoveryService,
  activeEconomicsInScope,
  valueCoverage,
} from "./intelligenceServices";

export const DecisionRepository = {
  get: getDecisionRecord,
  list: listDecisionRecords,
  band: recordAttentionBand,
  snapshot: getDecisionStoreSnapshot,
  heroId: () => DECISION_IDS.peak,
  scoped(role: RoleView) {
    return scopedDecisions(listDecisionRecords(), role);
  },
};

export const ScenarioService = {
  addContext: addOperatorContext,
  approve: approveDecision,
  advance: advanceDecision,
};

export const VerificationService = {
  verify: verifyDecision,
  learn: learnDecision,
};

export const MemoryService = {
  forRole(role: RoleView): DecisionRecord[] {
    return memoryInScope(listDecisionRecords(), role).sort((a, b) => {
      const rank = (r: DecisionRecord) => {
        if (r.id === DECISION_IDS.peak) return 100;
        if (r.id === DECISION_IDS.menuPeak) return 95;
        if (r.id === DECISION_IDS.ota) return 90;
        if (r.id === DECISION_IDS.orphan) return 85;
        if (r.id === DECISION_IDS.guestVoice) return 80;
        if (r.id === DECISION_IDS.socialDemand) return 75;
        if (r.id === DECISION_IDS.tuna) return 10;
        return 50;
      };
      return rank(b) - rank(a);
    });
  },
};

export type AskFixture = {
  id: string;
  prompt: string;
  answer: string;
  decisionIds: string[];
  evidence?: string[];
};

export const AskRadrService = {
  fixtures(role: RoleView): AskFixture[] {
    const ctx = roleContextFor(role);
    const scoped = scopedDecisions(listDecisionRecords(), role);
    const { urgent, review } = splitNeedsYou(scoped);
    const needs = [...urgent, ...review];
    const peak = scoped.find((r) => r.id === DECISION_IDS.peak);
    const menu = scoped.find((r) => r.id === DECISION_IDS.menuPeak);
    const social = scoped.find((r) => r.id === DECISION_IDS.socialDemand);
    const guest = scoped.find((r) => r.id === DECISION_IDS.guestVoice);
    const playbook = scoped.find((r) => r.id === DECISION_IDS.playbook);

    const needLines = needs
      .map((r) => {
        const m = formatPrimaryMetric(r);
        return `${displayDecisionId(r.id)} · ${r.title} · ${r.decisionDeadline || r.decisionHorizon}${m ? ` · ${m.money}` : ""}`;
      })
      .join("\n");

    const base: AskFixture[] = [
      {
        id: "needs_me",
        prompt: "What needs me?",
        answer: needs.length
          ? `${needs.length} Decision${needs.length === 1 ? "" : "s"} need you (${ctx.shortLabel}):\n${needLines}`
          : `Nothing needs you in ${ctx.shortLabel}. Everything is operating within expectations.`,
        decisionIds: needs.map((r) => r.id),
        evidence: [
          `Grounded in ${needs.length} active Decision${needs.length === 1 ? "" : "s"} · ${ctx.shortLabel}`,
        ],
      },
      {
        id: "missing",
        prompt: "What am I missing?",
        answer: guest
          ? `You may be looking at labor.\nRADR is looking at kitchen mix.\n\nFriday labor cost: within plan.\nYet contribution and guest sentiment deteriorated.\n\nStrongest relationship:\nsignature-dish mix ↑ → station pressure ↑ → ticket time ↑ → second turns ↓ → “slow service” mentions ↑.\n\nFOH staffing was normal.\n\nPotential exposure: €${CANON_GUEST_VOICE.exposureEuro} · DEMO.\n\nOpen ${displayDecisionId(DECISION_IDS.guestVoice)}.`
          : peak
            ? `Peak capacity collision is forming — empty tables are not free capacity when kitchen ≥90% and 38 covers inbound.\n€${CANON_PEAK.expectedProtectedEuro} expected incremental contribution vs seat-now · DEMO.`
            : `Nothing material is outside ${ctx.shortLabel} right now.`,
        decisionIds: guest
          ? [guest.id, ...(menu ? [menu.id] : [])]
          : peak
            ? [peak.id]
            : [],
        evidence: guest
          ? ["Guest reviews", "KDS", "Delivery", "POS mix", "Labor roster", "Operating Memory"]
          : peak
            ? ["Reservations", "KDS", "Delivery", "Operating Memory"]
            : undefined,
      },
      {
        id: "why_wait",
        prompt: "Why wait 12 minutes?",
        answer: peak
          ? `${peak.recommendationReasoning}\n\n€${CANON_PEAK.expectedProtectedEuro} expected incremental contribution vs seat-now · tonight · DEMO.`
          : "Peak capacity Decision is outside your current scope.",
        decisionIds: peak ? [peak.id] : [],
        evidence: peak
          ? ["Reservations", "KDS", "Delivery", "Table turns", "Operating Memory"]
          : undefined,
      },
      {
        id: "friday",
        prompt: "Why did Friday deteriorate?",
        answer: guest
          ? `Slow-service mentions +${CANON_GUEST_VOICE.evidence.find((e) => e.label === "Theme")?.value.includes("31") ? "31" : "31"}%.\n\n82% of the increase clustered when:\nDelivery >26%\n+ Signature dish mix >18%\n+ Kitchen load >94%.\n\nLabor was not the driver.\n\n${displayDecisionId(DECISION_IDS.guestVoice)} · DEMO.`
          : "Friday guest-voice Decision is outside your current scope.",
        decisionIds: guest ? [guest.id] : [],
        evidence: guest
          ? ["Guest reviews", "KDS", "Delivery", "POS mix"]
          : undefined,
      },
      {
        id: "menu_hurt",
        prompt: "Which menu items hurt us during peak?",
        answer: menu
          ? `Tuna Tataki is a classic STAR (€${14.2} contribution · high sales).\n\nAt peak it is −18% contribution per kitchen minute vs Truffle Pasta.\nPrep +21% vs category · station 92% · ticket impact +3.8m when mix >18%.\n\nRecommendation: keep the dish · de-emphasize 19:00–20:30 only · feature faster high €/min alternative.\n\n€${CANON_MENU_PEAK.expectedProtectedEuro} expected incremental contribution vs keep-mix · DEMO.`
          : "Menu peak Decision is outside your current scope.",
        decisionIds: menu ? [menu.id] : [],
        evidence: menu
          ? ["POS / menu mix", "KDS", "Recipe / BOM", "Kitchen load", "Operating Memory"]
          : undefined,
      },
      {
        id: "campaign",
        prompt: "What changed after the social campaign?",
        answer: social
          ? `14:32 Reel featured Tuna Tataki (DEMO SIGNAL — not a live Instagram connection).\nBy 17:30 engagement 2.4× baseline.\n\nEngagement is a demand indicator — not revenue.\nHistorically associated with featured-item mix ↑.\nInventory limited · kitchen already constrained.\n\nRADR: protect stock for booked covers · shift next owned feature · do not boost again.\n\n€${CANON_SOCIAL_DEMAND.expectedProtectedEuro} expected protected · MODELED attribution · DEMO.`
          : "Social-demand Decision is outside your current scope.",
        decisionIds: social ? [social.id] : [],
        evidence: social
          ? ["Social · DEMO SIGNAL", "Reservations", "Inventory", "KDS", "Operating Memory"]
          : undefined,
      },
      {
        id: "margin_leak",
        prompt: "Where is revenue growing but profit shrinking?",
        answer: menu
          ? `Signature volume looks healthy while peak contribution quality falls.\nContribution / kitchen minute −18% vs alternative during 19:00–20:30.\n\nAlso watch supplier variance on the same item (+8% input) — BUY × LABOR × SELL.\n\n${displayDecisionId(DECISION_IDS.menuPeak)} · ${displayDecisionId(DECISION_IDS.supplier)} · DEMO.`
          : needs.length
            ? needLines
            : "No margin-quality Decision in scope.",
        decisionIds: [
          ...(menu ? [menu.id] : []),
          ...(scoped.find((r) => r.id === DECISION_IDS.supplier)
            ? [DECISION_IDS.supplier]
            : []),
        ],
        evidence: ["POS", "KDS", "Supplier / Procurement", "Recipe"],
      },
      {
        id: "recurring",
        prompt: "Which problem keeps coming back?",
        answer: guest
          ? `Delivery throttle / peak mix pressure appears across comparable Fridays.\nGuest voice + kitchen load co-occur.\n\nTemporary rescues are becoming a pattern — candidate for structural Decision (allocation / peak menu), not another one-off throttle.\n\n${displayDecisionId(DECISION_IDS.guestVoice)}${playbook ? ` · group transfer lens ${displayDecisionId(playbook.id)}` : ""} · DEMO.`
          : playbook
            ? `${displayDecisionId(playbook.id)} — similar commercial performance, different profit. Test before copy.`
            : "No recurring pattern Decision in scope.",
        decisionIds: [
          ...(guest ? [guest.id] : []),
          ...(playbook ? [playbook.id] : []),
        ],
        evidence: ["Operating Memory", "Guest reviews", "KDS"],
      },
    ];

    return base;
  },
  answer(role: RoleView, prompt: string): AskFixture {
    const q = prompt.trim().toLowerCase();
    const all = AskRadrService.fixtures(role);
    const scoped = scopedDecisions(listDecisionRecords(), role);
    const peak = scoped.find((r) => r.id === DECISION_IDS.peak);
    const hit = (id: string) => all.find((f) => f.id === id) ?? all[0]!;
    if (q.includes("missing")) return hit("missing");
    if (q.includes("break tonight") || q.includes("will break")) {
      return {
        id: "break",
        prompt: "What will break tonight?",
        answer:
          "Arrival compression 19:10–19:35 · cold station projected ~96% · rain removes terrace and historically lifts delivery.\n\nTonight's demand mix exceeds current cold-station flexibility.\n\nOpen Pre-shift for prepared responses · DEMO.",
        decisionIds: peak ? [peak.id] : [],
        evidence: ["Reservations", "KDS", "Weather · DEMO", "Delivery history"],
      };
    }
    if (q.includes("team know") || q.includes("data doesn't")) {
      return {
        id: "team_know",
        prompt: "What does the team know that the data doesn't?",
        answer:
          "RADR asks before final recommendation when prior Fridays changed after VIP/event context.\n\nPrompt: Any VIP or event constraints tonight?\n3 prior hits · judgment memory.\n\nOpen Pre-shift · DEMO.",
        decisionIds: peak ? [peak.id] : [],
        evidence: ["Operating Memory", "Operator context history"],
      };
    }
    if (q.includes("disagree") || q.includes("conflict")) {
      return {
        id: "conflict",
        prompt: "Where do our systems disagree?",
        answer:
          "Source conflict · Finding:\nInvoice 420L received ≠ inventory movement 391L ≠ usage model 407L.\n\nAffects D-4102 · confidence reduced until delivery/yield verified · do not reprice on disputed input · DEMO.",
        decisionIds: scoped.some((r) => r.id === DECISION_IDS.supplier)
          ? [DECISION_IDS.supplier]
          : [],
        evidence: ["Invoice", "Inventory", "Usage model"],
      };
    }
    if (q.includes("demand") && q.includes("accept")) {
      return {
        id: "demand_accept",
        prompt: "Which demand should we accept?",
        answer:
          "At peak, scarce kitchen minutes change demand quality.\n\nDelivery €42 gross · weak €/kitchen minute under projected compression → throttle.\nReserved inbound → protect.\nWalk-in → hold 12m for second-turn economics.\n\nOpen Service Map / Pre-shift · DEMO.",
        decisionIds: peak ? [peak.id] : [],
        evidence: ["Delivery", "Reservations", "KDS", "Contribution model"],
      };
    }
    if (q.includes("friday") || q.includes("deteriorate")) return hit("friday");
    if (q.includes("menu") || q.includes("dish") || q.includes("hurt"))
      return hit("menu_hurt");
    if (q.includes("campaign") || q.includes("social") || q.includes("instagram"))
      return hit("campaign");
    if (q.includes("profit") || q.includes("margin") || q.includes("revenue growing"))
      return hit("margin_leak");
    if (q.includes("coming back") || q.includes("recurring") || q.includes("keep"))
      return hit("recurring");
    if (
      (q.includes("coke") || q.includes("coca")) &&
      (q.includes("0.20") ||
        q.includes("0,20") ||
        q.includes("raise") ||
        q.includes("increase") ||
        q.includes("€0.20") ||
        q.includes("euro"))
    ) {
      const sim = simulateCokePriceRaise(0.2);
      const margin = scoped.find((r) => r.id === DECISION_IDS.marginCoke);
      return {
        id: "coke_raise",
        prompt: "What if we raise Coke by €0.20?",
        answer: `MODELED SCENARIO · DEMO\n\nRaise Coca-Cola 330ml by €0.20.\n\n+€${sim.expectedIncrementalEuro} expected incremental contribution (fixture model).\n${sim.note}\n\nPrice needed to restore theoretical item margin: €${COKE_MARGIN_SHOCK.priceNeededToRestoreMarginEuro.toFixed(2)} — that is one input, not the Decision.\nStrongest modeled response remains beverage category rebalance (+€168 expected).\n\nOpen Margin Response / ${displayDecisionId(DECISION_IDS.marginCoke)}.`,
        decisionIds: margin ? [margin.id] : [DECISION_IDS.marginCoke],
        evidence: ["Invoice", "POS beverage mix", "Contract rate", "Cross-location SKU"],
      };
    }
    if (
      q.includes("supplier") &&
      (q.includes("contract") || q.includes("return") || q.includes("compare"))
    ) {
      return {
        id: "supplier_contract",
        prompt: "What if supplier returns to contract price?",
        answer:
          "MODELED SCENARIO · DEMO\n\nIf Beverage Co returns to contract €0.42:\nMonthly exposure (~€796) collapses.\nCategory rebalance Futures become optional — not urgent.\n\nCross-location leverage still supports a procurement case (Berlin pays above Amsterdam/Lisbon).\n\nOpen Margin Response · DEMO.",
        decisionIds: scoped.some((r) => r.id === DECISION_IDS.marginCoke)
          ? [DECISION_IDS.marginCoke]
          : [],
        evidence: ["Contract", "Invoice history", "Group SKU variance"],
      };
    }
    if (q.includes("affected") && (q.includes("dish") || q.includes("menu") || q.includes("coke"))) {
      return {
        id: "affected_dishes",
        prompt: "Show me affected dishes",
        answer:
          "Ingredient exposure · Coca-Cola 330ml:\n· Coca-Cola (anchor)\n· Diet Coke\n· Lunch drink bundle (38% attach)\n\nOne Decision — not five alerts.\nWeekly category pressure €184 · monthly ~€796 if absorbed.\n\nOpen Margin Response · DEMO.",
        decisionIds: [DECISION_IDS.marginCoke],
        evidence: ["BOM", "POS", "Bundle attach"],
      };
    }
    if (q.includes("wait") || q.includes("12")) return hit("why_wait");
    if (q.includes("seat")) return hit("why_wait");
    if (q.includes("need")) return hit("needs_me");
    return hit("missing");
  },
};

export function controlCenterBundle(role: RoleView) {
  const scoped = scopedDecisions(listDecisionRecords(), role);
  const { urgent, review } = splitNeedsYou(scoped);
  return {
    scoped,
    urgent,
    review,
    handling: scoped.filter((r) => recordAttention(r) === "handling"),
    verified: scoped.filter((r) => recordAttention(r) === "verified"),
    watching: getWatchingSignals(),
    check: sinceLastCheck().filter((i) => scoped.some((r) => r.id === i.id)),
  };
}

export type { AttentionBand, DecisionRecord, WatchingSignal };
export { primaryMetricOf, formatPrimaryMetric };
