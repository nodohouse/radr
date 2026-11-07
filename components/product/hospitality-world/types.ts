import type { MutableRefObject } from "react";
import type { GuestSignal } from "@/lib/product/guestSignals";

export type SpatialEntity = {
  id: string;
  label: string;
  number: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  seats?: number;
  tone: string;
  status: string;
  detail: string;
  signals: GuestSignal[];
};
export type SpatialCamera = {
  reset: () => void;
  zoom: (factor: number) => void;
  top: () => void;
  pan: (x: number, z: number) => void;
};
export type HospitalityWorldProps = {
  kind: "restaurant" | "hotel";
  label: string;
  width: number;
  depth: number;
  entities: SpatialEntity[];
  selected: string | null;
  onSelect: (id: string) => void;
  cameraRef?: MutableRefObject<SpatialCamera | null>;
};
export function toneColor(tone: string) {
  return ["wait", "dirty", "ooo", "blocked"].includes(tone)
    ? "#d9933b"
    : ["ready", "turning"].includes(tone)
      ? "#00c886"
      : ["seated", "cleaning"].includes(tone)
        ? "#2874df"
        : "#9baaa5";
}
