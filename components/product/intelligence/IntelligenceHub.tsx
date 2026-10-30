"use client";

/**
 * Intelligence — Findings list · one selected analysis · RADR rail.
 * Progressive disclosure: expand nothing by default except selection.
 */

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import {
  listIntelligenceModules,
  type IntelCategory,
  intelCategoriesForVertical,
  getIntelligenceModule,
} from "@/lib/radr/intelligence/moduleRegistry";
import { renderIntelModule } from "@/components/product/intelligence/renderIntelModule";
import { useIntelligencePinsOptional } from "@/components/product/intelligence/IntelligencePinContext";
import { PillNav } from "@/components/product/ui/PillNav";
import {
  curatedIntelModuleIds,
  resolveExperienceContext,
} from "@/lib/radr/product/experienceComposer";
import { getRecommendedIntelligenceModules } from "@/lib/radr/intelligence/recommendedModules";
import { modulesForIntelligenceCategory } from "@/lib/radr/intelligence/categoryModules";
import { AddToDashboardButton } from "@/components/product/dashboards/AddToDashboardButton";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { PinButton } from "@/components/product/intelligence/IntelModules";
import {
  evidenceLabels,
  getIntelBrief,
  judgmentLabel,
  type IntelBrief,
} from "@/components/product/intelligence/moduleBrief";
import type { IntelModuleDef } from "@/lib/radr/intelligence/moduleRegistry";
import "@/app/intelligence-app.css";
import "@/components/product/intelligence/intelligence-hub.css";

const PROCUREMENT_ONLY = new Set(["supplier_variance"]);

