"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  getCfoControlCenter,
  type CfoIndustry,
  type DriverId,
} from "@/lib/product/cfoControlCenter";
import type { AttentionItem } from "@/lib/product/cfoControlCenter/types";
import type { SinceLastCheckItem } from "@/lib/product/cfoControlCenter/types";
import {
  ActionRail,
  BridgeChart,
  DecisionPosture,
  ExposureModel,
  ForwardOutlook,
  KpiStrip,
  PortfolioTable,
  RadrSeesHero,
  SinceLastCheck,
} from "./parts";
import "./cfo-control-center.css";

function NavIcon({ id }: { id: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (id) {
    case "cc":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="5" height="5" rx="1.2" />
          <rect x="9" y="2" width="5" height="5" rx="1.2" />
          <rect x="2" y="9" width="5" height="5" rx="1.2" />
          <rect x="9" y="9" width="5" height="5" rx="1.2" />
        </svg>
      );
    case "decisions":
      return (
        <svg {...common}>
          <path d="M4 3.5h8v9H4z" />
          <path d="M6 6h4M6 8.5h4M6 11h2.5" />
        </svg>
      );
    case "live":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.2" />
          <path d="M3.2 8a4.8 4.8 0 0 1 9.6 0M1.5 8a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "locations":
    case "properties":
      return (
        <svg {...common}>
          <path d="M8 14s5-4.2 5-7.2A5 5 0 0 0 3 6.8C3 9.8 8 14 8 14Z" />
          <circle cx="8" cy="6.8" r="1.6" />
        </svg>
      );
    case "financials":
      return (
        <svg {...common}>
          <path d="M3 12V4M8 12V7M13 12V2" />
        </svg>
      );
    case "labor":
    case "hk":
    case "rooms":
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2.2" />
          <path d="M2.5 13c.4-2.2 2-3.4 3.5-3.4S9.1 10.8 9.5 13" />
          <circle cx="11.2" cy="5.4" r="1.7" />
          <path d="M10 13c.2-1.4 1.1-2.3 2.2-2.3" />
        </svg>
      );
    case "fb":
      return (
        <svg {...common}>
          <path d="M4 3v10M4 3c1.8 0 3 1.4 3 4S5.8 11 4 11M10 3v10M12.5 3v4a2.5 2.5 0 0 1-2.5 2.5" />
        </svg>
      );
    case "procurement":
      return (
        <svg {...common}>
          <path d="M2.5 4.5h11l-1.2 7.2a1.4 1.4 0 0 1-1.4 1.1H5.1a1.4 1.4 0 0 1-1.4-1.1L2.5 4.5Z" />
          <path d="M5.5 4.5 6.2 2.8h3.6l.7 1.7" />
        </svg>
      );
    case "guests":
      return (
        <svg {...common}>
          <circle cx="8" cy="5.5" r="2.4" />
          <path d="M3.2 13.2c.6-2.6 2.4-4 4.8-4s4.2 1.4 4.8 4" />
        </svg>
      );
    case "reports":
      return (
        <svg {...common}>
          <rect x="3" y="2.5" width="10" height="11" rx="1.5" />
          <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
        </svg>
      );
    case "revenue":
      return (
        <svg {...common}>
          <path d="M3 11.5 7 7l2.5 2.5L13 5" />
          <path d="M9.5 5H13v3.5" />
        </svg>
      );
    case "intel":
      return (
        <svg {...common}>
          <path d="M8 2.5 9.2 6.2 13 6.5 10.2 9l.8 3.7L8 10.9 5 12.7l.8-3.7L3 6.5l3.8-.3L8 2.5Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2" />
        </svg>
      );
  }
}

type Props = {
  industry: CfoIndustry;
  embedded?: boolean;
};

