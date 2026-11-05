"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { getServiceCommand } from "@/lib/product/serviceCommand";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";

const model = getServiceCommand();
const tables = model.tables.filter((t) => t.zone === "main");
const status = {
  seated: "Seated",
  turning: "Turning",
  wait: "Needs attention",
  empty: "Available",
  blocked: "Reserved hold",
};

/** The same synthetic floor coordinates and kitchen loads used by the product. */
export function OperationsShowcase({ section }: { section: number }) {
  const [selected, setSelected] = useState(model.defaultTableId);
  const table = tables.find((t) => t.id === selected) || tables[0];
  return (
    <div className="rsc-scene rso-scene" data-section={section}>
      <div className="rsc-heading">
        <div>
          <p>{venue.displayName} · The operating view</p>
          <h3>
            {section === 0
              ? "See the floor behind the signal."
              : "Find the constraint. Create room."}
          </h3>
        </div>
        <span className="rsc-section-marker">
          {section === 0 ? "01" : "02"} / 02
        </span>
      </div>
      {section === 0 ? (
        <>
          <div
            className="rso-floor"
            role="group"
            aria-label="Dining room schematic using product demo table positions"
          >
            <span className="rso-floor-label">DINING ROOM</span>
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                className="rso-table"
                data-tone={t.tone}
                data-selected={t.id === selected || undefined}
                aria-label={`Table ${t.n}, ${status[t.tone]}`}
                aria-pressed={t.id === selected}
                onClick={() => setSelected(t.id)}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                {t.n}
              </button>
            ))}
            <span className="rso-kitchen-label">KITCHEN ↗</span>
          </div>
          <div className="rsc-decision rso-table-detail">
            <span className="rsc-signal">
              {status[table.tone].toUpperCase()}
            </span>
            <h4>Table {table.n}</h4>
            <strong className="rso-party">
              {table.party || 0} / {table.seats} guests
            </strong>
            <p>
              {table.stage || "Ready for service"}
              {table.waitMin ? ` · ${table.waitMin} min wait` : ""}
            </p>
            <span className="rso-detail-note">
              Same table state as the product demo.
            </span>
            <Link href="/product?surface=live" className="rsc-action">
              Explore Live <span>→</span>
            </Link>
          </div>
          <div className="rso-legend">
            <span>
              <i />
              Seated
            </span>
            <span>
              <i />
              Needs attention
            </span>
            <span>Schematic · synthetic data</span>
          </div>
        </>
      ) : (
        <>
          <div className="rso-stations">
            <p>Kitchen capacity · demo snapshot</p>
            {model.kitchen.slice(0, 4).map((station) => (
              <div key={station.id}>
                <span>
                  {station.name}
                  <small>{station.queue} queued</small>
                </span>
                <strong>{station.load}%</strong>
                <div className="rso-load-track">
                  <i
                    style={{ width: `${station.load}%` }}
                    data-high={station.load >= 90 || undefined}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="rsc-decision">
            <span className="rsc-signal">
              {venue.decisionId} · MODELED RESPONSE
            </span>
            <h4>Give the kitchen 12 minutes.</h4>
            <strong className="rso-value">{venue.expectedFormatted}</strong>
            <p>
              Expected protected tonight. A scenario estimate, not a completed
              result.
            </p>
            <Link href="/product?surface=operations" className="rsc-action">
              Review capacity <span>→</span>
            </Link>
          </div>
          <div className="rso-capacity-note">
            Current demo loads. No live feed or provider actions.
          </div>
        </>
      )}
    </div>
  );
}
