"use client";

/**
 * Product Live — spatial operating model.
 * Restaurant: LiveSpatialShell (signature).
 * Hotel: Daylight property twin (HotelLiveShell).
 */

import { Suspense } from "react";
import { HotelLiveShell } from "@/components/product/hotel-live/HotelLiveShell";
import { LiveSpatialShell } from "@/components/product/live-spatial/LiveSpatialShell";
import { useDemoOrg } from "@/components/product/useDemoOrg";

function LiveBody() {
  const { isHotel } = useDemoOrg();
  if (isHotel) return <HotelLiveShell />;
  return <LiveSpatialShell />;
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="ls-root ls-in-shell" aria-busy="true" data-testid="ls-loading" />
      }
    >
      <LiveBody />
    </Suspense>
  );
}
