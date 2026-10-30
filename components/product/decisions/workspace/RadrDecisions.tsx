"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getDecisionsWorkspace,
  type DecisionDetail,
  type DriverKind,
  type JudgmentRow,
  type MotionRow,
  type ResolvedRow,
} from "@/lib/product/decisionsWorkspace";
import { controlCenterHref } from "@/lib/product/radrContext/navigateWithContext";
import { detailFromRecord } from "@/lib/product/decisionsWorkspace/fromDecisionRecord";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  matchesDriver,
  matchesProperty,
  matchesQuery,
  sortJudgment,
  sortMotion,
  sortResolved,
  type DriverFilter,
  type LedgerSort,
  type PropertyFilter,
  type StatusFilter,
} from "@/lib/product/decisionsWorkspace/ledgerQuery";
import {
  CHANGE_SCOPE_OPTIONS,
  DECLINE_REASONS,
  formatEuro,
  hkProgressLabel,
  hkStaffingPreview,
  HOTEL_READINESS_ID,
  nextHkProgress,
  readinessCostOfWaiting,
  readinessFutures,
  type ChangeScopeOption,
  type DeclineReason,
  type HotelDecisionFuture,
  type HkStaffing,
} from "@/lib/product/decisionsWorkspace/hotelActions";
import { hotelCrossLinksFor } from "@/lib/product/decisionsWorkspace/hotelCrossLinks";
import {
  boostByPersonaDriver,
  hotelPersonaLens,
} from "@/lib/product/decisionsWorkspace/hotelPersonaLens";
import { isHotelDemo } from "@/lib/radr/demo/demoOrgSession";
import { useProduct } from "@/lib/product/store";
import "./radr-decisions.css";

function Spark({
  values,
  tone,
  kind = "bars",
}: {
  values: number[];
  tone: string;
  kind?: "bars" | "line";
}) {
  const w = 56;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const color =
    tone === "neg" ? "#d4534a" : tone === "amber" ? "#c4882a" : "#00A85A";
  if (kind === "line") {
    const pts = values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * (w - 2) + 1;
        const y = h - 2 - ((v - min) / span) * (h - 6);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg className="rd-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  const bw = (w - 4) / values.length - 1.5;
  return (
    <svg className="rd-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {values.map((v, i) => {
        const bh = ((v - min) / span) * (h - 5) + 3;
        return (
          <rect
            key={i}
            x={2 + i * ((w - 4) / values.length)}
            y={h - bh - 1}
            width={Math.max(bw, 2.5)}
            height={bh}
            rx="1"
            fill={color}
            opacity={0.45 + (i / values.length) * 0.55}
          />
        );
      })}
    </svg>
  );
}

function DriverBadge({ kind, label }: { kind: DriverKind; label: string }) {
  return <span className={`rd-driver rd-driver-${kind}`}>{label}</span>;
}

