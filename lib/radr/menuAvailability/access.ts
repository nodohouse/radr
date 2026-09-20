import { isSyntheticData, getRadrEnvironment } from "@/lib/radr/env";

/**
 * Menu Availability Risk surfaces in DEMO as illustrative intelligence.
 * LIVE requires real inventory/menu/POS feeds - never invent silently.
 */
export function isMenuAvailabilityEnabled(
  env = getRadrEnvironment(),
): boolean {
  if (process.env.NEXT_PUBLIC_FEATURE_MENU_AVAILABILITY === "false") {
    return false;
  }
  if (isSyntheticData(env)) return true;
  return process.env.NEXT_PUBLIC_MENU_AVAILABILITY_FEEDS === "true";
}
