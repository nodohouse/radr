/**
 * Shared Intelligence module renderer — hub + Control Center pins.
 */

import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { getTopDishes } from "@/lib/radr/intelligence/topDishes";
import {
  getMenuContribution,
  getMetricModule,
  getSettlementBridge,
  getSupplierVarianceSummary,
} from "@/lib/radr/intelligence/opsModules";
import type { IntelModuleDef } from "@/lib/radr/intelligence/moduleRegistry";
import {
  LiveServiceModule,
  MenuContributionModule,
  MetricModule,
  SettlementBridgeModule,
  SupplierVarianceModule,
  TopDishesModule,
} from "@/components/product/intelligence/IntelModules";
import {
  DayPaceHero,
  HotelDayPaceHero,
  MtdPacePanel,
  CombinedDemandCard,
  CancellationIntelCard,
} from "@/components/product/live/PaceSurfaces";
import {
  getRestaurantDayPace,
  getGroupMtdPace,
  getHotelDayPace,
} from "@/lib/radr/product/revenuePacing";
import {
  getCombinedTonightDemand,
  getCancellationIntel,
  getBerlinExternalSignals,
} from "@/lib/radr/product/externalSignals";
import {
  getHotelRoomReadinessModule,
  getHotelOccAdrRevparModule,
  getHotelHkModule,
  getHotelCancelModule,
} from "@/lib/radr/intelligence/hotelModules";
import { isHotelDemo } from "@/lib/radr/demo/demoOrgSession";
import { HotelBookingPace } from "@/components/product/hotel/HotelBookingPace";
import { HotelDistributionViz } from "@/components/product/hotel/HotelDistributionViz";
import { CostMovers } from "@/components/product/procurement/CostMovers";
import "@/components/product/control-center/hotel-cockpit.css";

export function renderIntelModule(def: IntelModuleDef) {
  if (def.id === "room_readiness") {
    return (
      <MetricModule
        key={def.id}
        def={def}
        data={getHotelRoomReadinessModule()}
      />
    );
  }
  if (def.id === "hotel_pickup") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size="full">
        <p className="rp-intel-mod-title">{def.title}</p>
        <p className="rp-intel-mod-desc">{def.description}</p>
        <HotelBookingPace />
      </div>
    );
  }
  if (def.id === "hotel_occ_adr_revpar") {
    return (
      <MetricModule
        key={def.id}
        def={def}
        data={getHotelOccAdrRevparModule()}
      />
    );
  }
  if (def.id === "hk_productivity") {
    return (
      <MetricModule key={def.id} def={def} data={getHotelHkModule()} />
    );
  }
  if (def.id === "hotel_channel_mix") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size="full">
        <p className="rp-intel-mod-title">{def.title}</p>
        <p className="rp-intel-mod-desc">{def.description}</p>
        <HotelDistributionViz />
      </div>
    );
  }
  if (def.id === "hotel_cancellation") {
    return (
      <MetricModule key={def.id} def={def} data={getHotelCancelModule()} />
    );
  }
  if (def.id === "live_service") {
    return (
      <LiveServiceModule
        key={def.id}
        def={def}
        data={getLiveServicePerformance()}
      />
    );
  }
  if (def.id === "revenue_pace_day") {
    if (isHotelDemo()) {
      return (
        <div key={def.id} className="rp-intel-mod" data-size="full">
          <HotelDayPaceHero pace={getHotelDayPace()} />
        </div>
      );
    }
    return (
      <div key={def.id} className="rp-intel-mod" data-size="full">
        <DayPaceHero pace={getRestaurantDayPace()} />
      </div>
    );
  }
  if (def.id === "revenue_pace_mtd") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size="full">
        <MtdPacePanel pace={getGroupMtdPace()} />
      </div>
    );
  }
  if (def.id === "tonight_demand") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size="half">
        <CombinedDemandCard ctx={getCombinedTonightDemand()} />
      </div>
    );
  }
  if (def.id === "cancellation_intel") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size="half">
        <CancellationIntelCard data={getCancellationIntel()} />
      </div>
    );
  }
  if (def.id === "weather_context" || def.id === "event_context") {
    const signals = getBerlinExternalSignals().filter((s) =>
      def.id === "weather_context" ? s.type === "weather" : s.type !== "weather",
    );
    const s = signals[0];
    return (
      <MetricModule
        key={def.id}
        def={def}
        data={{
          moduleId: def.id,
          primaryLabel: s?.label ?? def.title,
          primaryValue:
            s != null
              ? `${s.demandDeltaPct >= 0 ? "+" : ""}${s.demandDeltaPct}%`
              : "—",
          comparisonLabel: "Modeled demand effect",
          comparisonValue: s?.expectedOperationalEffect ?? "Needs data",
          radrRead: s
            ? `${s.source} · ${s.confidence} confidence · historically associated`
            : "Required evidence is not connected yet.",
          judgment: s ? "WATCHING" : "NEEDS_DATA",
          state: s ? "WATCHING" : "MISSING_DATA",
          relatedDecisionId: null,
          comparisonType: "vs baseline",
          periodLabel: "Tonight",
        }}
      />
    );
  }
  if (def.id === "top_dishes") {
    return (
      <TopDishesModule key={def.id} def={def} data={getTopDishes("tonight")} />
    );
  }
  if (def.id === "menu_contribution") {
    return (
      <MenuContributionModule
        key={def.id}
        def={def}
        data={getMenuContribution()}
      />
    );
  }
  if (def.id === "settlement_bridge") {
    return (
      <SettlementBridgeModule
        key={def.id}
        def={def}
        data={getSettlementBridge()}
      />
    );
  }
  if (def.id === "supplier_variance") {
    return (
      <SupplierVarianceModule
        key={def.id}
        def={def}
        data={getSupplierVarianceSummary()}
      />
    );
  }
  if (def.id === "cost_movers") {
    return (
      <div key={def.id} className="rp-intel-mod" data-size={def.defaultSize}>
        <CostMovers compact={def.defaultSize === "compact"} />
      </div>
    );
  }
  const metric = getMetricModule(
    def.id,
    isHotelDemo() ? "hotel" : "restaurant",
  );
  if (metric) {
    return <MetricModule key={def.id} def={def} data={metric} />;
  }
  return (
    <MetricModule
      key={def.id}
      def={def}
      data={{
        moduleId: def.id,
        primaryLabel: def.title,
        primaryValue: "—",
        comparisonLabel: "Needs data",
        comparisonValue: def.requiredEvidence.join(" · ") || "Unavailable",
        radrRead: "Required evidence is not connected yet.",
        judgment: "NEEDS_DATA",
        state: "MISSING_DATA",
        relatedDecisionId: null,
        comparisonType: "—",
        periodLabel: "—",
        needsData: `Requires ${def.requiredEvidence.join(" + ")}`,
      }}
    />
  );
}
