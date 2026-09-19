import {
  FEATURE_LIVE_SHIFT,
  LIVE_SHIFT_FEEDS_READY,
} from "@/lib/constants";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";

/**
 * Live Shift visibility.
 * DEMO/SANDBOX: illustrative stream when feature enabled.
 * LIVE: only when real feeds are declared ready - never silent fake numbers.
 */
export function isLiveShiftEnabled(
  env = getRadrEnvironment(),
): boolean {
  if (!FEATURE_LIVE_SHIFT) return false;
  if (isSyntheticData(env)) return true;
  return LIVE_SHIFT_FEEDS_READY;
}

export function liveShiftMode(
  env = getRadrEnvironment(),
): "off" | "illustrative" | "live" {
  if (!isLiveShiftEnabled(env)) return "off";
  if (isSyntheticData(env)) return "illustrative";
  return LIVE_SHIFT_FEEDS_READY ? "live" : "off";
}
