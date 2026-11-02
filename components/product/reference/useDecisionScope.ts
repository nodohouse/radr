"use client";
import {useSyncExternalStore} from "react";
import {useProduct} from "@/lib/product/store";
import {useDemoOrg} from "../useDemoOrg";
import {recordsForLocationSelection} from "@/lib/radr/product/selectedScope";
import {locationDisplayName} from "@/lib/radr/product/demoOrg";
import {decisionSummary} from "@/lib/radr/product/decisionSummary";
import {toCanonicalLocationId} from "@/lib/radr/product/locationIds";
import {subscribeDecisionStore, getDecisionStoreSnapshot} from "@/lib/radr/decision/store";
import {scopedDecisionsForDemo} from "@/lib/radr/product/roleScope";

export function useRecords() {
  const snap = useSyncExternalStore(subscribeDecisionStore,getDecisionStoreSnapshot,getDecisionStoreSnapshot);
  const { roleView, locationScope, comparisonLocationIds, locationMode } = useProduct(); const { session } = useDemoOrg();
  const selected = locationMode === "comparison" ? comparisonLocationIds : [];
  const scopeLabel = selected.length >= 2 ? `${selected.length} selected locations` : locationScope === "all" ? "All locations" : locationScope.startsWith("region_") ? locationScope.replace("region_", "").replace(/_/g, " ") : locationDisplayName(toCanonicalLocationId(locationScope));
  const records = recordsForLocationSelection(scopedDecisionsForDemo(Object.values(snap.records),roleView,session.vertical), locationScope, selected);
  return { roleView, vertical: session.vertical, records, summary: decisionSummary(records), locationScope, scopeLabel, comparisonLocationIds: selected };
}

