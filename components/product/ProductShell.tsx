"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { ProductNav } from "./ProductNav";
import { AskRadrProvider } from "./ask/AskRadrContext";
import { OperatingCanvasUrlSync } from "./useOperatingCanvasUrl";
import { LocationSwitcher } from "./LocationSwitcher";
import { TopbarPulse } from "./TopbarPulse";
import { ShiftClock } from "./ShiftClock";
import { useDemoServicePhase } from "./useDemoServicePhase";
import { ProductProvider } from "@/lib/product/store";
import {
  environmentChrome,
  getRadrEnvironment,
  isSyntheticData,
} from "@/lib/radr/env";
import { MobileTabBar } from "./MobileTabBar";

function ShellChrome({
  children,
  mobileNav,
  setMobileNav,
}: {
  children: React.ReactNode;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
}) {
  const pathname = usePathname() || "";
  const isLab = pathname.startsWith("/app/lab");
  const env = getRadrEnvironment();
  const chrome = environmentChrome(env);
  const synthetic = isSyntheticData(env);
  useDemoServicePhase(synthetic);

  /* Lab routes: providers only — no SaaS sidebar / topbar. */
  if (isLab) {
    return (
      <div className="rp-root rp-root-lab" data-radr-env={env} data-theme="light">
        <Suspense fallback={null}>
          <OperatingCanvasUrlSync />
        </Suspense>
        {children}
      </div>
    );
  }

  return (
    <div className="rp-root" data-radr-env={env} data-theme="light">
      <Suspense fallback={null}>
        <OperatingCanvasUrlSync />
      </Suspense>
      <div className="rp-frame" data-nav={mobileNav ? "open" : "closed"}>
        <ProductNav onNavigate={() => setMobileNav(false)} />
        <div className="rp-main">
          <header className="rp-topbar">
            <button
              type="button"
              className="rp-menu-btn"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              Menu
            </button>
            <TopbarPulse />
            <div className="rp-topbar-spacer">
              <ShiftClock />
            </div>
            <div className="rp-top-status">
              <p className="rp-live">
                <span
                  className="rp-live-dot"
                  data-demo={synthetic ? "true" : "false"}
                />
                <span>{synthetic ? "DEMO" : chrome}</span>
              </p>
            </div>
          </header>
          <div className="rp-content">{children}</div>
          <MobileTabBar />
        </div>
        {mobileNav ? (
          <button
            type="button"
            className="rp-nav-scrim"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          />
        ) : null}
      </div>
      <LocationSwitcher />
    </div>
  );
}

export function ProductShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <ProductProvider>
      <AskRadrProvider>
        <Suspense fallback={null}>
          <ShellChrome mobileNav={mobileNav} setMobileNav={setMobileNav}>
            {children}
          </ShellChrome>
        </Suspense>
      </AskRadrProvider>
    </ProductProvider>
  );
}
