"use client";

/**
 * RADR Live — SVG 2.5D spatial product surface (mockup-faithful).
 * No WebGL. Estate / Venue / Hotel Property as DOM+SVG worlds.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { liveDefaultForRole } from "@/lib/radr/spatial-live/personaLive";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";
import {
  hotelEstateEntities,
  hotelFloorRooms,
  hotelPropertyFloors,
  restaurantEstateEntities,
  restaurantVenueZones,
} from "@/lib/radr/spatial-live/fixtures";
import type { LiveEntity, LiveLevel } from "@/lib/radr/spatial-live/types";
import type { VenueZoneKind } from "@/lib/radr/spatial-live/venueLayout";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { LiveInspector } from "./LiveInspector";
import { VisionEstateWorld } from "./vision/VisionEstateWorld";
import { VisionVenueWorld } from "./vision/VisionVenueWorld";
import { VisionHotelOpsWorld } from "./vision/VisionHotelOpsWorld";
import "./radr-live.css";

type HotelLens = "financial" | "operations" | "readiness" | "guest";
type Horizon = "now" | "30" | "60" | "120";

const HOTEL_HERO = "loc_canal_house";

export function RadrLiveShell() {
  const { roleView, locationScope } = useProduct();
  const { isHotel, org } = useDemoOrg();
  const vertical = isHotel ? "hotel" : "restaurant";
  const defaults = useMemo(
    () => liveDefaultForRole(roleView, vertical),
    [roleView, vertical],
  );

  const [level, setLevel] = useState<LiveLevel>(defaults.level);
  const [lens, setLens] = useState<HotelLens>(() => {
    if (defaults.lens === "financial") return "financial";
    if (defaults.lens === "rooms") return "readiness";
    return "operations";
  });
  const [horizon, setHorizon] = useState<Horizon>("now");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState(HOTEL_HERO);
  const [, setHoverKind] = useState<VenueZoneKind | null>(null);
  const [simProgress, setSimProgress] = useState(0);
  const [clock, setClock] = useState(
    isHotel ? HOTEL_LIVE_SCENARIO.clockLabel : "19:48",
  );

  useEffect(() => {
    const d = liveDefaultForRole(roleView, vertical);
    setLevel(d.level === "floor" ? "property" : d.level);
    setLens(
      d.lens === "financial"
        ? "financial"
        : d.lens === "rooms"
          ? "readiness"
          : "operations",
    );
    setSelectedId(
      d.level === "estate" && !isHotel
        ? "loc_berlin_mitte"
        : d.level === "estate" && isHotel
          ? HOTEL_HERO
          : d.homeEntityId?.startsWith("loc_") && !d.homeEntityId.includes("__")
            ? d.homeEntityId
            : isHotel
              ? HOTEL_HERO
              : null,
    );
    if (isHotel && d.homeEntityId?.startsWith("loc_")) {
      const pid = d.homeEntityId.split("__")[0]!;
      setPropertyId(pid);
    } else if (isHotel) {
      setPropertyId(HOTEL_HERO);
    }
    setSimProgress(0);
    setHorizon("now");
    setClock(isHotel ? HOTEL_LIVE_SCENARIO.clockLabel : "19:48");
  }, [roleView, vertical, isHotel]);

  useEffect(() => {
    if (isHotel) return;
    let min = 48;
    const id = window.setInterval(() => {
      min = Math.min(59, min + 1);
      setClock(`19:${String(min).padStart(2, "0")}`);
    }, 12000);
    return () => window.clearInterval(id);
  }, [isHotel]);

  const venueLocationId = useMemo(() => {
    if (
      locationScope !== "all" &&
      !String(locationScope).startsWith("region_")
    ) {
      return toCanonicalLocationId(String(locationScope));
    }
    return isHotel ? propertyId : "loc_berlin_mitte";
  }, [locationScope, isHotel, propertyId]);

  const zones = useMemo(
    () => restaurantVenueZones(venueLocationId),
    [venueLocationId],
  );
  const estate = useMemo(
    () => (isHotel ? hotelEstateEntities() : restaurantEstateEntities()),
    [isHotel],
  );
  const floors = useMemo(
    () => (isHotel ? hotelPropertyFloors(propertyId) : []),
    [isHotel, propertyId],
  );
  const rooms = useMemo(() => {
    if (!isHotel) return [];
    const floorId = selectedId?.includes("__floor_")
      ? selectedId
      : selectedId?.includes("__room_")
        ? selectedId.split("__room_")[0]!
        : null;
    const floor =
      floors.find((f) => f.id === floorId) ??
      floors.find((f) => f.severity === "intervene") ??
      floors.find((f) => f.type === "floor") ??
      floors[0];
    return floor ? hotelFloorRooms(floor.id) : [];
  }, [isHotel, floors, selectedId]);

  const selected = useMemo((): LiveEntity | null => {
    if (!selectedId) return null;
    return (
      rooms.find((z) => z.id === selectedId) ??
      floors.find((z) => z.id === selectedId) ??
      zones.find((z) => z.id === selectedId) ??
      estate.find((e) => e.id === selectedId) ??
      null
    );
  }, [selectedId, zones, estate, floors, rooms]);

  const venueLabel =
    estate.find((e) => e.id === venueLocationId)?.label ??
    estate.find((e) => e.id === propertyId)?.label ??
    (isHotel ? "Mercer House · New York" : "Soho · New York");

  const onSelect = useCallback((id: string) => {
    if (!id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
  }, []);

  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  useEffect(() => {
    const w = window as Window & {
      __radrLiveSelect?: (id: string | null) => void;
    };
    w.__radrLiveSelect = (id) => selectRef.current(id ?? "");
    return () => {
      delete w.__radrLiveSelect;
    };
  }, []);

  const onEstateSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const enterProperty = useCallback(
    (id?: string) => {
      const pid =
        id ??
        (selectedId && !selectedId.includes("__") ? selectedId : propertyId);
      setPropertyId(pid);
      setLevel("property");
      setSelectedId(pid);
      setLens((prev) => (prev === "financial" ? "operations" : prev));
    },
    [selectedId, propertyId],
  );

  const horizonLabel =
    horizon === "now"
      ? "NOW"
      : horizon === "30"
        ? "+30m"
        : horizon === "60"
          ? "+60m"
          : "+120m";

  return (
    <div
      className="rp-live3 rv-live"
      data-vertical={vertical}
      data-level={level}
      data-lens={lens}
      data-horizon={horizon}
      data-inspector={selected ? "open" : "closed"}
      data-selected={selectedId ?? ""}
    >
      <div className="rp-live3-hud">
        <div className="rp-live3-hud-left">
          <div className="rp-live3-identity">
            <p className="rp-live3-brand">RADR Live</p>
            <p className="rp-live3-place">
              {level === "estate" ? org.shortName : venueLabel}
              <em> · Live</em>
            </p>
          </div>

          <div className="rp-live3-toolbar" role="toolbar" aria-label="Live controls">
            <div className="rp-live3-seg" role="group" aria-label="Spatial level">
              <button
                type="button"
                data-active={level === "estate" ? "true" : undefined}
                onClick={() => {
                  setLevel("estate");
                  setSelectedId(isHotel ? HOTEL_HERO : "loc_berlin_mitte");
                  setLens("financial");
                }}
              >
                Estate
              </button>
              <button
                type="button"
                data-active={
                  level === "venue" || level === "property" ? "true" : undefined
                }
                onClick={() => {
                  setLevel(isHotel ? "property" : "venue");
                  if (isHotel) {
                    setSelectedId(propertyId);
                    setLens((prev) =>
                      prev === "financial" ? "operations" : prev,
                    );
                  } else {
                    setSelectedId(null);
                  }
                }}
              >
                {isHotel ? "Property" : "Venue"}
              </button>
            </div>
            <div className="rp-live3-seg" role="group" aria-label="Lens">
              {(isHotel
                ? ([
                    ["financial", "Financial"],
                    ["operations", "Operations"],
                    ["readiness", "Room readiness"],
                    ["guest", "Guest"],
                  ] as const)
                : ([
                    ["financial", "Financial"],
                    ["operations", "Operations"],
                  ] as const)
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-active={lens === id ? "true" : undefined}
                  onClick={() => setLens(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {isHotel ? (
              <div className="rp-live3-seg" role="group" aria-label="Horizon">
                {(
                  [
                    ["now", "NOW"],
                    ["30", "+30"],
                    ["60", "+60"],
                    ["120", "+120"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    data-active={horizon === id ? "true" : undefined}
                    onClick={() => setHorizon(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
            <span className="rp-live3-pill">Live</span>
          </div>
        </div>
      </div>

      <div className="rp-live3-stage">
        {isHotel && (level === "property" || level === "venue") ? (
          <VisionHotelOpsWorld
            propertyId={propertyId}
            propertyLabel={venueLabel}
            floors={floors}
            rooms={rooms}
            selectedId={selectedId}
            onSelect={onSelect}
            lens={lens}
            horizon={horizon}
          />
        ) : !isHotel && level === "venue" ? (
          <VisionVenueWorld
            zones={zones}
            selectedId={selectedId}
            onSelect={onSelect}
            onHoverZone={(k) => setHoverKind((k as VenueZoneKind) ?? null)}
            simProgress={simProgress}
            venueLabel={venueLabel}
          />
        ) : (
          <VisionEstateWorld
            entities={estate}
            selectedId={selectedId}
            onSelect={onEstateSelect}
            onEnter={isHotel ? enterProperty : undefined}
            lens={lens === "financial" ? "financial" : "operations"}
            title="Estate View"
            subtitle={
              isHotel
                ? "Hotel estate · occupancy, readiness and live exposure."
                : "Your restaurant estate in real time. Financial performance, operational health and live signals."
            }
            plate="/demo/live/estate-berlin-night.webp"
          />
        )}

        <p className="rp-live3-clock" aria-hidden>
          {clock}
          {isHotel ? ` · ${horizonLabel}` : ""}
        </p>

        <LiveInspector
          entity={selected}
          vertical={vertical}
          onClose={() => {
            setSelectedId(null);
            setSimProgress(0);
          }}
          onSimulate={setSimProgress}
          onEnterVenue={
            selected &&
            (selected.type === "location" || selected.type === "property")
              ? () => enterProperty(selected.id)
              : undefined
          }
        />
      </div>
    </div>
  );
}
