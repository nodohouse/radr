"use client";

/**
 * Operations command.
 * Restaurant: ServiceShell (floor / timeline / recovery).
 * Hotel: House Readiness (Daylight readiness command center).
 */

import { Suspense } from "react";
import { ServiceShell } from "@/components/product/service/ServiceShell";
import { HouseReadinessShell } from "@/components/product/operations/house-readiness";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import "./service-map.css";
import "./service-intelligence.css";

function ServicePageInner() {
  const { isHotel } = useDemoOrg();
  if (isHotel) return <HouseReadinessShell />;
  return <ServiceShell />;
}

export default function ServiceMapPage() {
  return (
    <Suspense fallback={<div className="rp-svc" aria-busy="true" />}>
      <ServicePageInner />
    </Suspense>
  );
}
