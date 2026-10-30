"use client";

/** Lab alias — product Live is `/app/live`. */
import { Suspense } from "react";
import { LiveSpatialShell } from "@/components/product/live-spatial/LiveSpatialShell";

export default function LabLiveV2Page() {
  return (
    <Suspense fallback={<div className="ls-root ls-in-shell" aria-busy="true" />}>
      <LiveSpatialShell />
    </Suspense>
  );
}
