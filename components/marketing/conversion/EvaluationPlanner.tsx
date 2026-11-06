"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { Link } from "@/i18n/navigation";
import "./evaluation-planner.css";

const FOCUS = {
  supplier: {
    label: "Supplier credits and invoice differences",
    baseline:
      "Unresolved credits, invoice differences and the documents that support them.",
    evidence: "Invoices, purchase terms, credit notes and ledger receipts.",
    success:
      "Credits reconciled to receipts, with an owner and a complete evidence trail.",
  },
  service: {
    label: "Service pressure and staffing",
    baseline: "The service window where demand, staffing and capacity diverge.",
    evidence:
      "Reservations, sales by service period, staffing and kitchen or room-readiness records.",
    success:
      "A reviewed decision with a stated baseline, service outcome and measured economic effect.",
  },
  hotel: {
    label: "Hotel contribution and room readiness",
    baseline:
      "Contribution by channel and the cost or delay attached to each stay.",
    evidence:
      "Booking and channel records, room status, housekeeping and attributable operating costs.",
    success:
      "A comparable contribution view and an evidenced decision about the next operating constraint.",
  },
} as const;
export function EvaluationPlanner({ context }: { context?: string | null }) {
  const [vertical, setVertical] = useState(
    () =>
      (
        ({
          restaurant: "Restaurants",
          hotel: "Hotels",
          mixed: "Mixed hospitality group",
        }) as Record<string, string>
      )[context ?? ""] ?? "",
  );
  const [locations, setLocations] = useState("");
  const [focus, setFocus] = useState<keyof typeof FOCUS | "">("");
  const [prepared, setPrepared] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const item = focus ? FOCUS[focus] : null;
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotionSafe();
  useEffect(() => {
    if (!prepared) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "center",
    });
  }, [prepared, reduced]);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (vertical && locations && item) setPrepared(true);
  }
  function download() {
    if (!item) return;
    const text = `RADR | Evaluation brief\n\nOperating context: ${vertical}\nLocations: ${locations}\nFocus: ${item.label}\n\n1. Establish the baseline\n${item.baseline}\n\n2. Gather evidence\n${item.evidence}\n\n3. Agree the success measure\n${item.success}\n\nBefore an engagement: confirm source availability, permissions, data handling, scope, responsibilities and commercial terms with the RADR team. This is a planning worksheet, not a submitted inquiry, a quote or a promise of savings.\n\nExplore: https://radrup.com/en/demo\nModel assumptions: https://radrup.com/en/value-calculator\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "RADR-evaluation-brief.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="rm-evaluation" aria-labelledby="evaluation-title">
      <p className="rm-evaluation-kicker">A focused first step</p>
      <h2 id="evaluation-title">Leave with a plan.</h2>
      <p>
        Choose your operating context and one priority. Build a brief to review
        with your team. No account or contact details required.
      </p>
      <form onSubmit={prepare} aria-busy={!interactive}>
        <label>
          Operating context
          <select
            disabled={!interactive}
            required
            value={vertical}
            onChange={(e) => {
              setVertical(e.target.value);
              setPrepared(false);
            }}
          >
            <option value="">Choose your operation</option>
            <option>Restaurants</option>
            <option>Hotels</option>
            <option>Mixed hospitality group</option>
          </select>
        </label>
        <label>
          Locations
          <select
            disabled={!interactive}
            required
            value={locations}
            onChange={(e) => {
              setLocations(e.target.value);
              setPrepared(false);
            }}
          >
            <option value="">Choose your footprint</option>
            <option>1</option>
            <option>2–5</option>
            <option>6–20</option>
            <option>21+</option>
          </select>
        </label>
        <label>
          Your first priority
          <select
            disabled={!interactive}
            required
            value={focus}
            onChange={(e) => {
              setFocus(e.target.value as keyof typeof FOCUS | "");
              setPrepared(false);
            }}
          >
            <option value="">Choose one measurable problem</option>
            {Object.entries(FOCUS).map(([key, value]) => (
              <option value={key} key={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rx-btn rx-btn-primary"
          disabled={!interactive || !vertical || !locations || !focus}
          type="submit"
        >
          Prepare my brief →
        </button>
      </form>
      {prepared && item ? (
        <div className="rm-evaluation-result" role="status">
          <h3 ref={heading} tabIndex={-1}>
            Your evaluation brief
          </h3>
          <p>
            {vertical} · {locations}{" "}
            {locations === "1" ? "location" : "locations"} · {item.label}
          </p>
          <ol>
            <li>
              <strong>Establish the baseline.</strong> {item.baseline}
            </li>
            <li>
              <strong>Gather evidence.</strong> {item.evidence}
            </li>
            <li>
              <strong>Agree the success measure.</strong> {item.success}
            </li>
          </ol>
          <button
            className="rx-btn rx-btn-primary"
            type="button"
            onClick={download}
          >
            Save my evaluation brief ↓
          </button>
          <p className="rm-evaluation-note">
            This brief stays in your browser until you save it. It is not sent
            to RADR. Confirm integrations, scope and terms before an engagement.
          </p>
        </div>
      ) : null}
      <div className="rm-evaluation-next">
        <Link href="/demo">Explore the no-login demo →</Link>
        <Link href="/value-calculator">Model your operating value →</Link>
      </div>
    </section>
  );
}
