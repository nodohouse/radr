"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { navBadgesForScope } from "@/lib/radr/navAttention";

const TABS = [
  { href: "/app", label: "Center", exact: true },
  { href: "/app/decisions", label: "Decisions" },
  { href: "/app/value", label: "Value" },
  { href: "/app/memory", label: "Memory" },
] as const;

function isOn(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** One-handed mobile primary nav. Ask stays in the top bar. */
export function MobileTabBar() {
  const pathname = usePathname() || "/app";
  const { locationScope, locationMode, comparisonLocationIds, roleView } =
    useProduct();
  const badgeScope =
    locationMode === "comparison" && comparisonLocationIds.length >= 2
      ? "all"
      : locationScope;
  const badges = useMemo(
    () => navBadgesForScope(badgeScope, roleView),
    [badgeScope, roleView],
  );

  return (
    <nav className="rp-mobile-tabs" aria-label="Primary">
      {TABS.map((tab) => {
        const badge = badges[tab.href];
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="rp-mobile-tab"
            data-active={
              isOn(pathname, tab.href, "exact" in tab ? tab.exact : false)
                ? "true"
                : undefined
            }
          >
            <span className="rp-mobile-tab-label">{tab.label}</span>
            {badge ? (
              <span
                className="rp-mobile-tab-badge"
                data-tone={badge.tone}
                aria-label={badge.label}
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
