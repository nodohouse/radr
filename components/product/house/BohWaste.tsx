"use client";

import Link from "next/link";
import type { HouseSummary } from "@/lib/radr/product/houseAttention";
import type { BohView } from "./BohShell";

type Props = {
  house: HouseSummary;
  onOpenView: (v: BohView) => void;
  isHotel: boolean;
};

const WASTE_MEDIA: Record<string, string> = {
  w_tuna_1: "/house/waste-tuna-trim.jpg",
  w_dairy_1: "/house/waste-cream.jpg",
  w_cuke_1: "/house/waste-cucumber.jpg",
};

export function BohWaste({ house, onOpenView, isHotel }: Props) {
  const waste = house.waste;
  const total = waste.reduce((s, w) => s + w.valueEuro, 0);
  const prepWaste = waste.filter((w) => w.pattern === "prep");
  const recurring = waste.filter((w) => w.pattern === "recurring");

  return (
    <div className="boh-waste">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Leakage</p>
          <h2>Waste</h2>
          <p>
            What left value on the floor — prep variance, one-offs, and estate
            patterns worth remembering.
          </p>
        </div>
      </header>

      <div className="boh-waste-kpis">
        <article className="boh-panel">
          <span>Exposed this period</span>
          <strong>€{total}</strong>
        </article>
        <article className="boh-panel">
          <span>Prep-linked</span>
          <strong>{prepWaste.length}</strong>
        </article>
        <article className="boh-panel">
          <span>Recurring patterns</span>
          <strong>{recurring.length}</strong>
        </article>
      </div>

      <section className="boh-panel">
        <div className="boh-panel-head">
          <h3>Waste pattern</h3>
          <span className="boh-muted">{waste.length} entries</span>
        </div>
        <ul className="boh-waste-list boh-waste-rich">
          {waste.map((w) => (
            <li key={w.id}>
              {WASTE_MEDIA[w.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={WASTE_MEDIA[w.id]} alt="" width={48} height={48} />
              ) : null}
              <div>
                <strong>{w.item}</strong>
                <span>
                  {w.qty} · {w.pattern} · {w.reason}
                </span>
              </div>
              <em>€{w.valueEuro}</em>
            </li>
          ))}
        </ul>
      </section>

      {!isHotel ? (
        <section className="boh-panel boh-estate" style={{ marginTop: 16 }}>
          <div className="boh-panel-head">
            <h3>Estate pattern</h3>
          </div>
          <p>
            Prep trim waste on tuna clusters after Friday delivery waves. Cold
            line throughput drops when grill peak overlaps — Memory holds the
            pattern.
          </p>
          <div className="boh-capture-actions">
            <Link href="/app/memory" className="boh-btn-primary">
              Open Memory →
            </Link>
            <button
              type="button"
              className="boh-btn-secondary"
              onClick={() => onOpenView("prep")}
            >
              Prep & line
            </button>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="boh-link"
        style={{ marginTop: 16 }}
        onClick={() => onOpenView("overview")}
      >
        ← Back to Overview
      </button>
    </div>
  );
}
