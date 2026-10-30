import { Suspense } from "react";
import { ValueShell } from "@/components/product/value/engine/ValueShell";

export default function ValuePage() {
  return (
    <Suspense fallback={null}>
      <ValueShell />
    </Suspense>
  );
}
