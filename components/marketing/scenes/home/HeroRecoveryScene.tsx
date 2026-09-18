"use client";

/**
 * Signature hero product scene — D-4102 recovery choreography.
 * Invoice → contract → Decision → phone → credit → Verified.
 * Product logic is the motion. ~8s loop. Reduced-motion safe.
 */

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  PHONE_CFO_RECOVER,
  PHONE_VERIFIED,
  RadrPhone,
} from "@/components/marketing/scenes/home/RadrPhone";

type Beat =
  | "invoice"
  | "contract"
  | "decision"
  | "phone"
  | "credit"
  | "verified";

const BEATS: { id: Beat; ms: number; label: string }[] = [
  { id: "invoice", ms: 0, label: "Invoice" },
  { id: "contract", ms: 1400, label: "Contract" },
  { id: "decision", ms: 2800, label: "Decision" },
  { id: "phone", ms: 4200, label: "Review" },
  { id: "credit", ms: 5600, label: "Credit" },
  { id: "verified", ms: 7200, label: "Verified" },
];

const LOOP_MS = 9000;

export function HeroRecoveryScene() {
  const [beat, setBeat] = useState<Beat>("invoice");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setBeat("verified");
      return;
    }
    let start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) % LOOP_MS;
      let current: Beat = "invoice";
      for (const b of BEATS) {
        if (t >= b.ms) current = b.id;
      }
      setBeat(current);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced]);

  const grade =
    beat === "verified" || beat === "credit" ? "Verified" : "Expected";
  const euro = beat === "verified" ? "€273 recovered" : "€273 exposed";
  const phone =
    beat === "verified" || beat === "credit"
      ? PHONE_VERIFIED
      : PHONE_CFO_RECOVER;

  return (
    <div className="rx-hrs" data-beat={beat} aria-label="D-4102 recovery scene">
      <div className="rx-hrs-desktop">
        <header className="rx-hrs-head">
          <p className="rx-hrs-k">Supplier / AP · Finance</p>
          <p className="rx-hrs-id">D-4102 · Berlin Mitte · Demo</p>
        </header>

        <div className="rx-hrs-docs" aria-hidden="true">
          <div className="rx-hrs-doc" data-doc="invoice" data-on={beat !== "invoice" ? "true" : "pulse"}>
            <em>Invoice</em>
            <strong>€7.45 / L</strong>
            <span>INV-88421 · 420 L</span>
          </div>
          <div
            className="rx-hrs-doc"
            data-doc="contract"
            data-on={
              beat === "invoice"
                ? undefined
                : beat === "contract"
                  ? "pulse"
                  : "true"
            }
          >
            <em>Contract</em>
            <strong>€6.80 / L</strong>
            <span>CTR-OIL-2026</span>
          </div>
        </div>

        <h2 className="rx-hrs-title">Contract price variance</h2>

        <button
          type="button"
          className="rx-hrs-euro"
          data-grade={grade}
          data-seal={beat === "verified" ? "true" : undefined}
        >
          <strong>{euro.split(" ")[0]}</strong>
          <span>{grade}</span>
        </button>

        <p className="rx-hrs-because">
          {beat === "verified"
            ? "Credit memo CM-44102 matched to INV-88421"
            : beat === "credit"
              ? "Credit memo issued · applying to original invoice"
              : beat === "phone" || beat === "decision"
                ? "Dispute the variance · do not reprice menu yet"
                : "Invoice above contract · €273 exposed"}
        </p>

        <div className="rx-hrs-path" aria-hidden="true">
          {BEATS.map((b) => (
            <span key={b.id} data-on={beat === b.id ? "true" : undefined}>
              {b.label}
            </span>
          ))}
        </div>

        <NextLink
          href="/app/lab/control-center?seed=recover"
          className="rx-hrs-cta"
        >
          {beat === "verified" ? "Open Verified Trace →" : "See a Verified Recovery →"}
        </NextLink>

        <p className="rx-hrs-note">Illustrative demo · not customer results</p>
      </div>

      <RadrPhone
        state={phone}
        highlight={beat === "phone" || beat === "verified"}
      />
    </div>
  );
}
