/**
 * Shift outlook + pressure — forward operational difficulty.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import type { PressureWindow, TimelineMarker } from "./types";

/** Berlin dinner pressure windows on shared time axis. */
export function berlinPressureWindows(): PressureWindow[] {
  return [
    {
      id: "pw_now",
      start: "19:48",
      end: "20:10",
      level: "medium",
      label: "Within range",
      detail: "Kitchen 89% · building toward inbound wave",
      revenuePacePct: 3.2,
      kitchenPct: 89,
      risk: null,
    },
    {
      id: "pw_peak",
      start: "20:10",
      end: "20:35",
      level: "critical",
      label: "High pressure",
      detail: "18 inbound covers · delivery +31% · rain shifts terrace indoors",
      revenuePacePct: 8,
      kitchenPct: 97,
      risk: "Second-turn erosion",
      clearsIf: `Wait 12 min · ${displayDecisionId(DECISION_IDS.peak)}`,
    },
    {
      id: "pw_21",
      start: "20:35",
      end: "21:30",
      level: "medium",
      label: "Recovering",
      detail: "Kitchen expected 86% if hold applied · backlog clears",
      revenuePacePct: 1.5,
      kitchenPct: 86,
      risk: null,
    },
    {
      id: "pw_22",
      start: "21:30",
      end: "23:00",
      level: "low",
      label: "Within range",
      detail: "Late service · close within band",
      revenuePacePct: 0.4,
      kitchenPct: 42,
      risk: null,
    },
  ];
}

export function berlinTimelineMarkers(): TimelineMarker[] {
  return [
    {
      id: "m_now",
      at: "19:48",
      kind: "now",
      label: "NOW",
      detail: "Kitchen 89% · 2 walk-ins",
    },
    {
      id: "m_arr",
      at: "20:00",
      kind: "demand",
      label: "18 covers arriving",
      detail: "Reservation wave",
    },
    {
      id: "m_rain",
      at: "20:10",
      kind: "weather",
      label: "Rain",
      detail: "Terrace −8 · indoor +10 · net −€220",
    },
    {
      id: "m_kit",
      at: "20:18",
      kind: "decision",
      label: "Kitchen → 94%",
      detail: "Intervention band",
      decisionId: DECISION_IDS.peak,
      decisionLabel: `${displayDecisionId(DECISION_IDS.peak)} · Wait 12 min`,
      economicFormatted: "€620",
    },
  ];
}

export function canalPressureWindows(): PressureWindow[] {
  return [
    {
      id: "hk",
      start: "10:00",
      end: "12:00",
      level: "medium",
      label: "Housekeeping peak",
      detail: "Floor 3–4 turnover",
      revenuePacePct: null,
      kitchenPct: null,
      risk: "Early arrival friction",
    },
    {
      id: "cin",
      start: "14:00",
      end: "16:00",
      level: "high",
      label: "Arrival surge",
      detail: "42 arrivals · 11 not ready · 2 VIP affected",
      revenuePacePct: null,
      kitchenPct: null,
      risk: "Rooms-not-ready · Suite 501",
    },
    {
      id: "eve",
      start: "18:00",
      end: "21:00",
      level: "low",
      label: "Stabilizing",
      detail: "Check-ins complete · F&B demand up",
      revenuePacePct: 2.1,
      kitchenPct: null,
      risk: null,
    },
  ];
}

export function chiadoPressureWindows(): PressureWindow[] {
  return [
    {
      id: "dep",
      start: "09:00",
      end: "11:00",
      level: "medium",
      label: "Departure wave",
      detail: "14 departures · cleaning queue builds",
      revenuePacePct: null,
      kitchenPct: null,
      risk: null,
    },
    {
      id: "turn",
      start: "12:00",
      end: "15:00",
      level: "high",
      label: "Turnover bottleneck",
      detail: "6 units behind · 3 same-day bookings",
      revenuePacePct: null,
      kitchenPct: null,
      risk: "Arrival delay · gap night exposure",
    },
    {
      id: "arr",
      start: "15:00",
      end: "18:00",
      level: "medium",
      label: "Arrival window",
      detail: "Access codes · inspection lag",
      revenuePacePct: null,
      kitchenPct: null,
      risk: null,
    },
  ];
}
