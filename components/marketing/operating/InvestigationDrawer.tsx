"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  POINT_VALUE,
  TERRITORY_COPY,
  type ChartDayCase,
  type OpTerritory,
} from "@/lib/radr/operatingHero";
import { RADR_MOTION } from "@/lib/radr/motion";
import { TextSep } from "@/components/TextSep";

type DrawerState =
  | null
  | { kind: "territory"; id: OpTerritory }
  | { kind: "chart"; day: ChartDayCase };

type Props = {
  open: boolean;
  state: DrawerState;
  onClose: () => void;
};

function money(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useSheetMode() {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1099px)");
    const apply = () => setSheet(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return sheet;
}

/** Fixed overlay: desktop side drawer, mobile bottom sheet. Never shifts hero. */
export function InvestigationDrawer({ open, state, onClose }: Props) {
  const reduced = useReducedMotion();
  const sheet = useSheetMode();
  const territory = state?.kind === "territory" ? TERRITORY_COPY[state.id] : null;
  const inv = territory?.investigate;
  const day = state?.kind === "chart" ? state.day : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const enter = sheet ? { y: "100%" } : { x: "100%" };
  const shown = sheet ? { y: 0 } : { x: 0 };
  const slide = reduced ? { duration: 0 } : RADR_MOTION.panel;

  return (
    <AnimatePresence>
      {open && (inv || day) ? (
        <>
          <motion.button
            type="button"
            className="rx-op-drawer-backdrop"
            aria-label="Close investigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={RADR_MOTION.hover}
            onClick={onClose}
          />
          <motion.aside
            className="rx-op-drawer"
            data-sheet={sheet ? "true" : "false"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rx-op-drawer-title"
            initial={enter}
            animate={shown}
            exit={enter}
            transition={slide}
          >
            <header className="rx-op-drawer-head">
              <button type="button" className="rx-op-drawer-x" onClick={onClose} aria-label="Close">
                ×
              </button>
            </header>

            {inv && territory ? (
              <>
                <p className="rx-op-drawer-terr">{territory.name}</p>
                <p className="rx-op-drawer-tagline">
                  {territory.tagline.replace(/\.$/, "").toUpperCase()}
                </p>

                <div className="rx-op-drawer-money">
                  <strong>{inv.impact}</strong>
                  <TextSep srOnly>: </TextSep>
                  <em>{inv.impactKind}</em>
                </div>

                <h2 id="rx-op-drawer-title">{inv.title}</h2>
                <p className="rx-op-drawer-place">
                  {inv.location}
                  {inv.detail ? <span> · {inv.detail}</span> : null}
                </p>

                <ul className="rx-op-drawer-topics" aria-label="Scope">
                  {territory.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>

                <section>
                  <h3>Evidence</h3>
                  <ul>
                    {inv.evidence.map((row) => (
                      <li key={row.label}>
                        <span>{row.label}</span>
                        <TextSep>: </TextSep>
                        <strong>{row.value}</strong>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3>Why it matters</h3>
                  <p>{inv.why}</p>
                  <p className="rx-op-drawer-conf">Confidence {inv.confidence}</p>
                </section>

                <section>
                  <h3>Action</h3>
                  <p>{inv.recommend}</p>
                  <button type="button" className="rx-btn rx-btn-primary" disabled>
                    {inv.recommendCta}
                  </button>
                </section>

                <section className="rx-op-drawer-control">
                  <span>Control</span>
                  <p>{inv.control}</p>
                </section>

                {inv.verified ? (
                  <section className="rx-op-drawer-verified">
                    <h3>Verified value</h3>
                    <strong>{inv.verified}</strong>
                    {inv.verifiedNote ? <p>{inv.verifiedNote}</p> : null}
                  </section>
                ) : null}
              </>
            ) : null}

            {day ? (
              <>
                <p className="rx-op-drawer-terr">DAY</p>
                <p className="rx-op-drawer-tagline">PERFORMANCE</p>
                <h2 id="rx-op-drawer-title">{day.label}</h2>

                <div className="rx-op-drawer-money">
                  <strong>{money(day.revenue)}</strong>
                  <TextSep srOnly>: </TextSep>
                  <em>Revenue</em>
                </div>

                <section>
                  <h3>Margin</h3>
                  <ul>
                    <li>
                      <span>Actual</span>
                      <TextSep>: </TextSep>
                      <strong>{day.margin.toFixed(1)}%</strong>
                    </li>
                    <li>
                      <span>Plan</span>
                      <TextSep>: </TextSep>
                      <strong>{day.plan.toFixed(1)}%</strong>
                    </li>
                    <li>
                      <span>Δ</span>
                      <TextSep>: </TextSep>
                      <strong>
                        {day.margin - day.plan >= 0 ? "+" : ""}
                        {(day.margin - day.plan).toFixed(1)} pts
                      </strong>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3>RADR</h3>
                  <p>
                    {day.signals} material signal{day.signals === 1 ? "" : "s"}
                  </p>
                  {day.events.length ? (
                    <ul>
                      {day.events.map((ev) => (
                        <li key={ev.key}>
                          <span>{ev.title}</span>
                          <TextSep>: </TextSep>
                          <strong>{ev.value}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rx-op-drawer-conf">No territory events on this day.</p>
                  )}
                </section>

                {POINT_VALUE[day.key] ? (
                  <section>
                    <h3>Attribution</h3>
                    <ul>
                      <li>
                        <span>BUY exposure</span>
                        <TextSep>: </TextSep>
                        <strong>{money(POINT_VALUE[day.key].buy)}</strong>
                      </li>
                      <li>
                        <span>SELL upside</span>
                        <TextSep>: </TextSep>
                        <strong>{money(POINT_VALUE[day.key].sell)}</strong>
                      </li>
                    </ul>
                  </section>
                ) : null}
              </>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
