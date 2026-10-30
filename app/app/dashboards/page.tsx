"use client";

import { Suspense } from "react";
import { DashboardsShell } from "@/components/product/dashboards/engine/DashboardsShell";

export default function DashboardsLibraryPage() {
  return (
    <Suspense fallback={<div className="db-root">Loading dashboards…</div>}>
      <DashboardsShell />
    </Suspense>
  );
}
