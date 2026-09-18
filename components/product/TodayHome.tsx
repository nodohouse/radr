"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  computeSinceLastCheck,
  readAttentionSnapshot,
  recordControlCenterVisit,
} from "@/lib/radr/attentionState";
import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import { composeOperatingBrief } from "@/lib/radr/brief/operatingBrief";
import { AttentionReviewSheet } from "@/components/product/AttentionReviewSheet";
import {
  isLiveShiftEnabled,
  liveShiftMode,
} from "@/lib/radr/live";
import {
  demoMenuAvailabilityRisk,
  isMenuAvailabilityEnabled,
} from "@/lib/radr/menuAvailability";
import { LiveShiftPanel } from "@/components/product/live/LiveShiftPanel";
import { useDemoLiveShift } from "@/components/product/live/useDemoLiveShift";
import { MenuAvailabilityCard } from "@/components/product/MenuAvailabilityCard";
import { getRoleProfile } from "@/lib/radr/role/profiles";
import { useDemoServicePhase } from "@/components/product/useDemoServicePhase";
import {
  composeBerlinPreShiftBrief,
  composeBerlinPostShiftBrief,
} from "@/lib/radr/preShift";
import { PreShiftPlanPanel } from "@/components/product/preShift/PreShiftPlanPanel";
import { PostShiftSummary } from "@/components/product/preShift/PostShiftSummary";
import { ShiftTruth } from "@/components/product/ShiftTruth";
import { GuestBriefPanel } from "@/components/product/guest/GuestBriefPanel";
import { HospitalityBriefPanel } from "@/components/product/hospitality/HospitalityBriefPanel";
import { composeGuestTonightBrief } from "@/lib/radr/guest";
import { composeHospitalityTonightBrief } from "@/lib/radr/hospitality";
import { composeBerlinActiveRevenue } from "@/lib/radr/activeRevenue";
import { RevenueOpportunitiesPanel } from "@/components/product/activeRevenue/RevenueOpportunitiesPanel";
import { RecoveryDrawer } from "@/components/product/activeRevenue/RecoveryDrawer";
import { HandledByRadrSheet } from "@/components/product/activeRevenue/RecoveryOperatingLanes";
import { GlanceBoard } from "@/components/product/glance/GlanceBoard";
import type { GlanceVenueRow } from "@/components/product/glance/GlanceBoard";
import {
  composeGlanceBrief,
  glanceInputFromDemo,
  injectRecoveryIntoGlance,
  justNowCancellation,
  recoveryOperatingCounts,
  roleSeesFloorRecovery,
  roleSeesPortfolioRecovery,
  type GlanceSignal,
} from "@/lib/radr/glance";
import { composeMenuDecisionBrief } from "@/lib/radr/preShift/menuDecisionBrief";
import { composeBerlinOperatingHorizon } from "@/lib/radr/horizon";
import { HorizonRail } from "@/components/product/horizon/HorizonRail";
import {
  composeFleetBrief,
  isFleetRole,
} from "@/lib/radr/fleet";
import { LocationFleetBoard } from "@/components/product/fleet/LocationFleetBoard";
import { LookbackBoard } from "@/components/product/lookback/LookbackBoard";
import { readWhenHorizon } from "@/components/product/WhenScopeStrip";
import { isSyntheticData, getRadrEnvironment } from "@/lib/radr/env";
import { useProduct } from "@/lib/product/store";
import {
  getLocationById,
  shortLocationName,
} from "@/lib/radr/locationCatalog";
import { buildCompareHref } from "@/lib/radr/comparisonService";
import { needsYouHeadline, composeRoleAttention } from "@/lib/radr/roleAttention";
import type { LocationScope, DashPeriod } from "@/lib/product/demo/dashboard";
import { useOperatingProfile } from "@/components/product/useOperatingProfile";
import { HotelGlanceBoard } from "@/components/product/hotel/HotelGlanceBoard";
import { ResidencesGlanceBoard } from "@/components/product/residences/ResidencesGlanceBoard";
import { CANAL_HOUSE } from "@/lib/radr/demo/canalHouseAmsterdam";
import { LISBON_RESIDENCES } from "@/lib/radr/demo/lisbonResidences";
import {
  composeControlCenter,
  moduleEnabled,
} from "@/lib/radr/controlCenter";
import { mapDemoWhenToCockpitHorizon } from "@/lib/radr/hiddenSignals/rank";
import { HiddenSignalStrip } from "@/components/product/HiddenSignalStrip";
import { CockpitBands } from "@/components/product/CockpitBands";
import { DEFAULT_MAX_ATTENTION } from "@/lib/radr/attention/score";

