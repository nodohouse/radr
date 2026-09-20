/**
 * "Since your last check" - visit / first-seen state for Control Center.
 * Storage is a port. DEMO uses localStorage; LIVE should persist per user on the server.
 *
 * Principle: USER ATTENTION IS A SCARCE RESOURCE.
 * This summary answers what changed, what RADR handled, what still needs you,
 * and what was verified - not a generic dashboard rollup.
 */

import type { Finding } from "@/lib/radr/domain";
import { DEMO_FORECAST_EXPOSURE_DELTA, isoOnDemoDate } from "@/lib/radr/demoClock";
import {
  currentExposureFromFindings,
  attentionNowFindings,
  operatorAttentionState,
} from "@/lib/radr/valueSemantics";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";

const STORAGE_KEY = "radr.attention.v2";

export type AttentionSnapshot = {
  lastVisitAt: string;
  seenFindingIds: string[];
  acknowledgedFindingIds: string[];
};

export type AttentionStore = {
  read(): AttentionSnapshot;
  write(next: AttentionSnapshot): void;
};

export type SinceCheckEvent = {
  t: string;
  label: string;
  territory?: "BUY" | "LABOR" | "SELL" | "RECOVER";
  kind:
    | "detected"
    | "prepared"
    | "handled"
    | "approval"
    | "verified"
    | "forecast";
};

export type SinceLastCheck = {
  newFindings: number;
  changedFindings: number;
  resolvedFindings: number;
  handledCount: number;
  decisionsReady: number;
  needsYou: number;
  additionalExposure: number;
  recoveredValue: number;
  forecastExposureDelta: number;
  lastVisitAt: string | null;
  isFirstVisit: boolean;
  lines: string[];
  events: SinceCheckEvent[];
};

function epochSnapshot(): AttentionSnapshot {
  return {
    lastVisitAt: new Date(0).toISOString(),
    seenFindingIds: [],
    acknowledgedFindingIds: [],
  };
}

/** Prior visit: yesterday 16:00, before last night's recovery completed. */
export function demoSeedSnapshot(): AttentionSnapshot {
  return {
    lastVisitAt: isoOnDemoDate("2026-08-18", "16:00"),
    seenFindingIds: [],
    acknowledgedFindingIds: [],
  };
}

export const memoryAttentionStore = (function createMemoryStore(): AttentionStore {
  let snap: AttentionSnapshot | null = null;
  return {
    read() {
      return snap ?? demoSeedSnapshot();
    },
    write(next) {
      snap = next;
    },
  };
})();

export const localStorageAttentionStore: AttentionStore = {
  read() {
    if (typeof window === "undefined") return demoSeedSnapshot();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return demoSeedSnapshot();
      const parsed = JSON.parse(raw) as AttentionSnapshot;
      if (!parsed || typeof parsed.lastVisitAt !== "string") {
        return demoSeedSnapshot();
      }
      return {
        lastVisitAt: parsed.lastVisitAt,
        seenFindingIds: Array.isArray(parsed.seenFindingIds)
          ? parsed.seenFindingIds
          : [],
        acknowledgedFindingIds: Array.isArray(parsed.acknowledgedFindingIds)
          ? parsed.acknowledgedFindingIds
          : [],
      };
    } catch {
      return demoSeedSnapshot();
    }
  },
  write(next) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
};

function defaultStore(): AttentionStore {
  return typeof window === "undefined"
    ? memoryAttentionStore
    : localStorageAttentionStore;
}

export function readAttentionSnapshot(
  store: AttentionStore = defaultStore(),
): AttentionSnapshot {
  return store.read();
}

export function writeAttentionSnapshot(
  next: AttentionSnapshot,
  store: AttentionStore = defaultStore(),
): void {
  store.write(next);
}

export function recordControlCenterVisit(
  findings: Finding[],
  store: AttentionStore = defaultStore(),
): AttentionSnapshot {
  const prev = store.read();
  const ids = findings.map((f) => f.id);
  const next: AttentionSnapshot = {
    lastVisitAt: isoOnDemoDate(),
    seenFindingIds: Array.from(new Set([...prev.seenFindingIds, ...ids])),
    acknowledgedFindingIds: prev.acknowledgedFindingIds,
  };
  store.write(next);
  return next;
}

