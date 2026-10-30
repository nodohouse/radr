"use client";

/**
 * Legacy CFO Control Center URL → canonical /app with CFO lens.
 * No bare parallel shell; preserves AppShell + context model.
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useProduct } from "@/lib/product/store";
import { parseCfoIndustry } from "@/lib/product/cfoControlCenter";
import { ensureDemoOrgForVertical } from "@/lib/radr/demo/verticalScope";

function ControlCenterRedirectInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { setRoleView, setLocationScope, setPeriod, contextReady } =
    useProduct();
  const industry = parseCfoIndustry(search.get("industry"));

  useEffect(() => {
    if (!contextReady) return;
    const vertical = industry === "hotels" ? "hotel" : "restaurant";
    ensureDemoOrgForVertical(vertical);
    setRoleView("cfo");
    setLocationScope("all");
    setPeriod("mtd");
    router.replace("/app?stay=1");
  }, [
    contextReady,
    industry,
    router,
    setRoleView,
    setLocationScope,
    setPeriod,
  ]);

  return (
    <div className="rp-root" data-page="control-center-redirect" aria-busy="true">
      <p style={{ padding: 24, color: "#626a65", fontFamily: "inherit" }}>
        Opening Control Center…
      </p>
    </div>
  );
}

export default function CfoControlCenterPage() {
  return (
    <Suspense fallback={null}>
      <ControlCenterRedirectInner />
    </Suspense>
  );
}
