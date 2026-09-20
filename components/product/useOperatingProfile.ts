"use client";

/**
 * Runtime operating context — profile owns nav / CC / terminology.
 * DemoVertical is a fixture that sets profile + location, not a parallel architecture.
 */

import { useMemo } from "react";
import { useDemoVertical } from "@/components/product/DemoVerticalSwitcher";
import {
  resolveProfile,
  type DemoVertical,
} from "@/lib/radr/operating/resolveProfile";
import {
  terminologyForProfile,
  type TerminologyTokens,
} from "@/lib/radr/operating/terminology";
import type { HospitalityOperatingProfile } from "@/lib/radr/domain/hospitalityOperatingProfile";
import { useProduct } from "@/lib/product/store";

export type OperatingRuntime = {
  profile: HospitalityOperatingProfile;
  /** Demo fixture key — prefer profile.id for product logic. */
  vertical: DemoVertical;
  terms: TerminologyTokens;
  locationId: string;
};

export function useOperatingProfile(): OperatingRuntime {
  const vertical = useDemoVertical();
  const { locationScope } = useProduct();

  return useMemo(() => {
    const profile = resolveProfile({
      demoVertical: vertical,
      locationId: locationScope,
    });
    return {
      profile,
      vertical,
      terms: terminologyForProfile(profile),
      locationId: locationScope,
    };
  }, [vertical, locationScope]);
}

export { demoVerticalForProfileId } from "@/lib/radr/operating/resolveProfile";