function Confidence({ value }: { value: number }) {
  const tone = value >= 85 ? "strong" : value >= 75 ? "mid" : "soft";
  return (
    <div className="rd-conf" data-tone={tone} title={`Why confidence is ${value}%`}>
      <span>{value}%</span>
      <span className="rd-conf-bar">
        <i style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

type InspectorTab = "overview" | "financial" | "locations" | "evidence" | "plan";
type LedgerTab = "all" | "judgment" | "motion" | "resolved";

export function RadrDecisions() {
  /**
   * SSR defaults to restaurants (sessionStorage unavailable).
   * After mount, switch to hotels when demo org is hotel — avoids hydration mismatch.
   */
  const [industry, setIndustry] = useState<"restaurants" | "hotels">("restaurants");
  useEffect(() => {
    setIndustry(isHotelDemo() ? "hotels" : "restaurants");
  }, []);
  const isHotel = industry === "hotels";
  const { roleView } = useProduct();
  const persona = useMemo(
    () => (isHotel ? hotelPersonaLens(roleView) : null),
    [isHotel, roleView],
  );
  const model = useMemo(() => getDecisionsWorkspace(industry), [industry]);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const urlDecision = search.get("decision");
  const urlBand = search.get("band");

  const [ledgerTab, setLedgerTab] = useState<LedgerTab>(() =>
    urlBand === "needs_you" || urlBand === "judgment" ? "judgment" : "all",
  );
  const [selectedId, setSelectedId] = useState(() => {
    const rest = getDecisionsWorkspace("restaurants");
    if (urlDecision && (rest.details[urlDecision] || getDecisionRecord(urlDecision))) {
      return urlDecision;
    }
    return rest.defaultDecisionId;
  });

  useEffect(() => {
    if (urlDecision && (model.details[urlDecision] || getDecisionRecord(urlDecision))) {
      setSelectedId(urlDecision);
      return;
    }
    if (
      !model.details[selectedId] &&
      !getDecisionRecord(selectedId)
    ) {
      setSelectedId(model.defaultDecisionId);
    }
  }, [model, urlDecision, selectedId]);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("overview");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LedgerSort>("urgency");
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>("canal");
  const [driverFilter, setDriverFilter] = useState<DriverFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    urlBand === "needs_you" || urlBand === "judgment" ? "judgment" : "all",
  );
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);
  const [motionProgress, setMotionProgress] = useState<Record<string, number>>(
    {},
  );
  const [toast, setToast] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [changeScope, setChangeScope] =
    useState<ChangeScopeOption>("staffing");
  const [staffing, setStaffing] = useState<HkStaffing>(2);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<DeclineReason>("context");
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [futuresOpen, setFuturesOpen] = useState(false);
  const [selectedFutureId, setSelectedFutureId] = useState("future_c_two");

  // Hotel flagship opens Compare Futures by default (5–10s test).
  useEffect(() => {
    if (isHotel && selectedId === HOTEL_READINESS_ID) {
      setFuturesOpen(true);
      setSelectedFutureId("future_c_two");
    }
  }, [isHotel, selectedId]);

  // Needs You deep link from Control Center → judgment band + flagship Decision.
  useEffect(() => {
    if (urlBand === "needs_you" || urlBand === "judgment") {
      setLedgerTab("judgment");
      setStatusFilter("judgment");
      const flagship = isHotel
        ? DECISION_IDS.hotelReadiness
        : DECISION_IDS.peak;
      if (model.details[flagship] || getDecisionRecord(flagship)) {
        setSelectedId(flagship);
      }
    }
  }, [urlBand, isHotel, model.details]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Hotels: persona lens sets sort + driver. Restaurants keep value.
  useEffect(() => {
    if (!isHotel) {
      setSort("value");
      setPropertyFilter("all");
      setDriverFilter("all");
      return;
    }
    setPropertyFilter("canal");
    if (persona) {
      setSort(persona.defaultSort);
      setDriverFilter(persona.defaultDriver);
    } else {
      setSort("urgency");
      setDriverFilter("all");
    }
  }, [isHotel, persona]);

  const selectDecision = useCallback(
    (id: string) => {
      setSelectedId(id);
      setInspectorTab("overview");
      const params = new URLSearchParams(search.toString());
      params.set("decision", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, search],
  );

  const detail: DecisionDetail | undefined = useMemo(() => {
    if (model.details[selectedId]) return model.details[selectedId];
    const rec = getDecisionRecord(selectedId);
    return rec ? detailFromRecord(rec) : undefined;
  }, [model.details, selectedId]);

  const { judgment, motion, resolved, tabCounts } = useMemo(() => {
    const rowMatch = (r: {
      id: string;
      title: string;
      subtitle: string;
      driver: string;
      driverKind: string;
      locationsShort: string;
    }) =>
      matchesQuery(query, {
        title: r.title,
        subtitle: r.subtitle,
        driver: r.driver,
        id: r.id,
        location: r.locationsShort,
      }) &&
      matchesProperty(isHotel ? propertyFilter : "all", r.locationsShort) &&
      matchesDriver(isHotel ? driverFilter : "all", r.driverKind, r.driver);

    const judgmentBase = model.judgment
      .filter((r) => !approvedIds.includes(r.id))
      .filter((r) => !declinedIds.includes(r.id))
      .filter(rowMatch);

    const motionExtra: MotionRow[] = approvedIds
      .map((id) => {
        const j = model.judgment.find((r) => r.id === id);
        if (!j) return null;
        const progress = motionProgress[id] ?? 0;
        return {
          id: j.id,
          title: j.title,
          subtitle: j.subtitle,
          thumb: j.thumb,
          impact: j.impact,
          impactNoun: j.impactNoun,
          driver: j.driver,
          driverKind: j.driverKind,
          locationsShort: j.locationsShort,
          status: progress >= 100 ? "Verifying" : "Implementing",
          progress,
          expectedDate:
            id === HOTEL_READINESS_ID
              ? "Before 15:00 wave"
              : isHotel
                ? "Tonight"
                : "May 31",
        } satisfies MotionRow;
      })
      .filter(Boolean) as MotionRow[];

    const motionBase = [
      ...motionExtra,
      ...model.motion.map((r) => ({
        ...r,
        progress: motionProgress[r.id] ?? r.progress,
      })),
    ].filter(rowMatch);
    const resolvedBase = model.resolved.filter(rowMatch);

    let judgmentSorted = sortJudgment(judgmentBase, sort);
    let motionSorted = sortMotion(motionBase, sort);
    const resolvedSorted = sortResolved(resolvedBase, sort);
    if (isHotel && persona) {
      judgmentSorted = boostByPersonaDriver(
        judgmentSorted,
        persona.preferredDrivers,
      );
      motionSorted = boostByPersonaDriver(
        motionSorted,
        persona.preferredDrivers,
      );
    }

    return {
      judgment: judgmentSorted,
      motion: motionSorted,
      resolved: resolvedSorted,
      tabCounts: {
        all: judgmentBase.length + motionBase.length + resolvedBase.length,
        judgment: judgmentBase.length,
        motion: motionBase.length,
        resolved: resolvedBase.length,
      },
    };
  }, [
    model,
    query,
    propertyFilter,
    driverFilter,
    approvedIds,
    declinedIds,
    motionProgress,
    sort,
    isHotel,
    persona,
  ]);

  const showJudgment = ledgerTab === "all" || ledgerTab === "judgment";
  const showMotion = ledgerTab === "all" || ledgerTab === "motion";
  const showResolved = ledgerTab === "all" || ledgerTab === "resolved";

  // Keep selection inside the visible filtered set.
  useEffect(() => {
    const visible = [
      ...(showJudgment ? judgment : []),
      ...(showMotion ? motion : []),
      ...(showResolved ? resolved : []),
    ];
    if (visible.length === 0) return;
    if (!visible.some((r) => r.id === selectedId)) {
      selectDecision(visible[0]!.id);
    }
  }, [
    judgment,
    motion,
    resolved,
    showJudgment,
    showMotion,
    showResolved,
    selectedId,
    selectDecision,
  ]);

  const requestApprove = () => {
    if (!detail || detail.state !== "judgment") return;
    if (isHotel) {
      setApproveOpen(true);
      return;
    }
    confirmApprove();
  };

  const confirmApprove = () => {
    if (!detail || detail.state !== "judgment") return;
    const id = detail.id;
    setApprovedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setMotionProgress((p) => ({ ...p, [id]: 0 }));
    setApproveOpen(false);
    setOverflowOpen(false);
    showToast(
      isHotel
        ? "Approved · In motion · Housekeeping Operator notified"
        : "Decision approved · Implementation prepared",
    );
    // Stay on the approved Decision so GM sees IN MOTION + 0% progress.
    selectDecision(id);
    if (isHotel) {
      setLedgerTab("all");
      setStatusFilter("all");
    }
  };

  const confirmChanges = () => {
    if (!detail) return;
    if (isHotel && detail.id === HOTEL_READINESS_ID && changeScope === "staffing") {
      const preview = hkStaffingPreview(staffing);
      showToast(
        `Changes applied · ${staffing} HK · ${formatEuro(preview.protectedEuro)} protected · ${preview.confidence}%`,
      );
    } else {
      showToast("Changes requested · RADR will recalculate");
    }
    setChangesOpen(false);
    setChangeNote("");
    setChangeScope("staffing");
    setStaffing(2);
  };

  const confirmDecline = () => {
    if (!detail || detail.state !== "judgment") return;
    const id = detail.id;
    const reason =
      DECLINE_REASONS.find((r) => r.id === declineReason)?.label ?? "Other";
    setDeclinedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setDeclineOpen(false);
    setOverflowOpen(false);
    showToast(`Declined · ${reason}`);
    const next = judgment.find((r) => r.id !== id);
    if (next) selectDecision(next.id);
    else if (motion[0]) selectDecision(motion[0].id);
  };

  const advanceProgress = (id: string) => {
    setMotionProgress((prev) => {
      const current = prev[id] ?? 0;
      const next =
        id === HOTEL_READINESS_ID || isHotel
          ? nextHkProgress(current)
          : Math.min(100, current + 25);
      showToast(
        id === HOTEL_READINESS_ID
          ? hkProgressLabel(next)
          : `Progress ${next}%`,
      );
      return { ...prev, [id]: next };
    });
  };

  return (
    <div
      className="rd-root"
      data-page="decisions"
      data-embedded="true"
      data-industry={isHotel ? "hotels" : "restaurants"}
    >
      <div className="rd-main">
        <header className="rd-topbar rd-topbar-embedded">
          <label className="rd-search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              placeholder={model.searchPlaceholder}
              aria-label="Search decisions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </header>

        <div className="rd-page-head">
          <div>
            <h1>{model.pageTitle}</h1>
            <p>{persona?.pageSubtitle ?? model.pageSubtitle}</p>
            {persona ? (
              <ul className="rd-persona-focus" aria-label="Persona focus">
                {persona.focuses.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <section className="rd-summary" aria-label="Executive decision summary">
          <div className="rd-metrics">
            {model.summary.map((m) => (
              <article key={m.id} className="rd-metric" data-tone={m.tone}>
                <div className="rd-metric-top">
                  <span>{m.label}</span>
                  <Spark values={m.spark} tone={m.tone} kind={m.sparkKind} />
                </div>
                <strong>{m.value}</strong>
                <em className={m.tone === "pos" && m.id === "impact" ? "rd-tone-pos" : undefined}>
                  {m.sub}
                </em>
              </article>
            ))}
          </div>
          <aside className="rd-insight">
            <span className="rd-insight-kicker">
              {persona ? `${persona.roleLabel} lens` : "RADR Insight"}
            </span>
            <p>
              {persona?.insightHint ?? model.insight.body}{" "}
              {!persona ? (
                <span>({model.insight.exposureShare})</span>
              ) : (
                <span>({model.insight.body})</span>
              )}
            </p>
            <Link href={controlCenterHref()} className="rd-btn-primary rd-btn-sm">
              View in Control Center →
            </Link>
          </aside>
        </section>

        <div className="rd-body">
          <div className="rd-ledger">
            <div className="rd-ledger-toolbar">
              <div className="rd-tabs" role="tablist" aria-label="Decision filters">
                {model.tabs.map((t) => {
                  const count = tabCounts[t.id] ?? t.count;
                  const active = ledgerTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={active ? "is-active" : undefined}
                      onClick={() => {
                        setLedgerTab(t.id);
                        setStatusFilter(t.id === "all" ? "all" : t.id);
                      }}
                    >
                      {t.label} <em>({count})</em>
                    </button>
                  );
                })}
              </div>
              <div className="rd-ledger-tools">
                <label className="rd-tool-search">
                  <span aria-hidden>⌕</span>
                  <input
                    type="search"
                    placeholder="Search decisions..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search decisions in ledger"
                  />
                </label>
                <button
                  type="button"
                  className="rd-tool-btn"
                  onClick={() => {
                    setQuery("");
                    setDriverFilter("all");
                    setStatusFilter("all");
                    setLedgerTab("all");
                    setPropertyFilter(isHotel ? "canal" : "all");
                    setSort(isHotel ? "urgency" : "value");
                  }}
                >
                  Reset filters
                </button>
                <label className="rd-tool-sort">
                  <span>Sort:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as LedgerSort)}
                    aria-label="Sort decisions"
                  >
                    <option value="value">Highest value</option>
                    <option value="urgency">Most urgent</option>
                    <option value="deadline">Deadline</option>
                    <option value="confidence">Highest confidence</option>
                    <option value="progress">Most progress</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="location">{isHotel ? "Property" : "Location"}</option>
                  </select>
                </label>
                {isHotel ? (
                  <>
                    <label className="rd-tool-sort">
                      <span>Property:</span>
                      <select
                        value={propertyFilter}
                        onChange={(e) =>
                          setPropertyFilter(e.target.value as PropertyFilter)
                        }
                        aria-label="Property filter"
                      >
                        <option value="canal">Mercer House</option>
                        <option value="all">All properties</option>
                      </select>
                    </label>
                    <label className="rd-tool-sort">
                      <span>Driver:</span>
                      <select
                        value={driverFilter}
                        onChange={(e) =>
                          setDriverFilter(e.target.value as DriverFilter)
                        }
                        aria-label="Driver filter"
                      >
                        <option value="all">All drivers</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="labor">Labor</option>
                        <option value="channel">Channel mix</option>
                        <option value="guests">Guests</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="revenue">Revenue</option>
                        <option value="cancellations">Cancellation recovery</option>
                      </select>
                    </label>
                    <label className="rd-tool-sort">
                      <span>Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          const next = e.target.value as StatusFilter;
                          setStatusFilter(next);
                          setLedgerTab(next === "all" ? "all" : next);
                        }}
                        aria-label="Status filter"
                      >
                        <option value="all">All statuses</option>
                        <option value="judgment">Needs review</option>
                        <option value="motion">In motion</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </label>
                  </>
                ) : null}
              </div>
            </div>

            {tabCounts.all === 0 ? (
              <div className="rd-empty" role="status">
                <strong>No decisions match</strong>
                <p>
                  Clear search or reset filters to see the{" "}
                  {isHotel ? "Mercer House" : "location"} ledger.
                </p>
                <button
                  type="button"
                  className="rd-btn-secondary"
                  onClick={() => {
                    setQuery("");
                    setDriverFilter("all");
                    setStatusFilter("all");
                    setLedgerTab("all");
                    setPropertyFilter(isHotel ? "canal" : "all");
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : null}

            {showJudgment && judgment.length > 0 ? (
              <LedgerSection
                title="Needs your judgment"
                count={judgment.length}
                tone="judgment"
                sub="Decisions prepared by RADR, waiting for your approval."
              >
                <table className="rd-table">
                  <thead>
                    <tr>
                      {isHotel ? null : <th aria-label="Select" />}
                      <th>Decision</th>
                      <th>{isHotel ? "Expected Impact" : "Impact"}</th>
                      <th>Driver</th>
                      <th>{isHotel ? "Property" : "Locations"}</th>
                      {isHotel ? <th>Status</th> : <th>Confidence</th>}
                      {isHotel ? <th>Progress</th> : null}
                      <th>{isHotel ? "Deadline" : "Deadline"}</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judgment.map((row) => (
                      <JudgmentRowView
                        key={row.id}
                        row={row}
                        selected={selectedId === row.id}
                        onSelect={() => selectDecision(row.id)}
                        isHotel={isHotel}
                      />
                    ))}
                  </tbody>
                </table>
              </LedgerSection>
            ) : null}

            {showMotion && motion.length > 0 ? (
              <LedgerSection
                title="In motion"
                count={motion.length}
                tone="motion"
                sub="Approved and being implemented. Track progress and expected impact."
              >
                <table className="rd-table">
                  <thead>
                    <tr>
                      {isHotel ? null : <th aria-label="Select" />}
                      <th>Decision</th>
                      <th>Expected Impact</th>
                      <th>Driver</th>
                      <th>{isHotel ? "Property" : "Locations"}</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Expected date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motion.map((row) => (
                      <MotionRowView
                        key={row.id}
                        row={row}
                        selected={selectedId === row.id}
                        onSelect={() => selectDecision(row.id)}
                        isHotel={isHotel}
                      />
                    ))}
                  </tbody>
                </table>
              </LedgerSection>
            ) : null}

            {showResolved && resolved.length > 0 ? (
              <LedgerSection
                title="Resolved"
                count={resolved.length}
                tone="resolved"
                sub="Verified outcomes — what RADR predicted vs what happened."
              >
                <table className="rd-table">
                  <thead>
                    <tr>
                      {isHotel ? null : <th aria-label="Select" />}
                      <th>Decision</th>
                      <th>Impact</th>
                      <th>Accuracy</th>
                      <th>Driver</th>
                      <th>{isHotel ? "Property" : "Locations"}</th>
                      <th>Completed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((row) => (
                      <ResolvedRowView
                        key={row.id}
                        row={row}
                        selected={selectedId === row.id}
                        onSelect={() => selectDecision(row.id)}
                        isHotel={isHotel}
                      />
                    ))}
                  </tbody>
                </table>
              </LedgerSection>
            ) : null}
          </div>

          {detail ? (
            <Inspector
              detail={buildLiveDetail(
                detail,
                approvedIds,
                motionProgress,
                isHotel,
              )}
              tab={inspectorTab}
              onTab={setInspectorTab}
              onApprove={requestApprove}
              onRequestChanges={() => {
                setStaffing(2);
                setChangeScope("staffing");
                setChangesOpen(true);
              }}
              onDecline={() => {
                setDeclineOpen(true);
                setOverflowOpen(false);
              }}
              onAdvanceProgress={() => advanceProgress(detail.id)}
              onCompareFutures={() => setFuturesOpen((v) => !v)}
              futuresOpen={futuresOpen}
              selectedFutureId={selectedFutureId}
              onSelectFuture={(future) => {
                setSelectedFutureId(future.id);
                if (future.staffing === 1 || future.staffing === 2 || future.staffing === 3) {
                  setStaffing(future.staffing);
                }
                showToast(
                  future.recommended
                    ? `Selected recommended · ${future.label}`
                    : `Selected · ${future.label}`,
                );
              }}
              overflowOpen={overflowOpen}
              onOverflow={() => setOverflowOpen((v) => !v)}
              isHotel={isHotel}
              isApproved={approvedIds.includes(detail.id)}
            />
          ) : null}
        </div>
      </div>

      {toast ? (
        <div className="rd-toast" role="status">
          <strong>{toast.split(" · ")[0]}</strong>
          <span>{toast.includes(" · ") ? toast.slice(toast.indexOf(" · ") + 3) : toast}</span>
        </div>
      ) : null}

      {approveOpen && detail ? (
        <div className="rd-modal" role="dialog" aria-label="Approve decision">
          <div className="rd-modal-card">
            <header>
              <h2>Approve “{detail.title}”?</h2>
              <button
                type="button"
                onClick={() => setApproveOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p className="rd-modal-sub">
              Expected {detail.expected}
              {detail.id === HOTEL_READINESS_ID
                ? " · +4 rooms ready"
                : ""}{" "}
              · Confidence {detail.confidence}%.
            </p>
            <ul className="rd-modal-list">
              <li>
                {detail.planMeta.owner} will prepare execution immediately.
              </li>
              <li>Decision moves to In motion at 0% progress.</li>
              {detail.id === HOTEL_READINESS_ID ? (
                <li>
                  Policy: reassignment of 2+ workers requires GM approval.
                </li>
              ) : null}
            </ul>
            <div className="rd-modal-actions">
              <button
                type="button"
                className="rd-btn-secondary"
                onClick={() => setApproveOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rd-btn-primary"
                onClick={confirmApprove}
              >
                Approve
              </button>
            </div>
          </div>
          <button
            type="button"
            className="rd-modal-scrim"
            aria-label="Close"
            onClick={() => setApproveOpen(false)}
          />
        </div>
      ) : null}

      {changesOpen && detail ? (
        <div className="rd-modal" role="dialog" aria-label="Request changes">
          <div className="rd-modal-card rd-modal-card-lg">
            <header>
              <h2>Request changes</h2>
              <button
                type="button"
                onClick={() => setChangesOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p className="rd-modal-sub">
              {isHotel
                ? "Adjust the prepared Decision. RADR recalculates before approval."
                : "Tell RADR how to revise this prepared Decision before resubmitting."}
            </p>
            {isHotel ? (
              <>
                <label className="rd-modal-field">
                  <span>Change type</span>
                  <select
                    value={changeScope}
                    onChange={(e) =>
                      setChangeScope(e.target.value as ChangeScopeOption)
                    }
                    aria-label="Change type"
                  >
                    {CHANGE_SCOPE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                {changeScope === "staffing" &&
                detail.id === HOTEL_READINESS_ID ? (
                  <div className="rd-staffing">
                    <span className="rd-staffing-label">Housekeepers to reassign</span>
                    <div className="rd-staffing-toggles" role="group" aria-label="Staffing amount">
                      {([1, 2, 3] as HkStaffing[]).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={staffing === n ? "is-active" : undefined}
                          aria-pressed={staffing === n}
                          onClick={() => setStaffing(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const p = hkStaffingPreview(staffing);
                      return (
                        <div className="rd-staffing-preview" aria-live="polite">
                          <div>
                            <span>Ready</span>
                            <strong>{p.ready}</strong>
                          </div>
                          <div>
                            <span>At risk</span>
                            <strong>{p.atRisk}</strong>
                          </div>
                          <div>
                            <span>Protected</span>
                            <strong className="rd-tone-pos">
                              {formatEuro(p.protectedEuro)}
                            </strong>
                          </div>
                          <div>
                            <span>Confidence</span>
                            <strong>{p.confidence}%</strong>
                          </div>
                          <p>
                            {p.recommended ? "Recommended · " : ""}
                            {p.summary}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                ) : null}
              </>
            ) : null}
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder={
                isHotel
                  ? "Move only 1 housekeeper, not 2."
                  : "Keep Lakeside unchanged. Apply only Downtown + West End."
              }
              rows={3}
            />
            <div className="rd-modal-actions">
              <button
                type="button"
                className="rd-btn-secondary"
                onClick={() => setChangesOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rd-btn-primary"
                onClick={confirmChanges}
              >
                Apply changes
              </button>
            </div>
          </div>
          <button
            type="button"
            className="rd-modal-scrim"
            aria-label="Close"
            onClick={() => setChangesOpen(false)}
          />
        </div>
      ) : null}

      {declineOpen && detail ? (
        <div className="rd-modal" role="dialog" aria-label="Decline decision">
          <div className="rd-modal-card">
            <header>
              <h2>Decline “{detail.title}”?</h2>
              <button
                type="button"
                onClick={() => setDeclineOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p className="rd-modal-sub">
              Declined Decisions remain in history. Memory learns only when appropriate.
            </p>
            <label className="rd-modal-field">
              <span>Reason</span>
              <select
                value={declineReason}
                onChange={(e) =>
                  setDeclineReason(e.target.value as DeclineReason)
                }
                aria-label="Decline reason"
              >
                {DECLINE_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rd-modal-actions">
              <button
                type="button"
                className="rd-btn-secondary"
                onClick={() => setDeclineOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rd-btn-danger"
                onClick={confirmDecline}
              >
                Decline Decision
              </button>
            </div>
          </div>
          <button
            type="button"
            className="rd-modal-scrim"
            aria-label="Close"
            onClick={() => setDeclineOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

function HotelCrossLinks({ decisionId }: { decisionId: string }) {
  const links = hotelCrossLinksFor(decisionId);
  return (
    <section className="rd-cross-links" aria-label="Connected surfaces">
      <h3>Connected</h3>
      <ul>
        {links.map((l) => (
          <li key={l.id}>
            <Link href={l.href}>
              <strong>{l.label}</strong>
              <span>{l.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
      {decisionId === HOTEL_READINESS_ID ? (
        <p className="rd-policy-line">
          Approval policy: Housekeeping reassignment &gt;1 worker · GM approval
          required.
        </p>
      ) : null}
    </section>
  );
}

function HotelFuturesCompare({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (future: HotelDecisionFuture) => void;
}) {
  const futures = readinessFutures();
  const waiting = readinessCostOfWaiting();

  return (
    <div className="rd-hotel-futures" aria-label="Compare futures">
      <header className="rd-hotel-futures-head">
        <h3>Compare futures</h3>
        <p>
          Decide by <strong>{waiting.decideBy}</strong> · {waiting.note}
        </p>
      </header>
      <div className="rd-hotel-futures-grid">
        {futures.map((f) => {
          const selected = selectedId === f.id;
          return (
            <article
              key={f.id}
              className={
                f.recommended
                  ? "is-recommended"
                  : f.staffing === 0
                    ? "is-nothing"
                    : undefined
              }
              data-selected={selected ? "true" : undefined}
            >
              <header>
                <h4>{f.label}</h4>
                {f.recommended ? (
                  <span className="rd-future-badge">Recommended</span>
                ) : null}
              </header>
              <ul className="rd-future-metrics">
                {f.operational.map((m) => (
                  <li key={m.label}>
                    <span>{m.label}</span>
                    <strong className={m.tone ? `rd-tone-${m.tone}` : undefined}>
                      {m.value}
                    </strong>
                  </li>
                ))}
                {f.financial.map((m) => (
                  <li key={`f-${m.label}`}>
                    <span>{m.label}</span>
                    <strong className={m.tone ? `rd-tone-${m.tone}` : undefined}>
                      {m.value}
                    </strong>
                  </li>
                ))}
                <li>
                  <span>Confidence</span>
                  <strong>{f.confidence}%</strong>
                </li>
                <li>
                  <span>Risk</span>
                  <strong>{f.risk}</strong>
                </li>
              </ul>
              <button
                type="button"
                className={
                  selected ? "rd-btn-primary rd-btn-sm" : "rd-btn-secondary rd-btn-sm"
                }
                onClick={() => onSelect(f)}
                aria-pressed={selected}
              >
                {selected ? "Selected" : "Choose this future"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function buildLiveDetail(
  detail: DecisionDetail,
  approvedIds: string[],
  motionProgress: Record<string, number>,
  isHotel: boolean,
): DecisionDetail {
  const pct = motionProgress[detail.id];
  if (approvedIds.includes(detail.id)) {
    const progress = pct ?? 0;
    return {
      ...detail,
      state: "motion",
      statusLabel: progress >= 100 ? "Verifying" : "In motion",
      motion: {
        progress,
        signals:
          detail.id === HOTEL_READINESS_ID
            ? [
                {
                  label: "Stage",
                  value: hkProgressLabel(progress),
                  tone: "neutral",
                },
                { label: "Started", value: "14:22", tone: "neutral" },
                {
                  label: "Owner",
                  value: "Housekeeping Operator",
                  tone: "neutral",
                },
                {
                  label: "Expected impact",
                  value: detail.expected,
                  tone: "pos",
                },
              ]
            : [
                {
                  label: "Status",
                  value: "Implementation prepared",
                  tone: "neutral",
                },
              ],
        earlyValue: detail.expected,
        verifyFrom: isHotel ? "After arrival wave" : "After 3 services",
        owner: detail.planMeta.owner,
        nextCheck: isHotel ? "15:00" : "Tonight",
      },
    };
  }
  if (detail.state === "motion" && detail.motion) {
    const progress = pct ?? detail.motion.progress;
    return {
      ...detail,
      statusLabel: progress >= 100 ? "Verifying" : detail.statusLabel,
      motion: {
        ...detail.motion,
        progress,
      },
    };
  }
  return detail;
}

function LedgerSection({
  title,
  count,
  tone,
  sub,
  children,
}: {
  title: string;
  count: number;
  tone: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rd-section" data-tone={tone}>
      <header className="rd-section-head">
        <div>
          <h2>
            {title} <em className={`rd-count rd-count-${tone}`}>{count}</em>
          </h2>
          <p>{sub}</p>
        </div>
      </header>
      <div className="rd-table-wrap">{children}</div>
    </section>
  );
}

function JudgmentRowView({
  row,
  selected,
  onSelect,
  isHotel = false,
}: {
  row: JudgmentRow;
  selected: boolean;
  onSelect: () => void;
  isHotel?: boolean;
}) {
  return (
    <tr
      data-selected={selected ? "true" : undefined}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {isHotel ? null : (
        <td>
          <input
            type="checkbox"
            aria-label={`Select ${row.title}`}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td>
        <div className="rd-dec">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.thumb} alt="" width={48} height={48} className="rd-thumb" />
          <div>
            <div className="rd-dec-title">{row.title}</div>
            <div className="rd-dec-sub">{row.subtitle}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="rd-impact">
          <strong className="rd-tone-pos">{row.impact}</strong>
          <span>{row.impactNoun}</span>
        </div>
      </td>
      <td>
        <DriverBadge kind={row.driverKind} label={row.driver} />
      </td>
      <td>
        {isHotel ? (
          <span className="rd-locs-single">{row.locationsShort}</span>
        ) : (
          <div className="rd-locs">
            <strong>{row.locationCount} locations</strong>
            <span>{row.locationsShort}</span>
          </div>
        )}
      </td>
      <td>
        {isHotel ? (
          <span className="rd-status-judgment">Needs review</span>
        ) : (
          <Confidence value={row.confidence} />
        )}
      </td>
      {isHotel ? (
        <td>
          <div className="rd-progress">
            <span>0%</span>
            <span className="rd-progress-bar rd-progress-zero">
              <i style={{ width: "0%" }} />
            </span>
          </div>
        </td>
      ) : null}
      <td>
        <span className={`rd-deadline rd-deadline-${row.deadlineTone}`}>{row.deadline}</span>
      </td>
      <td>
        <button
          type="button"
          className="rd-btn-primary rd-btn-review"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Review
        </button>
      </td>
    </tr>
  );
}

function MotionRowView({
  row,
  selected,
  onSelect,
  isHotel = false,
}: {
  row: MotionRow;
  selected: boolean;
  onSelect: () => void;
  isHotel?: boolean;
}) {
  return (
    <tr
      data-selected={selected ? "true" : undefined}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {isHotel ? null : (
        <td>
          <input
            type="checkbox"
            aria-label={`Select ${row.title}`}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td>
        <div className="rd-dec">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.thumb} alt="" width={48} height={48} className="rd-thumb" />
          <div>
            <div className="rd-dec-title">{row.title}</div>
            <div className="rd-dec-sub">{row.subtitle}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="rd-impact">
          <strong className="rd-tone-pos">{row.impact}</strong>
          <span>{row.impactNoun}</span>
        </div>
      </td>
      <td>
        <DriverBadge kind={row.driverKind} label={row.driver} />
      </td>
      <td>
        <span className="rd-locs-single">{row.locationsShort}</span>
      </td>
      <td>
        <span className="rd-status-motion">{row.status}</span>
      </td>
      <td>
        <div className="rd-progress">
          <span>{row.progress}%</span>
          <span className="rd-progress-bar">
            <i style={{ width: `${row.progress}%` }} />
          </span>
        </div>
      </td>
      <td>{row.expectedDate}</td>
      <td>
        <button
          type="button"
          className="rd-link-view"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          View <span aria-hidden>›</span>
        </button>
      </td>
    </tr>
  );
}

function ResolvedRowView({
  row,
  selected,
  onSelect,
  isHotel = false,
}: {
  row: ResolvedRow;
  selected: boolean;
  onSelect: () => void;
  isHotel?: boolean;
}) {
  return (
    <tr
      data-selected={selected ? "true" : undefined}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {isHotel ? null : (
        <td>
          <input
            type="checkbox"
            aria-label={`Select ${row.title}`}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td>
        <div className="rd-dec">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.thumb} alt="" width={48} height={48} className="rd-thumb" />
          <div>
            <div className="rd-dec-title">{row.title}</div>
            <div className="rd-dec-sub">{row.subtitle}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="rd-impact-stack">
          <span>
            Exp <em>{row.expected}</em>
          </span>
          <span>
            Act <strong className="rd-tone-pos">{row.actual}</strong>
          </span>
        </div>
      </td>
      <td>
        <strong className="rd-tone-pos">{row.accuracy}</strong>
      </td>
      <td>
        <DriverBadge kind={row.driverKind} label={row.driver} />
      </td>
      <td>
        <span className="rd-locs-single">{row.locationsShort}</span>
      </td>
      <td>{row.completed}</td>
      <td>
        <button
          type="button"
          className="rd-link-view"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          View <span aria-hidden>›</span>
        </button>
      </td>
    </tr>
  );
}

function Inspector({
  detail,
  tab,
  onTab,
  onApprove,
  onRequestChanges,
  onDecline,
  onAdvanceProgress,
  onCompareFutures,
  futuresOpen,
  selectedFutureId,
  onSelectFuture,
  overflowOpen,
  onOverflow,
  isHotel = false,
  isApproved = false,
}: {
  detail: DecisionDetail;
  tab: InspectorTab;
  onTab: (t: InspectorTab) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onDecline: () => void;
  onAdvanceProgress: () => void;
  onCompareFutures: () => void;
  futuresOpen: boolean;
  selectedFutureId: string;
  onSelectFuture: (future: HotelDecisionFuture) => void;
  overflowOpen: boolean;
  onOverflow: () => void;
  isHotel?: boolean;
  isApproved?: boolean;
}) {
  const tabs: { id: InspectorTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "financial", label: "Financial Impact" },
    {
      id: "locations",
      label: isHotel
        ? `Before / After`
        : `Locations (${detail.locations.length})`,
    },
    { id: "evidence", label: "Evidence" },
    { id: "plan", label: "Plan" },
  ];

  return (
    <aside className="rd-inspector" aria-label="Decision detail">
      <header className="rd-insp-head">
        <div className="rd-insp-title-row">
          <h2>{detail.title}</h2>
          <span className={`rd-status-badge rd-status-${detail.state}`}>
            {detail.statusLabel}
          </span>
        </div>
        <p>{detail.subtitle}</p>
      </header>

      <div className="rd-insp-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "is-active" : undefined}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rd-insp-body">
        {tab === "overview" ? (
          <>
            <div className="rd-insp-kpis">
              <article className="rd-insp-kpi is-value">
                <span>
                  {isHotel ? "Expected contribution protected" : "Expected contribution"}
                </span>
                <strong className="rd-tone-pos">{detail.expected}</strong>
                <em>Range: {detail.expectedRange}</em>
              </article>
              <article className="rd-insp-kpi is-conf">
                <span>Confidence</span>
                <strong>{detail.confidence}%</strong>
                <span className="rd-conf-ring" style={{ "--p": detail.confidence } as React.CSSProperties} />
              </article>
              <article className={`rd-insp-kpi is-deadline rd-deadline-${detail.deadlineTone}`}>
                <span>Decision deadline</span>
                <strong>{detail.deadline}</strong>
                <em>{isHotel && detail.deadline === "14:40" ? "20m remaining" : "⏱"}</em>
              </article>
            </div>

            {detail.verified ? (
              <div className="rd-verified-block">
                <div className="rd-verified-grid">
                  <div>
                    <span>Expected</span>
                    <strong>{detail.verified.expected}</strong>
                  </div>
                  <div>
                    <span>Actual</span>
                    <strong className="rd-tone-pos">{detail.verified.actual}</strong>
                  </div>
                  <div>
                    <span>Accuracy</span>
                    <strong className="rd-tone-pos">{detail.verified.accuracy}</strong>
                  </div>
                  <div>
                    <span>Confidence at decision</span>
                    <strong>{detail.verified.confidenceAtDecision}%</strong>
                  </div>
                </div>
                <h3>What happened</h3>
                <p>{detail.verified.whatHappened}</p>
                <h3>Why it worked</h3>
                <p>{detail.verified.whyWorked}</p>
                <h3>What RADR learned</h3>
                <p className="rd-learned">{detail.verified.learned}</p>
              </div>
            ) : null}

            {detail.motion && detail.state === "motion" ? (
              <div className="rd-motion-block">
                <div className="rd-progress lg">
                  <span>Progress {detail.motion.progress}%</span>
                  <span className="rd-progress-bar">
                    <i style={{ width: `${detail.motion.progress}%` }} />
                  </span>
                </div>
                <ul>
                  {detail.motion.signals.map((s) => (
                    <li key={s.label}>
                      <span>{s.label}</span>
                      <strong className={s.tone ? `rd-tone-${s.tone}` : undefined}>{s.value}</strong>
                    </li>
                  ))}
                </ul>
                <p>
                  Early estimated value <strong className="rd-tone-pos">{detail.motion.earlyValue}</strong>
                  {" · "}
                  Verification begins {detail.motion.verifyFrom}
                </p>
              </div>
            ) : null}

            {!detail.verified ? (
              <>
                <section className="rd-why">
                  <h3>Why RADR recommends this</h3>
                  {detail.why.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </section>

                <section className="rd-outcome">
                  <h3>Expected outcome</h3>
                  <div className="rd-outcome-grid">
                    {detail.outcomes.map((o) => (
                      <article key={o.id}>
                        <strong>{o.value}</strong>
                        <span>{o.label}</span>
                        <em>{o.detail}</em>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rd-loc-impact">
                  <header>
                    <h3>{isHotel ? "Current course vs with RADR" : "Impact by location"}</h3>
                    <div className="rd-legend">
                      <span>
                        <i className="is-current" />{" "}
                        {isHotel ? "Current course" : "Current (MTD)"}
                      </span>
                      <span>
                        <i className="is-after" />{" "}
                        {isHotel ? "With RADR" : "After implementation"}
                      </span>
                    </div>
                  </header>
                  {isHotel && detail.id === "dec_hotel_readiness_canal" ? (
                    <div className="rd-before-after">
                      <article>
                        <h4>Current course</h4>
                        <ul>
                          <li>
                            <span>Ready</span>
                            <strong>31 / 42</strong>
                          </li>
                          <li>
                            <span>At risk</span>
                            <strong className="rd-tone-neg">7 rooms</strong>
                          </li>
                          <li>
                            <span>Avg delay</span>
                            <strong>22m</strong>
                          </li>
                        </ul>
                      </article>
                      <article className="is-radr">
                        <h4>With RADR</h4>
                        <ul>
                          <li>
                            <span>Ready</span>
                            <strong className="rd-tone-pos">35 / 42</strong>
                          </li>
                          <li>
                            <span>At risk</span>
                            <strong className="rd-tone-pos">3 rooms</strong>
                          </li>
                          <li>
                            <span>Avg delay</span>
                            <strong className="rd-tone-pos">8m</strong>
                          </li>
                        </ul>
                      </article>
                    </div>
                  ) : (
                    <ul>
                      {detail.locations.map((loc) => (
                        <li key={loc.id}>
                          <div className="rd-loc-name">{loc.name}</div>
                          <div className="rd-loc-bars">
                            <span
                              className="rd-bar is-current"
                              style={{ width: `${loc.currentPct}%` }}
                            />
                            <span
                              className="rd-bar is-after"
                              style={{ width: `${loc.afterPct}%` }}
                            />
                          </div>
                          <strong className="rd-tone-pos">{loc.gain}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {isHotel ? (
                  <HotelCrossLinks decisionId={detail.id} />
                ) : null}

                <button type="button" className="rd-futures-toggle" onClick={onCompareFutures}>
                  {futuresOpen ? "Hide futures" : "Compare futures"}
                </button>
                {futuresOpen ? (
                  isHotel && detail.id === HOTEL_READINESS_ID ? (
                    <HotelFuturesCompare
                      selectedId={selectedFutureId}
                      onSelect={onSelectFuture}
                    />
                  ) : (
                    <div className="rd-futures">
                      <article>
                        <h4>{detail.futures.doNothing.title}</h4>
                        <ul>
                          {detail.futures.doNothing.lines.map((l) => (
                            <li key={l.label}>
                              <span>{l.label}</span>
                              <strong
                                className={
                                  l.tone ? `rd-tone-${l.tone}` : undefined
                                }
                              >
                                {l.value}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </article>
                      <article className="is-radr">
                        <h4>{detail.futures.withRadr.title}</h4>
                        <ul>
                          {detail.futures.withRadr.lines.map((l) => (
                            <li key={l.label}>
                              <span>{l.label}</span>
                              <strong
                                className={
                                  l.tone ? `rd-tone-${l.tone}` : undefined
                                }
                              >
                                {l.value}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  )
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {tab === "financial" ? (
          <section className="rd-fin">
            <div className="rd-fin-grid">
              <article>
                <span>Expected</span>
                <strong className="rd-tone-pos">{detail.financial.expected}</strong>
              </article>
              <article>
                <span>Low case</span>
                <strong>{detail.financial.low}</strong>
              </article>
              <article>
                <span>High case</span>
                <strong>{detail.financial.high}</strong>
              </article>
              <article>
                <span>Cost of doing nothing</span>
                <strong className="rd-tone-neg">{detail.financial.costOfNothing}</strong>
              </article>
              <article>
                <span>Implementation cost</span>
                <strong>{detail.financial.implementationCost}</strong>
              </article>
              <article>
                <span>Net expected value</span>
                <strong className="rd-tone-pos">{detail.financial.net}</strong>
              </article>
            </div>
            <p className="rd-fin-horizon">Horizon: {detail.financial.horizon}</p>
          </section>
        ) : null}

        {tab === "locations" ? (
          <section className="rd-loc-list">
            {detail.locations.map((loc) => (
              <article key={loc.id}>
                <h3>{loc.name}</h3>
                <p>
                  {loc.currentLabel} → {loc.afterLabel}
                </p>
                <strong className="rd-tone-pos">{loc.gain}</strong>
                <Link href={`/app/live?level=venue&location=${loc.id}`} className="rd-link-view">
                  Open location →
                </Link>
              </article>
            ))}
          </section>
        ) : null}

        {tab === "evidence" ? (
          <section className="rd-evidence">
            <ul className="rd-sources">
              {detail.evidenceSources.map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong>
                  <span>{s.freshness}</span>
                  {s.healthy ? <em>Healthy</em> : null}
                </li>
              ))}
            </ul>
            {detail.evidenceNotes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </section>
        ) : null}

        {tab === "plan" ? (
          <section className="rd-plan">
            <ol>
              {detail.plan.map((step) => (
                <li key={step.n}>
                  <em>{step.n}</em>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
            <dl className="rd-plan-meta">
              <div>
                <dt>Owner</dt>
                <dd>{detail.planMeta.owner}</dd>
              </div>
              <div>
                <dt>Effective</dt>
                <dd>{detail.planMeta.effective}</dd>
              </div>
              <div>
                <dt>Monitoring</dt>
                <dd>{detail.planMeta.monitor}</dd>
              </div>
              <div>
                <dt>Rollback</dt>
                <dd>{detail.planMeta.rollback}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>

      {detail.state === "judgment" && !isApproved ? (
        <footer className="rd-insp-actions">
          <button
            type="button"
            className="rd-btn-primary rd-btn-approve"
            onClick={onApprove}
          >
            Approve Decision
          </button>
          <div className="rd-insp-secondary">
            <button
              type="button"
              className="rd-btn-secondary"
              onClick={onRequestChanges}
            >
              Request changes
            </button>
            <div className="rd-overflow">
              <button
                type="button"
                className="rd-btn-secondary rd-btn-icon"
                aria-label="More actions"
                aria-expanded={overflowOpen}
                onClick={onOverflow}
              >
                ···
              </button>
              {overflowOpen ? (
                <div className="rd-overflow-menu" role="menu">
                  {isHotel && detail.liveHref ? (
                    <Link href={detail.liveHref} role="menuitem">
                      View House Readiness
                    </Link>
                  ) : null}
                  <Link href={`/app/decisions/${detail.id}`} role="menuitem">
                    View decision details
                  </Link>
                  <button type="button" role="menuitem" onClick={onDecline}>
                    Decline Decision
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </footer>
      ) : null}

      {detail.state === "motion" ? (
        <footer className="rd-insp-actions">
          {(detail.motion?.progress ?? 0) < 100 ? (
            <button
              type="button"
              className="rd-btn-primary rd-btn-approve"
              onClick={onAdvanceProgress}
            >
              Advance progress
            </button>
          ) : (
            <Link
              href={`/app/decisions/${detail.id}`}
              className="rd-btn-primary rd-btn-approve"
            >
              View verification →
            </Link>
          )}
          <div className="rd-insp-secondary">
            <Link
              href={`/app/decisions/${detail.id}`}
              className="rd-btn-secondary"
            >
              View progress
            </Link>
            {detail.liveHref ? (
              <Link href={detail.liveHref} className="rd-btn-secondary">
                {isHotel ? "House Readiness" : "Live"}
              </Link>
            ) : null}
          </div>
        </footer>
      ) : null}
    </aside>
  );
}
