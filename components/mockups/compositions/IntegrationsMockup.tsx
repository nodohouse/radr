"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";

const SOURCES = [
  { category: "POS", name: "Toast · Lightspeed" },
  { category: "Reservations", name: "OpenTable · SevenRooms" },
  { category: "Labor", name: "Deputy · 7shifts" },
  { category: "Suppliers", name: "Invoices · contracts" },
  { category: "Payments", name: "Stripe · Mollie" },
  { category: "Accounting", name: "Xero · QuickBooks" },
] as const;

const OUTCOMES = [
  { label: "Intelligence", value: "Findings with money attached", hot: false },
  { label: "Action", value: "Owners · timing · confidence", hot: false },
  { label: "Verified value", value: "€184 captured tonight", hot: true },
] as const;

export function IntegrationsMockup() {
  return (
    <MockupCanvas id="integrations">
      <MockupBrand label="Integrations" />
      <div className="mk-int">
        <div className="mk-int-title">
          <p className="mk-kicker">Systems → intelligence</p>
          <h1 className="mk-display">The layer above the stack.</h1>
        </div>

        <svg className="mk-int-wires" viewBox="0 0 3840 2160" aria-hidden="true">
          {SOURCES.map((_, i) => {
            const y = 540 + i * 118;
            return (
              <path
                key={`in-${i}`}
                d={`M860 ${y} C 1200 ${y}, 1400 1080, 1660 1080`}
                fill="none"
                stroke="rgba(0,185,107,0.22)"
                strokeWidth="1.5"
              />
            );
          })}
          {OUTCOMES.map((_, i) => {
            const y = 780 + i * 160;
            return (
              <path
                key={`out-${i}`}
                d={`M2180 1080 C 2500 1080, 2700 ${y}, 3080 ${y}`}
                fill="none"
                stroke={
                  i === 2
                    ? "rgba(0,185,107,0.55)"
                    : "rgba(0,185,107,0.22)"
                }
                strokeWidth={i === 2 ? 2 : 1.5}
              />
            );
          })}
        </svg>

        <div className="mk-int-sources">
          {SOURCES.map((s) => (
            <div key={s.category} className="mk-int-src">
              <em>{s.category}</em>
              <strong>{s.name}</strong>
            </div>
          ))}
        </div>

        <div className="mk-int-core">
          <div className="mk-int-core-inner">
            <span className="mk-brand-delta">
              <RadrDeltaGlyph />
            </span>
            <strong>RADR</strong>
            <span>Intelligence layer</span>
          </div>
        </div>

        <div className="mk-int-out">
          {OUTCOMES.map((o) => (
            <div
              key={o.label}
              className="mk-int-out-item"
              data-hot={o.hot ? "true" : undefined}
            >
              <em>{o.label}</em>
              <strong>{o.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </MockupCanvas>
  );
}
