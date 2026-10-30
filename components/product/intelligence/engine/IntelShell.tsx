"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  COMPARE_DRIVERS,
  INTEL_DOMAINS,
  INTEL_EXTRA_FINDINGS,
  INTEL_FINDINGS,
  findingStateFromDecision,
  findingsForDomain,
  formatEuro,
  getFindingById,
  parseDomain,
  parseFindingId,
  parsePeriod,
  parseSku,
  saysForContext,
  sortFindings,
  type IntelPeriod,
  type IntelSkuSlug,
  type IntelSort,
} from "@/lib/radr/product/intelligenceEngine";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import {
  addModuleToDashboard,
  createEmptyDashboard,
  readDashboards,
} from "@/lib/product/dashboards";
import { defaultDims } from "@/lib/product/dashboardBuilder";
import { IntelFindingsRail } from "./IntelFindingsRail";
import { IntelCanvas } from "./IntelCanvas";
import { IntelSaysRail } from "./IntelSaysRail";
import "./intel-engine.css";

const FAV_KEY = "radr.intelligence.favorites.v1";

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

const FINDING_TO_MODULE: Record<string, string> = {
  "cost-movers": "cost_movers",
  "settlement-bridge": "settlement_bridge",
  "location-exposure": "location_exposure",
  "revenue-vs-forecast": "revenue_vs_forecast",
  "verified-value-trend": "verified_value_trend",
  "channel-mix": "channel_mix",
  "kitchen-pressure": "kitchen_pressure",
  "menu-destroyers": "menu_contribution",
  "terrace-conversion": "booking_pace",
  "labor-template": "labor_productivity",
};

