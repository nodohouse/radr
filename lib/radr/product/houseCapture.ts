/**
 * BOH phone capture inbox — demo simulation of mobile voice/camera intake.
 * Not a live camera pipeline. Captures persist in localStorage and feed House UI.
 */

import type { HouseCapture } from "@/lib/radr/product/houseAttention";

export const HOUSE_CAPTURE_KEY = "radr.houseCaptures.v1";

export type SimulatedCaptureInput = {
  channel: "voice" | "camera" | "note" | "document";
  transcript: string;
  vertical: "restaurant" | "hotel";
};

const VOICE_PRESETS_RESTAURANT = [
  {
    transcript: "Two kilos caster sugar left, need more before pastry.",
    interpreted: "Caster sugar = 2 kg · below par 5 kg",
    gapId: "gap_sugar_berlin",
    confidence: 0.94,
  },
  {
    transcript: "Fryer oil — four buckets on the line, two short.",
    interpreted: "Fryer oil = 4 buckets · below par 6",
    gapId: "gap_oil_berlin",
    confidence: 0.91,
  },
];

const VOICE_PRESETS_HOTEL = [
  {
    transcript: "Cart three soap almost gone, need restock before arrivals.",
    interpreted: "Guest soap ≈ 22 sets · below cart par 40",
    gapId: "gap_soap_canal",
    confidence: 0.92,
  },
];

function clockLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Stable empty snapshot — useSyncExternalStore requires Object.is equality. */
export const EMPTY_HOUSE_CAPTURES: HouseCapture[] = [];

let cachedRaw: string | null | undefined = undefined;
let cachedCaptures: HouseCapture[] = EMPTY_HOUSE_CAPTURES;

function invalidateCaptureCache(): void {
  cachedRaw = undefined;
  cachedCaptures = EMPTY_HOUSE_CAPTURES;
}

export function readSimulatedCaptures(): HouseCapture[] {
  if (typeof window === "undefined") return EMPTY_HOUSE_CAPTURES;
  try {
    const raw = localStorage.getItem(HOUSE_CAPTURE_KEY);
    if (raw === cachedRaw) return cachedCaptures;
    cachedRaw = raw;
    if (!raw) {
      cachedCaptures = EMPTY_HOUSE_CAPTURES;
      return cachedCaptures;
    }
    const parsed = JSON.parse(raw) as HouseCapture[];
    cachedCaptures = Array.isArray(parsed) ? parsed : EMPTY_HOUSE_CAPTURES;
    return cachedCaptures;
  } catch {
    cachedRaw = null;
    cachedCaptures = EMPTY_HOUSE_CAPTURES;
    return EMPTY_HOUSE_CAPTURES;
  }
}

export function writeSimulatedCaptures(caps: HouseCapture[]): void {
  try {
    const raw = JSON.stringify(caps);
    localStorage.setItem(HOUSE_CAPTURE_KEY, raw);
    cachedRaw = raw;
    cachedCaptures = caps;
    window.dispatchEvent(new CustomEvent("radr:house-captures"));
  } catch {
    invalidateCaptureCache();
  }
}

export function simulatePhoneCapture(
  input: SimulatedCaptureInput,
): HouseCapture {
  const presets =
    input.vertical === "hotel" ? VOICE_PRESETS_HOTEL : VOICE_PRESETS_RESTAURANT;
  const match =
    presets.find((p) =>
      input.transcript.toLowerCase().includes(
        p.interpreted.split("=")[0]?.trim().toLowerCase().slice(0, 8) ?? "___",
      ),
    ) ?? presets[0]!;

  const cap: HouseCapture = {
    id: `cap_sim_${Date.now()}`,
    when: clockLabel(),
    channel:
      input.channel === "document"
        ? "note"
        : input.channel === "note"
          ? "note"
          : input.channel,
    by: input.vertical === "hotel" ? "HK · phone" : "Kitchen · phone",
    transcript: input.transcript || match.transcript,
    interpreted: match.interpreted,
    confidence: match.confidence,
    confirmation: "pending",
    modalityDetail:
      input.channel === "camera"
        ? "Camera · phone demo"
        : input.channel === "voice"
          ? "Voice · phone demo"
          : "Manual · phone demo",
    gapId: match.gapId,
    status: "parsed",
  };

  const next = [cap, ...readSimulatedCaptures()].slice(0, 12);
  writeSimulatedCaptures(next);
  return cap;
}

export function subscribeHouseCaptures(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === HOUSE_CAPTURE_KEY) cb();
  };
  const onCustom = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("radr:house-captures", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("radr:house-captures", onCustom);
  };
}
