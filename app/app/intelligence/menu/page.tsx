"use client";

import Link from "next/link";
import Image from "next/image";
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
import {
  getBasketPairs,
  getMenuRankings,
  rankingsAreDistinct,
  type MenuRankKind,
} from "@/lib/radr/intelligence/menuRankings";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import "./menu-intelligence.css";

/**
 * Menu Intelligence — contribution × capacity · rankings · basket.
 */
export default function MenuIntelligencePage() {
  const { isHotel } = useDemoOrg();
  if (isHotel) {
    return <HotelMenuGate />;
  }
  return <RestaurantMenuIntelligence />;
}

function HotelMenuGate() {
  return (
    <div className="rp-intel-hub" style={{ padding: "2rem 1.25rem" }}>
      <p className="rp-intel-kicker">Intelligence</p>
      <h1>Menu economics is a restaurant lens.</h1>
      <p className="rp-cin-quiet" style={{ maxWidth: "32rem" }}>
        Northstar Hotels uses room readiness, distribution, and housekeeping
        modules instead.
      </p>
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/app/intelligence" className="rp-ccx-hero-link">
          Open hotel Intelligence →
        </Link>
      </p>
    </div>
  );
}

function RestaurantMenuIntelligence() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const berlinOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id);
  const [peakMode, setPeakMode] = useState(true);
  const [rank, setRank] = useState<MenuRankKind>("sellers");
  const [selectedId, setSelectedId] = useState("mi_tuna_tataki");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pairHover, setPairHover] = useState<string | null>(null);

  const items = useMemo(() => {
    const raw = MenuIntelligenceService.forBerlin();
    return peakMode ? MenuIntelligenceService.peakMode(raw) : raw;
  }, [peakMode]);

  const ranked = useMemo(
    () => getMenuRankings(rank, { peak: peakMode }),
    [rank, peakMode],
  );
  const pairs = useMemo(() => getBasketPairs({ peak: peakMode }), [peakMode]);
  const distinct = rankingsAreDistinct();

  const selected =
    items.find((i) => i.itemId === selectedId) ?? items[0] ?? null;
  const complexity =
    selected?.itemId === "mi_tuna_tataki" ? tunaComplexityAdjusted() : null;
  const focusId = hoverId ?? selectedId;

  const rankHint =
    rank === "sellers"
      ? "Highest units / demand"
      : rank === "contributors"
        ? "Highest total contribution"
        : "Highest contribution per constrained kitchen minute";

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
          SELL × MARGIN × CAPACITY × INVENTORY · Berlin Mitte · DEMO
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
            Peak 19:00–20:30
          </button>
        </div>
      </header>

      <section className="rp-menu-ranks" aria-label="Menu rankings">
        <div className="rp-menu-rank-tabs" role="tablist">
          {(
            [
              ["sellers", "Best sellers"],
              ["contributors", "Best contributors"],
              ["operators", "Best operators"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              data-active={rank === id ? "true" : undefined}
              aria-selected={rank === id}
              onClick={() => setRank(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="rp-menu-rank-hint">
          {rankHint}
          {distinct ? null : " · rankings collapsed"}
        </p>
        <div className="rp-menu-rank-tracks">
          <div className="rp-menu-rank-head" aria-hidden="true">
            <span className="rp-menu-rank-n">#</span>
            <span className="rp-menu-rank-img" />
            <span className="rp-menu-rank-name">Dish</span>
            <span className="rp-menu-rank-sold">Demand</span>
            <span className="rp-menu-rank-contrib">Contribution</span>
            <span className="rp-menu-rank-cpk">€ / constrained min</span>
            <span className="rp-menu-rank-station">Station</span>
            <span className="rp-menu-rank-state">State</span>
          </div>
          <ol className="rp-menu-rank-list">
            {ranked.slice(0, 5).map((d, i) => (
              <li key={d.itemId} data-action={d.action}>
                <button
                  type="button"
                  className="rp-menu-rank-row"
                  onClick={() => setSelectedId(d.itemId)}
                  data-selected={selectedId === d.itemId ? "true" : undefined}
                  title={d.actionWhy}
                >
                  <em className="rp-menu-rank-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </em>{" "}
                  <span className="rp-menu-rank-img">
                    {d.imageSrc ? (
                      <Image src={d.imageSrc} alt="" width={48} height={48} />
                    ) : null}
                  </span>{" "}
                  <strong className="rp-menu-rank-name">{d.name}</strong>{" "}
                  <span className="rp-menu-rank-sold">
                    <strong>{d.units}</strong>
                    <em>sold</em>
                  </span>{" "}
                  <span className="rp-menu-rank-contrib">
                    {formatDecisionMoney(d.contribution)}
                  </span>{" "}
                  <span className="rp-menu-rank-cpk">
                    {formatDecisionMoney(d.contributionPerKitchenMin)}
                  </span>{" "}
                  <span className="rp-menu-rank-station">{d.station}</span>{" "}
                  <span
                    className="rp-menu-rank-state"
                    data-action={d.action}
                  >
                    {d.action}
                  </span>{" "}
                  <span className="rp-menu-rank-more" aria-hidden="true">
                    <span>
                      <i>Demand</i>
                      {d.units} sold
                    </span>
                    <span>
                      <i>€ / constrained min</i>
                      {formatDecisionMoney(d.contributionPerKitchenMin)}
                    </span>
                    <span>
                      <i>Station</i>
                      {d.station}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rp-menu-basket" aria-label="Frequently bought together">
        <p className="rp-cc-kicker">Frequently bought together</p>
        <p className="rp-menu-rank-hint">
          Upsell = basket economics ∩ inventory ∩ kitchen ∩ service pressure
        </p>
        <ul>
          {pairs.map((p) => (
            <li
              key={p.id}
              data-hold={!p.promoteNow ? "true" : undefined}
              data-hover={pairHover === p.id ? "true" : undefined}
              onMouseEnter={() => setPairHover(p.id)}
              onMouseLeave={() => setPairHover(null)}
            >
              <span className="rp-menu-rank-img">
                {p.imageSrc ? (
                  <Image src={p.imageSrc} alt="" width={44} height={44} />
                ) : null}
              </span>
              <div>
                <strong>{p.pair}</strong>
                <span>
                  {p.basketCount} baskets · attach {p.attachLift} · avg{" "}
                  {p.avgBasket} · +€{p.incremental.toFixed(2)}
                </span>
                <dl className="rp-menu-pair-dims">
                  <div>
                    <dt>Inventory</dt>
                    <dd>{p.inventory}</dd>
                  </div>
                  <div>
                    <dt>Kitchen</dt>
                    <dd>{p.kitchen}</dd>
                  </div>
                  <div>
                    <dt>Pressure</dt>
                    <dd>{p.servicePressure}</dd>
                  </div>
                  <div>
                    <dt>Contribution</dt>
                    <dd>{p.contributionNote}</dd>
                  </div>
                </dl>
                {p.holdReason ? (
                  <em className="rp-menu-hold">{p.holdReason}</em>
                ) : (
                  <em className="rp-menu-go">GOOD UPSELL NOW</em>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

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
              </dl>
              {complexity ? (
                <p className="rp-drec-quiet">{complexity.verdict}</p>
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
            const short = item.name.split(" ")[0] ?? item.name;
            const showLabel =
              selected?.itemId === item.itemId ||
              hoverId === item.itemId ||
              item.contribution >= 10;
            return (
              <button
                key={item.itemId}
                type="button"
                className="rp-menu-dot"
                data-selected={
                  selected?.itemId === item.itemId ? "true" : undefined
                }
                data-dim={dim ? "true" : undefined}
                data-label={showLabel ? "true" : undefined}
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
                title={item.name}
              >
                {showLabel ? <span>{short}</span> : null}
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
                  demoLabel: "Demo editorial",
                } satisfies VisualAsset
              }
              aspect="4/3"
            />
          </div>
          <div className="rp-menu-detail-body">
            <h2>{selected.name}</h2>
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
