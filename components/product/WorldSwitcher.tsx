"use client";

/**
 * First-class Restaurants ↔ Hotels world switch.
 * Same session engine as DemoOrgSwitcher — no "DEMO" chrome in the operating bar.
 */

import { DemoOrgSwitcher } from "@/components/product/DemoOrgSwitcher";

export function WorldSwitcher({ className = "" }: { className?: string }) {
  return (
    <DemoOrgSwitcher
      className={`rp-world-switch ${className}`.trim()}
      variant="world"
    />
  );
}
