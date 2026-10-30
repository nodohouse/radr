"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "./shell/AppSidebar";
import { SIDEBAR_PIN_KEY } from "@/lib/product/appNav";

/**
 * @deprecated Use AppSidebar via ProductShell. Thin wrapper for residual imports.
 */
export function ProductNav({ onNavigate }: { onNavigate?: () => void }) {
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    try {
      setPinned(localStorage.getItem(SIDEBAR_PIN_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <AppSidebar
      pinned={pinned}
      onPinnedChange={setPinned}
      onNavigate={onNavigate}
    />
  );
}