export function computeSinceLastCheck(
  findings: Finding[],
  snapshot: AttentionSnapshot = readAttentionSnapshot(),
): SinceLastCheck {
  const isEpoch = snapshot.lastVisitAt === epochSnapshot().lastVisitAt;
  const effective = isEpoch ? demoSeedSnapshot() : snapshot;
  const seen = new Set(effective.seenFindingIds);
  const open = attentionNowFindings(findings);
  const resolved = findings.filter(
    (f) => f.status === "RESOLVED" || f.status === "VERIFIED",
  );
  const newFindingsList = open.filter((f) => !seen.has(f.id));
  const changedFindings = open.filter(
    (f) =>
      seen.has(f.id) &&
      new Date(f.updatedAt).getTime() >
        new Date(effective.lastVisitAt).getTime(),
  );
  const additionalExposure = currentExposureFromFindings(newFindingsList);
  const recoveredValue = resolved.reduce(
    (s, f) => s + (f.financialImpact.verifiedValue ?? 0),
    0,
  );
  const verifiedLedger = getVerifiedValueFromScenarios().verified;
  const forecastExposureDelta = DEMO_FORECAST_EXPOSURE_DELTA;
  const decisionsReady = open.filter(
    (f) => operatorAttentionState(f) === "READY_FOR_APPROVAL",
  ).length;
  const handledCount =
    resolved.length +
    findings.filter((f) => f.status === "ACTIONED").length;

  const newFindings = newFindingsList.length;
  const events: SinceCheckEvent[] = [];
  const lines: string[] = [];

  if (newFindings > 0) {
    lines.push(
      `${newFindings} finding${newFindings === 1 ? "" : "s"} detected`,
    );
    for (const f of newFindingsList.slice(0, 2)) {
      events.push({
        t: " - ",
        label: `${f.territory}: ${f.title}`,
        territory: f.territory,
        kind: "detected",
      });
    }
  }

  const buyOpen = open.find((f) => f.territory === "BUY");
  if (buyOpen) {
    lines.push("1 supplier discrepancy prepared");
    events.push({
      t: " - ",
      label: "Supplier discrepancy prepared for approval",
      territory: "BUY",
      kind: "prepared",
    });
  }

  if (resolved.length > 0 || verifiedLedger > 0) {
    lines.push(
      `${resolved.length || 1} recovery completed`,
    );
    events.push({
      t: " - ",
      label: "Recovery completed · outcome verified",
      territory: "RECOVER",
      kind: "verified",
    });
  }

  if (decisionsReady > 0) {
    lines.push(
      `${decisionsReady} decision${decisionsReady === 1 ? "" : "s"} need${decisionsReady === 1 ? "s" : ""} approval`,
    );
    events.push({
      t: " - ",
      label: "Prepared action ready for approval",
      territory: open.find((f) => operatorAttentionState(f) === "READY_FOR_APPROVAL")
        ?.territory,
      kind: "approval",
    });
  }

  const verifiedAdded = verifiedLedger || recoveredValue;
  if (verifiedAdded > 0) {
    lines.push(`€${verifiedAdded} added to Verified Value`);
  }

  if (Math.abs(forecastExposureDelta) > 0) {
    lines.push(
      `Forecast exposure decreased €${Math.abs(forecastExposureDelta)}`,
    );
    events.push({
      t: " - ",
      label: `Forecast exposure decreased €${Math.abs(forecastExposureDelta)}`,
      kind: "forecast",
    });
  }

  return {
    newFindings,
    changedFindings: changedFindings.length,
    resolvedFindings: resolved.length,
    handledCount: Math.max(handledCount, resolved.length || 1),
    decisionsReady,
    needsYou: open.length,
    additionalExposure,
    recoveredValue: recoveredValue || verifiedLedger,
    forecastExposureDelta,
    lastVisitAt: effective.lastVisitAt,
    isFirstVisit: false,
    lines,
    events,
  };
}
