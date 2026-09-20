"use client";

/**
 * Data Origin — YOUR STACK → △ RADR → DECISION.
 * Source TYPES on the homepage. Full catalog lives on Developers.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Link } from "@/i18n/navigation";
import { RadrDelta } from "@/components/radr/RadrDelta";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import "@/app/radr-public.css";

const DECISION_CHILDREN = [
  "Futures",
  "Action",
  "Verified Value",
  "Memory",
] as const;

type StackType = {
  id: string;
  label: string;
  systems: string[];
  evidence: string[];
  uses: string[];
  status: string;
};

const STACK: StackType[] = [
  {
    id: "invoices",
    label: "Invoices",
    systems: ["PDF / CSV", "Supplier portals", "AP inbox"],
    evidence: ["Line items", "Unit prices", "Credit memos", "Tax lines"],
    uses: ["Contract variance", "Duplicate charges", "Unapplied credits"],
    status: "Files · AVAILABLE",
  },
  {
    id: "contracts",
    label: "Contracts",
    systems: ["Signed PDFs", "Rate cards", "Group agreements"],
    evidence: ["Agreed rates", "Volume tiers", "Rebate terms"],
    uses: ["Price dispersion", "Missed rebates", "Supplier / AP"],
    status: "Files · AVAILABLE",
  },
  {
    id: "pos",
    label: "POS",
    systems: ["Toast", "Lightspeed", "Custom POS"],
    evidence: ["Sales", "Voids", "Comps", "Tender mix"],
    uses: ["Settlement gaps", "Cost variance", "Perishable revenue"],
    status: "Partner / Planned",
  },
  {
    id: "accounting",
    label: "Accounting / AP",
    systems: ["Xero", "NetSuite", "Exports"],
    evidence: ["AP ledger", "Payments", "Credits applied"],
    uses: ["Reconciliation", "Verified recovery proof"],
    status: "Planned / Files",
  },
  {
    id: "procurement",
    label: "Procurement",
    systems: ["Purchase orders", "Supplier catalogs"],
    evidence: ["PO prices", "Received quantities", "Location rates"],
    uses: ["Price dispersion", "Procurement leaks"],
    status: "Files · AVAILABLE",
  },
  {
    id: "payments",
    label: "Payments",
    systems: ["Adyen", "Stripe", "Worldpay"],
    evidence: ["Settlements", "Refunds", "Fees", "Chargebacks", "Payouts"],
    uses: ["Settlement gaps", "Refund mismatches", "Payment reconciliation"],
    status: "Planned",
  },
  {
    id: "reservations",
    label: "Reservations",
    systems: ["OpenTable", "SevenRooms", "PMS / CRS"],
    evidence: ["Covers", "No-shows", "Cancellations", "Channel mix"],
    uses: ["Perishable revenue", "Peak capacity"],
    status: "Partner access",
  },
  {
    id: "labor",
    label: "Labor",
    systems: ["Workforce tools", "Timesheets"],
    evidence: ["Shifts", "Hours", "Coverage"],
    uses: ["Labor mismatch", "Peak staffing Decisions"],
    status: "Planned",
  },
];

export function ConnectionOriginSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActiveId(null), []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [close]);

  const active = STACK.find((s) => s.id === activeId) ?? null;
  const lit = Boolean(active);

  return (
    <div
      className="rx-origin"
      ref={rootRef}
      data-lit={lit ? "true" : undefined}
    >
      <header className="rx-origin-head">
        <p className="rx-rec-k">Your stack</p>
        <h2 className="rx-origin-h">
          Your stack → RADR → Decision
        </h2>
      </header>

      <div className="rx-origin-triad" aria-label="Stack to Decision">
        <div className="rx-origin-zone rx-origin-zone--src">
          <p className="rx-origin-zone-k">Your stack</p>
          <ul className="rx-origin-stack">
            {STACK.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="rx-origin-stack-btn"
                  aria-expanded={activeId === s.id}
                  data-on={activeId === s.id ? "true" : undefined}
                  onMouseEnter={() => setActiveId(s.id)}
                  onFocus={() => setActiveId(s.id)}
                  onClick={() =>
                    setActiveId((cur) => (cur === s.id ? null : s.id))
                  }
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
          {active ? <StackNote stack={active} onClose={close} /> : null}
        </div>

        <div className="rx-origin-flow" aria-hidden="true">
          <i data-arm="in" data-on={lit ? "true" : undefined} />
        </div>
        <p className="rx-origin-mobile-arrow" aria-hidden="true">
          ↓
        </p>

        <div className="rx-origin-zone rx-origin-zone--core">
          <div className="rx-origin-delta" data-on={lit ? "true" : undefined}>
            <RadrDelta
              variant="nav"
              height={56}
              className="rx-origin-delta-mark"
            />
            <strong>RADR</strong>
          </div>
        </div>

        <div className="rx-origin-flow" aria-hidden="true">
          <i data-arm="out" data-on={lit ? "true" : undefined} />
        </div>
        <p className="rx-origin-mobile-arrow" aria-hidden="true">
          ↓
        </p>

        <div className="rx-origin-zone rx-origin-zone--out">
          <p className="rx-origin-decision" data-on={lit ? "true" : undefined}>
            Decision
          </p>
          <ul className="rx-origin-children">
            {DECISION_CHILDREN.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={{ pathname: "/developers", hash: "integrations" }}
        className="rx-origin-more"
      >
        Full integration catalog <span aria-hidden="true">→</span>
      </Link>
      <p className="rx-origin-note">
        Files / CSV · {capabilityBadge("filesCsv")} · keep the systems you
        already run
      </p>
    </div>
  );
}

function StackNote({
  stack,
  onClose,
}: {
  stack: StackType;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <aside
      className="rx-origin-note-card"
      role="dialog"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="rx-origin-note-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <h3 id={titleId}>{stack.label}</h3>
      <p className="rx-origin-note-k">Systems</p>
      <ul>
        {stack.systems.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p className="rx-origin-note-k">Evidence</p>
      <ul>
        {stack.evidence.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p className="rx-origin-note-k">RADR can use this for</p>
      <ul>
        {stack.uses.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p className="rx-origin-note-status">{stack.status}</p>
    </aside>
  );
}
