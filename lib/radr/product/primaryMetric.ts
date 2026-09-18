/**
 * Primary metric presentation per Decision — from Canon, never invented in UI.
 */

import type { DecisionRecord } from "@/lib/radr/decision/record";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  CANON_BY_ID,
  CANON_MARGIN_COKE,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_PLAYBOOK,
  CANON_SUPPLIER,
  CANON_TABLE,
  CANON_TUNA,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import {
  ECONOMIC_METRIC_LABEL,
  metricCaption,
  type MetricPresentation,
} from "@/lib/economics/metricTypes";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";

export function primaryMetricOf(r: DecisionRecord): MetricPresentation | null {
  const band = r.attentionOverride ?? attentionBandOf(r.status);
  const verified =
    band === "verified" || band === "learned"
      ? r.verifiedValue?.amount
      : undefined;

  switch (r.id) {
    case DECISION_IDS.peak: {
      if (verified != null) {
        return {
          type: "VERIFIED_INCREMENTAL_CONTRIBUTION",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_INCREMENTAL_CONTRIBUTION,
          scopeLabel: "Tonight's dinner service",
          horizonLabel: "",
          baselineLabel: "vs seat-now",
        };
      }
      if (r.outcomeDetail?.observedContributionEuro != null) {
        return {
          type: "OBSERVED_INCREMENTAL_CONTRIBUTION",
          value: r.outcomeDetail.observedContributionEuro,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.OBSERVED_INCREMENTAL_CONTRIBUTION,
          scopeLabel: "Tonight's dinner service",
          horizonLabel: "",
          baselineLabel: "vs seat-now",
        };
      }
      return {
        type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
        value: CANON_PEAK.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_INCREMENTAL_CONTRIBUTION,
        scopeLabel: "Tonight's dinner service",
        horizonLabel: "",
        baselineLabel: "vs seat-now",
      };
    }
    case DECISION_IDS.ota: {
      if (verified != null) {
        return {
          type: "VERIFIED_PROTECTED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_PROTECTED,
          scopeLabel: "4 premium rooms · 72h",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_PROTECTED",
        value: CANON_OTA.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_PROTECTED,
        scopeLabel: "4 premium rooms · 72h",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.orphan: {
      if (verified != null) {
        return {
          type: "VERIFIED_RECOVERED",
          value: verifiedEuro(CANON_ORPHAN),
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_RECOVERED,
          scopeLabel: "One unit-night",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_NET_CONTRIBUTION",
        value: CANON_ORPHAN.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_NET_CONTRIBUTION,
        scopeLabel: "One unit-night",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.supplier:
      return {
        type: "SUPPLIER_VARIANCE",
        value: CANON_SUPPLIER.exposureEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.SUPPLIER_VARIANCE,
        scopeLabel: "Current invoice",
        horizonLabel: "",
      };
    case DECISION_IDS.playbook:
      return {
        type: "STRUCTURAL_IMPROVEMENT_OPPORTUNITY",
        value: CANON_PLAYBOOK.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.STRUCTURAL_IMPROVEMENT_OPPORTUNITY,
        scopeLabel: "Group · test horizon",
        horizonLabel: "",
      };
    case DECISION_IDS.tableRecover: {
      if (verified != null) {
        return {
          type: "VERIFIED_RECOVERED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_RECOVERED,
          scopeLabel: "Current reservation recovery window",
          horizonLabel: "",
        };
      }
      if (
        r.observedOutcome ||
        r.outcomeDetail?.observedContributionEuro != null
      ) {
        return {
          type: "OBSERVED_NET_CONTRIBUTION",
          value:
            r.outcomeDetail?.observedContributionEuro ??
            CANON_TABLE.actualProtectedEuro,
          currency: "EUR",
          label: "Observed recovered contribution",
          scopeLabel: "Current reservation recovery window",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_NET_CONTRIBUTION",
        value: CANON_TABLE.expectedProtectedEuro,
        currency: "EUR",
        label: "Potential recovered contribution",
        scopeLabel: "Current reservation recovery window",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.tuna: {
      if (verified != null) {
        return {
          type: "VERIFIED_PROTECTED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_PROTECTED,
          scopeLabel: "Historical · Berlin Mitte",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_PROTECTED",
        value: CANON_TUNA.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_PROTECTED,
        scopeLabel: "Historical · Berlin Mitte",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.menuPeak: {
      if (verified != null) {
        return {
          type: "VERIFIED_PROTECTED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_PROTECTED,
          scopeLabel: "Peak window · menu economics",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
        value: CANON_BY_ID[DECISION_IDS.menuPeak]?.expectedProtectedEuro ?? 680,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_INCREMENTAL_CONTRIBUTION,
        scopeLabel: "Peak window vs keep-mix",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.socialDemand: {
      if (verified != null) {
        return {
          type: "VERIFIED_PROTECTED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_PROTECTED,
          scopeLabel: "Tonight · MODELED attribution",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_PROTECTED",
        value: CANON_BY_ID[DECISION_IDS.socialDemand]?.expectedProtectedEuro ?? 310,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_PROTECTED,
        scopeLabel: "Tonight · demand signal",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.guestVoice: {
      if (verified != null) {
        return {
          type: "VERIFIED_PROTECTED",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_PROTECTED,
          scopeLabel: "Comparable Friday peak",
          horizonLabel: "",
        };
      }
      return {
        type: "EXPECTED_PROTECTED",
        value: CANON_BY_ID[DECISION_IDS.guestVoice]?.expectedProtectedEuro ?? 390,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_PROTECTED,
        scopeLabel: "Recurring Friday pattern",
        horizonLabel: "",
      };
    }
    case DECISION_IDS.marginCoke: {
      if (verified != null) {
        return {
          type: "VERIFIED_INCREMENTAL_CONTRIBUTION",
          value: verified,
          currency: "EUR",
          label: ECONOMIC_METRIC_LABEL.VERIFIED_INCREMENTAL_CONTRIBUTION,
          scopeLabel: "Beverage category · Berlin Mitte",
          horizonLabel: "",
          baselineLabel: "vs absorb-cost baseline",
        };
      }
      return {
        type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
        value: CANON_MARGIN_COKE.expectedProtectedEuro,
        currency: "EUR",
        label: ECONOMIC_METRIC_LABEL.EXPECTED_INCREMENTAL_CONTRIBUTION,
        scopeLabel: "Beverage category · Berlin Mitte",
        horizonLabel: "This week",
        baselineLabel: "vs absorb-cost baseline",
      };
    }
    default: {
      const c = CANON_BY_ID[r.id];
      const amount =
        verified ??
        r.expectedContributionImpact ??
        c?.expectedProtectedEuro ??
        r.exposedContribution ??
        0;
      return {
        type: "EXPOSURE",
        value: amount,
        currency: "EUR",
        label: "Contribution",
        scopeLabel: r.property,
        horizonLabel: "",
      };
    }
  }
}

export function formatPrimaryMetric(r: DecisionRecord): {
  money: string;
  caption: string;
} | null {
  const m = primaryMetricOf(r);
  if (!m) return null;
  return {
    money: formatDecisionMoney(m.value),
    caption: `${metricCaption(m)} · DEMO`,
  };
}
