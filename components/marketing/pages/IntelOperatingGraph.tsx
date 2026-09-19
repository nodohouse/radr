"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { CANON_MENU_PEAK } from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { TerritoryRouteId } from "@/data/demo/intelligence";

const NODES: {
  id: string;
  label: string;
  lenses: TerritoryRouteId[];
  x: number;
  y: number;
}[] = [
  { id: "pos", label: "POS", lenses: ["sell", "buy"], x: 18, y: 28 },
  { id: "labor", label: "Labor", lenses: ["labor"], x: 48, y: 18 },
  { id: "kds", label: "KDS", lenses: ["labor", "sell"], x: 78, y: 30 },
  { id: "inv", label: "Inventory", lenses: ["buy"], x: 22, y: 68 },
  { id: "menu", label: "Menu mix", lenses: ["buy", "sell", "labor"], x: 52, y: 58 },
  { id: "del", label: "Delivery", lenses: ["sell", "labor"], x: 82, y: 70 },
];

/**
 * Interactive Operating Graph — select lenses, reveal D-7110.
 */
export function IntelOperatingGraph() {
  const [selected, setSelected] = useState<TerritoryRouteId[]>(["buy"]);

  const toggle = (id: TerritoryRouteId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const activeNodes = useMemo(() => {
    if (!selected.length) return new Set<string>();
    return new Set(
      NODES.filter((n) => n.lenses.some((l) => selected.includes(l))).map(
        (n) => n.id,
      ),
    );
  }, [selected]);

  const showFlagship =
    selected.includes("buy") &&
    selected.includes("labor") &&
    selected.includes("sell");

  return (
    <section className="rx-intel-graph" data-nav-theme="light" aria-label="Operating graph">
      <div className="rx-shell">
        <p className="rx-intel-k">Operating graph</p>
        <h2 className="rx-intel-graph-title">
          Four lenses.
          <br />
          One operating model.
        </h2>
        <p className="rx-intel-graph-lead">
          Select lenses. Watch evidence light up. Cross BUY × LABOR × SELL to
          reveal the flagship Decision.
        </p>

        <div className="rx-intel-graph-lenses" role="group" aria-label="Lenses">
          {(["buy", "labor", "sell", "recover"] as TerritoryRouteId[]).map(
            (id) => (
              <button
                key={id}
                type="button"
                className="rx-reveal-lens"
                data-on={selected.includes(id) ? "true" : undefined}
                onClick={() => toggle(id)}
                aria-pressed={selected.includes(id)}
              >
                {id.toUpperCase()}
              </button>
            ),
          )}
        </div>

        <div className="rx-intel-graph-stage" aria-hidden="true">
          {NODES.map((n) => (
            <div
              key={n.id}
              className="rx-intel-graph-node"
              data-on={activeNodes.has(n.id) ? "true" : undefined}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              {n.label}
            </div>
          ))}
          {showFlagship ? (
            <div className="rx-intel-graph-hub">
              <em>{CANON_MENU_PEAK.displayId}</em>
              <strong>THIS STAR HURTS AT PEAK</strong>
              <span>
                {formatDecisionMoney(CANON_MENU_PEAK.expectedProtectedEuro)}{" "}
                expected · illustrative
              </span>
            </div>
          ) : null}
        </div>

        {showFlagship ? (
          <NextLink href="/demo" className="rx-reveal-cta">
            Open Decision →
          </NextLink>
        ) : (
          <p className="rx-intel-graph-hint">
            Tip: select BUY + LABOR + SELL together.
          </p>
        )}
      </div>
    </section>
  );
}
