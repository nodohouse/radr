import { Suspense } from "react";
import { ConnectionsShell } from "@/components/product/connections/engine/ConnectionsShell";

export default function ConnectionsPage() {
  return (
    <Suspense fallback={null}>
      <ConnectionsShell />
    </Suspense>
  );
}
