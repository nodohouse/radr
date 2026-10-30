"use client";

import { useState } from "react";
import type { HouseRoom } from "@/lib/radr/product/houseReadiness";
import { RoomTile } from "./RoomTile";

type Props = {
  floor: number;
  rooms: HouseRoom[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
};

export function FloorRow({
  floor,
  rooms,
  selectedId,
  onSelect,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const first = rooms[0]?.number ?? "";
  const last = rooms[rooms.length - 1]?.number ?? "";
  const counts = {
    ready: rooms.filter((r) => r.state === "ready").length,
    cleaning: rooms.filter((r) => r.state === "cleaning").length,
    dirty: rooms.filter((r) => r.state === "dirty").length,
    blocked: rooms.filter((r) => r.state === "blocked").length,
    inspection: rooms.filter((r) => r.state === "inspection").length,
  };

  return (
    <section className="hr-floor" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className="hr-floor-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hr-floor-chev" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
        <strong>FLOOR {floor}</strong>
        <em>
          {first}–{last}
        </em>
        {!open ? (
          <span className="hr-floor-summary">
            {counts.ready} ready · {counts.cleaning} cleaning ·{" "}
            {counts.inspection} inspect · {counts.dirty} dirty ·{" "}
            {counts.blocked} blocked
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="hr-floor-grid" role="group" aria-label={`Floor ${floor} rooms`}>
          {rooms.map((room) => (
            <RoomTile
              key={room.id}
              room={room}
              selected={selectedId === room.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
