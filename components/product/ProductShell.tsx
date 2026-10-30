"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./shell/AppSidebar";
import { GlobalOperatingHeader } from "./shell/GlobalOperatingHeader";
import { AskRadrProvider } from "./ask/AskRadrContext";
import { AskRadr } from "./ask/AskRadr";
import { IntelligencePinProvider } from "./intelligence/IntelligencePinContext";
import { FocusRailProvider, FocusRail } from "./focus/FocusRail";
import { OperatingCanvasUrlSync } from "./useOperatingCanvasUrl";
import { LocationSwitcher } from "./LocationSwitcher";
import { useDemoServicePhase } from "./useDemoServicePhase";
import { ProductProvider, useProduct } from "@/lib/product/store";
import { RoutePeriodSync } from "@/lib/product/radrContext/RoutePeriodSync";
import {
  getRadrEnvironment,
  isSyntheticData,
} from "@/lib/radr/env";
import { MobileTabBar } from "./MobileTabBar";
import { SIDEBAR_PIN_KEY } from "@/lib/product/appNav";
import { useShellNavMode } from "./shell/useShellBreakpoint";

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
  const { contextReady } = useProduct();
  const isLiveV2 = pathname.startsWith("/app/lab/live-v2");
  /** Other lab surfaces stay bare; Live V2 uses the real product shell. */
  const isLab = pathname.startsWith("/app/lab") && !isLiveV2;
  const isEnter = pathname === "/app/enter" || pathname.startsWith("/app/enter/");
  const isControlCenter = pathname === "/app" || pathname === "/app/";
  const isLive =
    isLiveV2 ||
    pathname === "/app/live" ||
    pathname.startsWith("/app/live/");
  const env = getRadrEnvironment();
  const synthetic = isSyntheticData(env);
  useDemoServicePhase(synthetic);
  const navMode = useShellNavMode();
  /** Desktop/tablet: left operating rail. Mobile: bottom tabs + sheet rail when open. */
  const showSidebar =
    navMode === "desktop" ||
    navMode === "drawer" ||
    (navMode === "mobile" && mobileNav);
  const showMobileTabs = navMode === "mobile";
  const showHamburger = navMode === "drawer" || navMode === "mobile";
  const railPersistent = navMode === "desktop" || navMode === "drawer";

  /**
   * Drive-in / drive-out: rail always overlays content.
   * Collapsed by default · expands on hover · never pushes layout.
   * Clicking a route does not pin the menu open.
   */
  const overlayRail = true;
  const pinned = false;
  const setPinned = (_v: boolean) => {
    try {
      localStorage.setItem(SIDEBAR_PIN_KEY, "0");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_PIN_KEY, "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("rp-overflow-guard");
    return () => document.documentElement.classList.remove("rp-overflow-guard");
  }, []);

  useEffect(() => {
    if (navMode === "desktop") setMobileNav(false);
  }, [navMode, setMobileNav]);

  if (isLab || isEnter) {
    return (
      <div
        className={isEnter ? "rp-root rp-root-enter" : "rp-root rp-root-lab"}
        data-radr-env={env}
        data-theme="light"
      >
        <Suspense fallback={null}>
          <OperatingCanvasUrlSync />
        </Suspense>
        {children}
      </div>
    );
  }

  return (
    <div
      className="rp-root rp-shell-v2 rp-premium"
      data-radr-env={env}
      data-theme="daylight"
      data-surface="operating"
      data-page={
        isControlCenter ? "control-center" : isLive ? "live" : undefined
      }
      data-rail-pinned={pinned ? "true" : "false"}
      data-rail-overlay={overlayRail ? "true" : undefined}
      data-nav-mode="rail"
      data-shell-nav={navMode}
      data-context-ready={contextReady ? "true" : "false"}
    >
      <Suspense fallback={null}>
        <OperatingCanvasUrlSync />
        <RoutePeriodSync />
      </Suspense>
      <div className="rp-frame-v2" data-nav={mobileNav ? "open" : "closed"}>
        {railPersistent ? (
          <div className="rp-rail-spacer" aria-hidden="true" />
        ) : null}
        {showSidebar ? (
          <AppSidebar
            pinned={pinned}
            onPinnedChange={setPinned}
            overlayRail={overlayRail}
            forceOpen={
              navMode === "mobile" || navMode === "drawer" ? mobileNav : false
            }
            onNavigate={() => setMobileNav(false)}
          />
        ) : null}
        <div className="rp-main-v2">
          <GlobalOperatingHeader
            onOpenNav={() => setMobileNav(true)}
            navMode={navMode}
            showHamburger={showHamburger}
          />
          <a className="px-skip" href="#product-content">Skip to content</a>
          <main id="product-content" className="rp-content-v2" tabIndex={-1}>{children}<p className="px-workspace-note">DEMO WORKSPACE · Illustrative data · No external system writes</p></main>
          {showMobileTabs ? (
            <MobileTabBar onOpenMore={() => setMobileNav(true)} />
          ) : null}
        </div>
        {(navMode === "mobile" || navMode === "drawer") && mobileNav ? (
          <button
            type="button"
            className="rp-rail-scrim"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          />
        ) : null}
      </div>
      <LocationSwitcher />
      <AskRadr />
      <FocusRail />
    </div>
  );
}

export function ProductShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <ProductProvider>
      <AskRadrProvider>
        <IntelligencePinProvider>
          <FocusRailProvider>
            <Suspense fallback={null}>
              <ShellChrome mobileNav={mobileNav} setMobileNav={setMobileNav}>
                {children}
              </ShellChrome>
            </Suspense>
          </FocusRailProvider>
        </IntelligencePinProvider>
      </AskRadrProvider>
    </ProductProvider>
  );
}
