"use client";

import { memo } from "react";
import {
  roomStateLabel,
  type HouseRoom,
} from "@/lib/radr/product/houseReadiness";

type Props = {
  room: HouseRoom;
  selected: boolean;
  onSelect: (id: string) => void;
};

function RoomTileInner({ room, selected, onSelect }: Props) {
  const label = [
    `Room ${room.number}`,
    roomStateLabel(room.state),
    room.etaReady ? `expected ready ${room.etaReady}` : null,
    room.nextArrivalAt ? `next arrival ${room.nextArrivalAt}` : null,
    room.vip ? "VIP" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      className="hr-room"
      data-state={room.state}
      data-selected={selected ? "true" : undefined}
      data-vip={room.vip ? "true" : undefined}
      data-room={room.number}
      aria-label={label}
      aria-pressed={selected}
      title={`Room ${room.number} · ${roomStateLabel(room.state)}${
        room.etaReady ? ` · ETA ${room.etaReady}` : ""
      }`}
      onClick={() => onSelect(room.id)}
    >
      <span className="hr-room-num">{room.number}</span>
      <span className="hr-room-dot" aria-hidden />
      {room.vip ? <span className="hr-room-vip" aria-hidden>★</span> : null}
    </button>
  );
}

export const RoomTile = memo(RoomTileInner);
