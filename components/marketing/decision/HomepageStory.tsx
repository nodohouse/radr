"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Decision,
  DecisionCardState,
  DecisionVertical,
} from "@/lib/radr/decision/core";
import {
  HERO_BY_VERTICAL,
  HIDDEN_BY_VERTICAL,
  VERIFIED_BY_VERTICAL,
  simulateFor,
  toDecisionVertical,
  toHeroVertical,
} from "@/lib/radr/decision/catalog";

type StoryCtx = {
  vertical: DecisionVertical;
  heroVertical: "restaurant" | "hotel" | "apartments";
  setVertical: (v: DecisionVertical) => void;
  setHeroVertical: (v: "restaurant" | "hotel" | "apartments") => void;
  userLocked: boolean;
  lockVertical: (v: DecisionVertical) => void;
  heroState: DecisionCardState;
  setHeroState: (s: DecisionCardState) => void;
  simulateState: DecisionCardState;
  setSimulateState: (s: DecisionCardState) => void;
  hiddenState: DecisionCardState;
  setHiddenState: (s: DecisionCardState) => void;
  hero: Decision;
  verified: Decision;
  simulate: Decision | null;
  hidden: Decision;
};

const Ctx = createContext<StoryCtx | null>(null);

export function HomepageStoryProvider({ children }: { children: ReactNode }) {
  const [vertical, setVerticalState] = useState<DecisionVertical>("restaurant");
  const [userLocked, setUserLocked] = useState(false);
  const [heroState, setHeroState] = useState<DecisionCardState>("DECIDE");
  const [simulateState, setSimulateState] =
    useState<DecisionCardState>("SIMULATE");
  const [hiddenState, setHiddenState] = useState<DecisionCardState>("DECIDE");

  const setVertical = useCallback((v: DecisionVertical) => {
    setVerticalState(v);
    setHeroState("DECIDE");
    setSimulateState("SIMULATE");
    setHiddenState("DECIDE");
  }, []);

  const lockVertical = useCallback(
    (v: DecisionVertical) => {
      setUserLocked(true);
      setVertical(v);
    },
    [setVertical],
  );

  const setHeroVertical = useCallback(
    (v: "restaurant" | "hotel" | "apartments") => {
      setVertical(toDecisionVertical(v));
    },
    [setVertical],
  );

  const value = useMemo<StoryCtx>(
    () => ({
      vertical,
      heroVertical: toHeroVertical(vertical),
      setVertical,
      setHeroVertical,
      userLocked,
      lockVertical,
      heroState,
      setHeroState,
      simulateState,
      setSimulateState,
      hiddenState,
      setHiddenState,
      hero: HERO_BY_VERTICAL[vertical],
      verified: VERIFIED_BY_VERTICAL[vertical],
      simulate: simulateFor(vertical),
      hidden: HIDDEN_BY_VERTICAL[vertical],
    }),
    [
      vertical,
      setVertical,
      setHeroVertical,
      userLocked,
      lockVertical,
      heroState,
      simulateState,
      hiddenState,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHomepageStory() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useHomepageStory must be used within HomepageStoryProvider");
  }
  return ctx;
}
