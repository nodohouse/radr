"use client";

/**
 * GlobalOperatingHeader — thin command bar + LIVE telemetry.
 * Primary destinations live in the left operating rail.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const WorkspaceSearch = dynamic(() => import("../reference/WorkspaceSearch"), { ssr: false });
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import { roleContextFor } from "@/lib/radr/product/personas";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { WorldSwitcher } from "@/components/product/WorldSwitcher";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";
import { useAskRadrOptional } from "@/components/product/ask/AskRadrContext";
import { RoleViewSwitcher } from "@/components/product/RoleViewSwitcher";
import {
  allPrimaryNavItems,
  isNavActive,
  NAV_EXPLORE,
} from "@/lib/product/appNav";
import {
  composeOperatingHeaderState,
  formatVerifiedAria,
  type OperatingHeaderState,
} from "@/lib/radr/product/operatingHeaderState";
import "./global-operating-header.css";

function pageTitle(pathname: string): string {
  if (pathname === "/app" || pathname === "/app/") return "Control Center";
  // (explicit — also matched via nav)
  if (
    pathname.startsWith("/app/live") ||
    pathname.startsWith("/app/lab/live-v2")
  ) {
    return "Live";
  }
  if (pathname.startsWith("/app/decisions/") && pathname !== "/app/decisions") {
    return "Decision";
  }
  const all = [
    ...allPrimaryNavItems(),
    ...NAV_EXPLORE,
    { href: "/app/lab/live-v2", label: "Live" },
    { href: "/app/live", label: "Live" },
    { href: "/app/dashboards", label: "Dashboards" },
    { href: "/app/settings", label: "Settings", exact: true as const },
    { href: "/app/ask", label: "Ask RADR", exact: true as const },
  ];
  const hit = all.find((i) => isNavActive(pathname, i.href, i.exact));
  return hit?.label ?? "RADR";
}

const PERIOD_OPTIONS: { id: "live" | DashPeriod; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "today", label: "Today" },
  { id: "mtd", label: "MTD" },
];

type TrayId =
  | "signals"
  | "evaluated"
  | "handling"
  | "watching"
  | "verified"
  | null;

type Props = {
  onOpenNav?: () => void;
  /** desktop = rail · drawer/mobile = hamburger opens rail sheet */
  navMode?: "desktop" | "drawer" | "mobile";
  showHamburger?: boolean;
};

