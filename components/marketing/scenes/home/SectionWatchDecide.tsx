"use client";

import { useProductTour } from "@/components/marketing/tour/ProductTour";

/**
 * First-class CTA — Watch RADR decide.
 */
export function SectionWatchDecide() {
  const { startTour } = useProductTour();

  return (
    <section className="rx-watch" data-nav-theme="dark" id="watch">
      <div className="rx-watch-shell">
        <p className="rx-watch-kicker">45 seconds · no narration required</p>
        <h2 className="rx-watch-title">Watch RADR decide</h2>
        <p className="rx-watch-body">
          One Decision. From empty-looking tables to verified value and
          operating memory — in a guided product story.
        </p>
        <button type="button" className="rx-watch-cta" onClick={startTour}>
          Watch RADR decide
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

/** Supported systems — never invent customer logos. */
export function SectionStackTrust() {
  const systems = [
    { name: "POS", status: "Connect" },
    { name: "PMS", status: "Connect" },
    { name: "Reservations", status: "Connect" },
    { name: "Labor", status: "Connect" },
    { name: "Inventory", status: "Connect" },
    { name: "Channels", status: "Connect" },
    { name: "Payments", status: "Planned" },
    { name: "Reviews", status: "Demo" },
  ];

  return (
    <section
      className="rx-stack-rail"
      data-nav-theme="light"
      aria-label="Supported systems"
    >
      <div className="rx-stack-rail-shell">
        <p className="rx-stack-rail-kicker">
          Built to work with the stack you already run
        </p>
        <ul className="rx-stack-rail-list">
          {systems.map((s) => (
            <li key={s.name}>
              {s.name}
              <em>· {s.status}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OperatingAmbientBanner() {
  const items = [
    { t: "38 covers arriving · 22 min", live: true },
    { t: "Kitchen 92%" },
    { t: "Delivery +31%" },
    { t: "9 second turns exposed", live: true },
    { t: "Next decision window 11 min" },
  ];
  const loop = [...items, ...items];

  return (
    <div className="rx-op-banner" aria-hidden="true">
      <div className="rx-op-banner-inner">
        {loop.map((item, i) => (
          <span key={`${item.t}-${i}`} data-live={item.live ? "true" : undefined}>
            {item.t}
          </span>
        ))}
      </div>
    </div>
  );
}
