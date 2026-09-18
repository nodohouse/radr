"use client";

import { Suspense } from "react";
import { DecisionLedger } from "@/components/product/decisions/DecisionLedger";

export default function DecisionsPage() {
  return (
    <Suspense fallback={null}>
      <DecisionLedger />
    </Suspense>
  );
}