export function CfoControlCenter({ industry, embedded = false }: Props) {
  const model = useMemo(() => getCfoControlCenter(industry), [industry]);
  const [bridgeMode, setBridgeMode] = useState<"value" | "pct">("value");
  const [tab, setTab] = useState(
    model.portfolio.columns === "restaurant" ? "all" : "all",
  );
  const [selectedDriverId, setSelectedDriverId] = useState<DriverId | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [hoverLocationId, setHoverLocationId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<"current" | "radr">("current");
  const [showHealthy, setShowHealthy] = useState(false);

  useEffect(() => {
    setTab("all");
    setBridgeMode("value");
    setSelectedDriverId(null);
    setActiveLocationId(null);
    setHoverLocationId(null);
    setScenario("current");
    setShowHealthy(false);
  }, [industry]);

  const selectDriver = (id: DriverId | null) => {
    setSelectedDriverId(id);
    if (id) {
      setTab("all");
      setShowHealthy(false);
    }
  };

  const onAttentionFocus = (item: AttentionItem) => {
    setActiveLocationId(item.locationId);
    if (item.driverId) setSelectedDriverId(item.driverId);
    setTab("all");
    setShowHealthy(false);
  };

  const onSinceSelect = (item: SinceLastCheckItem) => {
    const focus = item.focus;
    if (!focus) return;
    if (focus.href) {
      window.location.assign(focus.href);
      return;
    }
    if (focus.driverId) setSelectedDriverId(focus.driverId);
    if (focus.locationId) setActiveLocationId(focus.locationId);
    if (focus.tab) setTab(focus.tab);
    setShowHealthy(false);
  };

  return (
    <div
      className="cfo-root"
      data-industry={industry}
      data-embedded={embedded ? "true" : undefined}
      data-driver={selectedDriverId || undefined}
    >
      {!embedded ? (
        <>
          <div className="cfo-nav-spacer" aria-hidden />
          <nav className="cfo-nav" aria-label="Primary">
            <Link
              href={`/app/control-center?industry=${industry}`}
              className="cfo-nav-brand"
              aria-label="RADR Control Center"
            >
              <span className="cfo-nav-mark" aria-hidden="true">
                <FrozenRadrLogo
                  variant="wordmark"
                  theme="dark"
                  size="sm"
                  decorative
                />
              </span>
            </Link>
            <ul className="cfo-nav-list">
              {model.nav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={item.active ? "is-active" : undefined}
                    aria-current={item.active ? "page" : undefined}
                    title={item.label}
                  >
                    <span className="cfo-nav-glyph">
                      <NavIcon id={item.id} />
                    </span>
                    <span className="cfo-nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="cfo-nav-foot">
              <div className="cfo-live">
                <span className="cfo-live-dot" />
                <div className="cfo-nav-foot-copy">
                  <div className="cfo-live-title">{model.dataLive}</div>
                  <div className="cfo-live-sub">{model.sourcesLabel}</div>
                </div>
              </div>
              <p className="cfo-nav-tagline">
                {industry === "restaurants"
                  ? "Restaurant Intelligence for a stronger tomorrow."
                  : "Hotel Intelligence for verified decisions."}
              </p>
            </div>
          </nav>
        </>
      ) : null}

      <div className="cfo-main">
        {!embedded ? (
          <header className="cfo-topbar">
            <div className="cfo-topbar-left">
              <div className="cfo-greet">{model.greeting}</div>
              <div className="cfo-title-row">
                <h1>{model.pageTitle}</h1>
                <div className="cfo-context-pills">
                  <span className="cfo-pill is-active">{model.contextLabel}</span>
                  <span className="cfo-pill cfo-pill-quiet">{model.roleLabel}</span>
                  <span className="cfo-pill cfo-pill-quiet">{model.periodLabel}</span>
                </div>
              </div>
              <SinceLastCheck
                items={model.sinceLastCheck}
                onSelect={onSinceSelect}
              />
            </div>
            <div className="cfo-topbar-center">
              <label className="cfo-search">
                <span className="cfo-search-icon" aria-hidden>
                  ⌕
                </span>
                <input
                  type="search"
                  placeholder={model.searchPlaceholder}
                  aria-label="Search"
                />
                <kbd>⌘ K</kbd>
              </label>
            </div>
            <div className="cfo-topbar-right">
              <button type="button" className="cfo-date" title={model.periodLabel}>
                <span aria-hidden>▦</span>
                {model.dateRange}
              </button>
              <button type="button" className="cfo-bell" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M8 2.2a3.4 3.4 0 0 0-3.4 3.4v2.1c0 .5-.2 1-.5 1.4L3.2 10.5h9.6l-.9-1.4a2 2 0 0 1-.5-1.4V5.6A3.4 3.4 0 0 0 8 2.2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.4 12.2a1.6 1.6 0 0 0 3.2 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <i>3</i>
              </button>
              <div className="cfo-avatar" aria-label="Alex K.">
                AK
              </div>
            </div>
          </header>
        ) : (
          <div className="cfo-embed-switch">
            <span className="cfo-pill is-active">{model.contextLabel}</span>
            <span className="cfo-pill cfo-pill-quiet">{model.roleLabel}</span>
            <Link
              href={`/app/control-center?industry=${industry}`}
              className="cfo-pill cfo-pill-switch"
            >
              Open full CFO Center
            </Link>
          </div>
        )}

        <div className="cfo-body">
          <div className="cfo-col-main">
            <KpiStrip metrics={model.kpis} />
            <DecisionPosture posture={model.posture} />
            <ExposureModel
              model={model.exposureModel}
              forecast={model.forecast}
            />

            <div className="cfo-intel-row">
              <RadrSeesHero
                hero={model.hero}
                activeLocationId={activeLocationId}
                selectedDriverId={selectedDriverId}
                onSelectDriver={selectDriver}
                onFocusLocation={(id) => {
                  setActiveLocationId(id);
                  if (id) setShowHealthy(false);
                }}
              />

              <BridgeChart
                title={model.bridge.title}
                subtitle={model.bridge.subtitle}
                steps={model.bridge.steps}
                planLabel={model.bridge.planLabel}
                actualLabel={model.bridge.actualLabel}
                mode={bridgeMode}
                onModeChange={setBridgeMode}
                selectedDriverId={selectedDriverId}
                onSelectDriver={selectDriver}
                hoverLocationId={hoverLocationId || activeLocationId}
              />
            </div>

            <ForwardOutlook
              title={model.outlook.title}
              current={model.outlook.current}
              withRadr={model.outlook.withRadr}
              protectedLabel={model.outlook.protectedLabel}
              scenario={scenario}
              onScenarioChange={setScenario}
            />

            <PortfolioTable
              title={model.portfolio.title}
              entityLabel={model.portfolio.entityLabel}
              columns={model.portfolio.columns}
              tabs={model.portfolio.tabs}
              rows={model.portfolio.rows}
              activeTab={tab}
              onTabChange={(id) => {
                setTab(id);
                if (id === "healthy") setShowHealthy(true);
              }}
              selectedDriverId={selectedDriverId}
              activeLocationId={activeLocationId}
              hoverLocationId={hoverLocationId}
              onHoverLocation={setHoverLocationId}
              showHealthy={showHealthy}
              onToggleHealthy={() => setShowHealthy((v) => !v)}
            />
          </div>

          <ActionRail
            attention={model.rail.attention}
            pending={model.rail.pending}
            verified={model.rail.verified}
            activeDriverId={selectedDriverId}
            activeLocationId={activeLocationId}
            onAttentionFocus={onAttentionFocus}
          />
        </div>
      </div>
    </div>
  );
}
