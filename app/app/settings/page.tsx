"use client";

import { Suspense } from "react";
import { SettingsShell } from "@/components/product/settings/engine/SettingsShell";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="se-root" aria-busy="true">
          <div className="se-main">
            <header className="se-head">
              <h1>Settings</h1>
              <p>How RADR is governed</p>
            </header>
          </div>
        </div>
      }
    >
      <SettingsShell />
    </Suspense>
  );
}
