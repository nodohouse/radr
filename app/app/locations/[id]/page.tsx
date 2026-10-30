"use client";

/**
 * Location detail — ideal connected operation.
 * Overview = command · Live = now · Performance = history.
 */

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { useProduct } from "@/lib/product/store";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { normalizeLocationId } from "@/lib/radr/product/demoOrg";
import {
  locationTabsFor,
  type LocationTabId,
} from "@/lib/radr/product/experienceComposer";
import { PillNav } from "@/components/product/ui/PillNav";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { ensureDemoOrgForVertical } from "@/lib/radr/demo/verticalScope";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { composeLocationIntel } from "@/lib/radr/location/composeLocationIntel";
import {
  allCanonicalLocationIds,
  resolveLocation,
} from "@/lib/radr/location/resolve";
import {
  deriveLocationAttention,
  locationAttentionLabel,
} from "@/lib/radr/product/locationAttention";
import { LocationOverview } from "@/components/product/locations/LocationOverview";
import { LocationLive } from "@/components/product/locations/LocationLive";
import { LocationPerformance } from "@/components/product/locations/LocationPerformance";
import { HotelPropertyDemandPanel } from "@/components/product/locations/HotelPortfolioIntel";
import { sourcesForDemo } from "@/lib/radr/product/integrations";

function money(n: number) {
  return formatDecisionMoney(n);
}

