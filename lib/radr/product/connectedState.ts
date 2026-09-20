/**
 * Connected operating scenario — Futures selection updates Service Map / related surfaces.
 */

type Listener = () => void;

export type ConnectedScenario = {
  peakPath: "wait" | "seat" | "refuse";
  serviceTime: "18:00" | "18:42" | "19:00" | "20:00" | "21:00";
  marginFutureId: string | null;
  cokePriceDeltaEuro: number | null;
};

let state: ConnectedScenario = {
  peakPath: "wait",
  serviceTime: "18:42",
  marginFutureId: "category_rebalance",
  cokePriceDeltaEuro: null,
};

const listeners = new Set<Listener>();

export function getConnectedScenario(): ConnectedScenario {
  return state;
}

export function setPeakPath(peakPath: ConnectedScenario["peakPath"]) {
  state = { ...state, peakPath };
  listeners.forEach((l) => l());
}

export function setServiceTime(serviceTime: ConnectedScenario["serviceTime"]) {
  state = { ...state, serviceTime };
  listeners.forEach((l) => l());
}

export function setMarginFutureId(marginFutureId: string | null) {
  state = { ...state, marginFutureId };
  listeners.forEach((l) => l());
}

export function setCokePriceDelta(cokePriceDeltaEuro: number | null) {
  state = { ...state, cokePriceDeltaEuro };
  listeners.forEach((l) => l());
}

export function subscribeConnected(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
