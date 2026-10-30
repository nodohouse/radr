"use client";

import { Suspense } from "react";
import { GuestShell } from "@/components/product/guests";

export default function GuestsPage() {
  return (
    <Suspense fallback={null}>
      <GuestShell />
    </Suspense>
  );
}
