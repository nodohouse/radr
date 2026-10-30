"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  buildDataHealthOverview,
  filterEvidenceSources,
  parseDataHealthSourceId,
  parseDataHealthStatus,
  parseInspectorTab,
  type DataHealthStatusFilter,
  type InspectorTab,
} from "@/lib/radr/product/dataHealthProofEngine";
import { DataHealthOverview } from "./DataHealthOverview";
import "./data-health-engine.css";

export function DataHealthShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/data-health";
  const searchParams = useSearchParams();
  const { roleView } = useProduct();
  const { session, isHotel } = useDemoOrg();

  const vertical = isHotel ? "hotel" : session.vertical;
  const model = useMemo(
    () => buildDataHealthOverview(roleView, vertical),
    [roleView, vertical],
  );

  const statusFilter = parseDataHealthStatus(searchParams.get("status"));
  const tab = parseInspectorTab(searchParams.get("tab"));
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [trustOpen, setTrustOpen] = useState(false);

  // Deep link: ?decision=D-4102 → select owning source
  const decisionParam = searchParams.get("decision");
  const selectedFromDecision = useMemo(() => {
    if (!decisionParam) return null;
    const hit = model.sources.find(
      (s) =>
        s.evidenceTags.some(
          (t) => t.toLowerCase() === decisionParam.toLowerCase(),
        ) ||
        s.affectedDecisions.some(
          (d) =>
            d.label.toLowerCase() === decisionParam.toLowerCase() ||
            d.id === decisionParam,
        ),
    );
    return hit?.id ?? null;
  }, [decisionParam, model.sources]);

  const selectedId =
    selectedFromDecision ??
    parseDataHealthSourceId(searchParams.get("source"), model.sources);

  // PASS 2 default: open Xero inspector when no source/decision in URL
  useEffect(() => {
    if (
      searchParams.get("source") ||
      searchParams.get("decision") ||
      searchParams.get("cleared") === "1"
    ) {
      return;
    }
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("source", "xero");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : `${pathname}?source=xero`, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const filtered = useMemo(
    () => filterEvidenceSources(model.sources, query, statusFilter),
    [model.sources, query, statusFilter],
  );

  const pushState = useCallback(
    (patch: {
      status?: DataHealthStatusFilter;
      source?: string | null;
      tab?: InspectorTab;
      search?: string;
      decision?: string | null;
    }) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (patch.status !== undefined) {
        if (patch.status === "all") sp.delete("status");
        else sp.set("status", patch.status);
      }
      if (patch.source !== undefined) {
        if (!patch.source) {
          sp.delete("source");
          sp.set("cleared", "1");
        } else {
          sp.set("source", patch.source);
          sp.delete("cleared");
        }
        sp.delete("decision");
      }
      if (patch.tab !== undefined) {
        if (patch.tab === "overview") sp.delete("tab");
        else sp.set("tab", patch.tab);
      }
      if (patch.search !== undefined) {
        if (!patch.search.trim()) sp.delete("search");
        else sp.set("search", patch.search.trim());
      }
      if (patch.decision !== undefined) {
        if (!patch.decision) sp.delete("decision");
        else sp.set("decision", patch.decision);
      }
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="dh-root" data-data-health-engine="true">
      <DataHealthOverview
        model={model}
        sources={filtered}
        selectedId={selectedId}
        statusFilter={statusFilter}
        search={query}
        tab={tab}
        onSelect={(id) => pushState({ source: id })}
        onStatusFilter={(f) => pushState({ status: f })}
        onSearch={(q) => {
          setQuery(q);
          pushState({ search: q });
        }}
        onTab={(t) => pushState({ tab: t })}
        onOpenTrust={() => setTrustOpen(true)}
      />

      {trustOpen ? (
        <div
          className="dh-inspector"
          role="dialog"
          aria-label="How RADR calculates evidence trust"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 320,
            zIndex: 40,
            boxShadow: "0 16px 40px rgba(10,13,11,0.18)",
          }}
        >
          <div className="dh-insp-head">
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              How RADR calculates evidence trust
            </h3>
            <button
              type="button"
              className="dh-link"
              onClick={() => setTrustOpen(false)}
            >
              ×
            </button>
          </div>
          <ul className="dh-dec-list">
            <li>
              <strong style={{ fontWeight: 700 }}>Freshness</strong>
              <span>35%</span>
            </li>
            <li>
              <strong style={{ fontWeight: 700 }}>Completeness</strong>
              <span>30%</span>
            </li>
            <li>
              <strong style={{ fontWeight: 700 }}>Conflicts / consistency</strong>
              <span>25%</span>
            </li>
            <li>
              <strong style={{ fontWeight: 700 }}>Coverage</strong>
              <span>10%</span>
            </li>
          </ul>
          <p className="dh-cell-meta" style={{ marginTop: 12 }}>
            {model.trustTooltip}
          </p>
          <p className="dh-cell-meta" style={{ marginTop: 8 }}>
            Current Trust Score: <strong>{model.trustScore}%</strong> (derived
            from source evidence confidences).
          </p>
        </div>
      ) : null}
    </div>
  );
}
