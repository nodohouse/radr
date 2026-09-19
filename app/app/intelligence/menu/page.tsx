"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { MenuIntelligenceService } from "@/lib/radr/product/intelligenceServices";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import type { VisualAsset } from "@/data/demo/visualAssets";
import { IntelligenceCanvas } from "@/components/product/canvas/IntelligenceCanvas";
import { tunaComplexityAdjusted } from "@/lib/radr/product/marginResponse";

/**
 * Secondary Menu Intelligence — contribution × capacity intensity spatial map.
 * Peak mode repositions items — the transition is the explanation.
 */
export default function MenuIntelligencePage() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const berlinOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id);
  const [peakMode, setPeakMode] = useState(false);
  const [selectedId, setSelectedId] = useState("mi_tuna_tataki");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const items = useMemo(() => {
    const raw = MenuIntelligenceService.forBerlin();
    return peakMode ? MenuIntelligenceService.peakMode(raw) : raw;
  }, [peakMode]);

  const selected =
    items.find((i) => i.itemId === selectedId) ?? items[0] ?? null;
  const complexity =
    selected?.itemId === "mi_tuna_tataki" ? tunaComplexityAdjusted() : null;
  const focusId = hoverId ?? selectedId;

  if (!berlinOk) {
    return (
      <div className="rp-menu-intel">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Intelligence</p>
          <h1 className="rp-cc-title">Menu</h1>
          <p className="rp-cc-since">
            Menu intelligence is scoped to Berlin Mitte in this demo.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="rp-menu-intel">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Intelligence · secondary</p>
        <h1 className="rp-cc-title">Menu economics</h1>
        <p className="rp-cc-since">
          Not Stars & Dogs — contribution per constrained kitchen minute ·
          complexity-adjusted when drivers exist · Berlin Mitte · DEMO
        </p>
        <div className="rp-menu-mode">
          <button
            type="button"
            data-active={!peakMode ? "true" : undefined}
            onClick={() => setPeakMode(false)}
          >
            All service
          </button>
          <button
            type="button"
            data-active={peakMode ? "true" : undefined}
            onClick={() => setPeakMode(true)}
          >
            Peak service 19:00–20:30
          </button>
        </div>
      </header>

      <IntelligenceCanvas
        kicker="Menu economic map"
        title="Items reposition when capacity becomes scarce"
        inspector={
          selected ? (
            <div className="rp-menu-inspector">
              <p className="rp-icanvas-kicker">{selected.name}</p>
              <dl>
                <div>
                  <dt>Contribution</dt>
                  <dd>{formatDecisionMoney(selected.contribution)}</dd>
                </div>
                <div>
                  <dt>€ / kitchen minute</dt>
                  <dd>
                    {formatDecisionMoney(
                      selected.capacityMetric.contributionPerUnit,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Station</dt>
                  <dd>{selected.station}</dd>
                </div>
                <div>
                  <dt>Prep</dt>
                  <dd>{selected.prepTimeMin}m</dd>
                </div>
                <div>
                  <dt>Basket</dt>
                  <dd>
                    {selected.basketContributionEuro != null
                      ? formatDecisionMoney(selected.basketContributionEuro)
                      : "—"}
                  </dd>
                </div>
              </dl>
              {complexity ? (
                <div className="rp-menu-complexity">
                  <p className="rp-icanvas-kicker">Menu complexity tax</p>
                  <p>
                    Direct {formatDecisionMoney(complexity.directContributionEuro)}{" "}
                    · tax −{formatDecisionMoney(complexity.complexityTaxEuro)} ·
                    adjusted{" "}
                    {formatDecisionMoney(complexity.adjustedContributionEuro)}
                  </p>
                  <p className="rp-drec-quiet">{complexity.verdict}</p>
                  <ul>
                    <li>
                      Unique low-turn SKUs · {complexity.drivers.lowTurnSkus}
                    </li>
                    <li>
                      Suppliers · {complexity.drivers.supplierDependencyCount}
                    </li>
                    <li>Prep · {complexity.drivers.prepMinutes}m</li>
                    <li>Station · {complexity.drivers.stationDependency}</li>
                    <li>
                      Spoilage · {complexity.drivers.wasteSpoilagePct}%
                    </li>
                  </ul>
                </div>
              ) : null}
              <Link
                href={`/app/decisions/${DECISION_IDS.menuPeak}`}
                className="rp-drec-secondary"
              >
                Open {displayDecisionId(DECISION_IDS.menuPeak)}
              </Link>
            </div>
          ) : null
        }
      >
        <div
          className="rp-menu-plot-stage"
          data-mode={peakMode ? "peak" : "all"}
          key={peakMode ? "peak" : "all"}
          role="img"
          aria-label="Menu economic map"
        >
          {items.map((item) => {
            const x = Math.min(100, (item.contribution / 16) * 100);
            const y = Math.min(100, (item.prepTimeMin / 12) * 100);
            const size = 28 + item.salesMixPct;
            const dim = focusId && focusId !== item.itemId;
            return (
              <button
                key={item.itemId}
                type="button"
                className="rp-menu-dot"
                data-selected={selected?.itemId === item.itemId ? "true" : undefined}
                data-dim={dim ? "true" : undefined}
                data-weak={
                  peakMode &&
                  item.capacityMetric.comparedToPeerPct != null &&
                  item.capacityMetric.comparedToPeerPct < 0
                    ? "true"
                    : undefined
                }
                style={{
                  left: `${x}%`,
                  bottom: `${y}%`,
                  width: size,
                  height: size,
                }}
                onClick={() => setSelectedId(item.itemId)}
                onMouseEnter={() => setHoverId(item.itemId)}
                onMouseLeave={() => setHoverId(null)}
                aria-label={item.name}
              >
                <span>{item.name.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="rp-menu-axis" aria-hidden="true">
            <span>← contribution</span>
            <span>capacity intensity ↑</span>
          </div>
        </div>
      </IntelligenceCanvas>

      {selected?.imageSrc ? (
        <section className="rp-menu-detail">
          <div className="rp-menu-detail-visual">
            <OperatingScene
              asset={
                {
                  id: selected.itemId,
                  src: selected.imageSrc,
                  alt: `${selected.name} plating`,
                  subject: "menu_item",
                  demoLabel: "DEMO EDITORIAL ASSET",
                } satisfies VisualAsset
              }
              aspect="4/3"
            />
          </div>
          <div className="rp-menu-detail-body">
            <h2>{selected.name}</h2>
            <p className="rp-drec-quiet">
              Classic class · {selected.classicMenuClass} — RADR uses system
              economics, not Stars & Dogs alone · DEMO
            </p>
            <Link
              href={`/app/decisions/${DECISION_IDS.menuPeak}`}
              className="rp-cc-cta"
            >
              Open {displayDecisionId(DECISION_IDS.menuPeak)}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
