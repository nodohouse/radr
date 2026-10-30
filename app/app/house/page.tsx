"use client";

/**
 * Back of House — Kitchen Operating Intelligence.
 * Presentation rebuilt to Daylight references (Overview → Captures → Critical → Prep).
 * Logic preserved from houseAttention / houseCapture.
 */

import { Suspense } from "react";
import { BohShell } from "@/components/product/house";

export default function HousePage() {
  return (
    <Suspense fallback={<div className="boh-root" style={{ padding: 24 }}>Loading kitchen…</div>}>
      <BohShell />
    </Suspense>
  );
}
