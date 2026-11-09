"use client";

/**
 * Product Live — spatial operating model.
 * Restaurant: shared 3D service floor with operating overview.
 * Hotel: Daylight property twin (HotelLiveShell).
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HotelLiveShell } from "@/components/product/hotel-live/HotelLiveShell";
import { ReferenceLive } from "@/components/product/reference/ReferencePages";
import { LiveSpatialShell } from "@/components/product/live-spatial/LiveSpatialShell";
import { useDemoOrgHydrated } from "@/components/product/useDemoOrg";

function LiveBody() {
  const { isHotel, ready } = useDemoOrgHydrated();
  const search = useSearchParams();
  if (!ready)
    return (
      <div
        className="ls-root ls-in-shell"
        aria-busy="true"
        data-testid="ls-loading"
      />
    );
  if (isHotel) return <HotelLiveShell />;
  const overview =
    search.get("view") === "operations" ||
    search.get("level") === "estate" ||
    search.has("zone") ||
    search.has("station") ||
    search.get("layout") === "detail";
  return overview ? <LiveSpatialShell /> : <ReferenceLive />;
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div
          className="ls-root ls-in-shell"
          aria-busy="true"
          data-testid="ls-loading"
        />
      }
    >
      <LiveBody />
    </Suspense>
  );
}
