"use client";

import { useEffect, useMemo, useState } from "react";
import { useProduct } from "@/lib/product/store";
import { getOperatingSnapshot } from "@/lib/radr/operatingSnapshot";
import type { Finding } from "@/lib/radr/domain";
import { findingsForScope } from "@/lib/radr/findings";
import { getLocationById } from "@/lib/radr/locationCatalog";
import { TodayHome } from "./TodayHome";

/**
 * Control Center - operating desk shell.
 */
export default function ControlCenter() {
  const { locationScope, period, roleView, comparisonLocationIds } =
    useProduct();
  const [findings, setFindings] = useState<Finding[]>(() =>
    findingsForScope("loc_ber"),
  );

  useEffect(() => {
    const scope =
      comparisonLocationIds.length >= 2
        ? comparisonLocationIds.includes("loc_ber") ||
          comparisonLocationIds.includes("loc_ber_kreuz")
          ? "loc_ber"
          : comparisonLocationIds[0]!
        : locationScope;
    setFindings(findingsForScope(scope));
  }, [locationScope, comparisonLocationIds]);

  const snapshot = useMemo(
    () => getOperatingSnapshot(locationScope, period),
    [locationScope, period],
  );

  const locationName =
    comparisonLocationIds.length >= 2
      ? comparisonLocationIds
          .map((id) => getLocationById(id)?.name ?? id)
          .join(" · ")
      : snapshot.locationName;

  return (
    <div className="rp-command rp-command-today">
      <TodayHome
        findings={findings}
        locationName={locationName}
        locationScope={locationScope}
        isGroup={snapshot.isGroup || comparisonLocationIds.length >= 2}
        roleView={roleView}
      />
    </div>
  );
}
