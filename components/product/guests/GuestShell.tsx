"use client";

import { Heading } from "../reference/ReferenceUI";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  guestOverviewModel,
  type GuestSegmentId,
} from "@/lib/radr/product/guestAttention";
import { GuestOverview } from "./GuestOverview";
import { GuestFloor } from "./GuestFloor";
import { GuestSegments } from "./GuestSegments";
import { GuestFeedback } from "./GuestFeedback";
import "./guest.css";

export type GuestView = "overview" | "floor" | "segments" | "feedback";

const VIEWS: { id: GuestView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "floor", label: "Live Floor" },
  { id: "segments", label: "Segments" },
  { id: "feedback", label: "Feedback" },
];

function parseView(raw: string | null): GuestView {
  if (VIEWS.some((v) => v.id === raw)) return raw as GuestView;
  return "overview";
}

export function GuestShell() {
  const { isHotel } = useDemoOrg();
  const router = useRouter();
  const pathname = usePathname() || "/app/guests";
  const search = useSearchParams();
  const [view, setView] = useState<GuestView>(() => parseView(search.get("view")));
  const [table, setTable] = useState(() => search.get("table"));
  const [segment, setSegment] = useState(() => search.get("segment"));

  const model = guestOverviewModel();

  const pushState = useCallback(
    (next: {
      view?: GuestView;
      table?: string | null;
      segment?: string | null;
    }) => {
      const sp = new URLSearchParams(search.toString());
      if (next.view) sp.set("view", next.view);
      if (next.table === null) sp.delete("table");
      else if (next.table) sp.set("table", next.table);
      if (next.segment === null) sp.delete("segment");
      else if (next.segment) sp.set("segment", next.segment);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router, search],
  );

  useEffect(() => {
    setView(parseView(search.get("view")));
    setTable(search.get("table"));
    setSegment(search.get("segment"));
  }, [search]);

  const selectView = (id: GuestView) => {
    setView(id);
    if (id !== "floor") setTable(null);
    if (id !== "segments") setSegment(null);
    pushState({
      view: id,
      table: id === "floor" ? table : null,
      segment: id === "segments" ? segment : null,
    });
  };

  const openFloorTable = (tableId: string) => {
    setView("floor");
    setTable(tableId);
    pushState({ view: "floor", table: tableId });
  };

  const openSegment = (id: GuestSegmentId) => {
    setView("segments");
    setSegment(id);
    pushState({ view: "segments", segment: id });
  };

  const openProfile = (guestId: string) => {
    router.push(`/app/guests/profile/${guestId}`);
  };

  let body: ReactNode = null;
  if (view === "overview") {
    body = (
      <GuestOverview
        model={model}
        onOpenView={selectView}
        onOpenFloorTable={openFloorTable}
        onOpenSegment={openSegment}
        onOpenProfile={openProfile}
      />
    );
  } else if (view === "floor") {
    body = (
      <GuestFloor
        tableId={table}
        onSelectTable={openFloorTable}
        onOpenView={selectView}
        onOpenProfile={openProfile}
      />
    );
  } else if (view === "segments") {
    body = (
      <GuestSegments
        segmentId={segment}
        onSelectSegment={openSegment}
        onOpenView={selectView}
        onOpenProfile={openProfile}
      />
    );
  } else {
    body = (
      <GuestFeedback
        onOpenView={selectView}
        onOpenFloorTable={openFloorTable}
      />
    );
  }

  return (
    <div className="gi-root" data-view={view} data-vertical={isHotel ? "hotel" : "restaurant"}>
      {view !== "overview" ? null : (
        <Heading eyebrow="Guest intelligence" title="Know the guest behind the visit." description={model.subtitle} />
      )}

      <nav className="gi-nav" aria-label="Guest views">
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