function normalizeTab(id: LocationTabId): LocationTabId {
  if (id === "today" || id === "arrivals" || id === "turnovers") return "overview";
  return id;
}

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { roleView, setLocationScope } = useProduct();
  const { session: _session } = useDemoOrg();
  void _session;
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const resolved = resolveLocation(params.id ?? "");
  const intel = useMemo(
    () => (params.id ? composeLocationIntel(params.id, { role: roleView }) : null),
    [params.id, roleView],
  );

  const tabs = locationTabsFor(
    resolved?.vertical === "hotel" ? "hotel" : "restaurant",
  );
  const [tab, setTab] = useState<LocationTabId>("overview");

  useLayoutEffect(() => {
    if (resolved) ensureDemoOrgForVertical(resolved.vertical, resolved.id);
  }, [resolved]);

  useEffect(() => {
    if (params.id) setLocationScope(resolveLocation(params.id)?.id ?? params.id);
  }, [params.id, setLocationScope]);

  // Keep tab when switching locations
  useEffect(() => {
    setTab((t) => normalizeTab(t));
  }, [params.id]);

  const decisions = useMemo(() => {
    if (!resolved) return [];
    const scoped = scopedDecisionsForDemo(
      Object.values(snap.records),
      roleView,
      resolved.vertical,
    );
    return scoped.filter(
      (r) =>
        r.locationId === resolved.id ||
        normalizeLocationId(r.locationId) === resolved.id,
    );
  }, [snap, roleView, resolved]);

  const needs = decisions.filter((r) => recordAttention(r) === "needs_you");
  const verified = decisions.filter((r) => r.verifiedValue);
  const sources = resolved
    ? sourcesForDemo(roleView, resolved.vertical)
    : [];

  if (!resolved || !intel) {
    return (
      <div className="rp-empty">
        <h3>Location not found</h3>
        <p>
          <Link href="/app/locations">Back to portfolio</Link>
        </p>
        <p className="rp-ccx-quiet">
          Known locations: {allCanonicalLocationIds().length}
        </p>
      </div>
    );
  }

  const title = resolved.seed.displayName;
  const hotel = resolved.vertical === "hotel";
  const siblings = resolved.org.locations;
  const idx = siblings.findIndex((l) => l.id === resolved.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const e = intel.economics;
  const annualized = intel.procurement?.annualizedExposure ?? 0;
  const exposureShown = Math.max(
    e.exposure,
    annualized > 0 ? Math.round(annualized / 12) : 0,
  );
  const attention = deriveLocationAttention({
    needsYouCount: e.needsYou,
    activeExposureEuro: exposureShown,
    annualizedExposureEuro: annualized,
    outlierPolarity:
      intel.outlier?.polarity === "healthy"
        ? "neutral"
        : intel.outlier?.polarity ?? null,
  });
  const attentionLabel =
    attention === "NEEDS_JUDGMENT" && e.needsYou > 0
      ? `${e.needsYou} need judgment`
      : locationAttentionLabel(attention);

  const activeTab = normalizeTab(tab);

  return (
    <div className="rp-loc-detail" data-vertical={resolved.vertical} data-loc={resolved.id}>
      <header className="rp-ledger-head rp-loc-identity">
        <div className="rp-loc-identity-row">
          <div>
            <p className="rp-cc-kicker">
              {hotel ? "Boutique hotel" : "Restaurant"} · {resolved.org.shortName}
            </p>
            <h1 className="rp-cc-title">{title}</h1>
            <p className="rp-cc-since">
              {resolved.seed.city} · {attentionLabel} · MTD
            </p>
          </div>
          <nav className="rp-loc-switch" aria-label="Switch location">
            {prev ? (
              <Link href={`/app/locations/${prev.id}`} title={prev.displayName}>
                ← {prev.name}
              </Link>
            ) : (
              <span />
            )}
            <label className="rp-loc-switch-select">
              <span className="rp-sr-only">Location</span>
              <select
                value={resolved.id}
                onChange={(e) => {
                  router.push(`/app/locations/${e.target.value}`);
                }}
              >
                {siblings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            {next ? (
              <Link href={`/app/locations/${next.id}`} title={next.displayName}>
                {next.name} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </header>

      <PillNav
        ariaLabel="Location perspective"
        items={tabs.map((t) => ({ id: t.id, label: t.label }))}
        value={activeTab}
        onChange={(id) => setTab(normalizeTab(id as LocationTabId))}
      />

      {activeTab === "overview" ? <LocationOverview intel={intel} /> : null}

      {activeTab === "live" ? <LocationLive intel={intel} /> : null}

      {activeTab === "performance" ? (
        <>
          <LocationPerformance intel={intel} />
          {hotel ? <HotelPropertyDemandPanel locationId={resolved.id} /> : null}
        </>
      ) : null}

      {activeTab === "distribution" || activeTab === "channels" ? (
        <section className="rp-vday-perf">
          <p className="rp-cc-kicker">
            {activeTab === "distribution" ? "Distribution" : "Channels"}
          </p>
          {hotel ? (
            <HotelPropertyDemandPanel locationId={resolved.id} />
          ) : intel.economics.delivery ? (
            <dl className="rp-vday-metrics">
              <div>
                <dt>Delivery share</dt>
                <dd>
                  <strong>{intel.economics.deliverySharePct}%</strong>
                </dd>
              </div>
              <div data-tone="risk">
                <dt>Platform fees</dt>
                <dd>
                  <strong>{money(intel.economics.delivery.platformFees)}</strong>
                </dd>
              </div>
              <div>
                <dt>Net delivery</dt>
                <dd>
                  <strong>{money(intel.economics.delivery.net)}</strong>
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
      ) : null}

      {activeTab === "decisions" ? (
        <section className="rp-vday-perf">
          <p className="rp-cc-kicker">Decisions</p>
          <p className="rp-cc-since">
            Last 90d · {intel.decisionHistory.formed90d} formed ·{" "}
            {intel.decisionHistory.verified} verified ·{" "}
            {money(intel.decisionHistory.verifiedEuro)} Verified Value
          </p>
          {needs.length === 0 && decisions.length === 0 ? (
            <p className="rp-ccx-quiet">
              Quiet at this location — no intervention required.
            </p>
          ) : (
            <ul className="rp-ccx-mini">
              {(needs.length ? needs : decisions).slice(0, 8).map((r) => (
                <li key={r.id}>
                  <Link href={`/app/decisions/${r.id}`}>
                    <em>{displayDecisionId(r.id)}</em>
                    <strong>{customerDecisionClass(r)}</strong>
                    <span>{r.recommendationHeadline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {activeTab === "value" ? (
        <section className="rp-vday-perf">
          <p className="rp-cc-kicker">Value</p>
          <dl className="rp-loc-ops-dl">
            <div>
              <dt>Identified</dt>
              <dd>{money(intel.economics.exposure + intel.economics.verified)}</dd>
            </div>
            <div>
              <dt>Actionable</dt>
              <dd>{money(intel.economics.exposure)}</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd data-tone="pos">{money(intel.economics.verified)}</dd>
            </div>
          </dl>
          {verified.length > 0 ? (
            <ul className="rp-ccx-mini">
              {verified.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/decisions/${r.id}`}>
                    <em>{displayDecisionId(r.id)}</em>
                    <strong>
                      {formatDecisionMoney(r.verifiedValue?.amount ?? 0)}
                    </strong>
                    <span>{r.verifiedValue?.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/app/value" className="rp-ccx-more">
            Open Verified Value ledger →
          </Link>
        </section>
      ) : null}

      {activeTab === "memory" ? (
        <section className="rp-vday-perf">
          <p className="rp-cc-kicker">What this location learned</p>
          <ul className="rp-loc-memory">
            {intel.lessons.map((l) => (
              <li key={l.id}>
                <strong>{l.summary}</strong>
                <span>{l.evidence}</span>
                <em>
                  {l.horizon}
                  {l.transferable ? " · Transferable" : ""}
                </em>
                {l.relatedDecisionId ? (
                  <Link href={`/app/decisions/${l.relatedDecisionId}`}>
                    Related Decision →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
          <Link href="/app/memory" className="rp-ccx-more">
            Open Operating Memory →
          </Link>
        </section>
      ) : null}

      {activeTab === "data" ? (
        <section className="rp-vday-perf">
          <p className="rp-cc-kicker">Data · why RADR knows this</p>
          <ul className="rp-loc-data-sources">
            {sources.map((s) => (
              <li key={s.id}>
                <strong>{s.name}</strong>
                <span>{s.domain}</span>
                <em data-status={s.status}>{s.status}</em>
                <span>{s.freshness}</span>
              </li>
            ))}
          </ul>
          <p className="rp-ccx-quiet">
            Truth labels: OBSERVED · DERIVED · ESTIMATED · PREDICTED ·
            RECOMMENDED · VERIFIED
          </p>
          <Link href="/app/data-health" className="rp-ccx-more">
            Open Data Health →
          </Link>
        </section>
      ) : null}
    </div>
  );
}
