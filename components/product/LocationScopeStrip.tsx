"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useProduct } from "@/lib/product/store";
import { locationLabel } from "@/lib/product/demo/dashboard";
import {
  getLocationById,
  groupLocationsByCity,
  searchLocations,
  shortLocationName,
} from "@/lib/radr/locationCatalog";
import { isFleetRole } from "@/lib/radr/fleet";

type Props = {
  onNavigate?: () => void;
};

/**
 * Location filter that scales - search + city groups, not a chip strip.
 * “More / Compare” opens the full multi-select switcher when needed.
 */
export function LocationScopeStrip({ onNavigate }: Props) {
  const {
    roleView,
    locationScope,
    locationMode,
    comparisonLocationIds,
    setLocationScope,
    clearComparison,
    openLocationSwitcher,
  } = useProduct();

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const comparing =
    locationMode === "comparison" && comparisonLocationIds.length >= 2;
  const fleet = isFleetRole(roleView);

  const summary = useMemo(() => {
    if (comparing) {
      return {
        title: `Comparing ${comparisonLocationIds.length}`,
        sub: "Edit in More",
      };
    }
    if (locationScope === "all") {
      return { title: "All locations", sub: "Group view" };
    }
    if (locationScope.startsWith("region_")) {
      return { title: locationLabel(locationScope), sub: "Region" };
    }
    const loc = getLocationById(locationScope);
    if (loc) {
      return {
        title: shortLocationName(loc.name),
        sub: `${loc.city} · ${loc.country}`,
      };
    }
    return { title: locationLabel(locationScope), sub: "Location" };
  }, [comparing, locationScope, comparisonLocationIds.length]);

  const filtered = useMemo(() => searchLocations(q), [q]);
  const groups = useMemo(() => groupLocationsByCity(filtered), [filtered]);

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

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

  function pick(id: string) {
    clearComparison();
    setLocationScope(id);
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div
      className="rp-loc-dd"
      ref={rootRef}
      data-open={open ? "true" : undefined}
      data-comparing={comparing ? "true" : undefined}
    >
      <p className="rp-rail-filter-kicker">Location</p>
      <button
        type="button"
        className="rp-loc-dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rp-loc-dd-copy">
          <strong>{summary.title}</strong>
          <em>{summary.sub}</em>
        </span>
        <span className="rp-loc-dd-chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          className="rp-loc-dd-panel"
          role="listbox"
          aria-label="Choose location"
        >
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
                role="option"
                className="rp-loc-dd-item"
                data-active={locationScope === "all" && !comparing ? "true" : undefined}
                aria-selected={locationScope === "all" && !comparing}
                onClick={() => pick("all")}
              >
                <strong>All locations</strong>
                <span>Group comparison</span>
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
                      const active = !comparing && locationScope === loc.id;
                      return (
                        <li key={loc.id}>
                          <button
                            type="button"
                            role="option"
                            className="rp-loc-dd-item"
                            data-active={active ? "true" : undefined}
                            aria-selected={active}
                            onClick={() => pick(loc.id)}
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
    </div>
  );
}