export function IntelShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/intelligence";
  const search = useSearchParams();
  const decisionSnap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const domain = parseDomain(search.get("domain") ?? search.get("cat"));
  const findingId = parseFindingId(search.get("finding"));
  const sku = parseSku(search.get("sku"));
  const period = parsePeriod(search.get("period"));

  const [sort, setSort] = useState<IntelSort>("impact");
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [dashSaved, setDashSaved] = useState(false);
  const [dashboards, setDashboards] = useState(() =>
    typeof window === "undefined" ? [] : readDashboards(),
  );
  const [locationFocus, setLocationFocus] = useState<string | null>(null);
  const [mobileRail, setMobileRail] = useState<"findings" | "says" | null>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const pushState = useCallback(
    (next: {
      domain?: string;
      finding?: string;
      sku?: string | null;
      period?: IntelPeriod | null;
    }) => {
      let nextDomain = next.domain ?? domain;
      let nextFinding = next.finding ?? findingId;
      const findingDef = getFindingById(nextFinding);

      // Domain tab: if current finding isn't in that lens, jump to the lens default.
      if (next.domain && !next.finding) {
        const scoped = findingsForDomain(next.domain as typeof domain);
        if (!scoped.some((f) => f.id === nextFinding)) {
          nextFinding = scoped[0]?.id ?? "cost-movers";
        }
      }

      // Explicit finding (rail / catalog): align domain to the finding's lens.
      if (next.finding && findingDef) {
        nextFinding = findingDef.id;
        if (findingDef.domain !== "overview") {
          nextDomain = findingDef.domain;
        } else if (next.domain) {
          nextDomain = next.domain;
        }
      }

      const resolved = getFindingById(nextFinding) ?? INTEL_FINDINGS[0]!;
      const nextSku =
        next.sku === undefined
          ? nextFinding === "cost-movers"
            ? sku
            : null
          : next.sku;
      const nextPeriod =
        next.period === undefined
          ? next.finding || next.domain
            ? resolved.periodDefault
            : period
          : next.period;

      const sp = new URLSearchParams();
      if (nextDomain !== "overview") sp.set("domain", nextDomain);
      sp.set("finding", nextFinding);
      if (nextSku && nextFinding === "cost-movers") sp.set("sku", nextSku);
      if (nextPeriod && nextPeriod !== "30d") sp.set("period", nextPeriod);
      const qs = sp.toString();
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [domain, findingId, sku, period, pathname, router],
  );

  const ranked = useMemo(() => {
    let list = findingsForDomain(domain);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(needle) ||
          f.summary.toLowerCase().includes(needle) ||
          f.question.toLowerCase().includes(needle) ||
          f.domain.includes(needle) ||
          (f.skus ?? []).some((s) => s.includes(needle)) ||
          (needle.includes("olive") && f.id === "cost-movers") ||
          (needle.includes("tuna") && f.id === "cost-movers"),
      );
    }
    const sorted = sortFindings(list, sort);
    return [...sorted].sort((a, b) => {
      const af = favorites.has(a.id) ? 1 : 0;
      const bf = favorites.has(b.id) ? 1 : 0;
      return bf - af;
    });
  }, [domain, sort, q, favorites]);

  const finding =
    ranked.find((f) => f.id === findingId) ??
    getFindingById(findingId) ??
    ranked[0] ??
    INTEL_FINDINGS[0]!;

  const liveState = findingStateFromDecision(
    finding.decisionId
      ? decisionSnap.records[finding.decisionId]?.status
      : null,
    finding.state,
  );

  const says = saysForContext(
    finding,
    finding.id === "cost-movers" ? sku : null,
    period,
  );

  const selectDomain = (id: string) => {
    pushState({ domain: id });
    setLocationFocus(null);
    setMobileRail(null);
  };

  const selectFinding = (id: string) => {
    pushState({ finding: id });
    setLocationFocus(null);
    setMobileRail(null);
  };

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(finding.id)) next.delete(finding.id);
      else next.add(finding.id);
      try {
        window.localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const saveToDashboard = (dashboardId: string | "new") => {
    const moduleId = FINDING_TO_MODULE[finding.id] ?? "cost_movers";
    if (dashboardId === "new") {
      const d = createEmptyDashboard(finding.title);
      addModuleToDashboard(d.id, moduleId, defaultDims(moduleId));
      setDashSaved(true);
      setDashboards(readDashboards());
      return;
    }
    addModuleToDashboard(dashboardId, moduleId, defaultDims(moduleId));
    setDashSaved(true);
    setDashboards(readDashboards());
  };

  const catalogItems = [
    ...INTEL_EXTRA_FINDINGS.map((f) => ({
      id: f.id,
      label: `${f.title} · ${f.domain}`,
      state: f.state,
      selectable: true as const,
    })),
    ...[
      "Waste spike · BOH",
      "OTA commission drag",
      "No-show cluster · Saturday",
      "Prep lag · pastry",
      "Refund anomaly · processor",
      "Cover pace vs forecast",
      "Supplier concentration",
      "Verified labor playbook",
    ].map((label) => ({
      id: label,
      label,
      state: "WATCHING" as const,
      selectable: false as const,
    })),
  ].slice(0, 12);

  return (
    <div className="ie-root" data-intel-engine="true">
      <header className="ie-head">
        <div>
          <p className="ie-kicker">Intelligence</p>
          <h1>Signals into decisions.</h1>
          <p className="ie-head-sub">
            RADR continuously connects operating, financial and guest signals to
            explain what is changing and why.
          </p>
        </div>
        <label className="ie-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search for a vendor, SKU, location..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search Intelligence"
          />
        </label>
      </header>

      <nav className="ie-domains" aria-label="Intelligence domains">
        {INTEL_DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            data-active={domain === d.id ? "true" : undefined}
            onClick={() => selectDomain(d.id)}
          >
            {d.label}
          </button>
        ))}
      </nav>

      <div className="ie-mobile-toggles">
        <button
          type="button"
          onClick={() =>
            setMobileRail((v) => (v === "findings" ? null : "findings"))
          }
        >
          Findings
        </button>
        <button
          type="button"
          onClick={() => setMobileRail((v) => (v === "says" ? null : "says"))}
        >
          RADR Says
        </button>
      </div>

      <div className="ie-body">
        <IntelFindingsRail
          findings={ranked.map((f) =>
            f.decisionId
              ? {
                  ...f,
                  state: findingStateFromDecision(
                    decisionSnap.records[f.decisionId]?.status,
                    f.state,
                  ),
                }
              : f,
          )}
          selectedId={finding.id}
          sort={sort}
          favorites={favorites}
          open={mobileRail === "findings"}
          onSelect={selectFinding}
          onSort={setSort}
          onOpenCatalog={() => setCatalogOpen(true)}
        />
        <IntelCanvas
          finding={finding}
          state={liveState}
          sku={sku}
          period={period}
          favorited={favorites.has(finding.id)}
          locationFocus={locationFocus}
          onSku={(s) => pushState({ finding: finding.id, sku: s })}
          onPeriod={(p) => pushState({ period: p })}
          onFavorite={toggleFavorite}
          onAddDashboard={() => {
            setDashSaved(false);
            setDashboards(readDashboards());
            setDashOpen(true);
          }}
          onLocationFocus={setLocationFocus}
        />
        <IntelSaysRail
          finding={finding}
          state={liveState}
          says={says}
          open={mobileRail === "says"}
          onCompareDrivers={() => setCompareOpen(true)}
        />
      </div>

      {compareOpen ? (
        <div
          className="ie-drawer-backdrop"
          role="presentation"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="ie-drawer"
            role="dialog"
            aria-label="Compare drivers"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Compare drivers</h3>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                color: "var(--ie-muted)",
              }}
            >
              Contribution movement bridged to Control Center.
            </p>
            <ul className="ie-drawer-list">
              {COMPARE_DRIVERS.map((d) => (
                <li key={d.id}>
                  <span>{d.label}</span>
                  <em data-neg={d.euro < 0 ? "true" : "false"}>
                    {d.euro < 0 ? "−" : "+"}
                    {formatEuro(Math.abs(d.euro))}
                  </em>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="ie-cta"
              style={{ marginTop: 16 }}
              onClick={() => {
                setCompareOpen(false);
                router.push("/app?lens=contribution");
              }}
            >
              View in Control Center →
            </button>
          </div>
        </div>
      ) : null}

      {catalogOpen ? (
        <div
          className="ie-modal"
          role="presentation"
          onClick={() => setCatalogOpen(false)}
        >
          <div
            className="ie-modal-card"
            role="dialog"
            aria-label="Finding catalog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Finding catalog</h3>
            <p>
              Additional findings by materiality, state, location, and
              confidence.
            </p>
            <ul className="ie-drawer-list">
              {catalogItems.map((item) => (
                <li key={item.id}>
                  {item.selectable ? (
                    <button
                      type="button"
                      className="ie-catalog-pick"
                      onClick={() => {
                        pushState({ finding: item.id });
                        setCatalogOpen(false);
                        setMobileRail(null);
                      }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  <em data-neg="false">{item.state.replace(/_/g, " ")}</em>
                </li>
              ))}
            </ul>
            <div className="ie-modal-actions">
              <button type="button" onClick={() => setCatalogOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {dashOpen ? (
        <div
          className="ie-modal"
          role="presentation"
          onClick={() => setDashOpen(false)}
        >
          <div
            className="ie-modal-card"
            role="dialog"
            aria-label="Add to dashboard"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add to dashboard</h3>
            <p>
              Pin <strong>{finding.title}</strong> as a live Intelligence
              widget.
            </p>
            {dashSaved ? (
              <p style={{ color: "var(--ie-green-deep)", fontWeight: 600 }}>
                Added to Dashboards.{" "}
                <button
                  type="button"
                  className="ie-link"
                  data-tone="decision"
                  onClick={() => router.push("/app/dashboards")}
                >
                  Open Dashboards →
                </button>
              </p>
            ) : (
              <>
                <label>
                  Existing dashboard
                  <select
                    id="ie-dash-select"
                    defaultValue={dashboards[0]?.id ?? ""}
                  >
                    {dashboards.length === 0 ? (
                      <option value="">No dashboards yet</option>
                    ) : (
                      dashboards.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <label>
                  Period
                  <select defaultValue={period}>
                    <option value="7d">7D</option>
                    <option value="30d">30D</option>
                    <option value="90d">90D</option>
                    <option value="1y">1Y</option>
                  </select>
                </label>
              </>
            )}
            <div className="ie-modal-actions">
              <button type="button" onClick={() => setDashOpen(false)}>
                Cancel
              </button>
              {!dashSaved ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveToDashboard("new")}
                  >
                    + New dashboard
                  </button>
                  <button
                    type="button"
                    data-primary="true"
                    onClick={() => {
                      const el = document.getElementById(
                        "ie-dash-select",
                      ) as HTMLSelectElement | null;
                      if (el?.value) saveToDashboard(el.value);
                      else saveToDashboard("new");
                    }}
                  >
                    Add widget
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-primary="true"
                  onClick={() => setDashOpen(false)}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
