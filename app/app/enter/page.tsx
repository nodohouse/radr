"use client";

/**
 * RADR demo gateway — choose Restaurant or Hotel operating world.
 *
 * Deep links:
 *   /app/enter
 *   /app/enter?vertical=restaurant   → preselect restaurant
 *   /app/enter?vertical=hotel        → preselect hotel
 *   /app/enter?vertical=restaurant&go=1 → enter immediately
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RadrGateway } from "@/components/product/enter/RadrGateway";
import { parseEnterVertical } from "@/lib/radr/demo/enterWorlds";

function DemoEnterInner() {
  const search = useSearchParams();
  const preselect = parseEnterVertical(search.get("vertical"));
  const go = search.get("go");
  const autoEnter =
    Boolean(preselect) &&
    (go === "1" || go === "true" || go === "enter");

  return <RadrGateway preselect={preselect} autoEnter={autoEnter} />;
}

export default function DemoEnterPage() {
  return (
    <Suspense fallback={null}>
      <DemoEnterInner />
    </Suspense>
  );
}
