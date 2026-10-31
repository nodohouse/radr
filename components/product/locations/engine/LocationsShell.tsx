"use client";

import { Heading } from "../../reference/ReferenceUI";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  buildLocationsOverview,
  parseLocationId,
  parseLocationsSort,
  parseLocationsView,
  type LocationsSort,
  type LocationsView,
  type LocationUiState,
} from "@/lib/radr/product/locationsProofEngine";
import { LocationsOverview } from "./LocationsOverview";
import {
  LocationsExposure,
  LocationsPerformance,
  LocationsProfitability,
  LocationsWatchlist,
} from "./LocationsViews";
import "./locations-engine.css";

const VIEWS: { id: LocationsView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "exposure", label: "Exposure" },
  { id: "profitability", label: "Profitability" },
  { id: "watchlist", label: "Watchlist" },
];

export function LocationsShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/locations";
  const search = useSearchParams();
  const { roleView } = useProduct();
  const { session, isHotel } = useDemoOrg();

  useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  // Portfolio economics are MTD in the body — do not overwrite global period.

  const view = parseLocationsView(search.get("view"));
  const sort = parseLocationsSort(search.get("sort"));
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<LocationUiState | "all" | null>(
    "all",
  );
  const [actionsOpen, setActionsOpen] = useState(false);

  const vertical = isHotel ? "hotel" : session.vertical;
  const model = useMemo(
    () => buildLocationsOverview(roleView, vertical, sort),
    [roleView, vertical, sort],
  );

  const selectedId = parseLocationId(search.get("location"), model.rows);
  const selected = model.rows.find((r) => r.id === selectedId) ?? null;

  const pushState = useCallback(
    (patch: {
      view?: LocationsView;
      sort?: LocationsSort;
      location?: string | null;
    }) => {
      const sp = new URLSearchParams(search.toString());
      if (patch.view !== undefined) {
        if (patch.view === "overview") sp.delete("view");
        else sp.set("view", patch.view);
      }
      if (patch.sort !== undefined) {
        if (patch.sort === "contribution") sp.delete("sort");
        else sp.set("sort", patch.sort);
      }
      if (patch.location !== undefined) {
        if (!patch.location) sp.delete("location");
        else {
          const row = model.rows.find((r) => r.id === patch.location);
          const slug =
            row?.name.toLowerCase().replace(/\s+/g, "-") ?? patch.location;
          sp.set("location", slug);
        }
      }
      // Locations economics are MTD SSOT
      sp.set("period", "mtd");
      const qs = sp.toString();
      // push (not replace) so browser back/forward works across Locations views
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search, model.rows],
  );

  return (
    <div
      className="le-root"
      data-locations-engine="true"
      data-drawer={selected ? "true" : undefined}
    >
      <header className="le-page-head">
        <Heading eyebrow="Locations" title="Every location. A sharper perspective." description="Compare performance, exposure and attention across your estate." />
        <nav className="le-views" aria-label="Locations perspective">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              data-active={view === v.id ? "true" : undefined}
              onClick={() => pushState({ view: v.id })}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      {view === "overview" ? (
        <LocationsOverview
          model={model}
          sort={sort}
          onSort={(s) => pushState({ sort: s })}
          selectedId={selectedId}
          onSelect={(id) => pushState({ location: id })}
          query={query}
          onQuery={setQuery}
          healthFilter={healthFilter}
          onHealthFilter={setHealthFilter}
          onRecommendedActions={() => setActionsOpen(true)}
        />
      ) : null}

      {view === "performance" ? (
        <LocationsPerformance
          model={model}
          selectedId={selectedId}
          onSelect={(id) => pushState({ location: id })}
        />
      ) : null}

      {view === "exposure" ? (
        <LocationsExposure
          model={model}
          selectedId={selectedId}
          onSelect={(id) => pushState({ location: id })}
        />
      ) : null}

      {view === "profitability" ? (
        <LocationsProfitability
          model={model}
          selectedId={selectedId}
          onSelect={(id) => pushState({ location: id })}
        />
      ) : null}

      {view === "watchlist" ? (
        <LocationsWatchlist
          model={model}
          selectedId={selectedId}
          onSelect={(id) => pushState({ location: id })}
        />
      ) : null}

      {selected ? (
        <aside className="le-drawer" aria-label={`${selected.name} detail`}>
          <div className="le-drawer-head">
            <div>
              <p className="le-k">{selected.city}</p>
              <h3>{selected.name}</h3>
              <span className="le-badge" data-state={selected.state}>
                {selected.attentionLabel}
              </span>
            </div>
            <button
              type="button"
              className="le-link"
              onClick={() => pushState({ location: null })}
            >
              Close
            </button>
          </div>
          <dl className="le-drawer-kpis">
            <div>
              <dt>Revenue</dt>
              <dd>{formatDecisionMoney(selected.revenue)}</dd>
            </div>
            <div>
              <dt>Contribution</dt>
              <dd>{formatDecisionMoney(selected.contribution)}</dd>
            </div>
            <div>
              <dt>Margin</dt>
              <dd>{selected.marginPct}%</dd>
            </div>
            <div>
              <dt>Exposure</dt>
              <dd>{formatDecisionMoney(selected.exposure)}</dd>
            </div>
          </dl>
          <p className="le-drawer-why">
            <strong>Why it matters</strong>, {selected.headline}. Primary
            driver: {selected.primaryDriver}.
          </p>
          <ul className="le-drawer-drivers">
            {selected.drivers.slice(0, 4).map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <strong data-tone={d.amount >= 0 ? "pos" : "neg"}>
                  {d.amount >= 0 ? "+" : "−"}
                  {formatDecisionMoney(Math.abs(d.amount))}
                </strong>
              </li>
            ))}
          </ul>
          <div className="le-drawer-links">
            <Link href={`/app?location=${selected.id}`}>
              View in Control Center
            </Link>
            <Link href={selected.liveHref}>View in Live</Link>
            <Link href={selected.decisionsHref}>Open Decisions</Link>
            <Link href={selected.diagnosisHref}>View diagnosis</Link>
            <Link href={selected.valueHref}>Verified Value</Link>
            <Link href={selected.memoryHref}>Operating DNA</Link>
          </div>
        </aside>
      ) : null}

      {actionsOpen ? (
        <div
          className="le-modal"
          role="presentation"
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="le-modal-card"
            role="dialog"
            aria-label="Recommended actions"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Recommended actions</h3>
            <ol>
              {model.attention.map((a) => (
                <li key={a.id}>
                  <strong>{a.name}</strong>, {a.opportunityLabel} · expected +
                  {a.upsideEuro > 0
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(a.upsideEuro)
                    : "Not available"}
                  <div className="le-modal-links">
                    <Link href={a.diagnosisHref}>Diagnosis →</Link>
                    <Link href={a.decisionsHref}>Decisions →</Link>
                  </div>
                </li>
              ))}
            </ol>
            <div className="le-modal-actions">
              <button
                type="button"
                className="le-cta"
                onClick={() => setActionsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
