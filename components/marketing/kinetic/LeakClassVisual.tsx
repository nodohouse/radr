"use client";

/**
 * Unique visual metaphors per problem class — causal, not decorative.
 */

import type { ProblemFamily } from "@/lib/radr/problemFamilies";

export function LeakClassVisual({
  family,
  compact = false,
}: {
  family: ProblemFamily;
  compact?: boolean;
}) {
  return (
    <div
      className="rx-lcv"
      data-family={family}
      data-compact={compact ? "true" : undefined}
      aria-hidden="true"
    >
      {family === "SUPPLIER_AP" ? <SupplierApVisual /> : null}
      {family === "RECONCILIATION" ? <ReconVisual /> : null}
      {family === "COST_VARIANCE" ? <CostVisual /> : null}
      {family === "PROCUREMENT" ? <ProcureVisual /> : null}
      {family === "PERISHABLE_REVENUE" ? <PerishVisual /> : null}
    </div>
  );
}

function SupplierApVisual() {
  return (
    <div className="rx-lcv-supplier">
      <div className="rx-lcv-line" data-kind="contract">
        <em>Contract</em>
        <strong>€6.80</strong>
        <i style={{ width: "68%" }} />
      </div>
      <div className="rx-lcv-line" data-kind="invoice">
        <em>Invoice</em>
        <strong>€7.45</strong>
        <i style={{ width: "86%" }} />
      </div>
      <div className="rx-lcv-gap">
        <span>Gap opens</span>
        <strong>€273</strong>
      </div>
      <div className="rx-lcv-credit">
        <em>Credit returns</em>
        <strong data-tone="verified">€273</strong>
      </div>
    </div>
  );
}

function ReconVisual() {
  return (
    <div className="rx-lcv-recon">
      <div className="rx-lcv-stream" data-kind="expected">
        <em>Expected</em>
        <strong>€9,814</strong>
        <span className="rx-lcv-flow" />
      </div>
      <div className="rx-lcv-stream" data-kind="actual">
        <em>Actual</em>
        <strong>€9,521</strong>
        <span className="rx-lcv-flow" />
      </div>
      <div className="rx-lcv-diverge">
        <span>Streams diverge</span>
        <strong>€293 unexplained</strong>
      </div>
      <ul className="rx-lcv-attrs">
        <li>Refund</li>
        <li>Promo</li>
        <li>Fee</li>
      </ul>
    </div>
  );
}

function CostVisual() {
  const drivers = [
    { id: "price", label: "Supplier", w: 22 },
    { id: "yield", label: "Yield", w: 34 },
    { id: "waste", label: "Waste", w: 18 },
    { id: "mix", label: "Mix", w: 26 },
  ];
  return (
    <div className="rx-lcv-cost">
      <p className="rx-lcv-cost-head">
        Food cost <strong>+2.3pts</strong>
      </p>
      <ul className="rx-lcv-bars">
        {drivers.map((d) => (
          <li key={d.id}>
            <em>{d.label}</em>
            <i style={{ ["--w" as string]: `${d.w}%` }} />
          </li>
        ))}
      </ul>
      <p className="rx-lcv-fade">False assumption fades · yield + mix lead</p>
    </div>
  );
}

function ProcureVisual() {
  const locs = [
    { city: "Berlin", price: "€7.45" },
    { city: "Amsterdam", price: "€6.80" },
    { city: "Lisbon", price: "€6.62" },
  ];
  return (
    <div className="rx-lcv-proc">
      <div className="rx-lcv-locs">
        {locs.map((l) => (
          <div key={l.city} className="rx-lcv-loc">
            <em>{l.city}</em>
            <strong>{l.price}</strong>
          </div>
        ))}
      </div>
      <ol className="rx-lcv-norm">
        <li>Pack</li>
        <li>Freight</li>
        <li>Contract</li>
        <li>Volume</li>
      </ol>
      <p className="rx-lcv-remain">Unexplained dispersion remains → leverage</p>
    </div>
  );
}

function PerishVisual() {
  const ticks = ["19h", "12h", "6h", "2h"];
  return (
    <div className="rx-lcv-perish">
      <div className="rx-lcv-clock">
        {ticks.map((t, i) => (
          <span key={t} data-i={i} data-hot={i === 3 ? "true" : undefined}>
            {t}
          </span>
        ))}
      </div>
      <div className="rx-lcv-decay">
        <em>Room value</em>
        <strong>€184 → €0</strong>
      </div>
      <ul className="rx-lcv-opts">
        <li data-on="true">Waitlist</li>
        <li data-on="true">Direct</li>
        <li>Channel release</li>
      </ul>
    </div>
  );
}
