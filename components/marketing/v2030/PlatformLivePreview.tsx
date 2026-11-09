"use client";

import { useEffect, useRef, useState } from "react";
import { TourArrow, TourCheck } from "./PlatformTourIcons";
import { HospitalityWorld } from "@/components/product/hospitality-world/HospitalityWorld";
import type { SpatialEntity } from "@/components/product/hospitality-world/types";
import { getServiceCommand } from "@/lib/product/serviceCommand";
import { tableExperiences } from "@/lib/product/serviceCommand/tableExperience";
import { guestSignals } from "@/lib/product/guestSignals";
import { hotelGuestNeeds } from "@/lib/product/hotelGuestNeeds";
import {
  HOTEL_OBJECTS,
  RESTAURANT_OBJECTS,
  HOTEL_SHOWCASE,
  HOSPITALITY_LOCATIONS,
  type HospitalityKind,
} from "@/lib/marketing/hospitalityShowcase";

const service = getServiceCommand();
const restaurantEntities: SpatialEntity[] = RESTAURANT_OBJECTS.map((object) => {
  const table = service.tables.find((table) => table.id === object.id)!;
  const experience = tableExperiences[object.id];
  return {
    id: object.id,
    label: object.label,
    number: String(table.n),
    x: (table.x - 50) * 0.24,
    z: (table.y - 50) * 0.16,
    width: 2.3,
    depth: 1.6,
    seats: table.seats,
    tone: table.tone,
    status: object.state,
    detail: object.value,
    signals: [
      ...guestSignals(experience?.needs, "current"),
      ...guestSignals(experience?.next.needs, "incoming"),
    ],
  };
});
const hotelEntities: SpatialEntity[] = HOTEL_OBJECTS.map((object) => {
  const room = HOTEL_SHOWCASE.rooms.find((room) => room.id === object.id)!;
  return {
    id: object.id,
    label: object.label,
    number: room.number,
    x: (room.x + room.w / 2 - 50) * 0.28,
    z: (room.y + room.h / 2 - 50) * 0.2,
    width: room.w * 0.28,
    depth: room.h * 0.2,
    tone: room.state,
    status: object.state,
    detail: object.value,
    signals: guestSignals(hotelGuestNeeds(room), "incoming"),
  };
});

function focusFrame(entities: SpatialEntity[]) {
  const left = Math.min(
    ...entities.map((entity) => entity.x - entity.width / 2),
  );
  const right = Math.max(
    ...entities.map((entity) => entity.x + entity.width / 2),
  );
  const top = Math.min(
    ...entities.map((entity) => entity.z - entity.depth / 2),
  );
  const bottom = Math.max(
    ...entities.map((entity) => entity.z + entity.depth / 2),
  );
  return {
    width: Math.max(12, right - left + 4),
    depth: Math.max(10, bottom - top + 4),
    entities: entities.map((entity) => ({
      ...entity,
      x: entity.x - (left + right) / 2,
      z: entity.z - (top + bottom) / 2,
    })),
  };
}
const restaurantFrame = focusFrame(restaurantEntities);
const hotelFrame = focusFrame(hotelEntities);

