"use client";

import { Suspense } from "react";
import { RadrDecisions } from "@/components/product/decisions/workspace";

export default function DecisionsPage() {
  return (
    <Suspense fallback={null}>
      <RadrDecisions />
    </Suspense>
  );
}
