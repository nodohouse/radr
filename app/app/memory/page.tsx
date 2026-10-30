import { Suspense } from "react";
import { MemoryShell } from "@/components/product/memory/engine/MemoryShell";

export default function MemoryPage() {
  return (
    <Suspense fallback={null}>
      <MemoryShell />
    </Suspense>
  );
}
