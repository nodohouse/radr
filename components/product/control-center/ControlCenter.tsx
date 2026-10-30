"use client";

/**
 * Control Center 4.0 — one-screen cockpit + Focus Mode.
 * Deep Live/Performance remain via ?focus= (not primary tabs).
 */

import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  useMemo,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { useProduct } from "@/lib/product/store";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { DecisionPreviewDrawer } from "./DecisionPreviewDrawer";
import { IntelligenceExplorerDrawer } from "./IntelligenceExplorerDrawer";
import { VisionGmCockpit } from "./vision/VisionGmCockpit";
import { HotelCockpit } from "./HotelCockpit";
import { CfoControlCenter } from "./cfo-center/CfoControlCenter";
import { CcFocusMode } from "./CcFocusMode";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  hotelNeedsYouDecisions,
  hotelHandlingDecisions,
} from "@/lib/radr/demo/hotelDecisions";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import {
  composeControlCenterExperience,
  prioritizeNeedsYouIds,
} from "@/lib/radr/product/experienceComposer";
import type { CcFocus } from "@/lib/radr/product/controlCenter4";
import "@/app/intelligence-app.css";
import "@/app/operating-day.css";
import "./control-center.css";
import "@/app/product-command.css";
import "@/app/dashboard-modules.css";
import "./control-center-4.css";
import "./control-center-cockpit.css";
import "./hotel-cockpit.css";

function useStoreTick() {
  return useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
}

function useDecisionStore() {
  return useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
}

function parseFocus(search: URLSearchParams): CcFocus {
  const focus = search.get("focus");
  if (
    focus === "live" ||
    focus === "performance" ||
    focus === "history" ||
    focus === "pulse" ||
    focus === "location" ||
    focus === "intel"
  ) {
    return focus;
  }
  const view = search.get("view");
  if (view === "live" || view === "performance") return view;
  return null;
}

