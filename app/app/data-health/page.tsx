"use client";

import { Suspense } from "react";
import { DataHealthShell } from "@/components/product/data-health/engine/DataHealthShell";

export default function DataHealthPage() {
  return (
    <Suspense fallback={<div className="dh-root">Loading Data Health…</div>}>
      <DataHealthShell />
    </Suspense>
  );
}
