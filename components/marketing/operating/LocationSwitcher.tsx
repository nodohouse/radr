"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEMO_LOCATION_COUNT,
  formatCityCountry,
  LOCATIONS,
  type VenueLocation,
} from "@/lib/radr/operatingHero";
import { TextSep } from "@/components/TextSep";

type Props = {
  location: VenueLocation;
  onChange: (id: string) => void;
  rank?: number;
  total?: number;
};

/** Location identity + selector: compact identity block. */
export function LocationSwitcher({ location, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="rx-om-loc" ref={root} data-open={open ? "true" : "false"}>
      <p className="rx-om-loc-geo">{formatCityCountry(location)}</p>
      <button
        type="button"
        className="rx-om-loc-name"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        {location.venueName}
        <span aria-hidden="true">▾</span>
      </button>
      <p className="rx-om-loc-meta">
        {location.venueType}
        <TextSep />
        #{location.rank} of {DEMO_LOCATION_COUNT}
        <TextSep />
        Live
      </p>

      {open ? (
        <ul className="rx-om-loc-menu" role="listbox" aria-label="Locations">
          {LOCATIONS.map((loc) => (
            <li key={loc.id}>
              <button
                type="button"
                role="option"
                aria-selected={loc.id === location.id}
                data-on={loc.id === location.id ? "true" : "false"}
                onClick={() => {
                  onChange(loc.id);
                  setOpen(false);
                }}
              >
                <span className="rx-om-loc-menu-geo">
                  {loc.city}
                  <TextSep />
                  {loc.countryCode}
                </span>
                <strong>{loc.venueName.replace("Northstar ", "")}</strong>
                <em>
                  {loc.margin.toFixed(1)}%
                  <TextSep />
                  {loc.status.replace("_", " ")}
                </em>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
