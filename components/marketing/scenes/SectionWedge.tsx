import { BRAND } from "../config/brand";

const REASONS = [
  "Thin margins",
  "High transaction volume",
  "Labor intensity",
  "Fragmented systems",
  "Volatile demand",
  "Multiple revenue channels",
  "Complex supplier networks",
  "Large multi-site operations",
] as const;

/**
 * Hospitality beachhead — then vision beyond.
 */
export function SectionWedge() {
  return (
    <section
      className="rx-section rx-dark rx-wedge"
      id="wedge"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-wedge-inner">
        <p className="rx-kicker">Beachhead</p>
        <h2 className="rx-display rx-display-sm">{BRAND.beachhead}</h2>
        <p className="rx-lead-inv rx-lead-short">
          Hospitality is an exceptional proving ground — and where we show the
          product with invoices, schedules, rates, credits and settlements you
          already recognize.
        </p>
        <ul className="rx-wedge-reasons">
          {REASONS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="rx-wedge-vision">
          The problem doesn&apos;t stop at hospitality.
          <br />
          <strong>{BRAND.vision}</strong>
        </p>
      </div>
    </section>
  );
}
