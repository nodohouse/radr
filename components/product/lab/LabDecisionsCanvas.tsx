"use client";

/**
 * Decisions — Needs-you queue with action · € · clock · because · wedge.
 * Click opens Why / Futures — not a dead detail.
 */

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  scopedDecisions,
  splitNeedsYou,
} from "@/lib/radr/product/roleScope";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import type { RoleView } from "@/lib/product/types";
import { LAB_SEEDS } from "./labLineage";
import { useLab } from "./LabContext";
import { ROLE_LENSES } from "./labRoleLens";

type QueueItem = {
  id: string;
  displayId: string;
  title: string;
  euro: string;
  grade: "Expected" | "Verified";
  clock: string;
  because: string;
  wedge: string;
  href: string;
  seed?: "service" | "recover";
  sortEuro: number;
  sortMin: number;
};

function roleView(role: string): RoleView {
  if (role === "cfo") return "cfo";
  if (role === "clevel") return "coo";
  return "gm";
}

function wedgeOf(id: string): string {
  if (id === DECISION_IDS.peak || id === DECISION_IDS.menuPeak) return "SELL";
  if (id === DECISION_IDS.labor) return "LABOR";
  if (id === DECISION_IDS.supplier) return "RECOVER";
  if (id === DECISION_IDS.tuna) return "VALUE";
  return "SELL";
}

const HEROES: QueueItem[] = [
  {
    id: DECISION_IDS.peak,
    displayId: "D-1911",
    title: "WAIT 12 MINUTES",
    euro: "€620",
    grade: "Expected",
    clock: "Decide by 18:53 · 11m",
    because: "Kitchen 92% · seat-now burns 9 second turns",
    wedge: "SELL",
    href: LAB_SEEDS.service.path,
    seed: "service",
    sortEuro: 620,
    sortMin: 11,
  },
  {
    id: DECISION_IDS.supplier,
    displayId: "D-4102",
    title: "AP CREDIT APPLIED",
    euro: "€273",
    grade: "Verified",
    clock: "Verified · matched to invoice",
    because: "INV-88421 line matched CM-44102 applied to the same invoice",
    wedge: "RECOVER",
    href: LAB_SEEDS.recover.path,
    seed: "recover",
    sortEuro: 273,
    sortMin: 0,
  },
  {
    id: DECISION_IDS.labor,
    displayId: "D-1920",
    title: "HOLD LABOR PLAN",
    euro: "€410",
    grade: "Expected",
    clock: "Tonight service",
    because: "Headcount OK — risk is kitchen mix, not roster",
    wedge: "LABOR",
    href: "/app/lab/decisions/d-1920",
    sortEuro: 410,
    sortMin: 180,
  },
  {
    id: DECISION_IDS.menuPeak,
    displayId: "D-7110",
    title: "DE-EMPHASIZE PEAK WINDOW",
    euro: "€610",
    grade: "Expected",
    clock: "Tonight · 19:00–20:30",
    because: "Signature mix burns cold-station minutes at peak",
    wedge: "SELL",
    href: "/app/lab/decisions/d-7110",
    sortEuro: 610,
    sortMin: 90,
  },
];

export function LabDecisionsCanvas() {
  const { nav, setSeed, goDecision } = useLab();
  const lens = ROLE_LENSES[nav.role];
  const [sortBy, setSortBy] = useState<"decide-by" | "euro">("decide-by");
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const storeItems: QueueItem[] = useMemo(() => {
    const scoped = scopedDecisions(
      Object.values(snap.records),
      roleView(nav.role),
    );
    const { urgent, review } = splitNeedsYou(scoped);
    return [...urgent, ...review]
      .filter(
        (r) =>
          r.id !== DECISION_IDS.peak &&
          r.id !== DECISION_IDS.supplier &&
          r.id !== DECISION_IDS.labor &&
          r.id !== DECISION_IDS.menuPeak,
      )
      .map((r) => {
        const m = formatPrimaryMetric(r);
        return {
          id: r.id,
          displayId: displayDecisionId(r.id),
          title:
            (r.recommendationHeadline ?? r.title)
              .split("—")[0]
              ?.trim()
              .toUpperCase() ?? r.title,
          euro: m?.money ?? "—",
          grade: "Expected" as const,
          clock: r.decisionDeadline ?? r.decisionHorizon ?? "—",
          because: r.contextLine ?? "Material decision still open",
          wedge: wedgeOf(r.id),
          href: `/app/lab/decisions/${displayDecisionId(r.id).toLowerCase()}`,
          sortEuro: 0,
          sortMin: 9999,
        };
      });
  }, [snap, nav.role]);

  const items = useMemo(() => {
    const heroes =
      nav.role === "cfo"
        ? [...HEROES].sort((a, b) => {
            const rank = (w: string) =>
              w === "RECOVER" ? 0 : w === "LABOR" ? 2 : 1;
            return rank(a.wedge) - rank(b.wedge);
          })
        : nav.role === "clevel"
          ? [...HEROES].sort((a, b) => b.sortEuro - a.sortEuro)
          : HEROES;
    const all = [...heroes, ...storeItems];
    return all.sort((a, b) =>
      sortBy === "euro" ? b.sortEuro - a.sortEuro : a.sortMin - b.sortMin,
    );
  }, [nav.role, storeItems, sortBy]);

  return (
    <div className="lab-viewport lab-viewport-decisions lab-surface-light">
      <div className="lab-decisions lab-decisions-v50">
        <header className="lab-surf-head">
          <div>
            <p className="lab-surf-k">Decisions</p>
            <h1 className="lab-surf-title">
              <strong>{items.length}</strong> need you
            </h1>
            <p className="lab-surf-sub">
              {lens.subtitle} · {nav.role.toUpperCase()} lens
            </p>
          </div>
          <div className="lab-decisions-sort" role="group" aria-label="Sort">
            <button
              type="button"
              data-on={sortBy === "decide-by" ? "true" : undefined}
              onClick={() => setSortBy("decide-by")}
            >
              Decide-by
            </button>
            <button
              type="button"
              data-on={sortBy === "euro" ? "true" : undefined}
              onClick={() => setSortBy("euro")}
            >
              € at stake
            </button>
          </div>
        </header>

        <ul className="lab-decisions-queue">
          {items.map((item) => (
            <li key={`${item.id}-${item.displayId}`}>
              <article className="lab-dq">
                <div className="lab-dq-top">
                  <em>{item.displayId}</em>
                  <span className="lab-dq-wedge">{item.wedge}</span>
                </div>
                <h2 className="lab-dq-title">{item.title}</h2>
                <p className="lab-dq-euro" data-grade={item.grade}>
                  <strong>{item.euro}</strong>
                  <span>{item.grade}</span>
                </p>
                <p className="lab-dq-because">because {item.because}</p>
                <p className="lab-dq-clock">{item.clock}</p>
                <div className="lab-dq-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.seed) {
                        setSeed(item.seed);
                        return;
                      }
                      goDecision(item.id, "why");
                    }}
                  >
                    Why + Futures
                  </button>
                  <Link href={item.href}>Open</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
