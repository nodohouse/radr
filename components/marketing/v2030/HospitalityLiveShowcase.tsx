"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  HOTEL_OBJECTS,
  HOTEL_SHOWCASE,
  HOSPITALITY_LOCATIONS,
  RESTAURANT_OBJECTS,
  type HospitalityKind,
} from "@/lib/marketing/hospitalityShowcase";
import "./hospitality-live-showcase.css";

/** Read-only product fixtures. Guest requirements remain bound to the relevant booking. */
export function HospitalityLiveShowcase({
  kind,
  onKindChange,
}: {
  kind: HospitalityKind;
  onKindChange: (kind: HospitalityKind) => void;
}) {
  const [restaurantId, setRestaurantId] = useState("t8");
  const [hotelId, setHotelId] = useState("room_310");
  const hotel = kind === "hotel";
  const objects = hotel ? HOTEL_OBJECTS : RESTAURANT_OBJECTS;
  const selected =
    objects.find((o) => o.id === (hotel ? hotelId : restaurantId)) ||
    objects[0]!;
  return (
    <div className="rhl-scene" data-hospitality={kind}>
      <div className="rhl-toolbar">
        <div>
          <span className="rhl-live-dot" />{" "}
          <strong>
            {hotel ? "Every arrival, considered." : "Every table, understood."}
          </strong>
          <small>
            {HOSPITALITY_LOCATIONS[kind]} · {hotel ? "14:20" : "19:48"}
          </small>
        </div>
        <div
          className="rhl-mode"
          role="group"
          aria-label="Hospitality operation"
        >
          <button
            type="button"
            aria-pressed={!hotel}
            onClick={() => onKindChange("restaurant")}
          >
            Restaurant
          </button>
          <button
            type="button"
            aria-pressed={hotel}
            onClick={() => onKindChange("hotel")}
          >
            Hotel
          </button>
        </div>
      </div>
      <div className="rhl-metrics">
        {(hotel
          ? [
              [`${HOTEL_SHOWCASE.occupancyPct}%`, "Occupancy"],
              [`${HOTEL_SHOWCASE.arrivalsToday}`, "Arrivals today"],
              ["3", "Floor in focus"],
            ]
          : [
              ["4", "Tables in focus"],
              ["19 min", "Table 8 delay"],
              ["20:15", "Next at Table 8"],
            ]
        ).map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="rhl-body">
        <div className="rhl-world" data-world={kind}>
          <div className="rhl-world-label">
            <span>
              {hotel ? "MERCER HOUSE · FLOOR 3" : "SOHO · DINING ROOM"}
            </span>
            <i>{hotel ? "8 floors" : "Dinner service"}</i>
          </div>
          <div
            className="rhl-object-grid"
            role="group"
            aria-label={
              hotel
                ? "Hotel rooms with incoming guest needs"
                : "Restaurant tables with current guest needs"
            }
          >
            {objects.map((o) => (
              <button
                type="button"
                key={o.id}
                className="rhl-object"
                aria-pressed={o.id === selected.id}
                aria-label={`${o.label}, ${o.state}${o.allergy ? `, ${o.scope}: ${o.allergy} allergy` : ""}`}
                onClick={() =>
                  hotel ? setHotelId(o.id) : setRestaurantId(o.id)
                }
                data-alert={!!o.allergy || undefined}
              >
                <span className="rhl-object-top">
                  <strong>{o.label}</strong>
                  <i aria-hidden="true" />
                </span>
                <span className="rhl-object-state">{o.state}</span>
                <span className="rhl-object-meta">
                  {hotel ? o.next : o.value}
                </span>
                {o.allergy ? (
                  <span className="rhl-object-alert">
                    {hotel ? "Incoming" : "Current"} · {o.allergy}
                  </span>
                ) : (
                  <span className="rhl-object-note">
                    {o.allergyState === "none-reported"
                      ? "No allergies reported"
                      : "Notes pending"}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="rhl-world-foot">
            <span>
              {hotel
                ? "Housekeeping → inspection → arrival"
                : "Kitchen → pass → guest experience"}
            </span>
            <span className="rhl-scan" aria-hidden="true" />
          </div>
        </div>
        <aside
          className="rhl-inspector"
          aria-label={`${selected.label} guest and operating details`}
        >
          <div className="rhl-inspector-head">
            <span>
              {selected.label} <b>{hotel ? "ARRIVAL" : "CURRENT PARTY"}</b>
            </span>
            <strong>{selected.party}</strong>
            <small>{selected.meta}</small>
          </div>
          <div
            className="rhl-safety"
            data-alert={!!selected.allergy || undefined}
          >
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
          <div className="rhl-request">
            <strong>{selected.occasion || "Guest requests"}</strong>
            <span>{selected.request}</span>
          </div>
          <div className="rhl-detail-line">
            <strong>{selected.value}</strong>
            <span>{selected.orders}</span>
          </div>
          <div className="rhl-next">
            <strong>
              {hotel ? "Arrival" : "Next"} · {selected.next}
            </strong>
            <span>
              {hotel ? `Owner · ${selected.owner}` : selected.nextNeeds}
            </span>
          </div>
        </aside>
      </div>
      <div
        className="rhl-timeline"
        aria-label={`${selected.label} service timeline`}
      >
        {selected.timeline.map((event, i) => (
          <div key={`${event.time}-${i}`}>
            <i />
            <strong>{event.time}</strong>
            <span>{event.label}</span>
          </div>
        ))}
        <Link href="/product?surface=live">Explore Live →</Link>
      </div>
    </div>
  );
}
