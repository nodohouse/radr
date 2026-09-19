"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CANAL_HOUSE,
  canalHouseArrivalForRoom,
  canalHouseRecoveryOptions,
  canalHouseRooms,
  canalHouseStayArrivals,
  formatHotelRecoveryOpened,
  hotelRoomStatusLabel,
  type HotelRoomStatus,
} from "@/lib/radr/demo/canalHouseAmsterdam";
import { hotelFacilityForType } from "@/lib/radr/demo/facilityCatalog";
import { FacilityCard } from "@/components/product/FacilityCard";
import {
  StayArrivalsBrief,
  StayGuestChips,
} from "@/components/product/StayArrivalsBrief";
import { formatEuro } from "@/lib/radr/money";

type Filter = "all" | HotelRoomStatus | "types";

/**
 * Hotel property surface — visual rooms + who is arriving today.
 */
export function HotelPropertyBoard() {
  const searchParams = useSearchParams();
  const openRecover = searchParams.get("recover") === "deluxe";
  const [filter, setFilter] = useState<Filter>("all");
  const [swapDone, setSwapDone] = useState(false);
  const [recoverOpen, setRecoverOpen] = useState(openRecover);
  const [recoverChoice, setRecoverChoice] = useState("direct");
  const [recoverDone, setRecoverDone] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [arrivalsOpen, setArrivalsOpen] = useState(true);

  const rooms = useMemo(() => canalHouseRooms(), []);
  const arrivals = useMemo(() => canalHouseStayArrivals(), []);
  const options = useMemo(() => canalHouseRecoveryOptions(), []);
  const typeGuide = useMemo(
    () =>
      CANAL_HOUSE.roomTypes.map((t) => hotelFacilityForType(t)).filter(Boolean),
    [],
  );

  const visibleRooms =
    filter === "types" || filter === "all"
      ? rooms
      : rooms.filter((r) => r.status === filter);

  return (
    <div className="rp-hotel-prop" aria-label="Property · rooms">
      <header className="rp-hotel-prop-head">
        <div>
          <p className="rp-hotel-glance-kicker">PROPERTY · ROOMS · DEMO</p>
          <h1>{CANAL_HOUSE.name}</h1>
          <p className="rp-hotel-glance-lead">
            Rooms · equipment · who arrives today and what to prepare
          </p>
        </div>
        <Link href="/app" className="rp-btn-secondary">
          Control Center
        </Link>
      </header>

      <div className="rp-stay-board-brief">
        <button
          type="button"
          className="rp-stay-board-toggle"
          aria-expanded={arrivalsOpen}
          onClick={() => setArrivalsOpen((o) => !o)}
        >
          {arrivalsOpen ? "Hide arrivals" : "Show arrivals"} · {arrivals.length}{" "}
          today
        </button>
        {arrivalsOpen ? (
          <StayArrivalsBrief arrivals={arrivals} vertical="boutique_hotel" />
        ) : null}
      </div>

      <div className="rp-hotel-prop-filters" role="tablist" aria-label="Room filter">
        {(
          [
            ["all", "All rooms"],
            ["types", "Room types"],
            ["delayed", "At risk"],
            ["cleaning", "Cleaning"],
            ["ready", "Ready"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            data-active={filter === id ? "true" : "false"}
            className="rp-hotel-prop-filter"
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === "types" ? (
        <section aria-label="Room type guide">
          <p className="rp-hotel-sec-label">
            Room types · for managers &amp; new staff
          </p>
          <div className="rp-fac-grid">
            {typeGuide.map((f) =>
              f ? (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  expanded={expandedId === f.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === f.id ? null : f.id))
                  }
                />
              ) : null,
            )}
          </div>
        </section>
      ) : (
        <section aria-label="Room board">
          <p className="rp-hotel-sec-label">Rooms</p>
          <div className="rp-fac-grid">
            {visibleRooms.map((r) => {
              const facility = hotelFacilityForType(r.type);
              if (!facility) return null;
              const exp = expandedId === r.id;
              const arrival = canalHouseArrivalForRoom(r.number);
              return (
                <FacilityCard
                  key={r.id}
                  facility={facility}
                  roomLabel={`Room ${r.number}`}
                  statusLabel={hotelRoomStatusLabel(r.status)}
                  radarNote={r.radar}
                  expanded={exp}
                  onToggle={() =>
                    setExpandedId((id) => (id === r.id ? null : r.id))
                  }
                  footer={
                    <div className="rp-fac-ops">
                      {arrival ? (
                        <StayGuestChips arrival={arrival} />
                      ) : r.guestName ? (
                        <p className="rp-hotel-room-guest">{r.guestName}</p>
                      ) : null}
                      {r.arrivalAt && !arrival ? (
                        <p className="rp-hotel-room-meta">
                          Arrives {r.arrivalAt}
                        </p>
                      ) : arrival ? (
                        <p className="rp-hotel-room-meta">
                          Arrives {arrival.time}
                        </p>
                      ) : null}
                      {r.note ? (
                        <p className="rp-hotel-room-note">{r.note}</p>
                      ) : null}
                      {r.number === "204" && !swapDone ? (
                        <button
                          type="button"
                          className="rp-btn-secondary"
                          onClick={() => setSwapDone(true)}
                        >
                          Approve sequence swap
                        </button>
                      ) : null}
                      {r.number === "204" && swapDone ? (
                        <p className="rp-hotel-room-done">
                          RADR handling · 207 before 204
                        </p>
                      ) : null}
                      {r.number === "118" && !recoverDone ? (
                        <button
                          type="button"
                          className="rp-btn-secondary"
                          onClick={() => setRecoverOpen(true)}
                        >
                          Recover room night
                        </button>
                      ) : null}
                      {r.number === "118" && recoverDone ? (
                        <p className="rp-hotel-room-done">
                          Held for direct · watching
                        </p>
                      ) : null}
                    </div>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {recoverOpen && !recoverDone ? (
        <div
          className="rp-hotel-recover"
          role="dialog"
          aria-label="Recover room night"
        >
          <div className="rp-hotel-recover-card">
            <p className="rp-hotel-sec-label">Recovery</p>
            <h2>
              {formatHotelRecoveryOpened({
                roomType: "Deluxe King",
                nights: 1,
                euro: 420,
              })}
            </h2>
            <p className="rp-hotel-glance-lead">
              WHAT RADR ALREADY DID · Held off automatic OTA push · prepared
              three paths.
            </p>
            <p className="rp-hotel-sec-label">WHAT RADR NEEDS FROM YOU</p>
            <ul className="rp-hotel-recover-opts">
              {options.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    data-active={recoverChoice === o.id ? "true" : "false"}
                    onClick={() => setRecoverChoice(o.id)}
                  >
                    <strong>{o.label}</strong>
                    <span>{o.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="rp-hotel-recover-actions">
              <button
                type="button"
                className="rp-btn-secondary"
                onClick={() => setRecoverOpen(false)}
              >
                Not now
              </button>
              <button
                type="button"
                className="rp-btn-primary"
                onClick={() => {
                  setRecoverDone(true);
                  setRecoverOpen(false);
                }}
              >
                Confirm · {formatEuro(420)} path
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
