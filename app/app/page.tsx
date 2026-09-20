"use client";

import { Suspense } from "react";
import { ControlCenter } from "@/components/product/control-center/ControlCenter";

export default function ControlCenterPage() {
  return (
    <div className="rp-command rp-command-cc">
      <Suspense fallback={null}>
        <ControlCenter />
      </Suspense>
    </div>
  );
}
