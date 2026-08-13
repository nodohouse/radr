"use client";

import { useState } from "react";
import { compareRows, statusLabel, type StatusTag } from "./config";

function Cell({ status }: { status: StatusTag }) {
  return (
    <span className="px-cell" data-s={status}>
      {statusLabel(status)}
    </span>
  );
}

type PlanKey = "free" | "control" | "scale";

export function FeatureCompare() {
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("control");

  return (
    <section className="px-compare" id="compare">
      <div className="prep-shell">
        <p className="prep-kicker">Compare</p>
        <h2 className="px-section-title">At a glance</h2>
        <div className="px-legend">
          <span data-s="live">✓ Live / included</span>
          <span data-s="building">Building</span>
          <span data-s="not">— Not included</span>
        </div>

        <div className="px-table-wrap">
          <table className="px-table px-table-short">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Free</th>
                <th scope="col">Control</th>
                <th scope="col">Scale</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>
                    <Cell status={row.free} />
                  </td>
                  <td>
                    <Cell status={row.control} />
                  </td>
                  <td>
                    <Cell status={row.scale} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-compare-mobile">
          <div className="px-roi-presets" role="tablist" aria-label="Plan">
            {(["free", "control", "scale"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                className="px-chip"
                data-active={mobilePlan === p ? "true" : "false"}
                onClick={() => setMobilePlan(p)}
              >
                {p === "free" ? "Free" : p === "control" ? "Control" : "Scale"}
              </button>
            ))}
          </div>
          <ul className="px-m-list">
            {compareRows.map((row) => (
              <li key={row.feature}>
                <span>{row.feature}</span>
                <Cell status={row[mobilePlan]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
