"use client";

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  tableCancellationClock,
  hotelChannelClock,
  orphanNightClock,
} from "@/lib/radr/decision/economics";
import { CANON_LABOR, CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";

/**
 * Pain first — live operating exposure before product architecture.
 */
export function SectionCostOfBeingLate() {
  const table = tableCancellationClock();
  const hotel = hotelChannelClock();
  const apt = orphanNightClock();

  const chips = [
    {
      vert: "Restaurant",
      label: table.title,
      value: formatDecisionMoney(table.nowValueEuro),
      hint: "Recoverable now · €0 after service",
    },
    {
      vert: "Hotel",
      label: "Channel drag",
      value: formatDecisionMoney(hotel.nowValueEuro || 4200),
      hint: "Revenue booked · margin diluted",
    },
    {
      vert: "Apartment",
      label: "Orphan night",
      value: formatDecisionMoney(apt.nowValueEuro),
      hint: "72 hours · then €0",
    },
    {
      vert: "Labor",
      label: "Peak shortfall",
      value: formatDecisionMoney(CANON_LABOR.exposureEuro),
      hint: "+2.1 pts over target pressure",
    },
    {
      vert: "Supplier",
      label: "Contract variance",
      value: formatDecisionMoney(CANON_SUPPLIER.exposureEuro),
      hint: "€6.80 contract · €7.45 invoiced",
    },
  ] as const;

  return (
    <section
      className="rx-spine-section rx-scene rx-pain"
      data-nav-theme="light"
      id="cost-of-late"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">The leak</p>
          <h2 className="rx-spine-title">
            The money leaks
            <br />
            before finance sees it.
          </h2>
        </header>

        <ul className="rx-pain-chips" aria-label="Live operating exposure">
          {chips.map((c) => (
            <li key={c.vert}>
              <em>{c.vert}</em>
              <strong className="rx-econ-risk">{c.value}</strong>
              <span>{c.label}</span>
              <p>{c.hint}</p>
            </li>
          ))}
        </ul>

        <p className="rx-pain-punch">
          By the time month-end explains it, the value may already be gone.
        </p>
      </div>
    </section>
  );
}