export default function PlatformLivePreview() {
  const [kind, setKind] = useState<HospitalityKind>("hotel");
  const [selectedId, setSelectedId] = useState("room_310");
  const [exploring, setExploring] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const world = useRef<HTMLDivElement>(null);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const hotel = kind === "hotel";
  const frame = hotel ? hotelFrame : restaurantFrame;
  const objects = hotel ? HOTEL_OBJECTS : RESTAURANT_OBJECTS;
  const selected =
    objects.find((object) => object.id === selectedId) || objects[0]!;
  useEffect(() => {
    const node = world.current;
    if (!node) return;
    const detect = () =>
      setSceneReady(
        Boolean(node.querySelector(".hw-root")?.getAttribute("data-camera")),
      );
    const observer = new MutationObserver(detect);
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-camera"],
      childList: true,
      subtree: true,
    });
    detect();
    return () => observer.disconnect();
  }, [kind]);
  function changeKind(next: HospitalityKind) {
    if (next === kind) return;
    setSceneReady(false);
    setKind(next);
    setSelectedId(next === "hotel" ? "room_310" : "t8");
    setExploring(false);
  }
  return (
    <div
      className="ps-live"
      data-kind={kind}
      onKeyDown={(event) => {
        if (event.key === "Escape" && exploring) {
          setExploring(false);
          exploreButton.current?.focus();
        }
      }}
    >
      <div className="ps-live-toolbar">
        <div>
          <span className="ps-live-dot" />
          <strong>{HOSPITALITY_LOCATIONS[kind]}</strong>
          <small>{hotel ? "Floor 3 · 14:20" : "Dinner service · 19:48"}</small>
        </div>
        <div
          className="ps-live-switch"
          role="group"
          aria-label="Hospitality operation"
        >
          <button
            type="button"
            aria-pressed={!hotel}
            onClick={() => changeKind("restaurant")}
          >
            Restaurant
          </button>
          <button
            type="button"
            aria-pressed={hotel}
            onClick={() => changeKind("hotel")}
          >
            Hotel
          </button>
        </div>
      </div>
      <div className="ps-live-metrics">
        {(hotel
          ? [
              [`${HOTEL_SHOWCASE.occupancyPct}%`, "Occupancy"],
              [String(HOTEL_SHOWCASE.arrivalsToday), "Arrivals today"],
              [selected.next.split(" · ")[0], "Selected arrival"],
            ]
          : [
              ["19 min", "Table 8 wait"],
              [selected.value, "Selected check"],
              [selected.next.split(" · ")[0], "Next reservation"],
            ]
        ).map(([value, label]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="ps-live-body">
        <div className="ps-live-visual">
          <div
            className="ps-live-viewport"
            data-exploring={exploring}
            data-ready={sceneReady}
          >
            <div ref={world} className="ps-live-world" inert={!exploring}>
              <HospitalityWorld
                key={kind}
                kind={kind}
                label={hotel ? "Floor 3" : "Dining room"}
                width={frame.width}
                depth={frame.depth}
                entities={frame.entities}
                selected={selected.id}
                onSelect={setSelectedId}
              />
            </div>
            <div
              className="ps-live-loading"
              role="status"
              aria-hidden={sceneReady}
            >
              <svg
                width="130"
                height="90"
                viewBox="0 0 160 110"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m15 52 65-36 65 36-65 36-65-36Zm0 12 65 36 65-36M80 88v12M48 34l65 36M112 34 48 70"
                  stroke="#9dbdd9"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  className="ps-live-loading-scan"
                  d="m48 34 32-18 65 36-32 18-65-36Z"
                  fill="#00c98f12"
                  stroke="#00ae82"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Opening the operating view</span>
            </div>
            <span className="ps-live-focus-label">
              {hotel ? "ROOM READINESS" : "SERVICE PRESSURE"}
              <small>
                {objects.length} {hotel ? "rooms" : "tables"} in focus
              </small>
            </span>
            <button
              ref={exploreButton}
              disabled={!sceneReady}
              className="ps-live-explore"
              type="button"
              aria-pressed={exploring}
              onClick={() => setExploring((value) => !value)}
            >
              {exploring ? "Done exploring" : "Explore the space"}
              <span aria-hidden="true">
                {exploring ? <TourCheck /> : <TourArrow />}
              </span>
            </button>
            <span className="ps-live-gesture">
              {exploring
                ? "Drag to orbit · Scroll to zoom · Esc to finish"
                : "Select below to see guest and operating context"}
            </span>
          </div>
          <div
            className="ps-live-entities"
            role="group"
            aria-label={hotel ? "Rooms in focus" : "Tables in focus"}
          >
            {objects.map((object) => (
              <button
                type="button"
                key={object.id}
                aria-pressed={selected.id === object.id}
                aria-label={`${object.label}${object.allergy ? `, ${object.scope}: ${object.allergy} allergy` : ""}`}
                onClick={() => setSelectedId(object.id)}
              >
                <span>{object.label}</span>
                {object.allergy && <i aria-hidden="true">!</i>}
              </button>
            ))}
          </div>
        </div>
        <aside
          className="ps-live-inspector"
          aria-label={`${selected.label} guest and operating details`}
        >
          <header>
            <span>{selected.label}</span>
            <small>{selected.state}</small>
            <h4>{selected.party}</h4>
            <p>{selected.meta}</p>
          </header>
          <div className="ps-live-safety" data-alert={!!selected.allergy}>
            <strong>
              {selected.allergy
                ? `${selected.allergy} allergy`
                : selected.allergyState === "none-reported"
                  ? "No allergies reported"
                  : "Allergies not confirmed"}
            </strong>
            <span>
              {selected.scope} ·{" "}
              {selected.allergy
                ? "Guest-reported; reconfirm"
                : "Check guest notes"}
            </span>
          </div>
          <div className="ps-live-request">
            <span>{selected.occasion || "Guest requests"}</span>
            <p>{selected.request}</p>
          </div>
          <div className="ps-live-check">
            <span>{hotel ? "Room readiness" : "Current check"}</span>
            <strong>{selected.value}</strong>
            <p>{selected.orders}</p>
          </div>
          <div className="ps-live-next">
            <span>{hotel ? "Arrival" : "Next reservation"}</span>
            <strong>{selected.next}</strong>
            <p>{hotel ? `Owner · ${selected.owner}` : selected.nextNeeds}</p>
          </div>
        </aside>
      </div>
      <div
        className="ps-live-timeline"
        aria-label={`${selected.label} service timeline`}
      >
        {selected.timeline.map((event, index) => (
          <div key={`${event.time}-${index}`}>
            <i />
            <strong>{event.time}</strong>
            <span>{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
