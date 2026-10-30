"use client";

/**
 * Applies route-aware period mapping when the pathname class changes.
 * Remembers the last period per route class so Value↔Operations does not
 * permanently overwrite the user's Control Center Live/Today choice.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import {
  resolvePeriodForRoute,
  routePeriodClass,
  type RoutePeriodClass,
} from "./periodMap";

const MEMORY_KEY = "radr.periodByRouteClass.v1";

function readMemory(): Partial<Record<RoutePeriodClass, DashPeriod>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(MEMORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<RoutePeriodClass, DashPeriod>>;
  } catch {
    return {};
  }
}

function writeMemory(
  memory: Partial<Record<RoutePeriodClass, DashPeriod>>,
): void {
  try {
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

export function RoutePeriodSync() {
  const pathname = usePathname() || "/app";
  const { period, setPeriod, contextReady } = useProduct();
  const lastClass = useRef<RoutePeriodClass | null>(null);
  const periodRef = useRef(period);
  periodRef.current = period;

  useEffect(() => {
    if (!contextReady) return;
    const cls = routePeriodClass(pathname);
    const prev = lastClass.current;
    if (prev === cls) return;

    const memory = readMemory();
    if (prev) {
      memory[prev] = periodRef.current;
      writeMemory(memory);
    }

    lastClass.current = cls;

    const remembered = memory[cls];
    const next =
      remembered ?? resolvePeriodForRoute(pathname, periodRef.current);
    if (next !== periodRef.current) setPeriod(next);
  }, [pathname, setPeriod, contextReady]);

  return null;
}
