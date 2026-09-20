"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import { locationLabel } from "@/lib/product/demo/dashboard";
import {
  getRoleProfile,
} from "@/lib/radr/role/profiles";
import { demoRoleGroupsForVertical } from "@/lib/radr/role/lenses";
import type { ServicePhase } from "@/lib/radr/servicePhase";
import { isFleetRole } from "@/lib/radr/fleet";
import {
  groupLocationsByCity,
  searchLocations,
  shortLocationName,
} from "@/lib/radr/locationCatalog";
import { useOperatingProfile } from "@/components/product/useOperatingProfile";
import { resolveProfile } from "@/lib/radr/operating/resolveProfile";
import { terminologyForProfile } from "@/lib/radr/operating/terminology";

type Props = {
  locationLabel: string;
  phase: ServicePhase | null;
  onChangePhase?: (phase: ServicePhase) => void;
  synthetic: boolean;
  onNavigate?: () => void;
};

export function phaseOperatingLabel(
  phase: ServicePhase | null,
  vertical?: "restaurant" | "boutique_hotel" | "serviced_apartments",
): string | null {
  if (!phase) return null;
  const profile = resolveProfile({
    demoVertical: vertical ?? "restaurant",
  });
  const terms = terminologyForProfile(profile);
  if (phase === "PRE_SHIFT") return terms.rhythmLabels.prepare;
  if (phase === "POST_SHIFT" || phase === "CLOSING")
    return terms.rhythmLabels.after;
  return terms.rhythmLabels.operate === "Arrival"
    ? "In-house"
    : terms.rhythmLabels.operate === "Live"
      ? "Live service"
      : terms.rhythmLabels.operate;
}

type PanelTab = "role" | "location" | "phase";

/**
 * One contextual switcher: who · where · operational phase.
 * Analysis period (Tonight / Month / Year) stays in WhenScopeStrip.
 */