function dayLabelFromStorage(): string | undefined {
  try {
    const raw = sessionStorage.getItem("radr.demo.whenDay");
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
    const d = new Date(`${raw}T12:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return undefined;
  }
}

function resolveLookbackPeriod(period: DashPeriod): DashPeriod | null {
  const horizon = readWhenHorizon();
  if (horizon === "custom") return period;
  if (horizon === "mtd" || period === "mtd") return "mtd";
  if (horizon === "ytd" || period === "ytd") return "ytd";
  if (horizon === "day") return "yesterday";
  return null;
}

type Props = {
  findings: Finding[];
  locationName: string;
  locationScope: string;
  isGroup: boolean;
  roleView: RoleView;
};

/**
 * Control Center - role × phase glance surface.
 * RADR knows everything; the user sees only what they need.
 */
export function TodayHome({
  findings,
  locationName,
  locationScope,
  isGroup,
  roleView,
}: Props) {
  const synthetic = isSyntheticData(getRadrEnvironment());
  const { phase, asOfIso, ready: phaseReady, ctx } = useDemoServicePhase(synthetic);
  const { profile: operatingProfile, vertical: demoVertical } =
    useOperatingProfile();
  const {
    locationMode,
    comparisonLocationIds,
    setLocationScope,
    setComparisonLocationIds,
    period,
  } = useProduct();

  const [whenTick, setWhenTick] = useState(0);
  useEffect(() => {
    const on = () => setWhenTick((n) => n + 1);
    window.addEventListener("radr-when-horizon", on);
    return () => window.removeEventListener("radr-when-horizon", on);
  }, []);

  const lookPeriod = useMemo(() => {
    if (typeof window === "undefined") return null;
    return resolveLookbackPeriod(period);
  }, [period, whenTick]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [hospOpen, setHospOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);
  const [handledOpen, setHandledOpen] = useState(false);
  const [justNowDismissed, setJustNowDismissed] = useState(false);
  const [postDeep, setPostDeep] = useState(false);
  const [postMoneyId, setPostMoneyId] = useState<string | null>(null);
  const [resumeCompareIds, setResumeCompareIds] = useState<string[] | null>(
    null,
  );
  const profile = getRoleProfile(roleView);

  useEffect(() => {
    if (locationMode === "comparison") setResumeCompareIds(null);
  }, [locationMode]);

  const compareVenues = useMemo((): GlanceVenueRow[] | undefined => {
    if (locationMode !== "comparison" || comparisonLocationIds.length < 2) {
      return undefined;
    }
    return comparisonLocationIds.map((id) => {
      const loc = getLocationById(id);
      const attention = loc?.openSignals ?? 0;
      return {
        id,
        name: loc?.name ?? id,
        attention,
        status: attention > 0 ? "needs" : "calm",
        statusLabel: attention > 0 ? "Needs you" : "Calm",
        why:
          attention > 0
            ? "Open decisions at this venue still need a human"
            : "Nothing waiting on you here",
      };
    });
  }, [locationMode, comparisonLocationIds]);

  const compareMeta = useMemo(() => {
    if (!compareVenues?.length) return null;
    return `Comparing ${compareVenues.map((v) => v.name).join(", ")}`;
  }, [compareVenues]);

  const compareHref = useMemo(
    () =>
      comparisonLocationIds.length >= 2
        ? buildCompareHref(comparisonLocationIds)
        : null,
    [comparisonLocationIds],
  );

  const isPost = phase === "POST_SHIFT";
  const isLiveLike = phase === "LIVE" || phase === "CLOSING";
  const isPre = phase === "PRE_SHIFT";

  const liveOn = isLiveShiftEnabled();
  const liveMode = liveShiftMode();
  const {
    state: liveState,
    paused,
    setPaused,
    pulse,
  } = useDemoLiveShift(liveOn && liveMode === "illustrative" && isLiveLike);

  const preBrief = useMemo(
    () => composeBerlinPreShiftBrief(asOfIso),
    [asOfIso],
  );
  const postBrief = useMemo(
    () => (isPost ? composeBerlinPostShiftBrief() : null),
    [isPost],
  );
  const horizon = useMemo(() => composeBerlinOperatingHorizon(), []);
  const composedCc = useMemo(
    () =>
      composeControlCenter({
        profile: operatingProfile,
        role: roleView,
        vertical: demoVertical,
        whenHorizon: mapDemoWhenToCockpitHorizon(readWhenHorizon()),
      }),
    [roleView, whenTick, operatingProfile, demoVertical],
  );
  const roleAttention = useMemo(
    () =>
      composeRoleAttention({
        findings,
        role: roleView,
        scope: locationScope,
        maxAttention: composedCc.maxAttention,
      }),
    [locationScope, roleView, composedCc.maxAttention, findings],
  );
  const fleetBrief = useMemo(
    () => (isFleetRole(roleView) ? composeFleetBrief(roleView) : null),
    [roleView],
  );
  const fleetPrimary = Boolean(
    fleetBrief && (isGroup || composedCc.surface === "fleet"),
  );

  const guestBrief = useMemo(
    () => composeGuestTonightBrief(roleView),
    [roleView],
  );
  const hospBrief = useMemo(
    () => composeHospitalityTonightBrief(roleView),
    [roleView],
  );
  const revenueBrief = useMemo(() => composeBerlinActiveRevenue(), []);

  const since = useMemo(
    () => computeSinceLastCheck(findings, readAttentionSnapshot()),
    [findings],
  );

  useEffect(() => {
    recordControlCenterVisit(findings);
  }, [findings]);

  const brief = useMemo(
    () =>
      composeOperatingBrief({
        role: roleView,
        findings,
        locationScope,
        locationName,
        isGroup,
        since,
      }),
    [roleView, findings, locationScope, locationName, isGroup, since],
  );

  const menuRisk =
    isMenuAvailabilityEnabled() ? demoMenuAvailabilityRisk() : null;

  const glanceBrief = useMemo(() => {
    const menu = composeMenuDecisionBrief();
    const allergies = hospBrief.allergies ?? [];
    const glanceInput = glanceInputFromDemo({
      role: roleView,
      phase,
      locationName,
      expectedCovers: preBrief?.expectedCovers ?? 142,
      expectedWalkIns: preBrief?.expectedWalkIns ?? 26,
      projectedRevenue: preBrief?.projectedNetSales ?? 9480,
      expectedContribution: preBrief?.expectedContribution ?? 5860,
      peakStart: preBrief?.peakWindow.start ?? "19:30",
      peakEnd: preBrief?.peakWindow.end ?? "21:00",
      terraceOpen: preBrief?.weatherImpact?.decision === "OPEN",
      terraceNet: preBrief?.weatherImpact?.netExpectedContribution ?? null,
      menuPortionsLeft: menu?.portionsAvailable ?? 9,
      menuPortionsExpected: menu?.portionsExpected ?? 31,
      menuRunOutBy: menu?.runOutBy ?? "20:15",
      menuContributionAtRisk: menu?.contributionAtRisk ?? 730,
      menuSourcingNet:
        menu?.sourcing.options.find((o) => o.recommended)?.netExpectedValue ??
        558,
      staffingAtRisk: 290,
      staffingWindow: "19:15 to 20:30",
      allergyTables: Math.max(hospBrief.allergyAlerts, allergies.length),
      allergyUnconfirmed: allergies.filter(
        (a) => a.needsClarification || a.status === "UNCONFIRMED",
      ).length,
      allergyKitchenPending: allergies.filter((a) => !a.kitchenAcknowledged)
        .length,
      allergyLines: allergies.map((a) => ({
        table: a.tableLabel,
        time: a.time,
        label: a.allergenLabel,
      })),
      birthdays: hospBrief.birthdays,
      engagements: hospBrief.engagements,
      anniversaries: hospBrief.anniversaries,
      quietRequests: hospBrief.quietTableRequests,
      terraceRequests: hospBrief.terraceRequests,
      privateDining: hospBrief.privateDiningSetups,
      returningGuests: hospBrief.returningGuests,
      liveSales: liveState?.netSales,
      livePacePct: liveState?.vsExpectedPct,
      minutesToOpen:
        phase === "PRE_SHIFT" ? (ctx?.minutesToStart ?? 72) : null,
      groupReady: fleetBrief
        ? fleetBrief.rows.filter((r) => r.status === "READY").length
        : undefined,
      groupNeedAttention: fleetBrief?.needsYouCount,
      groupAtRisk: fleetBrief
        ? fleetBrief.rows.filter((r) => r.status === "WATCH" || r.needsYou > 0)
            .length
        : undefined,
      groupExposure: fleetBrief
        ? fleetBrief.rows.reduce((s, r) => s + r.attentionEuro, 0)
        : undefined,
    });
    let base = injectRecoveryIntoGlance(
      composeGlanceBrief(glanceInput),
      revenueBrief,
      glanceInput,
    );
    const attn = composeRoleAttention({
      findings,
      role: roleView,
      scope: locationScope,
      maxAttention: composedCc.maxAttention,
    });
    // Single attention SoT - never let glance invent a conflicting headline
    base = {
      ...base,
      headline: needsYouHeadline(attn.needsYou),
    };
    if (compareMeta) {
      base = {
        ...base,
        meta: compareMeta,
        kicker:
          locationMode === "comparison"
            ? `Compare ${compareVenues?.map((v) => shortLocationName(v.name)).join(", ")}`
            : base.kicker,
      };
    }
    return base;
  }, [
    roleView,
    phase,
    locationName,
    locationScope,
    preBrief,
    hospBrief,
    liveState,
    ctx,
    compareMeta,
    locationMode,
    compareVenues,
    revenueBrief,
    fleetBrief,
    findings,
    composedCc.maxAttention,
  ]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const openHandled = () => setHandledOpen(true);
    window.addEventListener("radr:open-handled", openHandled);
    return () => window.removeEventListener("radr:open-handled", openHandled);
  }, []);
  useEffect(() => {
    if (searchParams.get("proof") === "handled") setHandledOpen(true);
  }, [searchParams]);

  const onFocusCompareVenue = (id: string) => {
    if (comparisonLocationIds.length >= 2) {
      setResumeCompareIds([...comparisonLocationIds]);
    }
    setLocationScope(id as LocationScope);
  };

  const onBackToCompare = () => {
    if (!resumeCompareIds || resumeCompareIds.length < 2) return;
    setComparisonLocationIds(resumeCompareIds);
    setResumeCompareIds(null);
  };

  const floorLens = roleSeesFloorRecovery(roleView);
  const portfolioLens = roleSeesPortfolioRecovery(roleView);

  const onGlanceAction = (signal: GlanceSignal) => {
    switch (signal.action) {
      case "plan":
        setPlanOpen(true);
        break;
      case "hosp":
        setHospOpen(true);
        break;
      case "revenue": {
        if (portfolioLens) {
          setRevenueOpen(true);
          break;
        }
        const id =
          signal.opportunityId ??
          revenueBrief.recoveries.find((r) => r.attentionPhase === "NEEDS_YOU")
            ?.id ??
          revenueBrief.recoveries[0]?.id ??
          null;
        if (id) setRecoveryId(id);
        else setRevenueOpen(true);
        break;
      }
      case "menu":
        setMenuOpen(true);
        break;
      case "live":
        setLiveOpen(true);
        break;
      case "decision":
        setSelectedId(brief.ranked[0]?.finding.id ?? null);
        break;
      default:
        break;
    }
  };

  const recoveryOpp =
    !portfolioLens
      ? revenueBrief.recoveries.find((r) => r.id === recoveryId) ?? null
      : null;
  const justNow =
    !justNowDismissed && floorLens
      ? justNowCancellation(revenueBrief)
      : null;
  const recoveryCounts = useMemo(
    () => recoveryOperatingCounts(revenueBrief),
    [revenueBrief],
  );
  const showTruthRoles =
    roleView === "gm" ||
    roleView === "cfo" ||
    roleView === "owner" ||
    roleView === "coo" ||
    roleView === "fb_operator";

  const selected =
    findings.find((f) => f.id === selectedId) ??
    brief.ranked.find((r) => r.finding.id === selectedId)?.finding ??
    null;

  if (!phaseReady) {
    return <section className="rp-cc3" aria-busy="true" />;
  }

  // Profile-composed Control Center surfaces (demo vertical only sets the profile).
  if (composedCc.surface === "hotel_glance") {
    return (
      <section
        className="rp-cc3 rp-cc3-hotel"
        aria-label="Control Center"
        data-phase={phase}
        data-vertical="boutique_hotel"
        data-profile={operatingProfile.id}
        data-surface={composedCc.surface}
        data-location={CANAL_HOUSE.id}
        data-role={roleView}
      >
        <HotelGlanceBoard />
        <HorizonRail horizon={horizon} />
      </section>
    );
  }

  if (composedCc.surface === "residences_glance") {
    return (
      <section
        className="rp-cc3 rp-cc3-hotel rp-cc3-residences"
        aria-label="Control Center"
        data-phase={phase}
        data-vertical="serviced_apartments"
        data-profile={operatingProfile.id}
        data-surface={composedCc.surface}
        data-location={LISBON_RESIDENCES.id}
        data-role={roleView}
      >
        <ResidencesGlanceBoard />
        <HorizonRail horizon={horizon} />
      </section>
    );
  }

  if (lookPeriod) {
    return (
      <section
        className="rp-cc3 rp-cc3-horizon"
        aria-label="Control Center"
        data-phase="LOOKBACK"
        data-horizon={lookPeriod}
      >
        <LookbackBoard
          period={lookPeriod}
          locationScope={locationScope as LocationScope}
          dayLabel={dayLabelFromStorage()}
          roleView={roleView}
          onOpenLocation={(id) => setLocationScope(id as LocationScope)}
        />
        <HorizonRail horizon={horizon} />
        {handledOpen ? (
          <HandledByRadrSheet
            brief={revenueBrief}
            roleView={roleView}
            onClose={() => setHandledOpen(false)}
          />
        ) : null}
      </section>
    );
  }

  if (isPost && postBrief) {
    return (
      <section
        className="rp-cc3 rp-cc3-horizon"
        aria-label="Control Center"
        data-phase="POST_SHIFT"
        data-fleet={fleetPrimary ? "true" : undefined}
      >
        <header className="rp-cc3-attention" data-tour-target="hero">
          <p className="rp-cc3-greeting">
            {brief.greeting}
            <span>
              {locationName}, {profile.shortLabel}
            </span>
          </p>
          <h1 className="rp-cc3-statement">
            {fleetPrimary ? "Group night complete." : "Shift complete."}
          </h1>
          <p className="rp-cc3-lead">
            {fleetPrimary
              ? "Compare venues first. Open a location only when the group view asks for it."
              : "One picture of the night. Carry forward what’s useful - dig deeper only when you need it."}
          </p>
        </header>
        {fleetPrimary && fleetBrief ? (
          <LocationFleetBoard
            brief={fleetBrief}
            onOpenLocation={(id) => setLocationScope(id as LocationScope)}
          />
        ) : null}
        {!fleetPrimary ? (
          <>
            <ShiftTruth
              phase="POST_SHIFT"
              postBrief={postBrief}
              lens={
                roleSeesPortfolioRecovery(roleView) ? "portfolio" : "floor"
              }
              onDigDeeper={() => setPostDeep(true)}
              onOpenMoneyLine={(id) => setPostMoneyId(id)}
            />
            <PostShiftSummary
              brief={postBrief}
              forceExpanded={postDeep}
              openMoneyId={postMoneyId}
              onOpenMoneyId={setPostMoneyId}
            />
          </>
        ) : (
          <PostShiftSummary
            brief={postBrief}
            forceExpanded={postDeep}
            openMoneyId={postMoneyId}
            onOpenMoneyId={setPostMoneyId}
          />
        )}
        {!fleetPrimary && fleetBrief ? (
          <LocationFleetBoard brief={fleetBrief} />
        ) : null}
        <HorizonRail horizon={horizon} />
        {handledOpen ? (
          <HandledByRadrSheet
            brief={revenueBrief}
            roleView={roleView}
            onClose={() => setHandledOpen(false)}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="rp-cc3 rp-cc3-glance rp-cc3-horizon"
      aria-label="Control Center"
      data-phase={phase}
      data-role={roleView}
      data-profile={operatingProfile.id}
      data-surface={composedCc.surface}
      data-fleet={fleetPrimary ? "true" : undefined}
    >
      {fleetPrimary && fleetBrief ? (
        <LocationFleetBoard
          brief={fleetBrief}
          onOpenLocation={(id) => setLocationScope(id as LocationScope)}
        />
      ) : null}

      {!fleetPrimary && moduleEnabled(composedCc, "attention") ? (
        <CockpitBands
          attention={roleAttention}
          maxAttention={composedCc.maxAttention ?? DEFAULT_MAX_ATTENTION}
          onOpenFinding={(id) => setSelectedId(id)}
        />
      ) : null}

      {!fleetPrimary &&
      moduleEnabled(composedCc, "pre_shift") &&
      (isPre || (isLiveLike && liveState)) &&
      showTruthRoles ? (
        <div className="rp-glance-live-slot" data-placement="top">
          <ShiftTruth
            phase={phase}
            preBrief={isPre ? preBrief : null}
            liveState={isLiveLike ? liveState : null}
            pulse={isLiveLike ? pulse : undefined}
            illustrative={
              isLiveLike ? liveMode === "illustrative" : undefined
            }
            lens={portfolioLens ? "portfolio" : "floor"}
            attention={{
              needsYou: roleAttention.needsYou,
              handling: roleAttention.handling.length,
              handled: recoveryCounts.handled,
            }}
            interrupt={
              justNow
                ? {
                    label: `${justNow.tableLabel} cancelled`,
                    detail: `${justNow.partySize} guests · ${justNow.reservationTime}`,
                    amount: justNow.remainingRevenueExposure,
                    onRecover: () => setRecoveryId(justNow.id),
                    onDismiss: () => setJustNowDismissed(true),
                  }
                : null
            }
            onDigDeeper={() => {
              if (isPre) setPlanOpen(true);
              else setLiveOpen(true);
            }}
            onOpenHandled={() => setHandledOpen(true)}
          />
        </div>
      ) : null}

      {!fleetPrimary ? (
        <GlanceBoard
          brief={glanceBrief}
          onAction={onGlanceAction}
          venues={compareVenues}
          compareHref={compareHref}
          onFocusVenue={onFocusCompareVenue}
          onBackToCompare={
            resumeCompareIds && resumeCompareIds.length >= 2 && !compareVenues
              ? onBackToCompare
              : null
          }
        />
      ) : null}

      {moduleEnabled(composedCc, "predictions") ||
      composedCc.cockpitHiddenSignals.length > 0 ? (
        <HiddenSignalStrip
          title="Needs meaning · live"
          signals={composedCc.cockpitHiddenSignals}
          tone="cockpit"
        />
      ) : null}
      {composedCc.insightHiddenSignals.length > 0 ? (
        <HiddenSignalStrip
          title="Hidden signals · insights"
          signals={composedCc.insightHiddenSignals}
          tone="insights"
        />
      ) : null}

      {!fleetPrimary && fleetBrief ? (
        <LocationFleetBoard
          brief={fleetBrief}
          onOpenLocation={(id) => setLocationScope(id as LocationScope)}
        />
      ) : null}
      <HorizonRail horizon={horizon} />

      <AttentionReviewSheet
        finding={selected}
        roleView={roleView}
        onClose={() => setSelectedId(null)}
      />

      {menuOpen && menuRisk ? (
        <MenuAvailabilityCard
          risk={menuRisk}
          forceOpen
          onClose={() => setMenuOpen(false)}
        />
      ) : null}

      {liveOpen && liveState ? (
        <LiveShiftPanel
          state={liveState}
          roleView={roleView}
          illustrative={liveMode === "illustrative"}
          paused={paused}
          onPause={setPaused}
          onClose={() => setLiveOpen(false)}
        />
      ) : null}

      {planOpen ? (
        <PreShiftPlanPanel
          brief={preBrief}
          guestBrief={guestBrief}
          hospitalityBrief={hospBrief}
          onOpenGuestBrief={() => {
            setPlanOpen(false);
            setGuestOpen(true);
          }}
          onOpenHospitalityBrief={() => {
            setPlanOpen(false);
            setHospOpen(true);
          }}
          onClose={() => setPlanOpen(false)}
        />
      ) : null}

      {guestOpen ? (
        <GuestBriefPanel
          brief={guestBrief}
          onClose={() => setGuestOpen(false)}
        />
      ) : null}

      {hospOpen && hospBrief ? (
        <HospitalityBriefPanel
          brief={hospBrief}
          onClose={() => setHospOpen(false)}
        />
      ) : null}

      {revenueOpen ? (
        <RevenueOpportunitiesPanel
          brief={revenueBrief}
          roleView={roleView}
          onClose={() => setRevenueOpen(false)}
        />
      ) : null}

      {recoveryOpp ? (
        <RecoveryDrawer
          opportunity={recoveryOpp}
          onClose={() => setRecoveryId(null)}
        />
      ) : null}

      {handledOpen ? (
        <HandledByRadrSheet
          brief={revenueBrief}
          roleView={roleView}
          onClose={() => setHandledOpen(false)}
        />
      ) : null}
    </section>
  );
}
