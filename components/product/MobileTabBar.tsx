"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type HTMLAttributes } from "react";
import { usePathname } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { navBadgesForScope } from "@/lib/radr/navAttention";
import {
  HEADER_MORE_NAV,
  isNavActive,
  MOBILE_TABS,
} from "@/lib/product/appNav";

type Props = {
  /** Opens the utility rail / drawer for More destinations. */
  onOpenMore?: () => void;
};

/** Primary mobile tabs — mirrors core destinations only. */
export function MobileTabBar({ onOpenMore }: Props) {
  const pathname = usePathname() || "/app";
  const { locationScope, locationMode, comparisonLocationIds, roleView } =
    useProduct();
  const { session } = useDemoOrg();
  const badgeScope =
    locationMode === "comparison" && comparisonLocationIds.length >= 2
      ? "all"
      : locationScope;
  const badges = useMemo(
    () => navBadgesForScope(badgeScope, roleView, session.vertical),
    [badgeScope, roleView, session.vertical],
  );
  const [desktop, setDesktop] = useState(false);

  const moreActive = HEADER_MORE_NAV.some((i) =>
    isNavActive(pathname, i.href, i.exact),
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <nav
      className="rp-mobile-tabs"
      aria-label="Mobile primary"
      aria-hidden={desktop || undefined}
      {...(desktop
        ? ({ inert: true } as HTMLAttributes<HTMLElement>)
        : {})}
    >
      {MOBILE_TABS.map((tab) => {
        if (tab.id === "more") {
          return (
            <button
              key={tab.id}
              type="button"
              className="rp-mobile-tab"
              tabIndex={desktop ? -1 : undefined}
              aria-label="More · Memory, Locations, Connections, Data Health, Dashboards, Settings"
              data-active={moreActive ? "true" : undefined}
              onClick={() => onOpenMore?.()}
            >
              <span className="rp-mobile-tab-label" aria-hidden="true">
                More
              </span>
            </button>
          );
        }
        const badge = tab.badgePath ? badges[tab.badgePath] : undefined;
        const accessibleName = badge
          ? `${tab.shortLabel ?? tab.label}, ${badge.label}`
          : (tab.shortLabel ?? tab.label);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="rp-mobile-tab"
            tabIndex={desktop ? -1 : undefined}
            aria-label={accessibleName}
            data-active={
              isNavActive(pathname, tab.href, tab.exact) ? "true" : undefined
            }
          >
            <span className="rp-mobile-tab-label" aria-hidden="true">
              {tab.shortLabel ?? tab.label}
            </span>
            {badge ? (
              <span
                className="rp-mobile-tab-badge"
                data-tone={badge.tone}
                aria-hidden="true"
                title={badge.label}
              >
                <span className="rp-nav-badge-count">{badge.count}</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
