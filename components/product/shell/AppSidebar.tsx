"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { DemoOrgSwitcher } from "@/components/product/DemoOrgSwitcher";
import { isSyntheticData } from "@/lib/radr/env";
import { useAskRadrOptional } from "@/components/product/ask/AskRadrContext";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { roleContextFor } from "@/lib/radr/product/personas";
import { dataHealthSummaryForRole } from "@/lib/radr/product/dataHealthCanonical";
import {
  badgeForPath,
  navBadgesForScope,
  type NavBadge,
} from "@/lib/radr/navAttention";
import {
  isNavActive,
  railMoreNavForVertical,
  type AppNavItem,
} from "@/lib/product/appNav";
import { railNavForPersona } from "@/lib/radr/product/controlCenterLens";
import {
  pinnedDashboards,
  readDashboards,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import { NAV_ICONS } from "./navIcons";

type Props = {
  onNavigate?: () => void;
  forceOpen?: boolean;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  /**
   * Immersive Live: collapsed rail by default, expand on hover as overlay.
   * Does not keep desktop permanently expanded.
   */
  overlayRail?: boolean;
};

/** Hover linger before expand — ignore boundary skims. */
const HOVER_EXPAND_MS = 200;
/** Leave tolerance so the rail does not flicker between items. */
const HOVER_COLLAPSE_MS = 160;

function Badge({ badge, collapsed }: { badge: NavBadge; collapsed?: boolean }) {
  return (
    <span
      className="rp-rail-badge"
      data-tone={badge.tone}
      data-collapsed={collapsed ? "true" : undefined}
      title={badge.label}
      aria-hidden="true"
    >
      {badge.count}
    </span>
  );
}

function RailLink({
  item,
  expanded,
  onNavigate,
  badge,
  healthDot,
}: {
  item: AppNavItem;
  expanded: boolean;
  onNavigate?: () => void;
  badge?: NavBadge | null;
  healthDot?: "warn" | "bad" | null;
}) {
  const pathname = usePathname() || "/app";
  const active = isNavActive(pathname, item.href, item.exact);
  const Icon = NAV_ICONS[item.id];
  const accessibleName = badge
    ? `${item.label}, ${badge.label}`
    : item.label;

  return (
    <Link
      href={item.href}
      className="rp-rail-link"
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={accessibleName}
      onClick={onNavigate}
    >
      <span className="rp-rail-ico" aria-hidden="true">
        {Icon ? <Icon /> : null}
        {!expanded && badge && badge.count > 0 ? (
          <Badge badge={badge} collapsed />
        ) : null}
        {!expanded && healthDot ? (
          <em className="rp-rail-health-pip" data-tone={healthDot} />
        ) : null}
      </span>
      <span className="rp-rail-label" aria-hidden={!expanded || undefined}>
        {item.label}
      </span>
      {expanded && badge && badge.count > 0 ? <Badge badge={badge} /> : null}
      {expanded && healthDot ? (
        <em className="rp-rail-health-pip" data-tone={healthDot} aria-hidden="true" />
      ) : null}
      {!expanded ? (
        <span className="rp-rail-tip" role="tooltip" aria-hidden="true">
          {item.label}
          {badge && badge.count > 0 ? ` · ${badge.count}` : ""}
        </span>
      ) : null}
    </Link>
  );
}

export function AppSidebar({
  onNavigate,
  forceOpen = false,
  pinned = false,
  onPinnedChange: _onPinnedChange,
  overlayRail = false,
}: Props) {
  const pathname = usePathname() || "/app";
  const router = useRouter();
  const { roleView, locationScope, locationMode, comparisonLocationIds } =
    useProduct();
  const { session, isHotel } = useDemoOrg();
  const role = roleContextFor(roleView, session.vertical);
  const ask = useAskRadrOptional();
  const tipId = useId();
  const menuId = useId();
  const hoverTimer = useRef<number | null>(null);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverLocked, setHoverLocked] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const collapseHover = useCallback((lock = false) => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setHovered(false);
    setFocused(false);
    setUserOpen(false);
    if (lock) setHoverLocked(true);
    if (typeof document !== "undefined") {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest(".rp-rail")) {
        active.blur();
      }
    }
  }, []);

  useEffect(() => {
    if (!forceOpen) {
      collapseHover(false);
    }
  }, [pathname, forceOpen, collapseHover]);

  useEffect(() => {
    if (!userOpen) return;
    function onDoc(e: MouseEvent) {
      if (!userRef.current?.contains(e.target as Node)) setUserOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUserOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  const handleNavigate = useCallback(() => {
    if (!forceOpen) {
      collapseHover(true);
    }
    onNavigate?.();
  }, [forceOpen, collapseHover, onNavigate]);

  const expanded = overlayRail
    ? forceOpen || ((hovered || focused) && !hoverLocked)
    : forceOpen || isDesktop || ((hovered || focused) && !hoverLocked);
  const hideFromA11y = !isDesktop && !forceOpen;

  const badgeScope =
    locationMode === "comparison" && comparisonLocationIds.length >= 2
      ? "all"
      : locationScope;
  const badges = useMemo(
    () => navBadgesForScope(badgeScope, roleView, session.vertical),
    [badgeScope, roleView, session.vertical],
  );

  const health = useMemo(
    () => dataHealthSummaryForRole(roleView, session.vertical),
    [roleView, session.vertical],
  );
  const healthDot =
    health.unhealthyCount > 0
      ? health.tone === "bad"
        ? ("bad" as const)
        : ("warn" as const)
      : null;

  const primaryNav = useMemo(
    () => railNavForPersona(roleView, session.vertical),
    [roleView, session.vertical],
  );
  const moreNav = useMemo(
    () => railMoreNavForVertical(session.vertical),
    [session.vertical],
  );

  const [pinnedDashes, setPinnedDashes] = useState<RadrDashboard[]>([]);
  useEffect(() => {
    const sync = () => setPinnedDashes(pinnedDashboards(readDashboards()));
    sync();
    window.addEventListener("radr-dashboards-changed", sync);
    return () => window.removeEventListener("radr-dashboards-changed", sync);
  }, []);

  const leaveTimer = useRef<number | null>(null);

  return (
    <aside
      className="rp-rail"
      data-expanded={expanded ? "true" : "false"}
      data-pinned={
        overlayRail ? (pinned ? "true" : "false") : pinned || isDesktop ? "true" : "false"
      }
      data-overlay={overlayRail ? "true" : undefined}
      data-shell="operating"
      aria-label="RADR navigation"
      aria-hidden={hideFromA11y || undefined}
      {...(hideFromA11y
        ? ({ inert: true } as HTMLAttributes<HTMLElement>)
        : {})}
      onMouseEnter={() => {
        if (hoverLocked) return;
        if (leaveTimer.current) {
          window.clearTimeout(leaveTimer.current);
          leaveTimer.current = null;
        }
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
        hoverTimer.current = window.setTimeout(() => {
          setHovered(true);
        }, HOVER_EXPAND_MS);
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) {
          window.clearTimeout(hoverTimer.current);
          hoverTimer.current = null;
        }
        if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
        leaveTimer.current = window.setTimeout(() => {
          setHovered(false);
          setHoverLocked(false);
          setUserOpen(false);
          leaveTimer.current = null;
        }, HOVER_COLLAPSE_MS);
      }}
      onFocusCapture={() => {
        if (!hoverLocked) setFocused(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
          setUserOpen(false);
        }
      }}
    >
      <div className="rp-rail-inner">
        <div className="rp-rail-brand-row">
          <Link
            href="/app"
            className="rp-rail-brand"
            aria-label="RADR Control Center"
            onClick={handleNavigate}
          >
            <span className="rp-rail-mark" aria-hidden="true">
              <FrozenRadrLogo
                variant="mark"
                theme="dark"
                width={22}
                decorative
              />
            </span>
            <span className="rp-rail-word">
              <FrozenRadrLogo
                variant="wordmark"
                theme="dark"
                size="sm"
                decorative
              />
            </span>
          </Link>
        </div>

        <nav className="rp-rail-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <RailLink
              key={item.id}
              item={item}
              expanded={expanded}
              onNavigate={handleNavigate}
              badge={
                item.badgePath
                  ? badgeForPath(badges, item.badgePath)
                  : null
              }
            />
          ))}
        </nav>

        {pinnedDashes.length > 0 ? (
          <nav
            className="rp-rail-util rp-rail-pinned-dashes"
            aria-label="Pinned dashboards"
            data-pinned-dashboards-nav="true"
          >
            {expanded ? (
              <p className="rp-rail-util-label" aria-hidden="true">
                Pinned
              </p>
            ) : null}
            {pinnedDashes.map((d) => {
              const item: AppNavItem = {
                id: `dash-${d.id}`,
                href: `/app/dashboards/${d.id}`,
                label: d.name,
              };
              return (
                <RailLink
                  key={d.id}
                  item={item}
                  expanded={expanded}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </nav>
        ) : null}

        <div className="rp-rail-foot">
          {moreNav.length > 0 ? (
            <nav className="rp-rail-util" aria-label="More">
              {expanded ? (
                <p className="rp-rail-util-label" aria-hidden="true">
                  More
                </p>
              ) : null}
              {moreNav.map((item) => (
                <RailLink
                  key={item.id}
                  item={item}
                  expanded={expanded}
                  onNavigate={handleNavigate}
                  healthDot={item.id === "data-health" ? healthDot : null}
                />
              ))}
            </nav>
          ) : null}

          <div className="rp-rail-user" ref={userRef}>
            {expanded && !isHotel ? (
              <div
                className="rp-rail-venue-thumb"
                aria-hidden
                style={{
                  backgroundImage:
                    "url(/demo/facilities/radr-restaurant-atmosphere.jpg)",
                }}
              />
            ) : null}
            <button
              type="button"
              className="rp-rail-user-btn"
              aria-expanded={userOpen}
              aria-haspopup="menu"
              aria-controls={userOpen ? menuId : undefined}
              aria-label={`${role.firstName} · account`}
              onClick={() => setUserOpen((v) => !v)}
            >
              <span className="rp-rail-avatar" aria-hidden="true">
                {role.initials}
              </span>
              <span className="rp-rail-user-meta">
                <strong>{role.firstName}</strong>
                <em>{role.shortLabel ?? role.label}</em>
              </span>
            </button>
            {userOpen ? (
              <div
                id={menuId}
                className="rp-rail-user-menu"
                role="menu"
                aria-label="Account"
              >
                {isSyntheticData() ? (
                  <div className="rp-rail-user-demo" role="none">
                    <DemoOrgSwitcher className="rp-rail-demo-org" />
                  </div>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    router.push("/app/settings?section=preferences");
                    handleNavigate();
                  }}
                >
                  Preferences
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    router.push("/app/settings?section=organization");
                    handleNavigate();
                  }}
                >
                  Organization
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    router.push("/app/settings");
                    handleNavigate();
                  }}
                >
                  Settings
                </button>
                {ask ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false);
                      ask.openAsk();
                    }}
                  >
                    Ask RADR
                    <kbd>⌘K</kbd>
                  </button>
                ) : null}
              </div>
            ) : null}
            {!expanded ? (
              <span className="rp-rail-tip" role="tooltip" id={tipId}>
                {role.firstName}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
