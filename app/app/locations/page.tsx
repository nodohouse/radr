import { Suspense } from "react";
import { LocationsShell } from "@/components/product/locations/engine/LocationsShell";

export default function LocationsPage() {
  return (
    <Suspense fallback={null}>
      <LocationsShell />
    </Suspense>
  );
}
