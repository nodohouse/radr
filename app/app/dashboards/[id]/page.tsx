"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getDashboard,
  togglePinDashboard,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import { DashboardWidgetGrid } from "@/components/product/dashboards/DashboardWidgetGrid";
import { HOTEL_GM_DASH_META } from "@/lib/radr/product/hotelGmDashboardCanon";
import { HOTEL_MORNING_BRIEF_META } from "@/lib/radr/product/hotelMorningBriefCanon";
import "@/components/product/dashboards/hotel-gm/hotel-gm-dashboard.css";

export default function DashboardDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const search = useSearchParams();
  const router = useRouter();

  const [dash, setDash] = useState<RadrDashboard | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isHotelGm = id === "dash_hotel_gm";
  const isMorningBrief = id === "dash_hotel_morning_brief";

  // Scope / persona live in GlobalOperatingHeader — body only shows freshness.

  useEffect(() => {
    if (search.get("edit") === "1") router.replace(`/app/dashboards/${id}/edit`);
  }, [search, router, id]);

  const load = useCallback(() => {
    setDash(getDashboard(id));
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) return <div className="rp-dash-view" aria-busy="true" />;

  if (!dash) {
    return (
      <div className="rp-dash-view">
        <p>Dashboard not found.</p>
        <Link href="/app/dashboards">← Library</Link>
      </div>
    );
  }

  const updatedClock = isMorningBrief
    ? HOTEL_MORNING_BRIEF_META.briefClock
    : isHotelGm
      ? HOTEL_GM_DASH_META.lastUpdatedClock
      : new Date(dash.updatedAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

  const subhead = `Last updated ${updatedClock}`;

  const dashAttr = isMorningBrief
    ? "morning-brief"
    : isHotelGm
      ? "hotel-gm"
      : undefined;

  return (
    <div className="rp-dash-view" data-dash={dashAttr}>
      <header className="rp-dash-view-head">
        <div>
          <Link href="/app/dashboards" className="rp-cc4-focus-link">
            ← Dashboards
          </Link>
          <h1>{dash.name}</h1>
          <p className="rp-dash-view-subhead">{subhead}</p>
        </div>
        <div className="rp-dash-view-actions">
          <button
            type="button"
            data-pinned={dash.pinned ? "true" : undefined}
            onClick={() => {
              togglePinDashboard(dash.id);
              load();
            }}
          >
            {dash.pinned ? "★ Pinned" : "☆ Pin to navigation"}
          </button>
          <Link
            href={`/app/dashboards/${id}/edit`}
            data-testid="dashboard-edit"
          >
            Customize
          </Link>
        </div>
      </header>

      {dash.widgets.length === 0 ? (
        <div className="rp-dash-lib-empty">
          <p>Build this around the questions you ask most.</p>
          <Link href={`/app/dashboards/${id}/edit`}>Add modules →</Link>
        </div>
      ) : (
        <DashboardWidgetGrid widgets={dash.widgets} />
      )}
    </div>
  );
}
