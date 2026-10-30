"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { recordsForLocationSelection } from "@/lib/radr/product/selectedScope";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import {
  buildValueOverview,
  parseValueView,
  type ValueView,
} from "@/lib/radr/product/valueProofEngine";
import { ValueOverview } from "./ValueOverview";
import "./value-engine.css";

const VIEWS: { id: ValueView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "over-time", label: "Over time" },
  { id: "class", label: "By class" },
  { id: "location", label: "By location" },
];

export function ValueShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/value";
  const search = useSearchParams();
  const { roleView, locationScope, comparisonLocationIds, locationMode } = useProduct();
  const { session, isHotel } = useDemoOrg();

  const decisionSnapshot = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const view = parseValueView(search.get("view"));
  const [driver, setDriver] = useState<string | null>(
    search.get("class") || null,
  );
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  const model = useMemo(
    () =>
      buildValueOverview(roleView, isHotel ? "hotel" : session.vertical, recordsForLocationSelection(Object.values(decisionSnapshot.records), locationScope, locationMode === "comparison" ? comparisonLocationIds : [])),
    [roleView, session.vertical, isHotel, decisionSnapshot, locationScope, comparisonLocationIds, locationMode],
  );

  const pushView = useCallback(
    (next: ValueView) => {
      const sp = new URLSearchParams(search.toString());
      if (next === "overview") sp.delete("view");
      else sp.set("view", next);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search],
  );

  return (
    <div className="ve-root" data-value-engine="true">
      <header className="mk-page-head"><p className="mk-eyebrow">Value</p><h1>Track value. Verify the outcome.</h1><p>Expected, observed and verified results for the selected location scope. {model.currencyLabel}.</p></header>
      <nav className="ve-views" aria-label="Value perspective">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            data-active={view === v.id ? "true" : undefined}
            onClick={() => pushView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      {view === "overview" ? (
        <ValueOverview
          model={model}
          selectedDriver={driver}
          onSelectDriver={setDriver}
          onTraceEuro={() => setTraceOpen(true)}
          onOpenMethodology={() => setMethodologyOpen(true)}
        />
      ) : (
        <div className="ve-placeholder">
          <p>
            <strong>
              {VIEWS.find((v) => v.id === view)?.label ?? "View"}
            </strong>
          </p>
          <p style={{ marginTop: 8 }}>
            Deep {VIEWS.find((v) => v.id === view)?.label?.toLowerCase()} lens
            follows Overview approval. Headline stays {model.verifiedFormatted}.
          </p>
        </div>
      )}

      {methodologyOpen ? (
        <div
          className="ve-modal"
          role="presentation"
          onClick={() => setMethodologyOpen(false)}
        >
          <div
            className="ve-modal-card"
            role="dialog"
            aria-label="Value methodology"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>How RADR verifies value</h3>
            <p>
              Primary Verified Value counts only evidenced, system-reconciled
              outcomes — never expected, forecast, or opportunity amounts.
            </p>
            <ul>
              <li>
                <strong>Expected</strong> — modelled outcome before action
              </li>
              <li>
                <strong>Observed</strong> — actual operating / financial result
              </li>
              <li>
                <strong>Verified</strong> — observed result reconciled to
                sufficient evidence
              </li>
              <li>
                <strong>Missed</strong> — expected value not realised (shown
                honestly)
              </li>
            </ul>
            <p>
              Double-counting is prevented via canonical value events per
              Decision. Control Center uses this same ledger total (
              {model.verifiedFormatted}).
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="ve-cta" onClick={() => setMethodologyOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {traceOpen ? (
        <div
          className="ve-modal"
          role="presentation"
          onClick={() => setTraceOpen(false)}
        >
          <div
            className="ve-modal-card"
            role="dialog"
            aria-label="Trace this euro"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              Trace · {model.miss.displayId}
            </h3>
            <p>
              Expected {format(model.miss.expectedEuro)} · Observed{" "}
              {format(model.miss.observedEuro)} · Verified{" "}
              {format(model.miss.verifiedEuro)}.
            </p>
            <p>{model.miss.memoryNote}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <Link
                href={`/app/decisions/${model.miss.decisionId}`}
                className="ve-link"
              >
                Open decision →
              </Link>
              <button type="button" className="ve-cta" onClick={() => setTraceOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function format(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
