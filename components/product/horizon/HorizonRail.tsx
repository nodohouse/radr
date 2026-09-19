"use client";

import { useState } from "react";
import type { OperatingHorizon } from "@/lib/radr/horizon";
import { WhyLine } from "@/components/product/WhyLine";

type Props = {
  horizon: OperatingHorizon;
};

/**
 * Level 1: one tomorrow line. Expand for week / leads.
 */
export function HorizonRail({ horizon }: Props) {
  const [open, setOpen] = useState(false);
  const huge = horizon.leads.find((l) => l.scale === "HUGE");
  const bigLeads = horizon.leads.filter(
    (l) => l.scale === "BIG" || l.scale === "HUGE",
  );
  const leadCard = huge ?? bigLeads[0] ?? null;

  return (
    <section
      className="rp-horizon"
      data-compact={!open ? "true" : undefined}
      aria-label="Operating horizon"
    >
      <header className="rp-horizon-head">
        <p className="rp-horizon-kicker">Ahead</p>
        <p className="rp-horizon-headline">
          Tomorrow · {horizon.tomorrow.covers} covers ·{" "}
          {horizon.tomorrow.outlook}
          {leadCard ? ` · ${leadCard.title}` : null}
        </p>
        <button
          type="button"
          className="rp-ps-link"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Less" : "This week & leads"}
        </button>
      </header>

      {!open ? (
        <p className="rp-horizon-compact-note">
          <WhyLine why={horizon.tomorrow.note} />
        </p>
      ) : (
        <>
          <div className="rp-horizon-grid">
            <article
              className="rp-horizon-card"
              data-scale={horizon.tomorrow.scale}
            >
              <p className="rp-horizon-label">Tomorrow</p>
              <h3>{horizon.tomorrow.covers} covers</h3>
              <p className="rp-horizon-meta">
                {horizon.tomorrow.when}, {horizon.tomorrow.outlook}
              </p>
              <WhyLine why={horizon.tomorrow.note} />
            </article>

            <article className="rp-horizon-card" data-scale="NORMAL">
              <p className="rp-horizon-label">This week</p>
              <h3>
                {horizon.week.filter((w) => w.scale !== "NORMAL").length}{" "}
                notable nights
              </h3>
              <p className="rp-horizon-meta">
                {horizon.week
                  .slice(0, 2)
                  .map((w) => `${w.day} ${w.label}`)
                  .join(", ")}
              </p>
              <WhyLine why={horizon.week[0]?.note} />
            </article>

            {leadCard ? (
              <article className="rp-horizon-card" data-scale={leadCard.scale}>
                <p className="rp-horizon-label">
                  {leadCard.weeksOut} weeks
                  {leadCard.scale === "HUGE" ? ", huge" : ""}
                </p>
                <h3>{leadCard.title}</h3>
                <p className="rp-horizon-meta">{leadCard.when}</p>
                <WhyLine why={leadCard.why} />
                <p className="rp-horizon-note">{leadCard.prepare}</p>
              </article>
            ) : null}
          </div>

          <div className="rp-horizon-expand">
            <p className="rp-cc3-zone-label">This week</p>
            <ul className="rp-horizon-week">
              {horizon.week.map((w) => (
                <li key={w.id} data-scale={w.scale}>
                  <strong>{w.day}</strong>
                  <span>
                    {w.label} - {w.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="rp-cc3-zone-label">Lead time · up to 4 weeks</p>
            <ul className="rp-horizon-leads">
              {horizon.leads.map((l) => (
                <li key={l.id} data-scale={l.scale}>
                  <div>
                    <strong>
                      {l.scale === "HUGE" ? "HUGE" : "BIG"} · {l.weeksOut}w ·{" "}
                      {l.title}
                    </strong>
                    <span>
                      {l.when} - {l.why}
                    </span>
                    <em>{l.prepare}</em>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
