"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCATIONS } from "@/lib/product/demo/catalog";
import { useProduct } from "@/lib/product/store";
import {
  groupLocationsByCity,
  locationSubtitle,
  sameCityLocations,
  searchLocations,
  shortLocationName,
} from "@/lib/radr/locationCatalog";
import { buildCompareHref } from "@/lib/radr/comparisonService";

/**
 * Location switcher: search, city groups, default, same-city compare.
 * Confirm → Control Center by default; full metric compare is secondary.
 */
export function LocationSwitcher() {
  const router = useRouter();
  const {
    locationScope,
    defaultLocationId,
    comparisonLocationIds,
    locationSwitcherOpen,
    setLocationScope,
    setDefaultLocationId,
    setComparisonLocationIds,
    clearComparison,
    closeLocationSwitcher,
  } = useProduct();

  const [q, setQ] = useState("");
  const [comparePick, setComparePick] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locationSwitcherOpen) {
      setQ("");
      setComparePick(false);
      setDraftIds([]);
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [locationSwitcherOpen]);

  useEffect(() => {
    if (!locationSwitcherOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLocationSwitcher();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locationSwitcherOpen, closeLocationSwitcher]);

  const filtered = useMemo(() => searchLocations(q), [q]);
  const groups = useMemo(() => groupLocationsByCity(filtered), [filtered]);

  const activeId =
    locationScope === "all" || locationScope.startsWith("region_")
      ? null
      : locationScope;

  const peerCity = activeId ? sameCityLocations(activeId) : [];

  if (!locationSwitcherOpen) return null;

  const selectLocation = (id: string) => {
    if (comparePick) {
      setDraftIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 4) return prev;
        return [...prev, id];
      });
      return;
    }
    setLocationScope(id);
    clearComparison();
    closeLocationSwitcher();
  };

  const enterComparePick = (seed?: string[]) => {
    const initial =
      seed && seed.length
        ? seed.slice(0, 4)
        : comparisonLocationIds.length
          ? comparisonLocationIds.slice(0, 4)
          : activeId
            ? [activeId]
            : [];
    setDraftIds(initial);
    setComparePick(true);
  };

  const confirmCompare = (dest: "cc" | "full" = "cc") => {
    if (draftIds.length < 2 || draftIds.length > 4) return;
    const ids = [...draftIds];
    setComparisonLocationIds(ids);
    closeLocationSwitcher();
    if (dest === "full") {
      router.push(buildCompareHref(ids));
      return;
    }
    router.push("/app");
  };

  const startCompare = () => {
    if (comparePick) {
      confirmCompare("cc");
      return;
    }
    const seed =
      peerCity.length >= 2
        ? peerCity.slice(0, 4).map((l) => l.id)
        : activeId
          ? [activeId]
          : [];
    enterComparePick(seed);
  };

  const canConfirm = draftIds.length >= 2 && draftIds.length <= 4;
  const cityName = peerCity[0]?.city;

  return (
    <div className="rp-locsw" role="dialog" aria-label="Switch location">
      <button
        type="button"
        className="rp-locsw-backdrop"
        aria-label="Close location switcher"
        onClick={closeLocationSwitcher}
      />
      <div className="rp-locsw-panel">
        <header className="rp-locsw-head">
          <div>
            <p className="rp-locsw-kicker">
              {comparePick ? "Compare locations" : "Switch location"}
            </p>
            <h2 className="rp-locsw-title">
              {comparePick
                ? "Select 2-4 venues"
                : "Where are you operating?"}
            </h2>
          </div>
          <button
            type="button"
            className="rp-locsw-close"
            onClick={closeLocationSwitcher}
          >
            Esc
          </button>
        </header>

        <input
          ref={inputRef}
          className="rp-locsw-search"
          placeholder="Search locations, cities, countries…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search locations"
        />

        {!comparePick && peerCity.length > 1 ? (
          <div className="rp-locsw-city">
            <p className="rp-locsw-city-label">
              Same city, {cityName}
            </p>
            <div className="rp-locsw-city-row">
              {peerCity.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className="rp-locsw-chip"
                  data-active={l.id === activeId ? "true" : "false"}
                  onClick={() => {
                    if (l.id === activeId) {
                      setLocationScope("all");
                      clearComparison();
                      return;
                    }
                    selectLocation(l.id);
                  }}
                >
                  {shortLocationName(l.name)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rp-locsw-city-compare"
              onClick={() =>
                enterComparePick(peerCity.map((l) => l.id).slice(0, 4))
              }
            >
              Compare {cityName} venues
            </button>
          </div>
        ) : null}

        {comparePick ? (
          <p className="rp-locsw-hint">
            {draftIds.length}/4 selected
            {draftIds.length > 4
              ? " (max 4)"
              : draftIds.length < 2
                ? " (need at least 2)"
                : " (ready)"}
          </p>
        ) : null}

        <div className="rp-locsw-list">
          {groups.map((g) => (
            <section key={`${g.city}-${g.country}`} className="rp-locsw-group">
              <p className="rp-locsw-group-label">{g.city}</p>
              <ul>
                {g.locations.map((loc) => {
                  const isActive = loc.id === activeId;
                  const isDefault = loc.id === defaultLocationId;
                  const inCompare = comparePick
                    ? draftIds.includes(loc.id)
                    : comparisonLocationIds.includes(loc.id);
                  return (
                    <li key={loc.id}>
                      <button
                        type="button"
                        className="rp-locsw-row"
                        data-active={
                          !comparePick && isActive ? "true" : "false"
                        }
                        data-compare={inCompare ? "true" : "false"}
                        onClick={() => selectLocation(loc.id)}
                      >
                        <span className="rp-locsw-row-main">
                          <strong>
                            {isDefault ? "★ " : null}
                            {loc.name}
                          </strong>
                          <em>{locationSubtitle(loc)}</em>
                        </span>
                        <span className="rp-locsw-row-meta">
                          {isDefault && !comparePick ? (
                            <span className="rp-locsw-default">Your default</span>
                          ) : null}
                          {comparePick ? (
                            <span className="rp-locsw-check" aria-hidden="true">
                              {inCompare ? "✓" : ""}
                            </span>
                          ) : null}
                        </span>
                      </button>
                      {!comparePick && isActive && !isDefault ? (
                        <button
                          type="button"
                          className="rp-locsw-set-default"
                          onClick={() => setDefaultLocationId(loc.id)}
                        >
                          Set as my default location
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {groups.length === 0 ? (
            <p className="rp-locsw-empty">No locations match.</p>
          ) : null}
        </div>

        <footer className="rp-locsw-foot">
          {!comparePick ? (
            <button
              type="button"
              className="rp-locsw-action"
              data-primary={locationScope === "all" ? "true" : "false"}
              onClick={() => {
                setLocationScope("all");
                clearComparison();
                closeLocationSwitcher();
              }}
            >
              <strong>All locations</strong>
              <em>Group overview, {LOCATIONS.length} venues</em>
            </button>
          ) : null}
          <button
            type="button"
            className="rp-locsw-action"
            data-primary={comparePick && canConfirm ? "true" : "false"}
            disabled={comparePick && !canConfirm}
            onClick={startCompare}
          >
            <strong>
              {comparePick
                ? canConfirm
                  ? `Confirm ${draftIds.length} venues`
                  : "Select 2-4 locations"
                : "Compare locations"}
            </strong>
            <em>
              {comparePick
                ? "Opens in Control Center"
                : "Same-city peers or custom selection"}
            </em>
          </button>
          {comparePick && canConfirm ? (
            <button
              type="button"
              className="rp-locsw-action"
              onClick={() => confirmCompare("full")}
            >
              <strong>Open full compare</strong>
              <em>Metric compare workspace</em>
            </button>
          ) : null}
          {comparePick ? (
            <button
              type="button"
              className="rp-locsw-cancel"
              onClick={() => {
                setComparePick(false);
                setDraftIds([]);
              }}
            >
              Cancel compare
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
