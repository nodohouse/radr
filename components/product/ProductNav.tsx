"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState, Suspense } from "react";
import { RadrDelta } from "@/components/radr/RadrDelta";
import { useProduct } from "@/lib/product/store";
import { locationLabel } from "@/lib/product/demo/dashboard";
import { roleContextFor } from "@/lib/radr/product/personas";
import { useDemoServicePhase } from "@/components/product/useDemoServicePhase";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";
import {
  getLocationById,
  shortLocationName,
} from "@/lib/radr/locationCatalog";
import {
  badgeForPath,
  navBadgesForScope,
  type NavBadge,
} from "@/lib/radr/navAttention";
import { PerspectiveBlock } from "@/components/product/PerspectiveBlock";
import { WhenScopeStrip } from "@/components/product/WhenScopeStrip";
import { DemoVerticalSwitcher } from "@/components/product/DemoVerticalSwitcher";
import { useAskRadrOptional } from "@/components/product/ask/AskRadrContext";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

/** Thin rail: Control Center · Decisions · Value · Memory */
const PRIMARY_NAV: NavItem[] = [
  { href: "/app", label: "Control Center", exact: true },
  { href: "/app/decisions", label: "Decisions" },
  { href: "/app/value", label: "Value" },
  { href: "/app/memory", label: "Memory" },
];

/** Explore drawer — secondary intelligence surfaces */
const EXPLORE_NAV: NavItem[] = [
  { href: "/app/service", label: "Service Map" },
  { href: "/app/intelligence/menu", label: "Menu Intelligence" },
  { href: "/app/intelligence/margin", label: "Margin Response" },
  { href: "/app/locations", label: "Locations" },
  { href: "/app/integrations", label: "Integrations" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBadgePill({ badge }: { badge: NavBadge }) {
  return (
    <span
      className="rp-nav-badge"
      data-tone={badge.tone}
      aria-label={badge.label}
      title={badge.label}
    >
      <span className="rp-nav-badge-count">{badge.count}</span>
    </span>
  );
}

function NavRow({
  href,
  active,
  onNavigate,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  badge?: NavBadge | null;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rp-nav-link"
      data-active={active ? "true" : "false"}
      data-badge={badge ? badge.tone : undefined}
      onClick={onNavigate}
    >
      <span className="rp-nav-link-indicator" aria-hidden="true" />
      <span className="rp-nav-link-main">
        {children}
        {badge ? <NavBadgePill badge={badge} /> : null}
      </span>
    </Link>
  );
}

export function ProductNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<aside className="rp-nav" aria-hidden="true" />}>
      <ProductNavInner onNavigate={onNavigate} />
    </Suspense>
  );
}

function ProductNavInner({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/app";
  const {
    roleView,
    locationScope,
    locationMode,
    comparisonLocationIds,
  } = useProduct();
  const roleProfile = roleContextFor(roleView);
  const ask = useAskRadrOptional();
  const [exploreOpen, setExploreOpen] = useState(() =>
    EXPLORE_NAV.some((i) => isActive(pathname, i.href)),
  );

  const locName = useMemo(() => {
    if (locationMode === "comparison" && comparisonLocationIds.length >= 2) {
      return comparisonLocationIds
        .map((id) => {
          const loc = getLocationById(id);
          return loc ? shortLocationName(loc.name) : id;
        })
        .join(", ");
    }
    return locationLabel(locationScope);
  }, [locationMode, comparisonLocationIds, locationScope]);

  const synthetic = isSyntheticData(getRadrEnvironment());
  const { phase, setPhase, ready: phaseReady } = useDemoServicePhase(synthetic);

  const badgeScope =
    locationMode === "comparison" && comparisonLocationIds.length >= 2
      ? "all"
      : locationScope;
  const badges = useMemo(
    () => navBadgesForScope(badgeScope, roleView),
    [badgeScope, roleView],
  );

  const exploreActive = EXPLORE_NAV.some((i) => isActive(pathname, i.href));

  return (
    <aside className="rp-nav rp-nav-thin" aria-label="RADR control rail">
      <div className="rp-nav-top">
        <div className="rp-nav-identity">
          <Link
            href="/app"
            className="rp-nav-brand"
            aria-label="RADR Control Center"
            onClick={onNavigate}
          >
            <span className="rp-nav-mark" aria-hidden="true">
              <RadrDelta variant="nav" height={20} />
            </span>
          </Link>

          <PerspectiveBlock
            locationLabel={locName}
            phase={phaseReady ? phase : null}
            onChangePhase={synthetic ? setPhase : undefined}
            synthetic={synthetic}
            onNavigate={onNavigate}
          />
        </div>
        {phaseReady ? (
          <div className="rp-rail-filters" aria-label="Analysis period">
            <WhenScopeStrip
              phase={phase}
              onChangePhase={synthetic ? setPhase : () => {}}
              enabled={synthetic}
            />
            {synthetic ? <DemoVerticalSwitcher /> : null}
          </div>
        ) : null}
      </div>

      <nav className="rp-nav-links" aria-label="RADR product">
        <div className="rp-nav-section">
          {PRIMARY_NAV.map((item) => (
            <NavRow
              key={item.href}
              href={item.href}
              active={isActive(pathname, item.href, item.exact)}
              onNavigate={onNavigate}
              badge={badgeForPath(badges, item.href)}
            >
              <span className="rp-nav-link-label">{item.label}</span>
            </NavRow>
          ))}
        </div>

        <div className="rp-nav-section rp-nav-explore">
          <button
            type="button"
            className="rp-nav-explore-toggle"
            aria-expanded={exploreOpen}
            data-active={exploreActive ? "true" : undefined}
            onClick={() => setExploreOpen((o) => !o)}
          >
            Explore
          </button>
          {exploreOpen ? (
            <div className="rp-nav-explore-drawer">
              {EXPLORE_NAV.map((item) => (
                <NavRow
                  key={item.href}
                  href={item.href}
                  active={isActive(pathname, item.href, item.exact)}
                  onNavigate={onNavigate}
                >
                  <span className="rp-nav-link-label">{item.label}</span>
                </NavRow>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <div className="rp-nav-foot">
        {ask ? (
          <button
            type="button"
            className="rp-nav-ask"
            onClick={() => ask.openAsk()}
          >
            Ask RADR
            <kbd>⌘K</kbd>
          </button>
        ) : (
          <Link href="/app/ask" className="rp-nav-ask" onClick={onNavigate}>
            Ask RADR
            <kbd>⌘K</kbd>
          </Link>
        )}
        <div className="rp-nav-user-row">
          <div className="rp-nav-avatar" aria-hidden="true">
            {roleProfile.initials}
          </div>
          <div className="rp-nav-user-block">
            <p className="rp-nav-user">{roleProfile.firstName}</p>
          </div>
          <Link href="/app/settings" className="rp-nav-signout" onClick={onNavigate}>
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
