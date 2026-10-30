"use client";

/**
 * Focus Mode — expand Live / Performance / History without leaving CC context.
 * Shareable via ?focus=
 */

import { useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LiveCommandSurface } from "@/components/product/live/LiveCommandSurface";
import { HotelLiveSurface } from "@/components/product/live/HotelLiveSurface";
import { MtdPacePanel } from "@/components/product/live/PaceSurfaces";
import { getGroupMtdPace } from "@/lib/radr/product/revenuePacing";
import { ContributionBridgeViz } from "./OperatingPulseParts";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { OperatingCalendar } from "@/components/product/live/OperatingCalendar";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import type { CcFocus } from "@/lib/radr/product/controlCenter4";
import type { RoleView } from "@/lib/product/types";
import { useProduct } from "@/lib/product/store";
import { YearOnRadr, HOTEL_DEMO_CARDS } from "@/components/product/recap/YearOnRadr";
import Link from "next/link";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { hotelGroupRollup } from "@/lib/radr/demo/hotelDataset";

import { IntelligenceNodeView } from "@/components/product/intelligence/IntelligenceNodeView";
import {
  contributionNodeFromBridge,
  getIntelligenceNode,
} from "@/lib/radr/intelligence/graph";
import "@/components/product/intelligence/intel-node.css";

type Props = {
  focus: CcFocus;
  decisions: NeedsYouRow[];
  roleView: RoleView;
  locationId: string;
  onSelectDecision: (id: string) => void;
  intelNodeId?: string | null;
};

export function CcFocusMode({
  focus,
  decisions,
  roleView,
  locationId,
  onSelectDecision,
  intelNodeId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { period } = useProduct();
  const { isHotel } = useDemoOrg();
  const annual = period === "ytd";
  const hotelLive = canalHouseLive();
  const hotelGroup = hotelGroupRollup();

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("focus");
    next.delete("view");
    next.delete("node");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const setIntelNode = useCallback(
    (nodeId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("stay", "1");
      next.set("focus", "intel");
      next.set("node", nodeId);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!focus) return null;

  const title =
    focus === "live"
      ? "Live Focus"
      : focus === "performance"
        ? "Performance Focus"
        : focus === "history"
          ? "History Focus"
          : focus === "pulse"
            ? "Business Pulse"
            : focus === "intel"
              ? "Intelligence"
              : "Location Focus";

  const intelNode =
    focus === "intel" || focus === "pulse"
      ? intelNodeId === "contribution" || !intelNodeId
        ? contributionNodeFromBridge()
        : getIntelligenceNode(intelNodeId ?? "contribution") ??
          contributionNodeFromBridge()
      : null;

  return (
    <div className="rp-cc4-focus" role="dialog" aria-modal="true" aria-label={title}>
      <div className="rp-cc4-focus-scrim" onClick={close} aria-hidden="true" />
      <div className="rp-cc4-focus-panel">
        <header className="rp-cc4-focus-head">
          <div>
            <p className="rp-cc4-k">{title}</p>
            <p className="rp-cc4-focus-back-hint">Esc or Back returns to Control Center</p>
          </div>
          <button type="button" className="rp-cc4-focus-close" onClick={close}>
            ← Back
          </button>
        </header>
        <div className="rp-cc4-focus-body">
          {focus === "live" ? (
            isHotel ? (
              <HotelLiveSurface
                decisions={decisions}
                onSelectDecision={onSelectDecision}
                density="focus"
              />
            ) : (
              <LiveCommandSurface
                decisions={decisions}
                onSelectDecision={onSelectDecision}
                density="focus"
              />
            )
          ) : null}
          {focus === "performance" ? (
            <>
              {isHotel ? (
                <div className="rp-hotel-perf-focus">
                  <p className="rp-cc4-k">Hotel performance</p>
                  <dl className="rp-hotel-perf-grid">
                    <div>
                      <dt>Occupancy</dt>
                      <dd>{hotelGroup.occupancyPct}%</dd>
                    </div>
                    <div>
                      <dt>ADR</dt>
                      <dd>€{hotelGroup.adr}</dd>
                    </div>
                    <div>
                      <dt>RevPAR</dt>
                      <dd>€{hotelGroup.revpar}</dd>
                    </div>
                    <div>
                      <dt>Ready</dt>
                      <dd>{hotelGroup.readyRatio}</dd>
                    </div>
                    <div>
                      <dt>Exposure</dt>
                      <dd>€{hotelGroup.exposureEuro.toLocaleString("en-IE")}</dd>
                    </div>
                    <div>
                      <dt>Verified</dt>
                      <dd>€{hotelGroup.verifiedEuro.toLocaleString("en-IE")}</dd>
                    </div>
                  </dl>
                  <p className="rp-cc4-lede">
                    {hotelLive.locationName} · tonight {hotelLive.expectedOccTonight}% ·
                    ADR €{hotelLive.expectedAdr} · RevPAR €{hotelLive.expectedRevpar}
                  </p>
                </div>
              ) : annual ? (
                <div className="rp-cc4-year-hook">
                  <YearOnRadr
                    year={2025}
                    cards={isHotel ? HOTEL_DEMO_CARDS : undefined}
                  />
                  <p className="rp-cc4-lede">
                    Full annual story also lives in{" "}
                    <Link href="/app/memory">Operating Memory → Year on RADR</Link>
                  </p>
                </div>
              ) : (
                <>
                  <MtdPacePanel pace={getGroupMtdPace()} />
                  <ContributionBridgeViz bridge={getContributionBridge()} />
                  <p className="rp-cc4-lede">
                    Switch period to <strong>YTD</strong> for Your Year on RADR.
                  </p>
                </>
              )}
            </>
          ) : null}
          {focus === "history" ? (
            <OperatingCalendar
              locationId={
                locationId === "all" ? "loc_berlin_mitte" : locationId
              }
              defaultRange="month"
              onReplayDecision={onSelectDecision}
            />
          ) : null}
          {focus === "pulse" || focus === "intel" ? (
            intelNode ? (
              <IntelligenceNodeView
                node={intelNode}
                surface="focus"
                showEvidence={intelNode.kind === "vendor"}
                onNavigate={setIntelNode}
                onOpenDecision={onSelectDecision}
              />
            ) : null
          ) : null}
          {focus === "location" ? (
            <p className="rp-cc4-lede">
              Open a location from the portfolio pulse for vertical detail.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
