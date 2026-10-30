"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import {
  buildAppHref,
  controlCenterHref,
  decisionDetailHref,
  decisionsNeedsYouHref,
  periodForNavigation,
  type RadrNavParams,
} from "./navigateWithContext";

/**
 * Navigate while preserving Product store context and applying
 * route-aware period mapping when the destination requires it.
 */
export function useRadrNavigation() {
  const router = useRouter();
  const { period, setPeriod } = useProduct();

  const go = useCallback(
    (route: string, params?: RadrNavParams) => {
      const href = buildAppHref(route, params);
      const path = href.split("?")[0] || href;
      const nextPeriod = periodForNavigation(path, period);
      if (nextPeriod !== period) setPeriod(nextPeriod);
      router.push(href);
    },
    [period, router, setPeriod],
  );

  const openControlCenter = useCallback(() => go(controlCenterHref()), [go]);

  const openDecisions = useCallback(
    (options?: { band?: string; decision?: string }) =>
      go("/app/decisions", {
        band: options?.band,
        decision: options?.decision,
        stay: "1",
      }),
    [go],
  );

  const openDecisionsNeedsYou = useCallback(
    () => go(decisionsNeedsYouHref()),
    [go],
  );

  const openDecision = useCallback(
    (id: string) => {
      router.push(decisionDetailHref(id));
    },
    [router],
  );

  const openLive = useCallback(
    (options?: RadrNavParams) => go("/app/live", options),
    [go],
  );

  const openOperations = useCallback(
    (options?: RadrNavParams) => go("/app/service", options),
    [go],
  );

  const openIntelligence = useCallback(
    (options?: RadrNavParams) => go("/app/intelligence", options),
    [go],
  );

  const openValue = useCallback(
    (options?: RadrNavParams) => go("/app/value", { stay: "1", ...options }),
    [go],
  );

  const openMemory = useCallback(
    (options?: RadrNavParams) => go("/app/memory", options),
    [go],
  );

  const openLocation = useCallback(
    (id: string) => go(`/app/locations/${encodeURIComponent(id)}`),
    [go],
  );

  const openDataHealth = useCallback(
    (source?: string) =>
      go("/app/data-health", source ? { source } : undefined),
    [go],
  );

  return {
    go,
    openControlCenter,
    openDecisions,
    openDecisionsNeedsYou,
    openDecision,
    openLive,
    openOperations,
    openIntelligence,
    openValue,
    openMemory,
    openLocation,
    openDataHealth,
  };
}
