import { Suspense } from "react";
import { IntelShell } from "@/components/product/intelligence/engine/IntelShell";

export default function IntelligencePage() {
  return (
    <Suspense fallback={null}>
      <IntelShell />
    </Suspense>
  );
}
