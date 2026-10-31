"use client";

import { Heading, Arrow } from "../reference/ReferenceUI";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  applyDecisionStatusToHouse,
  houseAttentionFor,
  type HouseAttentionState,
} from "@/lib/radr/product/houseAttention";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { BohOverview } from "./BohOverview";
import { BohCaptures } from "./BohCaptures";
import { BohCriticalAction } from "./BohCriticalAction";
import { BohStock } from "./BohStock";
import { BohPrep } from "./BohPrep";
import { BohDeliveries } from "./BohDeliveries";
import { BohWaste } from "./BohWaste";
import "./boh.css";

export type BohView =
  | "overview"
  | "captures"
  | "stock"
  | "prep"
  | "deliveries"
  | "waste";

const VIEWS: { id: BohView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "captures", label: "Captures" },
  { id: "stock", label: "Stock" },
  { id: "prep", label: "Prep & Line" },
  { id: "deliveries", label: "Deliveries" },
  { id: "waste", label: "Waste" },
];

function parseView(raw: string | null): BohView {
  if (VIEWS.some((v) => v.id === raw)) return raw as BohView;
  return "overview";
}

export function BohShell() {
  const { session, isHotel } = useDemoOrg();
  const router = useRouter();
  const pathname = usePathname() || "/app/house";
  const search = useSearchParams();
  const [view, setView] = useState<BohView>(() => parseView(search.get("view")));
  const [item, setItem] = useState(() => search.get("item"));
  const [statusFilter, setStatusFilter] = useState<HouseAttentionState | "all">(
    "all",
  );
  const [verdicts, setVerdicts] = useState<
    Record<string, "confirmed" | "corrected">
  >({});
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const [received, setReceived] = useState<Record<string, boolean>>({});

  const decisionSnap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const house = useMemo(() => {
    const base = houseAttentionFor(session.vertical);
    return applyDecisionStatusToHouse(base, {
      [DECISION_IDS.casterSugar]:
        decisionSnap.records[DECISION_IDS.casterSugar]?.status,
      [DECISION_IDS.hotelReadiness]:
        decisionSnap.records[DECISION_IDS.hotelReadiness]?.status,
    });
  }, [session.vertical, decisionSnap]);

  const pushState = useCallback(
    (next: { view?: BohView; item?: string | null }) => {
      const sp = new URLSearchParams(search.toString());
      if (next.view) sp.set("view", next.view);
      if (next.item === null) sp.delete("item");
      else if (next.item) sp.set("item", next.item);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router, search],
  );

  useEffect(() => {
    setView(parseView(search.get("view")));
    setItem(search.get("item"));
  }, [search]);

  const selectView = (id: BohView) => {
    setView(id);
    if (id !== "stock") {
      setItem(null);
      pushState({ view: id, item: null });
    } else {
      pushState({ view: id, item });
    }
  };

  const openStockItem = (slug: string) => {
    setView("stock");
    setItem(slug);
    pushState({ view: "stock", item: slug });
  };

  const openActions = () => openStockItem("caster-sugar");


  let body: ReactNode = null;
  if (view === "overview") {
    body = (
      <BohOverview
        house={house}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onOpenActions={openActions}
        onOpenView={selectView}
        onOpenStockItem={openStockItem}
        isHotel={isHotel}
      />
    );
  } else if (view === "captures") {
    body = (
      <BohCaptures
        house={house}
        onOpenView={selectView}
        onOpenStockItem={openStockItem}
        verdicts={verdicts}
        onVerdict={(id, v) => setVerdicts((prev) => ({ ...prev, [id]: v }))}
      />
    );
  } else if (view === "stock" && item) {
    body = (
      <BohCriticalAction
        house={house}
        itemSlug={item}
        onOpenView={selectView}
        onOpenStockItem={openStockItem}
        acked={acked}
        onAck={(id) => setAcked((prev) => ({ ...prev, [id]: true }))}
      />
    );
  } else if (view === "stock") {
    body = (
      <BohStock
        house={house}
        onOpenView={selectView}
        onOpenStockItem={openStockItem}
        acked={acked}
        onAck={(id) => setAcked((prev) => ({ ...prev, [id]: true }))}
      />
    );
  } else if (view === "prep") {
    body = (
      <BohPrep house={house} onOpenView={selectView} isHotel={isHotel} />
    );
  } else if (view === "deliveries") {
    body = (
      <BohDeliveries
        house={house}
        onOpenView={selectView}
        received={received}
        onReceive={(id) => setReceived((prev) => ({ ...prev, [id]: true }))}
      />
    );
  } else if (view === "waste") {
    body = (
      <BohWaste house={house} onOpenView={selectView} isHotel={isHotel} />
    );
  }

  return (
    <div className="boh-root" data-view={view} data-vertical={session.vertical}>
      <Heading eyebrow="Back of House" title={isHotel?"Behind every ready room.":"Behind every smooth service."} description={isHotel?"Supplies, housekeeping observations and readiness evidence.":"Stock, staff observations and service readiness in one place."} aside={<button type="button" className="rs-section-action" onClick={()=>selectView("captures")}>Review captures <Arrow /></button>} />
      {view==="overview"?<section className="boh-capture-intro" aria-label="Staff capture workflow"><div><span className="rs-eyebrow">FROM THE FLOOR TO THE RECORD</span><h2>See it. Say it. Keep the evidence.</h2><p>{isHotel?"Room checks, linen, amenities and supplies.":"Storerooms, ingredients, supplies and prep."} Camera, voice and notes come together for review.</p><button type="button" onClick={()=>selectView("captures")}>Explore capture evidence <Arrow /></button><small>Demo evidence feed · staff app connection planned</small></div><ol><li><b>01</b><span>Capture<small>Video, photos, voice or notes</small></span></li><li><b>02</b><span>Review<small>Confirm quantities and uncertain observations</small></span></li><li><b>03</b><span>Act<small>Connect shortages and issues to a decision</small></span></li></ol></section>:null}

      <nav className="boh-nav" aria-label="Back of house views">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={view === v.id ? "is-active" : undefined}
            onClick={() => selectView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      {body}
    </div>
  );
}