export function IntelligenceHub() {
  const { roleView } = useProduct();
  const { isHotel } = useDemoOrg();
  const vertical = isHotel ? "hotel" : "restaurant";
  const categories = intelCategoriesForVertical(vertical);
  const validCat = useMemo(
    () => new Set(categories.map((c) => c.id)),
    [categories],
  );
  const pins = useIntelligencePinsOptional();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawCat = searchParams.get("cat");
  const category: IntelCategory =
    rawCat && validCat.has(rawCat as IntelCategory)
      ? (rawCat as IntelCategory)
      : "overview";
  const period = searchParams.get("period") ?? "live";
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const setCategory = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id === "overview") next.delete("cat");
      else next.set("cat", id);
      const qs = next.toString();
      setSelectedId(null);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const overviewIds = useMemo(() => {
    const ctx = resolveExperienceContext({
      role: roleView,
      locationScope: "all",
      period: period === "live" ? "today" : "mtd",
    });
    const curated = curatedIntelModuleIds({
      ...ctx,
      vertical: isHotel ? "hotel" : ctx.vertical,
      role: roleView,
    });
    const recommended = getRecommendedIntelligenceModules({
      role: roleView,
      vertical,
      temporalState: period === "live" ? "live" : "mtd",
    }).map((m) => m.id);
    const merged = [...curated, ...recommended].filter(
      (id) => getIntelligenceModule(id) && !PROCUREMENT_ONLY.has(id),
    );
    return Array.from(new Set(merged)).slice(0, 8);
  }, [roleView, period, vertical, isHotel]);

  const overviewMods = useMemo(() => {
    return modulesForIntelligenceCategory(category, overviewIds, vertical)
      .map((id) => getIntelligenceModule(id))
      .filter(Boolean) as IntelModuleDef[];
  }, [category, overviewIds, vertical]);

  const ranked = useMemo(() => {
    const query = q.trim().toLowerCase();
    const seen = new Set<string>();
    return overviewMods
      .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
      .filter(
        (m) =>
          !query ||
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query),
      )
      .map((def, i) => ({ def, brief: getIntelBrief(def, vertical), i }))
      .sort((a, b) => b.brief.weight - a.brief.weight || a.i - b.i);
  }, [overviewMods, q, vertical]);

  const hotelIds = useMemo(
    () =>
      new Set([
        "room_readiness",
        "hotel_pickup",
        "hotel_occ_adr_revpar",
        "hk_productivity",
        "hotel_channel_mix",
        "hotel_cancellation",
      ]),
    [],
  );

  const catalogExtra = useMemo(() => {
    if (category !== "overview") return [] as { def: IntelModuleDef; brief: IntelBrief }[];
    const shown = new Set(ranked.map((r) => r.def.id));
    let base = listIntelligenceModules().filter((m) => !shown.has(m.id));
    if (isHotel) {
      base = base.filter(
        (m) =>
          hotelIds.has(m.id) ||
          m.id.startsWith("revenue_pace") ||
          m.id === "verified_value_trend",
      );
    } else {
      base = base.filter((m) => !hotelIds.has(m.id));
    }
    return base.slice(0, 12).map((def) => ({
      def,
      brief: getIntelBrief(def, vertical),
    }));
  }, [category, ranked, isHotel, hotelIds, vertical]);

  const activeId = selectedId ?? ranked[0]?.def.id ?? null;
  const active = useMemo(() => {
    if (!activeId) return ranked[0] ?? null;
    return (
      ranked.find((r) => r.def.id === activeId) ??
      catalogExtra.find((r) => r.def.id === activeId) ??
      ranked[0] ??
      null
    );
  }, [activeId, ranked, catalogExtra]);

  const categoryPills = categories.map((c) => ({
    id: c.id,
    label: c.label.replace(" & ", " · "),
  }));

  const title =
    category === "overview"
      ? isHotel
        ? "What is moving room economics?"
        : "What is moving contribution?"
      : (categories.find((c) => c.id === category)?.label ?? "Intelligence");

  const ev = active ? evidenceLabels(active.def) : [];

  return (
    <div
      className="rp-intel-hub rp-intel-cockpit rp-intel-triptych"
      data-vertical={vertical}
    >
      <header className="rp-intel-hub-head">
        <div>
          <h1 data-editorial="true">{title}</h1>
        </div>
        <div className="rp-intel-hub-controls">
          <PillNav
            ariaLabel="Intelligence categories"
            items={categoryPills}
            value={category}
            onChange={setCategory}
          />
          <label className="rp-intel-search">
            <span className="sr-only">Search intelligence</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
            />
          </label>
        </div>
      </header>

      <div className="rp-ih-triptych" data-has-selection={active ? "true" : "false"}>
        <aside className="rp-ih-findings" aria-label="Findings">
          <p className="rp-ih-eyebrow">Findings</p>
          <ol className="rp-ih-find-list">
            {ranked.map(({ def, brief }, i) => (
              <li key={def.id}>
                <button
                  type="button"
                  className="rp-ih-find"
                  data-active={def.id === active?.def.id ? "true" : undefined}
                  data-j={brief.judgment ?? "NONE"}
                  onClick={() => setSelectedId(def.id)}
                >
                  <span className="rp-ih-find-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rp-ih-find-body">
                    <strong>{def.title}</strong>
                    {brief.state ? <em>{brief.state}</em> : null}
                  </span>
                  <span className="rp-ih-pill" data-j={brief.judgment ?? "NONE"}>
                    {judgmentLabel(brief.judgment)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {catalogExtra.length > 0 ? (
            <div className="rp-ih-catalog">
              <button
                type="button"
                className="rp-ih-catalog-toggle"
                aria-expanded={catalogOpen}
                onClick={() => setCatalogOpen((v) => !v)}
              >
                {catalogOpen
                  ? "Hide catalog"
                  : `${catalogExtra.length} more in catalog`}
              </button>
              {catalogOpen ? (
                <ol className="rp-ih-find-list rp-ih-find-list--catalog">
                  {catalogExtra.map(({ def, brief }) => (
                    <li key={def.id}>
                      <button
                        type="button"
                        className="rp-ih-find"
                        data-active={
                          def.id === active?.def.id ? "true" : undefined
                        }
                        data-j={brief.judgment ?? "NONE"}
                        onClick={() => setSelectedId(def.id)}
                      >
                        <span className="rp-ih-find-body">
                          <strong>{def.title}</strong>
                        </span>
                        <span
                          className="rp-ih-pill"
                          data-j={brief.judgment ?? "NONE"}
                        >
                          {judgmentLabel(brief.judgment)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}
        </aside>

        <section className="rp-ih-stage" aria-label="Selected intelligence">
          {active ? (
            <>
              <header className="rp-ih-stage-head">
                <div>
                  <p className="rp-ih-question">{active.brief.question}</p>
                  <h2>{active.def.title}</h2>
                </div>
                <div className="rp-ih-actions">
                  {active.def.pinningSupported ? (
                    <span className="rp-ih-fav">
                      <PinButton moduleId={active.def.id} />
                      <span>Favorite</span>
                    </span>
                  ) : null}
                  <AddToDashboardButton
                    moduleId={active.def.id}
                    moduleTitle={active.def.title}
                  />
                  {active.brief.decisionId ? (
                    <Link
                      href={`/app/decisions/${active.brief.decisionId}`}
                      className="rp-ih-declink"
                    >
                      Review Decision
                    </Link>
                  ) : null}
                </div>
              </header>
              {active.brief.state ? (
                <p className="rp-ih-stage-state">{active.brief.state}</p>
              ) : null}
              <div className="rp-ih-body">{renderIntelModule(active.def)}</div>
            </>
          ) : (
            <p className="rp-cin-quiet">Select a finding.</p>
          )}
        </section>

        <aside className="rp-ih-radr" aria-label="RADR">
          <p className="rp-ih-eyebrow">RADR</p>
          {active ? (
            <>
              <h3>What RADR sees</h3>
              <p>{active.brief.state ?? active.def.description}</p>
              {active.brief.materiality ? (
                <>
                  <h3>Why it matters</h3>
                  <p className="rp-ih-big">{active.brief.materiality.value}</p>
                  <p className="rp-ih-sub">{active.brief.materiality.label}</p>
                </>
              ) : null}
              <h3>Confidence</h3>
              <p>
                <span className="rp-ih-pill" data-j={active.brief.judgment ?? "NONE"}>
                  {judgmentLabel(active.brief.judgment)}
                </span>
              </p>
              {ev.length ? (
                <>
                  <h3>Evidence</h3>
                  <ul className="rp-ih-ev-list">
                    {ev.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : (
            <p className="rp-cin-quiet">Select a finding to see RADR’s read.</p>
          )}
        </aside>
      </div>

      {pins?.toast ? (
        <div className="rp-intel-toast" role="status">
          {pins.toast}
        </div>
      ) : null}
    </div>
  );
}
