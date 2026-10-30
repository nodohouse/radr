"use client";

/**
 * Shared leak visual — morphs by category.
 * Illustrative only. No fake customer totals.
 */

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PUBLIC_SUPPLIER } from "@/lib/marketing/publicCanon";
import { stageSwap } from "@/lib/marketing/motion";

export type LeakId =
  | "supplier"
  | "recon"
  | "cost"
  | "proc"
  | "perish";

type Props = {
  leak: LeakId;
  label: string;
  outcome: string;
};

function Frame({
  children,
  label,
  outcome,
}: {
  children: ReactNode;
  label: string;
  outcome: string;
}) {
  return (
    <div className="rx30-leak-canvas">
      <p className="rx30-kicker">{label}</p>
      <p className="rx30-demo-label">Illustrative RADR demo</p>
      {children}
      <p className="rx30-leak-outcome">{outcome}</p>
    </div>
  );
}

function SupplierVisual({ reduced }: { reduced: boolean }) {
  const [step, setStep] = useState(reduced ? 2 : 0);

  useEffect(() => {
    if (reduced) return;
    setStep(0);
    const t1 = window.setTimeout(() => setStep(1), 280);
    const t2 = window.setTimeout(() => setStep(2), 700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  return (
    <div className="rx30-leak-supplier" data-step={step}>
      <div className="rx30-leak-rates">
        <div>
          <span>Contract</span>
          <strong>{PUBLIC_SUPPLIER.contractFormatted}</strong>
        </div>
        <div data-hot>
          <span>Invoice</span>
          <strong>{PUBLIC_SUPPLIER.invoiceFormatted}</strong>
        </div>
      </div>
      <div className="rx30-leak-diff-line" aria-hidden="true">
        <i style={{ width: step >= 1 ? "100%" : "0%" }} />
      </div>
      <div className="rx30-leak-exposure" data-on={step >= 2 ? "true" : undefined}>
        <span>Exposure · {PUBLIC_SUPPLIER.volumeL} L</span>
        <strong>{PUBLIC_SUPPLIER.verifiedFormatted}</strong>
      </div>
      {step >= 2 ? (
        <p className="rx30-act-badge">Evidence package prepared</p>
      ) : null}
    </div>
  );
}

function ReconVisual({ reduced }: { reduced: boolean }) {
  const [diverge, setDiverge] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setDiverge(true);
      return;
    }
    setDiverge(false);
    const t = window.setTimeout(() => setDiverge(true), 400);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <div className="rx30-leak-recon" data-diverge={diverge ? "true" : undefined}>
      <svg viewBox="0 0 280 100" role="img" aria-label="Expected vs actual settlement">
        <path
          className="rx30-leak-line rx30-leak-line--expected"
          d="M 10 50 H 270"
        />
        <path
          className="rx30-leak-line rx30-leak-line--actual"
          d={diverge ? "M 10 50 C 90 50, 160 78, 270 82" : "M 10 50 H 270"}
        />
      </svg>
      <div className="rx30-leak-legend">
        <span data-a>Expected</span>
        <span data-b>Actual</span>
      </div>
      {diverge ? (
        <p className="rx30-act-badge">Gap isolated · unexplained difference</p>
      ) : null}
    </div>
  );
}

function CostVisual({ reduced }: { reduced: boolean }) {
  const drivers = ["Supplier", "Yield", "Waste", "Mix"] as const;
  const [n, setN] = useState(reduced ? drivers.length : 0);

  useEffect(() => {
    if (reduced) {
      setN(drivers.length);
      return;
    }
    setN(0);
    const timers = drivers.map((_, i) =>
      window.setTimeout(() => setN(i + 1), 180 + i * 160),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  return (
    <ul className="rx30-leak-drivers" aria-label="Cost drivers">
      {drivers.map((d, i) => (
        <li
          key={d}
          data-on={i < n ? "true" : undefined}
          data-lead={d === "Yield" && i < n ? "true" : undefined}
        >
          <span>{d}</span>
          <strong>{d === "Yield" ? "Largest" : "Material"}</strong>
        </li>
      ))}
    </ul>
  );
}

function ProcVisual() {
  const cities = [
    { name: "NYC", x: 40, y: 48, rate: "$7.45" },
    { name: "LA", x: 90, y: 70, rate: "$6.95" },
    { name: "LON", x: 150, y: 40, rate: "$7.10" },
    { name: "DXB", x: 200, y: 62, rate: "$7.80" },
    { name: "SIN", x: 245, y: 45, rate: "$7.20" },
  ];

  return (
    <div className="rx30-leak-proc">
      <svg viewBox="0 0 280 110" role="img" aria-label="Supplier price dispersion">
        {cities.map((c) => (
          <g key={c.name}>
            <circle
              cx={c.x}
              cy={c.y}
              r={c.name === "DXB" ? 9 : 6}
              data-hot={c.name === "DXB" ? "true" : undefined}
            />
            <text x={c.x} y={c.y + 22} textAnchor="middle">
              {c.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="rx30-act-badge">Leverage · Dubai unit rate high</p>
    </div>
  );
}

function PerishVisual({ reduced }: { reduced: boolean }) {
  const marks = [
    { t: "18h", v: 92 },
    { t: "12h", v: 78 },
    { t: "6h", v: 54 },
    { t: "2h", v: 28 },
  ] as const;
  const [i, setI] = useState(reduced ? marks.length - 1 : 0);

  useEffect(() => {
    if (reduced) {
      setI(marks.length - 1);
      return;
    }
    setI(0);
    const timers = marks.map((_, idx) =>
      window.setTimeout(() => setI(idx), 200 + idx * 280),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  const visible = marks.slice(0, i + 1);
  const path = visible
    .map((m, idx) => {
      const x = 20 + idx * 70;
      const y = 100 - m.v * 0.85;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="rx30-leak-perish">
      <svg viewBox="0 0 280 120" role="img" aria-label="Perishable value decay">
        <path className="rx30-leak-decay" d={path || "M 20 22"} />
        {visible.map((m, idx) => {
          const x = 20 + idx * 70;
          const y = 100 - m.v * 0.85;
          return (
            <g key={m.t}>
              <circle cx={x} cy={y} r={5} data-on={idx === i ? "true" : undefined} />
              <text x={x} y={114} textAnchor="middle">
                {m.t}
              </text>
            </g>
          );
        })}
        {i >= 2 ? (
          <line
            className="rx30-leak-intervene"
            x1="160"
            y1="10"
            x2="160"
            y2="100"
          />
        ) : null}
      </svg>
      {i >= 2 ? (
        <p className="rx30-act-badge">Intervene before expiry · decision deadline</p>
      ) : null}
    </div>
  );
}

export function LeakExplorerCanvas({ leak, label, outcome }: Props) {
  const reduced = useReducedMotion() ?? false;

  let visual: ReactNode;
  switch (leak) {
    case "supplier":
      visual = <SupplierVisual reduced={reduced} />;
      break;
    case "recon":
      visual = <ReconVisual reduced={reduced} />;
      break;
    case "cost":
      visual = <CostVisual reduced={reduced} />;
      break;
    case "proc":
      visual = <ProcVisual />;
      break;
    case "perish":
      visual = <PerishVisual reduced={reduced} />;
      break;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={leak}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -6 }}
        transition={stageSwap}
      >
        <Frame label={label} outcome={outcome}>
          {visual}
        </Frame>
      </motion.div>
    </AnimatePresence>
  );
}