export function PerspectiveBlock({
  locationLabel: locLabel,
  phase,
  onChangePhase,
  synthetic,
  onNavigate,
}: Props) {
  const {
    roleView,
    setRoleView,
    locationScope,
    locationMode,
    comparisonLocationIds,
    setLocationScope,
    clearComparison,
    openLocationSwitcher,
  } = useProduct();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("role");
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const { vertical: demoVertical, terms } = useOperatingProfile();
  const profile = getRoleProfile(roleView);
  const phaseLabel = phaseOperatingLabel(phase, demoVertical);
  const fleet = isFleetRole(roleView);
  const comparing =
    locationMode === "comparison" && comparisonLocationIds.length >= 2;

  const phaseOptions = useMemo(() => {
    return [
      { id: "PRE_SHIFT" as ServicePhase, label: terms.rhythmLabels.prepare },
      {
        id: "LIVE" as ServicePhase,
        label:
          demoVertical === "boutique_hotel"
            ? terms.phaseLabel.OPERATE
            : "Live service",
      },
      { id: "POST_SHIFT" as ServicePhase, label: terms.rhythmLabels.after },
    ];
  }, [terms, demoVertical]);

  const filtered = useMemo(() => searchLocations(q), [q]);
  const groups = useMemo(() => groupLocationsByCity(filtered), [filtered]);

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    if (tab === "location") {
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 1200);
    return () => window.clearTimeout(t);
  }, [flash]);

  function pickRole(id: RoleView) {
    if (id !== roleView) {
      setRoleView(id);
      setFlash(`Viewing as ${getRoleProfile(id).label}`);
      onNavigate?.();
    }
    setOpen(false);
  }

  function pickLocation(id: string) {
    clearComparison();
    setLocationScope(id);
    setOpen(false);
    onNavigate?.();
  }

  function pickPhase(next: ServicePhase) {
    onChangePhase?.(next);
    setOpen(false);
  }

  return (
    <div
      className="rp-pov"
      data-compact="true"
      data-context="true"
      ref={rootRef}
      data-open={open ? "true" : undefined}
    >
      <button
        type="button"
        className="rp-pov-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Viewing as ${profile.label}. ${locLabel}${phaseLabel ? ` · ${phaseLabel}` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rp-pov-line">
          <span className="rp-pov-role">{profile.label}</span>
          <span className="rp-pov-chev" aria-hidden="true" />
        </span>
        <span className="rp-pov-meta">
          <em>{locLabel}</em>
        </span>
      </button>

      {flash ? (
        <p className="rp-pov-flash" role="status">
          {flash}
        </p>
      ) : null}

      {open ? (
        <div
          id={panelId}
          className="rp-pov-panel rp-pov-panel--context"
          role="dialog"
          aria-label="Change context"
        >
          <div className="rp-pov-tabs" role="tablist">
            {(
              [
                ["role", "Role"],
                ["location", "Location"],
                ["phase", "Phase"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                className="rp-pov-tab"
                aria-selected={tab === id}
                data-active={tab === id ? "true" : undefined}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "role" ? (
            <div className="rp-pov-tab-panel">
              <p className="rp-pov-panel-title">View RADR as</p>
              {demoRoleGroupsForVertical(demoVertical).map((group) => (
                <div key={group.label} className="rp-pov-group">
                  <p className="rp-pov-group-label">{group.label}</p>
                  <ul className="rp-pov-role-list" role="listbox">
                    {group.roles.map((id) => {
                      const p = getRoleProfile(id);
                      const active = id === roleView;
                      return (
                        <li key={id} role="option" aria-selected={active}>
                          <button
                            type="button"
                            data-active={active ? "true" : undefined}
                            onClick={() => pickRole(id)}
                          >
                            <strong>
                              {active ? "✓ " : ""}
                              {p.label}
                            </strong>
                            <span>{p.demoBlurb}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "location" ? (
            <div className="rp-pov-tab-panel rp-pov-loc-panel">
              <label className="rp-loc-dd-search">
                <span className="sr-only">Search locations</span>
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  placeholder="Search city or venue…"
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <div className="rp-loc-dd-scroll">
                {fleet && !q.trim() ? (
                  <button
                    type="button"
                    className="rp-loc-dd-item"
                    data-active={
                      locationScope === "all" && !comparing ? "true" : undefined
                    }
                    onClick={() => pickLocation("all")}
                  >
                    <strong>All locations</strong>
                    <span>Group view</span>
                  </button>
                ) : null}
                {groups.length === 0 ? (
                  <p className="rp-loc-dd-empty">No matches</p>
                ) : (
                  groups.map((g) => (
                    <div key={`${g.city}|${g.country}`} className="rp-loc-dd-city">
                      <p className="rp-loc-dd-city-label">
                        {g.city}
                        <span>
                          {g.countryName} · {g.locations.length}
                        </span>
                      </p>
                      <ul>
                        {g.locations.map((loc) => {
                          const active =
                            !comparing && locationScope === loc.id;
                          return (
                            <li key={loc.id}>
                              <button
                                type="button"
                                className="rp-loc-dd-item"
                                data-active={active ? "true" : undefined}
                                onClick={() => pickLocation(loc.id)}
                              >
                                <strong>{shortLocationName(loc.name)}</strong>
                                <span>{loc.name}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                className="rp-loc-dd-foot"
                onClick={() => {
                  setOpen(false);
                  openLocationSwitcher();
                  onNavigate?.();
                }}
              >
                {comparing ? "Edit comparison…" : "Compare venues…"}
              </button>
            </div>
          ) : null}

          {tab === "phase" ? (
            <div className="rp-pov-tab-panel">
              <p className="rp-pov-panel-title">Operational phase</p>
              <p className="rp-pov-phase-hint">
                Current service beat - separate from Month / Year analysis.
              </p>
              <div className="rp-pov-phase-list">
                {phaseOptions.map((p) => {
                  const active =
                    phase === p.id ||
                    (p.id === "LIVE" && phase === "CLOSING");
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="rp-pov-phase-btn"
                      data-active={active ? "true" : undefined}
                      disabled={!onChangePhase && !synthetic}
                      onClick={() => pickPhase(p.id)}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="rp-pov-context-current">
                Now · {locLabel}
                {phaseLabel ? ` · ${phaseLabel}` : ""}
                {comparing ? ` · ${locationLabel(locationScope)}` : ""}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
