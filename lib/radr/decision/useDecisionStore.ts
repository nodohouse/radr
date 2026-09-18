"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
  setDecisionStoreVertical,
  type DecisionStoreState,
} from "@/lib/radr/decision/store";
import type { DecisionVertical } from "@/lib/radr/decision/core";

export function useDecisionStore(): DecisionStoreState {
  return useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
}

/** Keep demo store aligned with operating profile vertical. */
export function useSyncedDecisionStore(
  vertical: DecisionVertical,
): DecisionStoreState {
  const snap = useDecisionStore();
  useEffect(() => {
    setDecisionStoreVertical(vertical);
  }, [vertical]);
  return snap;
}
