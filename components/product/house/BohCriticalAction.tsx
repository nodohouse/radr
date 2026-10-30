"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { HouseSummary } from "@/lib/radr/product/houseAttention";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import type { BohView } from "./BohShell";
import {
  IconAlert,
  IconBox,
  IconChef,
  IconInfo,
  IconTruck,
} from "./BohIcons";

function futureIcon(id: string) {
  if (id === "transfer") return <IconTruck size={20} />;
  if (id === "adjust") return <IconChef size={20} />;
  return <IconAlert size={20} />;
}

type Props = {
  house: HouseSummary;
  itemSlug: string | null;
  onOpenView: (v: BohView) => void;
  onOpenStockItem: (slug: string) => void;
  acked: Record<string, boolean>;
  onAck: (id: string) => void;
};

function slug(item: string) {
  return item.toLowerCase().replace(/\s+/g, "-");
}

export function BohCriticalAction({
  house,
  itemSlug,
  onOpenView,
  onOpenStockItem,
  acked,
  onAck,
}: Props) {
  const gap =
    house.gaps.find((g) => slug(g.item) === itemSlug) ??
    house.gaps.find((g) => g.attention === "needs_you") ??
    house.gaps[0];
  const stock =
    house.stock.find((r) => slug(r.item) === (itemSlug ?? slug(gap?.item ?? ""))) ??
    house.stock[0];
  const futures = gap?.futures?.filter((f) => !f.id.includes("topup")) ?? [];
  const [selected, setSelected] = useState(
    () => futures.find((f) => f.recommended)?.id ?? futures[0]?.id ?? "",
  );
  const selectedFuture = futures.find((f) => f.id === selected) ?? futures[0];

  const recalculated = useMemo(() => {
    if (!gap || !stock) return null;
    if (selected === "transfer") {
      return {
        stockAfter: `${stock.current + 2} kg`,
        stockout: "Protected past pastry",
        exposure: "€0 unprotected",
        note: "Kreuzberg surplus covers gap · runner 25 min",
      };
    }
    if (selected === "adjust") {
      return {
        stockAfter: `${stock.current} kg`,
        stockout: "19:55 with dessert hold",
        exposure: "€72 residual",
        note: "Two dessert SKUs held · pastry protected",
      };
    }
    return {
      stockAfter: `${stock.current} kg`,
      stockout: gap.timeToStockout ?? "—",
      exposure: `€${gap.exposureEuro ?? 0} exposed`,
      note: "Stockout likely mid-service",
    };
  }, [selected, gap, stock]);

  const supplier = house.suppliers.find((s) => s.id === stock?.supplierId);
  const decisionId = gap?.decisionId ?? DECISION_IDS.casterSugar;

  const rows = [...house.stock]
    .filter((r) => r.risk !== "ok")
    .sort((a, b) => {
      const rank = { critical: 0, risk: 1, watch: 2, ok: 3 };
      return rank[a.risk] - rank[b.risk];
    });

  if (!gap || !stock) {
    return (
      <section className="boh-placeholder">
        <h2>Stock</h2>
        <p>No critical item selected.</p>
        <button type="button" className="boh-btn-primary" onClick={() => onOpenView("overview")}>
          Back to Overview
        </button>
      </section>
    );
  }

  return (
    <div className="boh-critical">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Stock command</p>
          <h2>Critical stock action</h2>
          <p>Protect service before stockouts hit. Review the situation and take action.</p>
        </div>
      </header>

      <section className="boh-crit-card">
        <div className="boh-crit-main">
          <div className="boh-crit-title">
            <div className="boh-crit-identity">
              <span className="boh-crit-box" aria-hidden>
                <IconBox size={22} />
              </span>
              <div>
                <h3>{gap.item}</h3>
                <p>{gap.area}</p>
              </div>
            </div>
            <span className="boh-badge is-critical">Critical · Action needed now</span>
          </div>
          <div className="boh-metrics boh-metrics-6">
            <div>
              <span>House standard</span>
              <strong>{gap.standardQty}</strong>
            </div>
            <div>
              <span>Reported</span>
              <strong className="boh-tone-neg">{gap.observedQty}</strong>
            </div>
            <div>
              <span>Gap</span>
              <strong className="boh-tone-neg">{gap.gapQty}</strong>
            </div>
            <div>
              <span>Time to stockout</span>
              <strong>{gap.timeToStockout}</strong>
            </div>
            <div>
              <span>Expected usage tonight</span>
              <strong>{gap.expectedUsageTonight}</strong>
            </div>
            <div>
              <span>Service / economic exposure</span>
              <strong>€{gap.exposureEuro}</strong>
            </div>
          </div>
          {recalculated ? (
            <div className="boh-recalc">
              <span>With selected future</span>
              <p>
                Stock → {recalculated.stockAfter} · Stockout → {recalculated.stockout} ·{" "}
                {recalculated.exposure}. {recalculated.note}
              </p>
            </div>
          ) : null}
        </div>
        <div className="boh-crit-media">
          <picture>
            <source srcSet="/house/caster-sugar-bin.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/house/caster-sugar-bin.jpg"
              alt={`${gap.item} — ${gap.area}`}
              width={480}
              height={360}
            />
          </picture>
          <em>
            {gap.item} · {gap.area}
          </em>
        </div>
      </section>

      <section className="boh-futures" aria-label="Recommended actions">
        <h3>Recommended actions</h3>
        <div className="boh-futures-grid">
          {futures.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`boh-future${selected === f.id ? " is-selected" : ""}${f.recommended ? " is-rec" : ""}`}
              onClick={() => setSelected(f.id)}
              aria-pressed={selected === f.id}
            >
              <div className="boh-future-top">
                <span className="boh-radio" aria-hidden />
                <span className={`boh-future-ico is-${f.id}`} aria-hidden>
                  {futureIcon(f.id)}
                </span>
                <strong>{f.title}</strong>
                {f.recommended ? (
                  <span className="boh-badge is-handling">Recommended</span>
                ) : null}
              </div>
              <p>
                {f.costLabel} · {f.timeLabel}
              </p>
              <p>
                Risk {f.serviceRisk} · {f.confidence}% confidence
              </p>
              <em>{f.note}</em>
            </button>
          ))}
        </div>
      </section>

      <div className="boh-insight-bar">
        <IconInfo className="boh-insight-ico" />
        <p>
          This item is forecast to run out at {gap.timeToStockout}, based on
          current burn rate (
          {Math.round(stock.burnPerHour * 10) / 10} {stock.unit}/h) and{" "}
          {stock.par} {stock.unit} par. Recommended:{" "}
          {selectedFuture?.title.toLowerCase() ?? "act now"} to restore par and
          protect service.
        </p>
        <Link
          href={`/app/decisions/${decisionId}`}
          className="boh-btn-primary"
        >
          Open {displayDecisionId(decisionId)} →
        </Link>
      </div>

      {supplier ? (
        <section className="boh-panel boh-supplier">
          <div className="boh-panel-head">
            <h3>Supplier · {supplier.name}</h3>
          </div>
          <div className="boh-metrics">
            <div>
              <span>Contact</span>
              <strong>{supplier.contact}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{supplier.phone}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{supplier.email}</strong>
            </div>
            <div>
              <span>Next delivery</span>
              <strong>{stock.nextDelivery.when}</strong>
            </div>
          </div>
          <div className="boh-capture-actions">
            <a className="boh-btn-primary" href={`tel:${supplier.phone.replace(/\s/g, "")}`}>
              Contact supplier
            </a>
            <button type="button" className="boh-btn-secondary">
              Prepare PO
            </button>
            <button type="button" className="boh-btn-secondary">
              Report short
            </button>
          </div>
        </section>
      ) : null}

      <section className="boh-panel">
        <div className="boh-panel-head">
          <h3>Stock / par · key items</h3>
          <button type="button" className="boh-link" onClick={() => onOpenView("stock")}>
            View all →
          </button>
        </div>
        <div className="boh-table-wrap">
          <table className="boh-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>State</th>
                <th>Area</th>
                <th>Current</th>
                <th>Par</th>
                <th>Gap</th>
                <th>Burn</th>
                <th>Run-out</th>
                <th>Next delivery</th>
                <th>Supplier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const gapN = Math.round((r.current - r.par) * 10) / 10;
                const sup = house.suppliers.find((s) => s.id === r.supplierId);
                return (
                  <tr
                    key={r.id}
                    data-active={slug(r.item) === slug(gap.item) ? "true" : undefined}
                    onClick={() => onOpenStockItem(slug(r.item))}
                  >
                    <td className="boh-item">{r.item}</td>
                    <td>
                      <span
                        className={`boh-badge is-${r.risk === "critical" ? "critical" : r.risk === "risk" ? "risk" : "watching"}`}
                      >
                        {r.risk === "critical"
                          ? "Critical"
                          : r.risk === "risk"
                            ? "At risk"
                            : "Watching"}
                      </span>
                    </td>
                    <td>{r.area}</td>
                    <td>
                      {r.current} {r.unit}
                    </td>
                    <td>
                      {r.par} {r.unit}
                    </td>
                    <td className={gapN < 0 ? "boh-tone-neg" : undefined}>
                      {gapN} {r.unit}
                    </td>
                    <td>
                      {r.burnPerHour} {r.unit}/h
                    </td>
                    <td>{r.runOut}</td>
                    <td>{r.nextDelivery.when}</td>
                    <td>{sup?.name ?? "—"}</td>
                    <td>
                      <div className="boh-row-acts">
                        <button
                          type="button"
                          className="boh-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStockItem(slug(r.item));
                          }}
                        >
                          Contact
                        </button>
                        <button
                          type="button"
                          className="boh-btn-secondary"
                          disabled={!!acked[r.id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAck(r.id);
                          }}
                        >
                          {acked[r.id] ? "Acked" : "Acknowledge"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