function PeriodSwitcher() {
  const pathname = usePathname() || "/app";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { period, setPeriod } = useProduct();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const onControlCenter = pathname === "/app" || pathname === "/app/";
  const isLive =
    onControlCenter &&
    (searchParams.get("view") === "live" ||
      (!searchParams.get("view") &&
        (period === "today" || period === "yesterday")));

  const currentLabel = isLive
    ? "Live"
    : PERIOD_OPTIONS.find((p) => p.id === period)?.label ??
      (period === "yesterday" ? "Live" : (period ?? "mtd").toUpperCase());

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(id: "live" | DashPeriod) {
    if (id === "live") {
      setPeriod("today");
      if (onControlCenter) {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("view");
        next.delete("focus");
        next.set("stay", "1");
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      } else {
        router.push("/app?stay=1");
      }
    } else {
      setPeriod(id);
      if (onControlCenter) {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("view");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }
    }
    setOpen(false);
  }

  return (
    <div className="rp-goh-ctrl" ref={rootRef}>
      <button
        type="button"
        className="rp-goh-ctrl-btn"
        data-live={isLive ? "true" : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Time · ${currentLabel}`}
        onClick={() => setOpen((v) => !v)}
      >
        {isLive ? (
          <span className="rp-goh-live-dot" aria-hidden="true" />
        ) : (
          <span className="rp-goh-ctrl-k">Period</span>
        )}
        <span className="rp-goh-ctrl-v">{currentLabel}</span>
        <span className="rp-goh-chev" aria-hidden="true" />
      </button>
      {open ? (
        <ul
          id={listId}
          className="rp-goh-menu"
          role="listbox"
          aria-label="Time horizon"
        >
          {PERIOD_OPTIONS.map((opt) => {
            const active =
              opt.id === "live" ? isLive : !isLive && period === opt.id;
            return (
              <li key={opt.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  data-active={active ? "true" : undefined}
                  onClick={() => pick(opt.id)}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function OperatingTray({
  open,
  title,
  onClose,
  children,
  labelledBy,
  align = "left",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy: string;
  align?: "left" | "center" | "right";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="rp-goh-tray"
      data-align={align}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
    >
      <p id={labelledBy} className="rp-goh-tray-k">
        {title}
      </p>
      {children}
    </div>
  );
}

/** Dead chrome — intentionally unmounted. Attention lives in CC body, not GOH. */
function OperatingStrip({
  state,
  tray,
  setTray,
  onSelectDecision,
}: {
  state: OperatingHeaderState;
  tray: TrayId;
  setTray: (id: TrayId) => void;
  onSelectDecision: (id: string) => void;
}) {
  const signalsId = useId();
  const evalId = useId();
  const handlingId = useId();
  const watchingId = useId();
  const verifiedId = useId();
  const toggle = useCallback(
    (id: TrayId) => setTray(tray === id ? null : id),
    [tray, setTray],
  );
  const { needJudgment, compression, verified } = state;
  const pulseRest = state.signalLine.replace(
    /^(DECISION|VERIFIED|WITHIN EXPECTATIONS)\s*·?\s*/i,
    "",
  );

  return (
    <div
      className="rp-goh-strip"
      data-strip="operating"
      data-dense="true"
      data-pulse="marketing"
      aria-label="Live operating state"
    >
      <div className="rp-goh-strip-live">
        <span className="rp-goh-live-pill">LIVE</span>
        <span className="rp-goh-live-clock">{state.clockLabel}</span>
      </div>

      <div className="rp-goh-strip-primary">
        <button
          type="button"
          className="rp-goh-signal"
          data-need={needJudgment > 0 ? "true" : undefined}
          aria-expanded={tray === "signals"}
          aria-controls={tray === "signals" ? signalsId : undefined}
          aria-label={state.signalLine}
          onClick={() => toggle("signals")}
        >
          <b className="rp-goh-pulse-status">{state.pulseStatus}</b>
          <span className="rp-goh-signal-word"> · {pulseRest}</span>
        </button>
      </div>

      <div className="rp-goh-strip-mid" aria-label="Operating summary">
        <button
          type="button"
          className="rp-goh-stat"
          aria-expanded={tray === "handling"}
          aria-label={`HANDLING, ${compression.handling}`}
          onClick={() => toggle("handling")}
        >
          <em>HANDLING</em>
          <strong>{compression.handling}</strong>
        </button>
        <button
          type="button"
          className="rp-goh-stat"
          aria-expanded={tray === "watching"}
          aria-label={`WATCHING, ${compression.watching}`}
          onClick={() => toggle("watching")}
        >
          <em>WATCHING</em>
          <strong>{compression.watching}</strong>
        </button>
        <button
          type="button"
          className="rp-goh-verified"
          aria-expanded={tray === "verified"}
          aria-label={formatVerifiedAria(verified.formatted)}
          onClick={() => toggle("verified")}
        >
          <em>VERIFIED</em>
          <strong>{verified.formatted}</strong>
        </button>
        <button
          type="button"
          className="rp-goh-telemetry-quiet"
          aria-expanded={tray === "evaluated"}
          aria-label={`${compression.cleared} within expectations`}
          aria-controls={tray === "evaluated" ? evalId : undefined}
          onClick={() => toggle("evaluated")}
        >
          <strong>{compression.cleared}</strong>
          <span> WITHIN EXPECTATIONS</span>
        </button>
      </div>

      <OperatingTray
        open={tray === "signals"}
        title="Needs your judgment"
        labelledBy={signalsId}
        onClose={() => setTray(null)}
      >
        {state.judgments.length === 0 ? (
          <p className="rp-goh-tray-empty">No signals need judgment.</p>
        ) : (
          <ul className="rp-goh-tray-list">
            {state.judgments.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  className="rp-goh-tray-row"
                  onClick={() => {
                    setTray(null);
                    onSelectDecision(j.id);
                  }}
                >
                  <span className="rp-goh-tray-id">{j.displayId}</span>
                  <span className="rp-goh-tray-title">{j.title}</span>
                  <span className="rp-goh-tray-econ">{j.economic}</span>
                  <span className="rp-goh-tray-meta">
                    {j.locationLabel}
                    {j.deadlineLabel ? ` · ${j.deadlineLabel}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </OperatingTray>

      <OperatingTray
        open={tray === "evaluated"}
        title="Status details"
        labelledBy={evalId}
        onClose={() => setTray(null)}
        align="center"
      >
        <ul className="rp-goh-tray-breakdown">
          <li>
            <strong>{compression.evaluated}</strong>
            <span>evaluated</span>
          </li>
          <li>
            <strong>{compression.cleared}</strong>
            <span>cleared · no intervention required</span>
          </li>
          <li>
            <strong>{compression.handling}</strong>
            <span>RADR handling</span>
          </li>
          <li>
            <strong>{compression.watching}</strong>
            <span>watching</span>
          </li>
          <li>
            <strong>{needJudgment}</strong>
            <span>need judgment</span>
          </li>
        </ul>
      </OperatingTray>

      <OperatingTray
        open={tray === "handling"}
        title="RADR handling"
        labelledBy={handlingId}
        onClose={() => setTray(null)}
        align="center"
      >
        {state.handling.length === 0 ? (
          <p className="rp-goh-tray-empty">Nothing in motion.</p>
        ) : (
          <ul className="rp-goh-tray-list">
            {state.handling.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="rp-goh-tray-row"
                  onClick={() => {
                    if (h.id !== "handling-rollup") {
                      setTray(null);
                      onSelectDecision(h.id);
                    }
                  }}
                >
                  <span className="rp-goh-tray-id">{h.displayId}</span>
                  <span className="rp-goh-tray-title">{h.title}</span>
                  <span className="rp-goh-tray-econ">{h.state}</span>
                  <span className="rp-goh-tray-meta">
                    {h.locationLabel}
                    {h.nextCheckpoint ? ` · ${h.nextCheckpoint}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </OperatingTray>

      <OperatingTray
        open={tray === "watching"}
        title="Watching"
        labelledBy={watchingId}
        onClose={() => setTray(null)}
        align="center"
      >
        {state.watching.length === 0 ? (
          <p className="rp-goh-tray-empty">No active watch conditions.</p>
        ) : (
          <ul className="rp-goh-tray-list">
            {state.watching.map((w) => (
              <li key={w.id}>
                <div className="rp-goh-tray-row rp-goh-tray-row-static">
                  <span className="rp-goh-tray-title">{w.title}</span>
                  {w.metric ? (
                    <span className="rp-goh-tray-econ">{w.metric}</span>
                  ) : null}
                  <span className="rp-goh-tray-meta">{w.reason}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </OperatingTray>

      <OperatingTray
        open={tray === "verified"}
        title="Verified value"
        labelledBy={verifiedId}
        onClose={() => setTray(null)}
        align="right"
      >
        <div className="rp-goh-tray-verified">
          <p className="rp-goh-tray-verified-hero">
            <strong>{verified.formatted}</strong>
            <span>Verified MTD</span>
          </p>
          <p className="rp-goh-tray-meta">
            {verified.count} proven outcome{verified.count === 1 ? "" : "s"}
            {verified.latest
              ? ` · latest ${verified.latest.displayId} ${verified.latest.economic}`
              : ""}
          </p>
          <Link
            href="/app/value"
            className="rp-goh-tray-link"
            onClick={() => setTray(null)}
          >
            View Value →
          </Link>
        </div>
      </OperatingTray>
    </div>
  );
}

export function GlobalOperatingHeader({
  onOpenNav,
  navMode = "desktop",
  showHamburger = false,
}: Props) {
  const pathname = usePathname() || "/app";
  const {
    locationScope,
    locationMode,
    comparisonLocationIds,
    openLocationSwitcher,
    roleView,
    period,
    contextReady,
  } = useProduct();
  const { org, isHotel, session } = useDemoOrg();
  const ask = useAskRadrOptional();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(value => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const synthetic = isSyntheticData(getRadrEnvironment());
  const title = useMemo(() => pageTitle(pathname), [pathname]);

  const locationId = useMemo(() => {
    if (locationScope === "all" || locationScope.startsWith("region_")) {
      return "all" as const;
    }
    return locationScope === "loc_ber" ? "loc_berlin_mitte" : locationScope;
  }, [locationScope]);

  const periodKey =
    period === "wtd" || period === "mtd" || period === "ytd" || period === "today"
      ? period
      : "mtd";

  const state = useMemo(
    () =>
      composeOperatingHeaderState({
        role: roleView,
        vertical: isHotel ? "hotel" : session.vertical,
        locationId,
        period: periodKey,
      }),
    [roleView, isHotel, session.vertical, locationId, periodKey],
  );

  const scopePrimary = org.shortName || org.name;
  const scopeSecondary = useMemo(() => {
    if (locationMode === "comparison" && comparisonLocationIds.length >= 2) {
      return isHotel
        ? `${comparisonLocationIds.length} properties`
        : `${comparisonLocationIds.length} locations`;
    }
    if (locationScope === "all") {
      return isHotel ? "All properties" : "All locations";
    }
    const fromOrg = org.locations.find(
      (l) =>
        l.id === locationScope ||
        l.id === (locationScope === "loc_ber" ? "loc_berlin_mitte" : locationScope),
    );
    if (fromOrg?.displayName || fromOrg?.name) {
      return fromOrg.displayName ?? fromOrg.name;
    }
    // Never resolve cross-vertical names (e.g. Canal House under Restaurants).
    const primary = org.locations[0];
    return (
      primary?.displayName ??
      primary?.name ??
      (isHotel ? "Mercer House · New York" : "Soho · New York")
    );
  }, [locationMode, comparisonLocationIds, locationScope, org, isHotel]);

  const onControlCenter = pathname === "/app" || pathname === "/app/";
  const onLive =
    pathname.startsWith("/app/live") ||
    pathname.startsWith("/app/lab/live-v2");
  const serviceOperatingName = useMemo(() => {
    if (!pathname.startsWith("/app/service")) return null;
    // Avoid SSR/client breadcrumb mismatch before prefs/session restore.
    if (!contextReady) return "Service";
    if (locationScope === "all" || locationScope.startsWith("region_")) {
      const primary = org.locations[0];
      const name =
        primary?.displayName ?? primary?.name ?? "Primary location";
      return `Group / ${name} / Service`;
    }
    return `Service / ${scopeSecondary}`;
  }, [
    pathname,
    contextReady,
    locationScope,
    org.locations,
    scopeSecondary,
  ]);
  const contextLine = serviceOperatingName ?? title;
  /** Page owns its own H1 — avoid Live / Live Estate duplication. */
  const pageOwnsTitle =
    onControlCenter ||
    pathname.startsWith("/app/settings") ||
    pathname.startsWith("/app/dashboards") ||
    pathname.startsWith("/app/live") ||
    pathname.startsWith("/app/service") ||
    pathname === "/app/decisions";

  return (
    <header
      className="rp-goh"
      data-vertical={isHotel ? "hotel" : "restaurant"}
      data-header="operating"
      data-page={
        onControlCenter ? "center" : onLive ? "live" : "route"
      }
      data-nav-mode="rail"
      data-shell-nav={navMode}
      data-chrome="lean"
    >
      <div className="rp-goh-row1" data-row="command">
        <div className="rp-goh-left">
          {showHamburger ? (
            <button
              type="button"
              className="rp-goh-navbtn"
              aria-label="Open navigation"
              onClick={onOpenNav}
            >
              <span className="rp-goh-menu-bars" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          ) : null}
          {pageOwnsTitle ? (
            <span className="rp-goh-title" aria-hidden="true">
              {"\u00a0"}
            </span>
          ) : (
            <span className="rp-goh-title" aria-hidden="true">{contextLine}</span>
          )}
        </div>

        <div className="rp-goh-zones" aria-label="Operating context">
          <div className="rp-goh-zone" data-zone="scope">
            <button
              type="button"
              className="rp-goh-ctrl-btn rp-goh-scope"
              onClick={() => openLocationSwitcher()}
              aria-label={`Scope · ${scopePrimary} / ${scopeSecondary}`}
            >
              <span className="rp-goh-ctrl-v">
                {scopePrimary}
                <em> / {scopeSecondary}</em>
              </span>
              <span className="rp-goh-chev" aria-hidden="true" />
            </button>
            {synthetic ? (
              <div className="rp-goh-ctrl rp-goh-role">
                <RoleViewSwitcher compact />
              </div>
            ) : (
              <div className="rp-goh-ctrl rp-goh-role-static">
                <span className="rp-goh-ctrl-v">{state.roleShort}</span>
              </div>
            )}
          </div>

          <div className="rp-goh-zone" data-zone="time">
            {!onControlCenter ? <PeriodSwitcher /> : null}
            {synthetic ? (
              <WorldSwitcher className="rp-goh-world" />
            ) : null}
          </div>

          <div className="rp-goh-zone" data-zone="utility">
            {ask ? (
              <button
                type="button"
                className="rp-goh-search"
                onClick={() => setSearchOpen(true)}
                aria-label="Search anything"
              >
                <span className="rp-goh-search-label"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="m12.3 12.3 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>Search anything…</span>
                <kbd>⌘K</kbd>
              </button>
            ) : null}
            <div className="rp-goh-utility-end">
              <button type="button" className="rs-ask-shortcut" onClick={() => ask?.openAsk()} aria-label="Ask RADR">Ask RADR</button>
              <Link
                href="/app/settings"
                className="rp-goh-avatar"
                aria-label="Account settings"
              >
                {roleContextFor(roleView, session.vertical).initials}
              </Link>
            </div>
          </div>
        </div>
      </div>
      {searchOpen ? <WorkspaceSearch onClose={() => setSearchOpen(false)} /> : null}
    </header>
  );
}

/** @deprecated Prefer GlobalOperatingHeader */
export { GlobalOperatingHeader as TopContextBar };