export function ControlCenter() {
  useStoreTick();
  const decisionSnap = useDecisionStore();
  const { roleView, locationScope, period } = useProduct();
  const { isHotel } = useDemoOrg();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [explorerMetricId, setExplorerMetricId] = useState<string | null>(null);
  const peekTriggerRef = useRef<HTMLElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const focus = parseFocus(searchParams);
  const intelNodeId = searchParams.get("node");

  const openPreview = useCallback((id: string) => {
    const active = document.activeElement;
    peekTriggerRef.current =
      active instanceof HTMLElement ? active : null;
    setExplorerMetricId(null);
    setPreviewId(id);
  }, []);

  const promoteIntelDepth = useCallback(
    (nodeId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("stay", "1");
      next.set("focus", "intel");
      next.set("node", nodeId);
      setExplorerMetricId(null);
      // Hard assign: soft router.push from the inert portal can no-op.
      window.location.assign(`${pathname}?${next.toString()}`);
    },
    [pathname, searchParams],
  );

  const locationId =
    locationScope === "all" || locationScope.startsWith("region_")
      ? "all"
      : locationScope === "loc_ber"
        ? "loc_berlin_mitte"
        : locationScope;

  const brief = useMemo(
    () =>
      composeControlCenterBrief({
        role: roleView,
        locationId,
        vertical: isHotel ? "hotel" : "restaurant",
        period:
          period === "yesterday"
            ? "mtd"
            : (period as "mtd" | "wtd" | "today" | "ytd"),
      }),
    [roleView, locationId, period, isHotel],
  );

  const pulse = useMemo(
    () => getBusinessPulse(roleView, isHotel ? "hotel" : "restaurant"),
    [roleView, isHotel],
  );
  const hotelNeeds = useMemo(() => hotelNeedsYouDecisions(), []);
  const hotelHandling = useMemo(() => hotelHandlingDecisions(), []);

  const hotelPreviewRow = useMemo(() => {
    if (!isHotel || !previewId) return null;
    const d =
      hotelNeeds.find((r) => r.id === previewId) ??
      hotelHandling.find((r) => r.id === previewId);
    if (!d) return null;
    return {
      id: d.id,
      displayId: d.displayId,
      classLabel: d.family,
      title: d.title,
      recommendation: d.verb,
      economicLabel: "Expected",
      economicValue: d.economicEuro,
      economicFormatted: d.economicFormatted,
      horizon: "NOW",
      deadlineLabel: d.deadlineLabel,
      locationLabel: d.locationLabel,
      severity: "urgent" as const,
      record:
        decisionSnap.records[d.id] ??
        (null as unknown as NeedsYouRow["record"]),
      contextLine: d.why,
    };
  }, [isHotel, previewId, hotelNeeds, hotelHandling, decisionSnap.records]);

  const preview =
    (hotelPreviewRow as NeedsYouRow | null) ??
    brief.needsYou.find((r) => r.id === previewId) ??
    brief.handling.find((r) => r.id === previewId) ??
    null;

  const closePreview = useCallback(() => setPreviewId(null), []);
  const closeExplorer = useCallback(() => setExplorerMetricId(null), []);

  const experience = useMemo(
    () =>
      composeControlCenterExperience({
        role: roleView,
        locationScope,
        vertical: isHotel ? "hotel" : "restaurant",
        period:
          period === "yesterday"
            ? "mtd"
            : (period as "mtd" | "wtd" | "today" | "ytd"),
      }),
    [roleView, locationScope, isHotel, period],
  );

  const rankedNeedsYou = useMemo(
    () =>
      prioritizeNeedsYouIds(brief.needsYou, experience.decisionPriorityIds),
    [brief.needsYou, experience.decisionPriorityIds],
  );

  const hotelFocusDecisions = hotelNeeds.map((d) => ({
    id: d.id,
    displayId: d.displayId,
    classLabel: d.family,
    title: d.title,
    recommendation: d.verb,
    economicLabel: "Expected",
    economicValue: d.economicEuro,
    economicFormatted: d.economicFormatted,
    horizon: "NOW",
    deadlineLabel: d.deadlineLabel,
    locationLabel: d.locationLabel,
    severity: "urgent" as const,
    record:
      decisionSnap.records[d.id] ??
      (null as unknown as NeedsYouRow["record"]),
  }));

  const isExecutiveCfo =
    roleView === "cfo" ||
    roleView === "finance" ||
    roleView === "owner" ||
    roleView === "coo" ||
    roleView === "regional";

  return (
    <div
      className="rp-ccx rp-cc-vision"
      data-depth="command"
      data-vertical={isHotel ? "hotel" : "restaurant"}
    >
      {isExecutiveCfo ? (
        <CfoControlCenter
          industry={isHotel ? "hotels" : "restaurants"}
          embedded
        />
      ) : isHotel ? (
        <HotelCockpit onSelectDecision={openPreview} />
      ) : (
        <VisionGmCockpit
          pulse={pulse}
          needsYou={rankedNeedsYou}
          verifiedFormatted={brief.verifiedFormatted}
          onSelectDecision={openPreview}
        />
      )}

      <CcFocusMode
        focus={focus}
        decisions={isHotel ? hotelFocusDecisions : rankedNeedsYou}
        roleView={roleView}
        locationId={String(isHotel ? "loc_canal_house" : locationId)}
        onSelectDecision={openPreview}
        intelNodeId={intelNodeId}
      />

      <DecisionPreviewDrawer
        decisionId={previewId}
        row={preview}
        onClose={closePreview}
        triggerRef={peekTriggerRef}
      />

      <IntelligenceExplorerDrawer
        metricId={explorerMetricId}
        onClose={closeExplorer}
        onPromoteDepth={promoteIntelDepth}
        onOpenDecision={(id) => {
          setExplorerMetricId(null);
          openPreview(id);
        }}
        triggerRef={peekTriggerRef}
      />
    </div>
  );
}
