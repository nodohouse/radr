"use client";

/**
 * Renders one dashboard widget body — shared by view mode and the builder canvas.
 * Intelligence modules come from the registry; builder-native widgets live here.
 */

import { memo, useSyncExternalStore } from "react";
import Link from "next/link";
import type { DashboardWidget } from "@/lib/product/dashboards";
import { getIntelligenceModule } from "@/lib/radr/intelligence/moduleRegistry";
import { renderIntelModule } from "@/components/product/intelligence/renderIntelModule";
import {
  getDecisionStoreSnapshot,
  listDecisionRecords,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { scopedDecisionsForDemo } from "@/lib/radr/product/roleScope";
import { MemoryService } from "@/lib/radr/product/services";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { usePathname } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { isNativeWidget } from "@/lib/product/dashboardBuilder";
import {
  renderHotelGmWidget,
  renderMorningBriefWidget,
} from "@/components/product/dashboards/hotel-gm/HotelGmWidgets";

function useDecisionStore() {
  return useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
}

function DecisionList({ band }: { band: "needs_you" | "verified" }) {
  useDecisionStore();
  const { roleView } = useProduct();
  const { session } = useDemoOrg();
  const records = scopedDecisionsForDemo(
    listDecisionRecords({ band }),
    roleView,
    session.vertical,
  ).slice(0, 4);

  if (records.length === 0) {
    return (
      <p className="rp-dbx-native-quiet">
        {band === "needs_you"
          ? "Nothing needs you. RADR is watching."
          : "No verified outcomes since your last check."}
      </p>
    );
  }
  return (
    <ul className="rp-dbx-native-list">
      {records.map((r) => (
        <li key={r.id}>
          <Link href={`/app/decisions/${r.id}`}>
            <strong>{r.title}</strong>
            <span>
              {r.property} · {displayDecisionId(r.id)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MemoryList() {
  useDecisionStore();
  const { roleView } = useProduct();
  const learned = MemoryService.forRole(roleView)
    .filter((r) => r.lesson)
    .slice(0, 3);
  if (learned.length === 0) {
    return (
      <p className="rp-dbx-native-quiet">
        Memory fills in as outcomes are verified.
      </p>
    );
  }
  return (
    <ul className="rp-dbx-native-list">
      {learned.map((r) => (
        <li key={r.id}>
          <Link href={`/app/decisions/${r.id}`}>
            <strong>{r.lesson}</strong>
            <span>
              {r.title} · {displayDecisionId(r.id)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NativeBody({ widget }: { widget: DashboardWidget }) {
  switch (widget.intelligenceModuleId) {
    case "builder_text": {
      const text = widget.config?.text?.trim();
      return text ? (
        <p className="rp-dbx-note">{text}</p>
      ) : (
        <p className="rp-dbx-native-quiet">
          Empty note. Select it and write in Properties.
        </p>
      );
    }
    case "builder_decisions":
      return <DecisionList band="needs_you" />;
    case "builder_verified":
      return <DecisionList band="verified" />;
    case "builder_memory":
      return <MemoryList />;
    default:
      return null;
  }
}

function ModuleBodyImpl({ widget }: { widget: DashboardWidget }) {
  const pathname = usePathname() || "";
  if (pathname.includes("dash_hotel_morning_brief")) {
    const brief = renderMorningBriefWidget(widget.intelligenceModuleId);
    if (brief) return <>{brief}</>;
  }
  if (pathname.includes("dash_hotel_gm")) {
    const hotelSkin = renderHotelGmWidget(widget.intelligenceModuleId);
    if (hotelSkin) return <>{hotelSkin}</>;
  }
  if (isNativeWidget(widget.intelligenceModuleId)) {
    return <NativeBody widget={widget} />;
  }
  const def = getIntelligenceModule(widget.intelligenceModuleId);
  if (!def) {
    return (
      <p className="rp-dash-widget-body">
        Unknown module · {widget.intelligenceModuleId}
      </p>
    );
  }
  return <>{renderIntelModule(def)}</>;
}

/** Re-renders only when the module or its config changes — not on every drag frame. */
export const DashboardModuleBody = memo(
  ModuleBodyImpl,
  (a, b) =>
    a.widget.intelligenceModuleId === b.widget.intelligenceModuleId &&
    JSON.stringify(a.widget.config ?? null) ===
      JSON.stringify(b.widget.config ?? null),
);
